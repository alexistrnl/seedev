import PocketBase from 'pocketbase';

// URL de PocketBase depuis les variables d'environnement
const PB_URL = process.env.NEXT_PUBLIC_PB_URL || 'http://145.223.33.70:8090';

// Vérification runtime de la configuration
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_PB_URL) {
  console.warn('[PocketBase] NEXT_PUBLIC_PB_URL n\'est pas défini. Utilisation de l\'URL par défaut:', PB_URL);
}

// Créer une instance unique de PocketBase (singleton)
let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (typeof window === 'undefined') {
    // Côté serveur, créer une nouvelle instance à chaque fois
    return new PocketBase(PB_URL);
  }

  // Côté client, utiliser un singleton
  if (!pbInstance) {
    pbInstance = new PocketBase(PB_URL);
    
    // Optionnel : Configurer le client pour le développement
    if (process.env.NODE_ENV === 'development') {
      pbInstance.autoCancellation(false);
    }
  }

  return pbInstance;
}

// Export de l'instance pour faciliter l'utilisation
export const pb = getPocketBase();

export default pb;
