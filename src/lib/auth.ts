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
 */
export async function signupWithEmailPassword(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  try {
    // Créer l'utilisateur
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Mettre à jour le profil si displayName fourni
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Envoyer l'email de vérification
    await sendEmailVerification(user);

    return user;
  } catch (error: any) {
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
 */
export async function resendVerificationEmail(
  email: string,
  password: string
): Promise<void> {
  try {
    // Se connecter temporairement pour obtenir l'utilisateur
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Envoyer l'email de vérification
    await sendEmailVerification(user);

    // Déconnecter après l'envoi
    await signOut(auth);
  } catch (error: any) {
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
