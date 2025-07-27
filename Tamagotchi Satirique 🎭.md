# Tamagotchi Satirique 🎭

Une mini-application satirique pour World App où les utilisateurs créent du contenu humoristique, gagnent des points et peuvent booster leurs posts avec WLD.

## 🎯 Concept

Tamagotchi Satirique est une plateforme sociale satirique qui combine l'humour du style South Park/Simpsons avec la technologie blockchain. Les utilisateurs s'authentifient via World ID, créent du contenu satirique, interagissent via des réactions et peuvent payer 0.2 WLD pour booster leurs posts pendant 24 heures.

## ✨ Fonctionnalités

### Authentification et Profil
- Connexion sécurisée via World ID (MiniKit)
- Profils utilisateur avec avatars et régions
- Gestion automatique des sessions

### Création de Contenu
- Posts satiriques jusqu'à 280 caractères
- Upload d'images avec compression automatique
- Génération d'inspiration satirique via IA (optionnel)
- Support multilingue (FR/EN)

### Interactions Sociales
- Système de réactions : Like (1pt), LOL (2pts), Facepalm (3pts)
- Leaderboard hebdomadaire par région
- Feed global et régional

### Système de Boost
- Paiement de 0.2 WLD via MiniKit
- Mise en avant pendant 24 heures
- Effets visuels spéciaux (bordure dorée, animation)

### Interface Utilisateur
- Design cartoon satirique (style South Park/Simpsons)
- Interface responsive (mobile-first)
- Animations et transitions fluides
- Thème sombre/clair adaptatif

## 🛠 Stack Technique

### Frontend
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **MiniKit SDK** - Intégration World App
- **React Hook Form** - Gestion des formulaires
- **Sonner** - Notifications toast

### Backend
- **Next.js API Routes** - API serverless
- **Supabase** - Base de données PostgreSQL et authentification
- **Prisma** - ORM pour la base de données
- **Row Level Security** - Sécurité au niveau des données

### Services Externes
- **World App** - Authentification World ID et paiements
- **OpenAI API** - Génération de contenu IA (optionnel)
- **Supabase Storage** - Stockage des images

## 🚀 Installation et Développement

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte World App Developer

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-username/tamagotchi-satirique.git
cd tamagotchi-satirique

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Configurer la base de données
npm run db:setup

# Lancer le serveur de développement
npm run dev
```

### Configuration de la Base de Données

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet Supabase
supabase login
supabase link --project-ref your-project-ref

# Exécuter les migrations
supabase db push

# Générer les types TypeScript
npm run db:types
```

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting du code
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
npm run db:setup     # Configuration initiale de la DB
npm run db:migrate   # Exécuter les migrations
npm run db:types     # Générer les types TypeScript
```

## 📱 Utilisation

### Pour les Utilisateurs

1. **Connexion** : Ouvrez l'app dans World App et connectez-vous avec World ID
2. **Création** : Rédigez du contenu satirique avec ou sans image
3. **Interaction** : Réagissez aux posts avec Like, LOL ou Facepalm
4. **Boost** : Payez 0.2 WLD pour mettre en avant vos posts
5. **Classement** : Gagnez des points et montez dans le leaderboard

### Pour les Développeurs

L'application suit une architecture modulaire avec :

- **Components** : Composants React réutilisables dans `src/components/`
- **Hooks** : Logique métier dans `src/hooks/`
- **API Routes** : Endpoints backend dans `src/app/api/`
- **Types** : Définitions TypeScript dans `src/types/`
- **Utils** : Fonctions utilitaires dans `src/lib/`

## 🎨 Design System

### Couleurs
- **Primary** : Orange satirique (#f97316)
- **Secondary** : Jaune cartoon (#fbbf24)
- **Accent** : Violet satirique (#8b5cf6)
- **Success** : Vert cartoon (#10b981)
- **Surface** : Blanc cassé (#fefefe)

### Typographie
- **Font** : Inter (système de fallback)
- **Tailles** : 72px/36px/24px (front), 36px/24px/20px (contenu)
- **Poids** : Bold pour les titres, Medium pour le contenu

### Animations
- **Bounce-in** : Entrée des éléments
- **Wiggle** : Animation des emojis
- **Pulse-fast** : Éléments interactifs
- **Slide-up** : Apparition des posts

## 🧪 Tests

### Tests Unitaires
```bash
npm run test                    # Tous les tests
npm run test:watch             # Mode watch
npm run test:coverage          # Avec couverture
```

### Tests d'Intégration
```bash
npm run test:e2e               # Tests end-to-end
```

### Structure des Tests
- **API Tests** : `__tests__/api/`
- **Component Tests** : `__tests__/components/`
- **Hook Tests** : `__tests__/hooks/`
- **Utils Tests** : `__tests__/lib/`

## 🚀 Déploiement

### Déploiement Automatique (Recommandé)

1. **Vercel** : Connectez votre repository GitHub à Vercel
2. **Variables** : Configurez les variables d'environnement
3. **Domaine** : Configurez votre domaine personnalisé
4. **World App** : Mettez à jour l'URL dans la configuration World App

### Déploiement Manuel

```bash
# Build de production
npm run build

