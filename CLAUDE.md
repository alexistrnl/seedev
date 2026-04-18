@AGENTS.md

# CLAUDE.md

## Commands
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test suite is configured.

## Environment

`.env.local` requis :
```
NEXT_PUBLIC_PB_URL=https://pb.seedev.fr
NEXT_PUBLIC_CALENDLY_URL=# (placeholder)
```
Fallback PB : `http://145.223.33.70:8090`

---

## Vue d'ensemble

**Seedev** est une plateforme en deux parties :
1. **Site vitrine / portfolio** public — présente les réalisations et services de Seedev
2. **Espace client + admin** privé — suivi de projet, upload cahier des charges, messagerie

### Contexte métier
Un apporteur d'affaires prospecte et présente Seedev aux clients.
Pendant le RDV, le client crée son compte sur seedev.fr.
Il uploade son cahier des charges. Seedev analyse, répond via le chat,
développe, livre. Le client suit tout depuis son dashboard.

---

## Stack

- **Next.js 15** + React 19, App Router, React Compiler activé
- **PocketBase** self-hosted (`https://pb.seedev.fr`) — auth, collections, fichiers
- **Tailwind CSS v4** — fichiers `.css` par composant aux côtés des `.tsx`
- **TypeScript** strict, alias `@/*` → `./src/*`

---

## Pages (4 pages uniquement)

### `/` — Accueil / Portfolio
Page unique en scroll. Sections dans l'ordre :
1. **Hero** — logo SEEDEV, accroche serif, 2 CTAs : "Prendre un RDV" (Calendly, nouvelle tab) + "Espace client" (→ /login)
2. **Portfolio** — grille de réalisations cliquables (nouvelle tab)
3. **Services** — Landing, Vitrine, SaaS, Maintenance — sans tarifs publics
4. **Footer** — mentions légales, CGV, espace client

### `/login` — Connexion + Inscription
Page unique, toggle entre deux formulaires :
- **Connexion** : email + mot de passe
- **Inscription** : prénom, nom, email, mot de passe
Inscription publique — le client crée son compte pendant le RDV.
Redirection vers `/dashboard` après auth réussie.

### `/dashboard` — Espace client `(auth required)`
- Son projet + statut
- Upload cahier des charges (PDF, image, Word)
- Chat avec Seedev
- Son site livré (URL + description, visible quand statut = `delivered`)
Redirection vers `/login` si non authentifié.

### `/admin` — Espace Seedev `(auth required + is_admin)`
- Liste de tous les clients et leur statut projet
- Consultation des cahiers des charges uploadés
- Changement de statut projet
- Chat par client
Redirection vers `/` si non authentifié ou non admin.

---

## PocketBase — Collections

### `users` (collection auth native PB)
Champs custom : `name` (text), `is_admin` (bool, default false)
Règles : inscription publique activée.

### `projects`
Champs :
- `owner` (relation → users, requis)
- `name` (text)
- `status` (select) : `waiting_brief` | `brief_received` | `quote_sent` | `in_progress` | `delivered`
- `brief_file` (file, optionnel) — PDF / image / Word
- `site_url` (url, optionnel) — renseigné à la livraison
- `site_description` (text, optionnel)

Règles PB :
- Création : utilisateur authentifié
- Lecture/update : owner ou admin

### `messages`
Champs :
- `project` (relation → projects, requis)
- `sender` (relation → users, requis)
- `content` (text, requis)
- `created` (auto)

Règles PB :
- Création : authentifié + être owner du projet ou admin
- Lecture : owner du projet ou admin

---

## Portfolio — données statiques (`src/data/portfolio.ts`)
```ts
export const projects = [
  {
    name: "Byoom",
    url: "https://byoom.fr",
    description: "Application de gestion de plantes avec identification par IA, gamification et abonnements.",
    tags: ["SaaS", "IA", "Next.js", "Stripe"],
  },
  {
    name: "QG Padel",
    url: "https://qg-padel.fr",
    description: "Site vitrine pour club de padel. Présentation, horaires et prise de contact.",
    tags: ["Vitrine", "Next.js", "Tailwind"],
  },
  {
    name: "ToDoMom",
    url: "https://todomom.fr",
    description: "To-do list gamifiée pour familles avec abonnements Stripe et déploiement VPS.",
    tags: ["SaaS", "PocketBase", "Stripe"],
  },
]
```

---

