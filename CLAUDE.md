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
│   ├── ThemeToggle.tsx + .css
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
- Positionnement visuel : **luxe / premium / éditorial**
- Zéro rondeur (`border-radius: 0` partout sauf exception explicite)
- Zéro gradient, zéro ombre portée, zéro effet glow
- Tout repose sur la typographie, l'espacement et les proportions

### Palette — dark (défaut)
```css
--bg:      #0e0d0b;   /* fond principal */
--bg2:     #151410;   /* surfaces */
--bg3:     #1c1a16;   /* surfaces hover */
--border:  rgba(212,196,168,0.10);
--border2: rgba(212,196,168,0.22);
--gold:    #c9a96e;   /* accent principal */
--gold2:   #e8d5b0;   /* accent hover */
--cream:   #f5efe6;   /* texte fort */
--text:    #f0ebe2;   /* texte courant */
--muted:   #8a8278;   /* texte secondaire */
--muted2:  #4a4640;   /* texte tertiaire */
```

### Palette — light (toggle)
```css
--bg:      #f7f3ee;
--bg2:     #f0ebe2;
--bg3:     #e8e0d4;
--border:  rgba(100,80,50,0.10);
--border2: rgba(100,80,50,0.22);
--gold:    #a07840;
--gold2:   #7a5a28;
--cream:   #1a1610;
--text:    #2a2420;
--muted:   #7a7068;
--muted2:  #b0a898;
```

### Typographie
```css
/* Titres — Playfair Display (Google Fonts) */
font-family: 'Playfair Display', serif;
/* weights : 400 (regular), 400 italic, 700 */

/* Accents italiques — Cormorant Garamond (Google Fonts) */
font-family: 'Cormorant Garamond', serif;
/* weights : 300, 300 italic, 400, 400 italic */

/* Corps, UI, labels — DM Sans (Google Fonts) */
font-family: 'DM Sans', sans-serif;
/* weights : 300, 400, 500 */
```

Import Google Fonts dans `layout.tsx` :
```
Playfair+Display:ital,wght@0,400;0,700;1,400
Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400
DM+Sans:wght@300;400;500
```

### Règles typographiques
- Titres de section (`h2`) : Playfair Display 400, avec un mot ou groupe en italique doré
- Sous-titres / citations : Cormorant Garamond 300 italic, couleur `--muted`
- Labels, nav, tags, boutons : DM Sans 400–500, `letter-spacing: 0.1em`, `text-transform: uppercase`, `font-size: 10–11px`
- Corps de texte : DM Sans 300, `font-size: 14px`, `line-height: 1.7`
- Numéros décoratifs : Cormorant Garamond 300 italic, très grands (40–52px), couleur `--muted2`

### Espacements
- Padding horizontal global : `60px` (desktop)
- Padding vertical sections : `120px`
- Grilles avec joints : `gap: 1px; background: var(--border)` — pas de gap réel, les joints sont la séparation
- Ligne verticale décorative dans le hero : `width: 0.5px`, couleur `--border2`

### Composants UI
- **Bouton primaire** : background `--gold`, couleur `--bg`, aucun border-radius, padding `16px 36px`, DM Sans 500 uppercase 11px
- **Bouton ghost** : background transparent, border `0.5px solid --border2`, couleur `--muted`, même taille
- **Tags** : border `0.5px solid --border2`, DM Sans uppercase 9px, `letter-spacing: 0.12em`, padding `4px 10px`, aucun border-radius
- **Cards portfolio** : padding `40px 36px`, hover → `background: --bg3`, flèche ↗ animée en `position: absolute` top-right
- **Séparateur section** : `s-tag` = ligne horizontale `24px` + texte, couleur `--gold`

### Animations
- CSS uniquement
- Hover cards : `transition: background 0.3s`
- Flèche portfolio : `opacity 0 → 1` + `transform: translate(-6px,6px) → translate(0,0)`, `transition: all 0.3s`
- Boutons : `transition: all 0.25s`
- Pas de scroll animations, pas de keyframes complexes

### Ce qu'il ne faut JAMAIS faire
- `border-radius` sauf demande explicite
- Gradients décoratifs sur les éléments UI
- Ombres portées (`box-shadow`)
- Couleurs vives (pas de bleu, pas de vert fluo, pas de rouge)
- Fonts system (Arial, Inter, Roboto, system-ui)
- Layouts centrés avec `max-width: 1200px; margin: auto` — le contenu va de bord à bord avec padding

---

## Auth pattern

- `useAuth()` — souscrit au PocketBase auth store, retourne `{ user, loading, isAuthenticated }`
- `/dashboard` — redirige vers `/login` si non authentifié
- `/admin` — redirige vers `/` si non authentifié ou `user.is_admin !== true`
- `/login` — redirige vers `/dashboard` si déjà connecté
- Pas de vérification email obligatoire à l'inscription

---

## Theme toggle

Dark par défaut. Persisté dans `localStorage` sous la clé `seedev-theme`.
Script injecté dans `<head>` avant hydration React pour éviter le flash.
La classe `dark` / `light` est appliquée sur `<html>`.
Toutes les variables CSS sont définies dans `:root` (light) et `:root.dark` (dark).