/**
 * Convertit les codes d'erreur Firebase en messages français
 */
export function getAuthErrorMessage(errorCode: string, defaultMessage?: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Identifiants incorrects',
    'auth/invalid-credential': 'Identifiants incorrects',
    'auth/email-already-in-use': 'Email déjà utilisé',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/weak-password': 'Mot de passe trop faible (minimum 6 caractères)',
    'auth/network-request-failed': 'Erreur réseau. Vérifie ta connexion.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
    'auth/requires-recent-login': 'Cette opération nécessite une reconnexion récente',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée',
    'auth/cancelled-popup-request': 'Connexion annulée',
    'auth/expired-action-code': 'Lien expiré. Demande un nouvel email de vérification.',
    'auth/invalid-action-code': 'Lien invalide ou déjà utilisé.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie dans quelques minutes.',
  };

  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  return defaultMessage || 'Une erreur est survenue. Veuillez réessayer.';
}
