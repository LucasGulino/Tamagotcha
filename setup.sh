#!/bin/bash

echo "🎭 Configuration du MVP Tamagotchi Satirique"
echo "============================================"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Copier le fichier d'environnement
if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cp .env.example .env.local
    echo "⚠️  N'oubliez pas de configurer vos variables d'environnement dans .env.local"
fi

# Installer Supabase CLI si pas installé
if ! command -v supabase &> /dev/null; then
    echo "📦 Installation de Supabase CLI..."
    npm install -g supabase
fi

# Générer les types Prisma
echo "🔧 Génération des types Prisma..."
npx prisma generate

echo ""
echo "🎉 Setup terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurez vos variables d'environnement dans .env.local"
echo "2. Lancez Supabase localement : npm run supabase:start"
echo "3. Appliquez les migrations : npm run db:push"
echo "4. Lancez le serveur de développement : npm run dev"
echo ""
echo "🌐 L'application sera disponible sur http://localhost:3000"

