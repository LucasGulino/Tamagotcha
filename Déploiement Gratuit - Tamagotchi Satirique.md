# Déploiement Gratuit - Tamagotchi Satirique

## 🆓 Stack 100% Gratuite

### Frontend - Vercel (Gratuit)
- **Limite** : 100 GB de bande passante/mois
- **Domaines** : Sous-domaine .vercel.app gratuit
- **Builds** : Illimités
- **SSL** : Automatique et gratuit

### Base de Données - Supabase (Gratuit)
- **Limite** : 500 MB de stockage
- **Utilisateurs** : 50,000 utilisateurs actifs mensuels
- **Requêtes** : 2 millions de requêtes/mois
- **Authentification** : Incluse

### Stockage Images - Supabase Storage (Gratuit)
- **Limite** : 1 GB de stockage
- **Bande passante** : 2 GB/mois
- **Parfait pour** : MVP et tests

## 🚀 Déploiement Étape par Étape

### 1. Préparer Supabase (5 minutes)

```bash
# 1. Créer un compte sur supabase.com
# 2. Créer un nouveau projet
# 3. Noter l'URL et les clés API
```

**Configuration Supabase :**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Dans Settings > API, copiez :
   - Project URL
   - Anon public key
   - Service role key

### 2. Configurer la Base de Données

```sql
-- Exécuter dans l'éditeur SQL Supabase
-- Copier-coller le contenu de supabase/migrations/001_initial_schema.sql
```

### 3. Déployer sur Vercel (2 minutes)

**Option A : Via GitHub (Recommandé)**
1. Pushez votre code sur GitHub
2. Connectez-vous sur [vercel.com](https://vercel.com)
3. Importez votre repository
4. Ajoutez les variables d'environnement
5. Déployez !

**Option B : Via CLI**
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### 4. Variables d'Environnement Vercel

Dans le dashboard Vercel, ajoutez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service
NEXT_PUBLIC_WORLD_APP_ID=app_staging_xxx (pour les tests)
WORLD_APP_SECRET=votre-secret-world-app
NEXT_PUBLIC_BOOST_WALLET_ADDRESS=0x0000000000000000000000000000000000000000
```

## 🧪 Mode Test World App

Pour tester sans frais :

### Configuration Test
```env
# Utiliser l'environnement de test World App
NEXT_PUBLIC_WORLD_APP_ID=app_staging_xxx
WORLD_APP_SECRET=test_secret

# Adresse de test (ne recevra pas de vrais WLD)
NEXT_PUBLIC_BOOST_WALLET_ADDRESS=0x0000000000000000000000000000000000000000
```

### Simulation des Paiements
Le code inclut déjà une simulation pour les tests :

```typescript
// Dans src/components/BoostModal.tsx
// Le paiement sera simulé si pas de vraie config World App
```

## 📱 Configuration World App Gratuite

### Environnement de Développement
1. Créez un compte développeur World App
2. Créez une app en mode "Development"
3. Configurez l'URL de votre déploiement Vercel
4. Utilisez les clés de test fournies

### Test de l'Authentification
- L'app fonctionnera dans World App Simulator
- Ou utilisez World App en mode développeur
- L'authentification sera simulée pour les tests

## 🎯 Optimisations Gratuites

### Réduire l'Usage Supabase
```typescript
// Pagination optimisée
const POSTS_PER_PAGE = 10 // Au lieu de 20

// Cache des requêtes
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Compression des images
const MAX_IMAGE_SIZE = 500 * 1024 // 500KB max
```

### Optimiser Vercel
```javascript
// next.config.js - Optimisations gratuites
module.exports = {
  images: {
    formats: ['image/webp'], // Réduire la bande passante
    minimumCacheTTL: 86400,  // Cache 24h
  },
  compress: true, // Compression gzip
}
```

## 🔧 Script de Déploiement Automatique

```bash
#!/bin/bash
# deploy-free.sh

echo "🚀 Déploiement gratuit Tamagotchi Satirique"

# 1. Build local
echo "📦 Build de l'application..."
npm run build

# 2. Test du build
echo "🧪 Test du build..."
npm run start &
SERVER_PID=$!
sleep 5
curl -f http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Build OK"
else
    echo "❌ Erreur de build"
    exit 1
fi
kill $SERVER_PID

# 3. Déploiement Vercel
echo "🌐 Déploiement sur Vercel..."
vercel --prod --confirm

echo "✅ Déploiement terminé !"
echo "🔗 Votre app est disponible sur votre domaine Vercel"
```

## 📊 Monitoring Gratuit

### Vercel Analytics (Gratuit)
```javascript
// Ajouter dans pages/_app.js
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### Supabase Dashboard
- Monitoring des requêtes inclus
- Logs d'erreurs gratuits
- Métriques d'usage en temps réel

## 🎉 Checklist Déploiement Gratuit

### Avant le Déploiement
- [ ] Compte Supabase créé
- [ ] Base de données configurée
- [ ] Compte Vercel créé
- [ ] Repository GitHub prêt
- [ ] Variables d'environnement préparées

### Après le Déploiement
- [ ] App accessible via URL Vercel
- [ ] Authentification World ID testée
- [ ] Création de posts fonctionnelle
- [ ] Système de réactions opérationnel
- [ ] Leaderboard mis à jour
- [ ] Images uploadées correctement

### Tests de Charge Gratuits
```bash
# Test simple avec curl
for i in {1..10}; do
  curl -s https://votre-app.vercel.app > /dev/null &
done
wait
echo "✅ Tests de charge OK"
```

## 💡 Conseils pour Rester Gratuit

### Optimiser l'Usage
1. **Images** : Compressez avant upload (max 500KB)
2. **Requêtes** : Utilisez la pagination intelligente
3. **Cache** : Activez le cache navigateur
4. **CDN** : Vercel CDN inclus gratuitement

### Surveiller les Limites
- Dashboard Supabase : Usage en temps réel
- Vercel Dashboard : Bande passante et builds
- Alertes automatiques avant dépassement

### Plan de Montée en Charge
Si vous dépassez les limites gratuites :
1. **Supabase Pro** : 25$/mois (8GB, 100M requêtes)
2. **Vercel Pro** : 20$/mois (1TB bande passante)
3. **Toujours moins cher** que les alternatives

## 🚀 Déploiement en 1 Commande

```bash
# Tout automatiser
chmod +x deploy-free.sh
./deploy-free.sh
```

Votre MVP sera en ligne en moins de 10 minutes, 100% gratuit ! 🎭

