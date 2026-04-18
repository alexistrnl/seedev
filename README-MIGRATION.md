# 🚀 Migration de la landing Seedev

## Ce que contient ce ZIP

```
src/
├── app/
│   ├── page.tsx          ← NOUVELLE landing (remplace l'existant)
│   ├── layout.tsx        ← NOUVEAU layout (remplace l'existant)
│   └── globals.css       ← NOUVEAU CSS global (remplace l'existant)
└── components/
    └── landing/          ← NOUVEAU dossier à créer
        ├── Nav.tsx
        ├── Hero.tsx
        ├── Process.tsx
        ├── Comparatif.tsx
        ├── Portfolio.tsx
        ├── Configurator.tsx
        ├── Pricing.tsx
        ├── CTA.tsx
        └── Footer.tsx
```

## Procédure d'installation

### 1. Backup (impératif, 30 secondes)

Dans ton terminal, à la racine du projet Seedev :

```bash
git checkout -b backup-avant-landing
git add .
git commit -m "backup avant nouvelle landing"
git push origin backup-avant-landing
git checkout main
git checkout -b feat/new-landing
```

### 2. Dézipper ce pack dans ton projet

Dézippe ce ZIP à la racine de ton projet Seedev.
Il va demander à écraser `src/app/page.tsx`, `src/app/layout.tsx`, 
`src/app/globals.css` — **accepte**.
Il va créer `src/components/landing/` avec 9 fichiers.

### 3. Ce qui NE sera PAS touché (important)

- `src/app/login/` ← intact
- `src/app/dashboard/` ← intact
- `src/app/admin/` ← intact
- `src/hooks/useAuth.ts` ← intact
- `src/lib/pocketbase.ts` ← intact
- `src/components/LoginForm.tsx`, `Dashboard.tsx`, `Chat.tsx`, `AdminPanel.tsx` ← intacts

Ta logique backend PocketBase et tes pages privées sont préservées.

### 4. Supprimer les anciens composants inutiles

Ces fichiers de l'ancienne landing ne servent plus, supprime-les :

```bash
rm -f src/components/HeroSection.tsx
rm -f src/components/HeroSection.css
rm -f src/components/PortfolioSection.tsx
rm -f src/components/PortfolioSection.css
rm -f src/components/ServicesSection.tsx
rm -f src/components/ServicesSection.css
rm -f src/components/StatsSection.tsx
rm -f src/components/StatsSection.css
rm -f src/components/ContactSection.tsx
rm -f src/components/ContactSection.css
rm -f src/components/TypeWriter.tsx
rm -f src/components/TypeWriter.css
rm -f src/components/AnimatedBg.tsx
rm -f src/components/AnimatedBg.css
rm -f src/components/TopMenu.tsx
rm -f src/components/TopMenu.css
rm -f src/components/Footer.tsx
rm -f src/components/Footer.css
```

Le nouveau Nav et Footer sont dans `src/components/landing/`.

### 5. Lancer le serveur

```bash
npm run dev
```

Puis ouvrir http://localhost:3000

### 6. Vérifications

- [ ] La nouvelle landing s'affiche avec fond animé bleu/violet
- [ ] Fond beige clair `#fafaf7` partout
- [ ] Les sections s'enchaînent : Hero → Process → Comparatif → Portfolio → Configurateur → Tarifs → CTA → Footer
- [ ] Le menu sticky en haut fonctionne (blur au scroll)
- [ ] Clic sur "Espace client" dans le nav → redirige vers /login (à ajouter si besoin)
- [ ] /login, /dashboard, /admin fonctionnent toujours

## ⚠️ Points d'attention à corriger après install

1. **Lien "Espace client" dans le Nav** → actuellement les liens du nav pointent vers des ancres `#process`, `#comparatif`, etc. Il manque un lien vers `/login`. À ajouter dans `Nav.tsx` si besoin.

2. **Bouton CTA principal** → pointe vers `#cta`, tu peux le changer pour pointer vers ton Calendly.

3. **Typage TypeScript** → si tu as des warnings dans Configurator.tsx sur la prop `data`, c'est normal (typé en `any` pour aller vite). On peut la typer plus tard proprement.

## Si ça ne marche pas

Retour en arrière en 1 commande :

```bash
git checkout main
git branch -D feat/new-landing
```

## Questions fréquentes

**Q : La police ne se charge pas ?**
R : Les fonts sont importées via Google Fonts dans `globals.css`. Vérifie ta connexion ou importe-les via `next/font/google` pour de la performance.

**Q : Le fond animé est trop coloré ?**
R : Modifie les valeurs `rgba(35,71,255,...)` dans `globals.css` sections `.ambient-bg::before` et `.ambient-bg::after`.

**Q : Les sections sont trop espacées / serrées ?**
R : Chaque composant a des `paddingTop` / `paddingBottom` inline dans la balise `<section>`. Modifie directement dans `Hero.tsx`, `Process.tsx`, etc.
