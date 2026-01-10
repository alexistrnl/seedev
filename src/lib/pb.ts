import PocketBase from 'pocketbase';

// URL de PocketBase depuis les variables d'environnement
const PB_URL = process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090';

// Créer une instance unique de PocketBase
export const pb = new PocketBase(PB_URL);

// Optionnel : Configurer le client pour le développement
if (typeof window !== 'undefined') {
  // En développement, on peut activer les logs
  if (process.env.NODE_ENV === 'development') {
    pb.autoCancellation(false);
  }
}

export default pb;