# Déploiement Vercel
npx vercel --prod

# Ou autre plateforme
npm run start
```

Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide détaillé.

## 🔧 Configuration

### Variables d'Environnement

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# World App
NEXT_PUBLIC_WORLD_APP_ID=
WORLD_APP_SECRET=

# Paiements
NEXT_PUBLIC_BOOST_WALLET_ADDRESS=

# IA (optionnel)
OPENAI_API_KEY=
```

### Personnalisation

- **Thème** : Modifiez `tailwind.config.js` pour les couleurs
- **Contenu** : Ajustez les prompts IA dans `src/lib/ai-prompts.ts`
- **Régions** : Configurez les régions dans `src/types/index.ts`
- **Traductions** : Éditez `locales/fr.json` et `locales/en.json`

## 📊 Monitoring

### Métriques Clés
- Nombre d'utilisateurs actifs
- Posts créés par jour
- Taux de conversion boost
- Engagement par région

### Outils Recommandés
- **Vercel Analytics** : Performance et usage
- **Sentry** : Monitoring des erreurs
- **Supabase Dashboard** : Métriques base de données

## 🤝 Contribution

### Guidelines

1. **Fork** le repository
2. **Créez** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Committez** vos changements (`git commit -m 'Add amazing feature'`)
4. **Pushez** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request

### Standards de Code

- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **TypeScript** : Typage strict
- **Tests** : Couverture > 70%

### Commit Convention

```
feat: add new satirical prompt system
fix: resolve boost payment validation
docs: update deployment guide
style: improve mobile responsiveness
test: add unit tests for reactions API
```

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🆘 Support

### Documentation
- [Guide de Déploiement](./DEPLOYMENT.md)
- [Documentation API](./docs/API.md)
- [Guide UX](./docs/UX_GUIDELINES.md)

### Communauté
- **Issues** : Reportez les bugs sur GitHub
- **Discussions** : Posez vos questions dans les discussions
- **Discord** : Rejoignez notre serveur communautaire

### Contact
- **Email** : support@tamagotchi-satirique.com
- **Twitter** : @TamagotchiSat
- **Website** : https://tamagotchi-satirique.com

---

Fait avec 🎭 pour la communauté World App

## 🎯 Roadmap

### Version 1.1
- [ ] Système de badges et achievements
- [ ] Partage sur réseaux sociaux externes
- [ ] Mode sombre/clair manuel
- [ ] Notifications push

### Version 1.2
- [ ] Système de commentaires
- [ ] Posts en mode thread
- [ ] Recherche et hashtags
- [ ] API publique pour développeurs

### Version 2.0
- [ ] Système de groupes/communautés
- [ ] Marketplace de contenu
- [ ] NFT des meilleurs posts
- [ ] Intégration autres blockchains

---

*Dernière mise à jour : Décembre 2024*

