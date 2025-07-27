# Guide de Déploiement - Tamagotchi Satirique

## Vue d'ensemble

Ce guide détaille le processus de déploiement de la mini-application "Tamagotchi Satirique" pour World App. L'architecture comprend un frontend Next.js 15, une base de données Supabase, et l'intégration MiniKit pour l'authentification et les paiements.

## Prérequis

Avant de commencer le déploiement, assurez-vous d'avoir accès aux services suivants :

**Comptes et Services Requis**
- Compte Vercel (pour le déploiement frontend)
- Compte Supabase (pour la base de données et l'authentification)
- Compte World App Developer (pour l'intégration MiniKit)
- Compte OpenAI (optionnel, pour la génération de contenu IA)

**Outils de Développement**
- Node.js 18+ et npm/yarn
- Git pour le contrôle de version
- Supabase CLI pour la gestion de la base de données

## Configuration de la Base de Données

### Étape 1: Création du Projet Supabase

Créez un nouveau projet Supabase et notez l'URL du projet ainsi que les clés API. Ces informations seront nécessaires pour la configuration des variables d'environnement.

### Étape 2: Migration de la Base de Données

Exécutez les migrations SQL pour créer les tables nécessaires. Les fichiers de migration se trouvent dans le dossier `supabase/migrations/`.

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase login
supabase link --project-ref your-project-ref

# Exécuter les migrations
supabase db push
```

### Étape 3: Configuration des Politiques RLS

Les politiques de Row Level Security sont automatiquement appliquées via les migrations. Elles garantissent que les utilisateurs ne peuvent accéder qu'à leurs propres données et aux données publiques appropriées.

### Étape 4: Configuration du Storage

Configurez le bucket de stockage pour les images des posts :

```sql
-- Créer le bucket pour les images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Politique pour permettre l'upload d'images
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre la lecture publique des images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');
```

## Configuration World App

### Étape 1: Création de l'Application

Rendez-vous sur le portail développeur World App et créez une nouvelle mini-application. Configurez les paramètres suivants :

**Informations de Base**
- Nom : Tamagotchi Satirique
- Description : Une mini-app satirique pour créer du contenu humoristique
- Catégorie : Social/Entertainment

**Configuration Technique**
- URL de l'application : Votre domaine de déploiement
- Action World ID : `tamagotchi-login`
- Niveau de vérification : Device (ou Orb pour plus de sécurité)

### Étape 2: Configuration des Paiements

Configurez l'adresse de portefeuille qui recevra les paiements de boost. Cette adresse doit être sécurisée et appartenir à votre organisation.

## Variables d'Environnement

Créez un fichier `.env.local` basé sur `.env.example` avec vos valeurs réelles :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# World App Configuration
NEXT_PUBLIC_WORLD_APP_ID=your-world-app-id
WORLD_APP_SECRET=your-world-app-secret

# Boost Payment Configuration
NEXT_PUBLIC_BOOST_WALLET_ADDRESS=0xYourWalletAddress

# Database
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# OpenAI (optionnel)
OPENAI_API_KEY=your-openai-api-key

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Déploiement sur Vercel

### Étape 1: Préparation du Code

Assurez-vous que votre code est prêt pour la production :

```bash
# Installer les dépendances
npm install

# Construire l'application
npm run build

# Tester localement
npm run start
```

### Étape 2: Déploiement Initial

Connectez votre repository GitHub à Vercel et configurez le déploiement :

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### Étape 3: Configuration des Variables d'Environnement

Dans le dashboard Vercel, ajoutez toutes les variables d'environnement nécessaires. Assurez-vous que les variables `NEXT_PUBLIC_*` sont correctement définies pour être accessibles côté client.

### Étape 4: Configuration du Domaine

Si vous utilisez un domaine personnalisé, configurez-le dans les paramètres Vercel et mettez à jour la configuration World App avec la nouvelle URL.

## Tests de Déploiement

### Tests Fonctionnels

Après le déploiement, effectuez les tests suivants :

**Authentification**
- Vérifiez que l'authentification World ID fonctionne correctement
- Testez la création automatique de profil utilisateur
- Confirmez la persistance de la session

**Création de Contenu**
- Testez la création de posts avec et sans images
- Vérifiez l'upload et l'affichage des images
- Confirmez la validation des données côté client et serveur

**Interactions Sociales**
- Testez les réactions (like, LOL, facepalm)
- Vérifiez la mise à jour en temps réel des compteurs
- Confirmez le calcul correct des points pour le leaderboard

**Système de Boost**
- Testez l'initialisation du paiement MiniKit
- Vérifiez la confirmation du paiement
- Confirmez l'affichage prioritaire des posts boostés

### Tests de Performance

Utilisez les outils suivants pour valider les performances :

```bash
# Lighthouse audit
npx lighthouse https://your-domain.vercel.app --view

# Tests de charge basiques
npx autocannon https://your-domain.vercel.app -c 10 -d 30
```

## Monitoring et Maintenance

### Surveillance des Erreurs

Configurez Vercel Analytics et Sentry pour surveiller les erreurs en production :

```bash
npm install @sentry/nextjs
```

### Logs et Debugging

Utilisez les logs Vercel pour diagnostiquer les problèmes :

```bash
vercel logs your-deployment-url
```

### Sauvegardes

Configurez des sauvegardes automatiques de votre base de données Supabase via le dashboard d'administration.

## Mise à Jour et Déploiement Continu

### Workflow GitHub Actions

Créez un workflow pour automatiser les déploiements :

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Stratégie de Rollback

En cas de problème, utilisez les fonctionnalités de rollback de Vercel :

```bash
# Lister les déploiements
vercel ls

# Rollback vers un déploiement précédent
vercel rollback deployment-url
```

## Sécurité

### Bonnes Pratiques

Implémentez les mesures de sécurité suivantes :

**Protection des API**
- Validation stricte des entrées utilisateur
- Rate limiting sur les endpoints sensibles
- Authentification requise pour les actions critiques

**Gestion des Secrets**
- Stockage sécurisé des clés API
- Rotation régulière des secrets
- Séparation des environnements de développement et production

**Conformité RGPD**
- Politique de confidentialité claire
- Mécanisme de suppression des données utilisateur
- Consentement explicite pour le traitement des données

## Troubleshooting

### Problèmes Courants

**Erreurs d'Authentification**
- Vérifiez la configuration World App
- Confirmez les variables d'environnement
- Testez la connectivité avec l'API World ID

**Problèmes de Base de Données**
- Vérifiez les politiques RLS
- Confirmez les permissions utilisateur
- Testez les requêtes SQL directement

**Erreurs de Paiement**
- Vérifiez l'adresse de portefeuille
- Confirmez la configuration MiniKit
- Testez avec de petits montants

### Support et Documentation

Pour obtenir de l'aide supplémentaire :

- Documentation Supabase : https://supabase.com/docs
- Documentation World App : https://docs.worldcoin.org
- Documentation Vercel : https://vercel.com/docs
- Support technique : Créez une issue sur le repository GitHub

## Checklist de Déploiement

Avant de considérer le déploiement comme terminé, vérifiez tous les points suivants :

**Configuration**
- Variables d'environnement définies et testées
- Base de données migrée et configurée
- World App configuré et validé
- Domaine configuré et SSL activé

**Fonctionnalités**
- Authentification World ID fonctionnelle
- Création et affichage des posts
- Système de réactions opérationnel
- Paiements MiniKit testés
- Leaderboard mis à jour correctement

**Performance et Sécurité**
- Tests de performance satisfaisants
- Audit de sécurité effectué
- Monitoring configuré
- Sauvegardes planifiées

**Documentation**
- README mis à jour
- Documentation API complète
- Guide utilisateur disponible
- Procédures de maintenance documentées

Une fois tous ces éléments validés, votre application Tamagotchi Satirique est prête pour la production et peut être soumise pour approbation sur World App.

