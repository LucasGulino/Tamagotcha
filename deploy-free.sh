#!/bin/bash

# Script de déploiement gratuit pour Tamagotchi Satirique
# Coût : 0€ avec Vercel + Supabase gratuit

set -e  # Arrêter en cas d'erreur

echo "🎭 DÉPLOIEMENT GRATUIT - TAMAGOTCHI SATIRIQUE"
echo "=============================================="

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Vérifier les prérequis
echo ""
print_info "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi
print_success "Node.js $(node --version) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi
print_success "npm $(npm --version) détecté"

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    print_error "Veuillez exécuter ce script depuis le dossier racine du projet"
    exit 1
fi
print_success "Dossier projet détecté"

# Installer les dépendances
echo ""
print_info "Installation des dépendances..."
npm install
print_success "Dépendances installées"

# Vérifier le fichier .env.local
echo ""
if [ ! -f ".env.local" ]; then
    print_warning "Fichier .env.local manquant"
    print_info "Copie de .env.example vers .env.local..."
    cp .env.example .env.local
    print_warning "⚠️  IMPORTANT: Configurez vos variables dans .env.local avant de continuer"
    print_info "Variables requises:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    read -p "Appuyez sur Entrée après avoir configuré .env.local..."
fi

# Build de l'application
echo ""
print_info "Build de l'application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build réussi"
else
    print_error "Échec du build"
    exit 1
fi

# Test du build localement
echo ""
print_info "Test du build en local..."
npm run start &
SERVER_PID=$!
sleep 10

# Tester si le serveur répond
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Serveur local OK"
else
    print_error "Le serveur local ne répond pas"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Arrêter le serveur local
kill $SERVER_PID 2>/dev/null || true
sleep 2

# Vérifier si Vercel CLI est installé
echo ""
if ! command -v vercel &> /dev/null; then
    print_info "Installation de Vercel CLI..."
    npm install -g vercel
    print_success "Vercel CLI installé"
else
    print_success "Vercel CLI détecté"
fi

# Connexion à Vercel
echo ""
print_info "Vérification de la connexion Vercel..."
if ! vercel whoami &> /dev/null; then
    print_warning "Connexion à Vercel requise"
    vercel login
fi
print_success "Connecté à Vercel"

# Configuration du projet Vercel
echo ""
print_info "Configuration du projet Vercel..."

# Créer vercel.json pour optimiser le déploiement gratuit
cat > vercel.json << EOF
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
EOF

print_success "Configuration Vercel créée"

# Déploiement sur Vercel
echo ""
print_info "Déploiement sur Vercel..."
print_warning "Assurez-vous d'avoir configuré les variables d'environnement dans le dashboard Vercel"

# Déployer en production
vercel --prod --confirm

if [ $? -eq 0 ]; then
    print_success "🎉 Déploiement réussi !"
    echo ""
    echo "🔗 Votre application est maintenant en ligne !"
    echo ""
    print_info "Prochaines étapes :"
    echo "1. Configurez les variables d'environnement dans le dashboard Vercel"
    echo "2. Testez l'authentification World ID"
    echo "3. Vérifiez le fonctionnement des posts et réactions"
    echo "4. Configurez votre app World App avec l'URL de production"
    echo ""
    print_info "Monitoring gratuit :"
    echo "- Dashboard Vercel : https://vercel.com/dashboard"
    echo "- Dashboard Supabase : https://app.supabase.com"
    echo ""
    print_success "Coût total : 0€ 💰"
else
    print_error "Échec du déploiement"
    exit 1
fi

# Nettoyage
rm -f vercel.json

echo ""
print_success "Script terminé avec succès ! 🎭"

