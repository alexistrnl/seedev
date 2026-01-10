# Configuration PocketBase pour SEEDEV

## Prérequis

1. PocketBase doit être installé et lancé sur `http://127.0.0.1:8090`
2. Le frontend Next.js doit avoir accès à cette URL

## Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
```

## Collections PocketBase requises

### Collection `users` (authentification)

PocketBase crée automatiquement une collection `users` pour l'authentification. Assurez-vous qu'elle existe avec les champs suivants :

- `email` (email, requis, unique)
- `password` (text, requis)
- `passwordConfirm` (text, requis pour l'inscription)
- `name` (text, optionnel)
- `verified` (bool, géré automatiquement par PocketBase)

**Important :** Pour activer la vérification email dans PocketBase :

1. Dans l'interface d'administration PocketBase (`http://127.0.0.1:8090/_/`), allez dans **Settings** → **Email templates**
2. Configurez un serveur SMTP (ou utilisez l'option de développement pour les tests)
3. Activez la vérification email dans **Settings** → **Auth settings** → **Email verification**
4. Configurez le template d'email de vérification si nécessaire

### Collections à créer pour le projet

Vous devrez créer d'autres collections pour :
- Les idées de projets soumises par les utilisateurs
- Les réponses aux questions
- Les projets en cours de développement

## Utilisation dans le code

Le client PocketBase est centralisé dans `src/lib/pb.ts` :

```typescript
import { pb } from '@/lib/pb';

// Connexion
const authData = await pb.collection('users').authWithPassword(email, password);

// Vérifier si l'email est vérifié (OBLIGATOIRE après connexion)
if (!authData.record.verified) {
  pb.authStore.clear();
  throw new Error('Email non vérifié');
}

// Création d'un compte
await pb.collection('users').create(data);

// Envoyer l'email de vérification après la création
await pb.collection('users').requestVerification(email);

// Renvoyer l'email de vérification
await pb.collection('users').requestVerification(email);

// Vérifier si l'utilisateur est connecté
const isAuth = pb.authStore.isValid;

// Obtenir l'utilisateur actuel
const user = pb.authStore.model;
```

## Vérification Email

### Inscription

Lors de l'inscription, le processus est le suivant :

1. Créer le compte avec `pb.collection('users').create(data)`
2. Envoyer immédiatement l'email de vérification avec `pb.collection('users').requestVerification(email)`
3. **NE PAS** connecter automatiquement l'utilisateur
4. Afficher un message indiquant que l'utilisateur doit vérifier son email

Si l'envoi de l'email échoue après la création du compte, afficher un message clair avec un bouton "Renvoyer l'email de vérification".

### Connexion

Lors de la connexion, **TOUJOURS** vérifier si l'email est vérifié :

```typescript
const authData = await pb.collection('users').authWithPassword(email, password);

if (!authData.record.verified) {
  // DÉCONNECTER l'utilisateur immédiatement
  pb.authStore.clear();
  
  // Bloquer l'accès et afficher un message avec un bouton de renvoi
  throw new Error('Email non vérifié. Vérifie ta boîte mail ou renvoie l\'email de vérification.');
}
```

**Important :** Ne jamais rediriger vers le dashboard si `verified === false`.

### Renvoi d'email de vérification

Sur la page de login, si l'erreur correspond à un email non vérifié :

1. Afficher un bouton "Renvoyer l'email de vérification"
2. Au clic, appeler `pb.collection('users').requestVerification(email)`
3. Gérer les erreurs (limite de taux, email invalide, etc.)
4. Afficher un feedback clair (succès ou erreur)

**Note :** PocketBase limite la fréquence d'envoi des emails de vérification (généralement 1 email par minute). Gérer ce cas avec un message approprié.

## Notes importantes

- Toute communication backend passe par PocketBase
- Pas d'API maison nécessaire
- PocketBase gère l'authentification, la base de données et l'API REST
- Le frontend ne contient aucune logique serveur métier

