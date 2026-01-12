'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import type { AppUser } from '@/lib/auth';

interface UseAuthReturn {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook pour gérer l'état d'authentification PocketBase
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fonction pour convertir le record PocketBase en AppUser
    const pbRecordToAppUser = (record: any): AppUser | null => {
      if (!record) return null;
      
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
    };

    // Initialiser l'état avec l'utilisateur actuel
    const updateUser = () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        setUser(pbRecordToAppUser(pb.authStore.model));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Mettre à jour immédiatement
    updateUser();

    // S'abonner aux changements d'authentification
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model) {
        setUser(pbRecordToAppUser(model));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Nettoyer l'abonnement au démontage
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
