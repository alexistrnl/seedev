import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Inscription avec email et mot de passe
 * Envoie automatiquement l'email de vérification après la création
 */
export async function signupWithEmailPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  try {
    console.log('[Auth] Début de l\'inscription pour:', email);
    
    // Créer l'utilisateur
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    console.log('[Auth] Utilisateur créé avec succès:', user.uid);

    // Mettre à jour le profil si displayName fourni
    if (displayName) {
      try {
        await updateProfile(user, { displayName });
        console.log('[Auth] Profil mis à jour avec displayName');
      } catch (profileError: any) {
        console.error('[Auth] Erreur lors de la mise à jour du profil:', profileError);
        // Ne pas bloquer l'inscription si la mise à jour du profil échoue
      }
    }

    // Envoyer l'email de vérification immédiatement après la création
    try {
      await sendEmailVerification(user, {
        url: 'https://seedev.fr/auth/verify',
      });
      console.log('[Auth] Email de vérification envoyé avec succès');
    } catch (verificationError: any) {
      console.error('[Auth] Erreur lors de l\'envoi de l\'email de vérification:', verificationError);
      // Relancer l'erreur pour que l'UI puisse la gérer
      throw {
        ...verificationError,
        code: verificationError.code || 'auth/verification-email-failed',
        message: 'Compte créé mais l\'email de vérification n\'a pas pu être envoyé. Tu peux le renvoyer depuis la page de vérification.',
      };
    }

    return user;
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
): Promise<User> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      // Déconnecter l'utilisateur
      await signOut(auth);
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    return user;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Renvoyer l'email de vérification
 * Utilise auth.currentUser si disponible, sinon se connecte temporairement
 */
export async function resendVerificationEmail(
  email?: string,
  password?: string
): Promise<void> {
  try {
    let user: User | null = null;

    // Si l'utilisateur est déjà connecté, utiliser auth.currentUser
    if (auth.currentUser && auth.currentUser.email) {
      user = auth.currentUser;
      console.log('[Auth] Utilisation de l\'utilisateur connecté pour renvoyer l\'email');
    } else if (email && password) {
      // Sinon, se connecter temporairement pour obtenir l'utilisateur
      console.log('[Auth] Connexion temporaire pour renvoyer l\'email');
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      user = userCredential.user;
    } else {
      throw new Error('Aucun utilisateur connecté et identifiants manquants');
    }

    if (!user) {
      throw new Error('Impossible d\'obtenir l\'utilisateur');
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      console.log('[Auth] Email déjà vérifié, pas besoin de renvoyer');
      throw new Error('EMAIL_ALREADY_VERIFIED');
    }

    // Envoyer l'email de vérification
    try {
      await sendEmailVerification(user, {
        url: 'https://seedev.fr/auth/verify',
      });
      console.log('[Auth] Email de vérification renvoyé avec succès');
    } catch (verificationError: any) {
      console.error('[Auth] Erreur lors du renvoi de l\'email:', verificationError);
      throw verificationError;
    }

    // Déconnecter seulement si on s'est connecté temporairement
    if (email && password && !auth.currentUser) {
      await signOut(auth);
      console.log('[Auth] Déconnexion après renvoi de l\'email');
    }
  } catch (error: any) {
    console.error('[Auth] Erreur lors du renvoi de l\'email de vérification:', error);
    throw error;
  }
}

/**
 * Déconnexion
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw error;
  }
}
