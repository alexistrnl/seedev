/**
 * Authentification avec PocketBase
 */

import { pb } from './pocketbase';

// Type utilisateur compatible avec l'UI existante
export interface AppUser {
  uid: string; // id de PocketBase
  email: string | null;
  displayName: string | null;
  emailVerified: boolean; // verified de PocketBase
  metadata: {
    creationTime: string; // created de PocketBase
  };
}

// Type pour compatibilité avec le code existant
export type MockUser = AppUser;

/**
 * Convertir un record PocketBase en AppUser
 */
function pbRecordToAppUser(record: any): AppUser {
  // Vérifier explicitement que verified est true (boolean strict)
  // Si verified est undefined/null, considérer comme false pour sécurité
  const emailVerified = record.verified === true;

  return {
    uid: record.id || '',
    email: record.email || null,
    displayName: record.name || record.username || null,
    emailVerified,
    metadata: {
      creationTime: record.created || new Date().toISOString(),
    },
  };
}

/**
 * Inscription avec email et mot de passe
 */
export async function signupWithEmailPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<AppUser> {
  try {
    const data: any = {
      email,
      password,
      passwordConfirm: password,
    };

    if (displayName) {
      data.name = displayName;
    }

    // Créer l'utilisateur
    const record = await pb.collection('users').create(data);

    // Envoyer l'email de vérification si disponible
    try {
      await pb.collection('users').requestVerification(email);
    } catch (verificationError: any) {
      // Si la vérification n'est pas disponible (SMTP non configuré), continuer quand même
      console.warn('[Auth] Impossible d\'envoyer l\'email de vérification:', verificationError?.message || 'SMTP non configuré');
    }

    return pbRecordToAppUser(record);
  } catch (error: any) {
    console.error('[Auth] Erreur lors de l\'inscription:', error);
    throw error;
  }
}

/**
 * Connexion avec email et mot de passe
 * Refuse l'accès si l'email n'est pas vérifié
 */
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<AppUser> {
  try {
    // Authentifier avec PocketBase
    const authData = await pb.collection('users').authWithPassword(email, password);

    // Rafraîchir le modèle d'authentification pour obtenir les données à jour depuis le serveur
    // Cela garantit que le champ `verified` est à jour
    try {
      await pb.collection('users').authRefresh();
    } catch (refreshError: any) {
      // Si le refresh échoue, continuer avec les données de authWithPassword
      console.warn('[Auth] Impossible de rafraîchir l\'auth model:', refreshError?.message);
    }

    // Obtenir le record à jour depuis authStore (après refresh)
    const currentRecord = pb.authStore.model;
    if (!currentRecord) {
      throw new Error('Impossible de récupérer les données utilisateur après authentification');
    }

    const user = pbRecordToAppUser(currentRecord);

    // Log de debug en développement
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Auth] User object after login:', {
        fullRecord: currentRecord,
        verified: currentRecord.verified,
        verifiedType: typeof currentRecord.verified,
        emailVerified: user.emailVerified,
        emailVerifiedType: typeof user.emailVerified,
      });
    }

    // Vérifier si l'email est vérifié
    // Bloquer SEULEMENT si verified === false (explicitement false)
    // Si verified est undefined/null, considérer comme non vérifié pour sécurité
    if (user.emailVerified === false || currentRecord.verified === false) {
      // Déconnecter l'utilisateur
      pb.authStore.clear();
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    return user;
  } catch (error: any) {
    // Ne pas relancer l'erreur EMAIL_NOT_VERIFIED, elle est déjà correcte
    if (error?.message === 'EMAIL_NOT_VERIFIED') {
      throw error;
    }
    console.error('[Auth] Erreur lors de la connexion:', error);
    throw error;
  }
}

/**
 * Renvoyer l'email de vérification
 */
export async function resendVerificationEmail(
  email?: string,
  password?: string
): Promise<void> {
  try {
    let userEmail = email;

    // Si pas d'email fourni, utiliser l'utilisateur actuel
    if (!userEmail) {
      const currentUser = pb.authStore.model;
      if (!currentUser || !currentUser.email) {
        throw new Error('Aucun utilisateur connecté et email manquant');
      }
      userEmail = currentUser.email;
    }

    // Vérifier que userEmail est défini (TypeScript)
    if (!userEmail) {
      throw new Error('Email manquant pour l\'envoi de vérification');
    }

    // Si l'utilisateur est connecté et déjà vérifié
    const currentUser = pb.authStore.model;
    if (currentUser && currentUser.verified) {
      throw new Error('EMAIL_ALREADY_VERIFIED');
    }

    // Si pas connecté et mot de passe fourni, se connecter temporairement
    if (!pb.authStore.isValid && password && email) {
      await pb.collection('users').authWithPassword(email, password);
    }

    // Envoyer l'email de vérification
    try {
      await pb.collection('users').requestVerification(userEmail);
    } catch (verificationError: any) {
      // Si la vérification n'est pas disponible, informer l'utilisateur
      const errorMsg = verificationError?.message || '';
      if (errorMsg.includes('SMTP') || errorMsg.includes('email') || errorMsg.includes('verification')) {
        throw new Error('L\'envoi d\'email de vérification nécessite la configuration SMTP sur le serveur. Contacte l\'administrateur.');
      }
      throw verificationError;
    } finally {
      // Déconnecter seulement si on s'est connecté temporairement
      if (!pb.authStore.isValid && password && email) {
        pb.authStore.clear();
      }
    }
  } catch (error: any) {
    console.error('[Auth] Erreur lors du renvoi de l\'email:', error);
    throw error;
  }
}

/**
 * Déconnexion
 */
export async function logout(): Promise<void> {
  try {
    pb.authStore.clear();
  } catch (error: any) {
    console.error('[Auth] Erreur lors de la déconnexion:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): AppUser | null {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return null;
  }

  return pbRecordToAppUser(pb.authStore.model);
}
