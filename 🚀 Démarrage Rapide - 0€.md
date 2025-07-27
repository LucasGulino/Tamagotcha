# 🚀 Démarrage Rapide - 0€

## En 3 Étapes Simples

### 1️⃣ Créer les Comptes Gratuits (5 min)

**Supabase (Base de données gratuite)**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte avec GitHub
3. Créez un nouveau projet
4. Notez l'URL et les clés API

**Vercel (Hébergement gratuit)**
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Prêt pour le déploiement !

### 2️⃣ Configuration (2 min)

```bash
# Copier les variables d'environnement
cp .env.example .env.local

# Éditer avec vos vraies valeurs Supabase
nano .env.local
```

**Variables à configurer :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service
```

### 3️⃣ Déploiement Automatique (3 min)

```bash
# Lancer le script de déploiement
./deploy-free.sh
```

**C'est tout ! 🎉**

## ⚡ Version Ultra-Rapide

Si vous voulez juste tester :

```bash
# 1. Configuration minimale
export NEXT_PUBLIC_SUPABASE_URL="demo"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="demo"

# 2. Démarrage local
npm install
npm run dev

# 3. Ouvrir http://localhost:3000
```

## 🎯 Limites Gratuites

### Supabase Gratuit
- ✅ 500 MB de stockage
- ✅ 50,000 utilisateurs/mois
- ✅ 2M requêtes/mois
- ✅ Parfait pour un MVP !

### Vercel Gratuit
- ✅ 100 GB bande passante/mois
- ✅ Domaine .vercel.app
- ✅ SSL automatique
- ✅ CDN mondial

## 🔧 Dépannage Express

**Erreur de build ?**
```bash
rm -rf node_modules .next
npm install
npm run build
```

**Variables d'environnement ?**
```bash
# Vérifier les variables
cat .env.local
```

**Problème Supabase ?**
1. Vérifiez l'URL du projet
2. Régénérez les clés API
3. Vérifiez les permissions RLS

## 📱 Test sur Mobile

Une fois déployé :
1. Ouvrez votre URL Vercel sur mobile
2. Testez l'interface responsive
3. Vérifiez les animations cartoon

## 🎭 Prêt à Lancer !

Votre Tamagotchi Satirique sera en ligne en moins de 10 minutes, coût : **0€** !

**Support :** Créez une issue GitHub si besoin d'aide.

