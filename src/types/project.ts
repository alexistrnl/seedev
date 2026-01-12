/**
 * Type pour un projet PocketBase
 */
export interface Project {
  id: string;
  name: string;
  owner: string; // ID de l'utilisateur
  status: 'draft' | 'in_progress' | 'completed';
  created: string;
  updated: string;
}