## Structure des fichiers cibles
```
src/
├── app/
│   ├── page.tsx                        # Accueil / portfolio
│   ├── login/
│   │   └── page.tsx                    # Connexion + inscription
│   ├── dashboard/
│   │   └── page.tsx                    # Espace client
│   ├── admin/
│   │   └── page.tsx                    # Espace admin
│   ├── layout.tsx                      # Fonts + metadata
│   └── globals.css                     # Variables CSS, reset, palette
├── components/
│   ├── HeroSection.tsx + .css
│   ├── PortfolioSection.tsx + .css
│   ├── ServicesSection.tsx + .css
│   ├── Footer.tsx + .css
│   ├── TopMenu.tsx + .css
│   ├── LoginForm.tsx + .css
│   ├── Dashboard.tsx + .css
│   ├── AdminPanel.tsx + .css
│   └── Chat.tsx + .css
├── data/
│   └── portfolio.ts
├── hooks/
│   └── useAuth.ts
└── lib/
    ├── pocketbase.ts
    └── auth.ts
```

---

## Design system — CRITIQUE, à respecter à la lettre

### Identité
- Marque : **SEEDEV** — toujours en majuscules dans le logo
- Positionnement visuel : **moderne / épuré / professionnel**
- Border-radius modérés : boutons `8px`, cards `12px`, inputs `8px`, tags `6px`
- Zéro gradient décoratif sur les éléments UI
- Ombres légères autorisées uniquement pour profondeur fonctionnelle : `box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`
- Thème unique clair (blanc/bleu/noir) — pas de toggle dark

### Palette
```css
--bg:      #ffffff;   /* fond principal */
--bg2:     #f8f9fb;   /* surfaces subtiles */
--bg3:     #eef1f6;   /* surfaces hover */
--border:  #e5e7eb;   /* borders neutres */
--border2: #d1d5db;   /* borders accentuées */
--blue:    #0066FF;   /* accent principal */
--blue2:   #0052cc;   /* accent hover */
--blue3:   #e6efff;   /* accent background léger */
--black:   #0a0a0a;   /* texte titres */
--text:    #1a1a1a;   /* texte courant */
--muted:   #6b7280;   /* texte secondaire */
--muted2:  #9ca3af;   /* texte tertiaire */
```

### Typographie
```css
/* Tout — Geist Sans (next/font/google) */
font-family: var(--font-geist-sans), ui-sans-serif, sans-serif;
/* variable : --font-geist-sans */

/* Code / chiffres monospace — Geist Mono */
font-family: var(--font-geist-mono), ui-monospace, monospace;
/* variable : --font-geist-mono */
```

### Règles typographiques
- Titres h1/h2/h3 : Geist Sans `font-weight: 700`, `letter-spacing: -0.02em`
- Corps de texte : Geist Sans 400, `font-size: 16px`, `line-height: 1.6`
- Labels, nav, boutons : Geist Sans 500, casse normale (pas uppercase), `letter-spacing: 0.01em` max
- Taille de base body : `16px`

### Espacements
- Padding horizontal global : `60px` (desktop)
- Padding vertical sections : `100px`
- Grilles cards : `gap: 16px`
- Ligne verticale décorative dans le hero : `1px solid var(--border)`

### Composants UI
- **Bouton primaire** (`.btn--gold`) : background `--blue`, couleur `#ffffff`, `border-radius: 8px`, padding `14px 32px`, Geist 500
- **Bouton ghost** (`.btn--ghost`) : background transparent, border `1px solid --border2`, couleur `--muted`, même taille
- **Tags** : background `--blue3`, border `1px solid rgba(0,102,255,0.2)`, couleur `--blue`, `border-radius: 6px`, Geist 500 11px
- **Cards** : background `--bg2`, border `1px solid --border`, `border-radius: 12px`, hover → `--bg3` + ombre légère
- **Séparateur section** : `.stag` = ligne `1px` 24px + texte, couleur `--blue`

### Animations
- CSS uniquement
- Hover cards : `transition: background 0.3s, box-shadow 0.3s`
- Flèche portfolio : `opacity 0 → 1` + `transform: translate(-6px,6px) → translate(0,0)`, `transition: all 0.35s`
- Boutons : `transition: all 0.25s`
- Pas de scroll animations, pas de keyframes complexes

### Ce qu'il ne faut JAMAIS faire
- Gradients décoratifs sur les éléments UI
- Ombres lourdes (`box-shadow` avec spread > 4px ou opacité > 0.15)
- Couleurs vives autres que `--blue` / `--blue2` / `--blue3`
- Fonts system (Arial, Inter, Roboto, system-ui) — utiliser Geist Sans
- Layouts centrés avec `max-width: 1200px; margin: auto` — le contenu va de bord à bord avec padding
- `text-transform: uppercase` sur boutons et labels (interdit)
- `letter-spacing` > `0.01em` sauf cas très spécifique (logo uniquement)

---

## Auth pattern

- `useAuth()` — souscrit au PocketBase auth store, retourne `{ user, loading, isAuthenticated }`
- `/dashboard` — redirige vers `/login` si non authentifié
- `/admin` — redirige vers `/` si non authentifié ou `user.is_admin !== true`
- `/login` — redirige vers `/dashboard` si déjà connecté
- Pas de vérification email obligatoire à l'inscription