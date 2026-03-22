# Studio IA — Studio de Création Musicale Assisté par IA

Studio IA est une application web complète pour la création musicale assistée par intelligence artificielle. Elle permet de gérer des artistes virtuels, créer des projets musicaux et collaborer avec des agents IA spécialisés (Directeur Artistique, Lyriste, Arrangeur, Directeur Visuel, Lore Keeper, Producteur).

## Stack Technique

- **Frontend/Backend** : Next.js 15 (App Router, TypeScript strict)
- **UI** : shadcn/ui + Tailwind CSS v4 (responsive mobile-first)
- **Base de données** : PocketBase (binaire embarqué)
- **LLM** : OpenRouter (compatible OpenAI SDK)
- **Images** : Fal.ai SDK
- **State** : Zustand
- **Déploiement** : Docker Compose (pour LXC Proxmox)

## Déploiement sur Proxmox LXC

### Prérequis

- Conteneur LXC avec Ubuntu 22.04 ou Debian 12
- Docker et Docker Compose installés
- Ports 3000 et 8090 accessibles depuis le réseau local

### Installation

#### 1. Préparer le conteneur LXC

Dans Proxmox, créez un conteneur LXC (Ubuntu 22.04) avec :
- **RAM** : 2 Go minimum (4 Go recommandé)
- **Disque** : 20 Go minimum
- **CPU** : 2 cœurs minimum

```bash
# Dans le conteneur LXC
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Installer Docker Compose
apt install -y docker-compose-plugin
```

#### 2. Cloner et configurer le projet

```bash
# Cloner le dépôt
git clone <votre-repo> /opt/studio-ia
cd /opt/studio-ia

# Créer le fichier .env
cp .env.example .env
nano .env
```

#### 3. Configurer le fichier `.env`

```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxx
FAL_API_KEY=fal_xxxxxxxxxxxxxxxxxxxx
POCKETBASE_URL=http://pocketbase:8090
NEXT_PUBLIC_POCKETBASE_URL=http://VOTRE_IP_LXC:8090
NEXTAUTH_SECRET=votre-secret-aleatoire-ici
PB_ADMIN_EMAIL=admin@studio-ia.local
PB_ADMIN_PASSWORD=votre-mot-de-passe-securise
```

> **Important** : Remplacez `VOTRE_IP_LXC` par l'adresse IP de votre conteneur LXC.

#### 4. Créer les dossiers de données

```bash
mkdir -p pocketbase/pb_data
```

#### 5. Lancer les services

```bash
# Build et démarrage
docker compose up -d --build

# Vérifier les logs
docker compose logs -f
```

#### 6. Initialiser PocketBase

Après le premier démarrage, initialisez les collections de la base de données :

```bash
# Dans le conteneur ou en local avec Node.js
npm run init-pb
```

Ou accédez à l'interface admin PocketBase pour créer les collections manuellement :
```
http://VOTRE_IP_LXC:8090/_/
```

#### 7. Accéder à l'application

- **Studio IA** : `http://VOTRE_IP_LXC:3000`
- **PocketBase Admin** : `http://VOTRE_IP_LXC:8090/_/`

### Ports à ouvrir dans Proxmox

Dans la configuration réseau du conteneur LXC ou dans le firewall Proxmox :

| Port | Service | Description |
|------|---------|-------------|
| 3000 | Studio IA (Next.js) | Interface principale |
| 8090 | PocketBase | Base de données + Admin |

### Volumes persistants

```
pocketbase/pb_data/    # Données PocketBase (artistes, projets, etc.)
.env                   # Configuration (clés API)
```

**Important** : Sauvegardez régulièrement le dossier `pocketbase/pb_data/`.

## Développement local

### Prérequis

- Node.js 20+
- npm ou yarn

### Installation

```bash
# Cloner le dépôt
git clone <votre-repo>
cd studio-ia

# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# Lancer PocketBase (télécharger le binaire depuis https://pocketbase.io)
./pocketbase serve

# Dans un autre terminal, lancer Next.js
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

### Initialiser PocketBase en dev

```bash
npm run init-pb
```

## Utilisation

### 1. Créer un artiste

1. Accédez à **Artistes > Nouvel artiste**
2. Remplissez les sections :
   - **Identité** : Nom, biographie
   - **ADN Musical** : Genres, instruments, BPM, tags Suno
   - **ADN Lyrique** : Style d'écriture, thèmes, langues
   - **Identité Visuelle** : Palette de couleurs, style, prompts
   - **Univers & Lore** : Univers narratif, personnages, lieux
3. Les agents IA sont créés automatiquement avec des prompts par défaut

### 2. Créer un projet

1. Accédez à **Projets > Nouveau projet**
2. Choisissez l'artiste et le type (Morceau ou Album)
3. Le projet est prêt pour une session studio

### 3. Session Studio

1. Ouvrez un projet et cliquez sur **Studio**
2. Sélectionnez un agent IA :
   - 🎬 **Directeur Artistique** : Vision globale, cohérence artistique
   - ✍️ **Lyriste** : Écriture des paroles (version littéraire + Suno)
   - 🎼 **Arrangeur** : Prompts Suno optimisés
   - 🖼️ **Directeur Visuel** : Prompts de cover pour Fal.ai
   - 📖 **Lore Keeper** : Cohérence narrative, univers
   - 🎧 **Producteur** : Synthèse, fiche concept finale
3. Chattez avec l'agent (streaming temps réel)
4. Les prompts générés apparaissent dans le panel de droite
5. Sauvegardez les prompts directement dans la fiche morceau

### 4. Configurer les agents

Accédez à **Agents IA** pour personnaliser :
- Le modèle LLM utilisé (Claude, GPT-4, Llama, etc.)
- La température (précision vs créativité)
- Le system prompt personnalisé
- L'accès à la mémoire (quelles données le contexte inclut)

### 5. Paramètres

Configurez vos clés API dans **Paramètres** :
- **OpenRouter** : Pour les agents LLM
- **Fal.ai** : Pour la génération d'images

## Structure du Projet

```
studio-ia/
├── app/
│   ├── (studio)/          # Pages de l'application
│   │   ├── page.tsx       # Dashboard
│   │   ├── artists/       # Gestion artistes
│   │   ├── projects/      # Gestion projets + Studio
│   │   ├── library/       # Bibliothèque morceaux/albums
│   │   ├── agents/        # Configuration agents IA
│   │   └── settings/      # Paramètres API
│   └── api/               # Routes API
│       ├── chat/          # Streaming LLM
│       ├── generate-image/ # Génération images Fal.ai
│       └── agents/        # Gestion agents
├── lib/
│   ├── agents/            # Agents IA par défaut
│   ├── memory/            # Context Builder
│   ├── pocketbase.ts      # Client PocketBase
│   ├── openrouter.ts      # Client OpenRouter
│   └── fal.ts             # Client Fal.ai
├── components/
│   ├── studio/            # Composants studio (Chat, etc.)
│   ├── library/           # Composants bibliothèque
│   └── ui/                # shadcn/ui components
├── stores/                # Zustand stores
├── types/                 # TypeScript types
├── scripts/
│   └── init-pb.ts         # Script init PocketBase
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Mise à Jour

```bash
# Arrêter les services
docker compose down

# Mettre à jour le code
git pull

# Rebuild et redémarrer
docker compose up -d --build
```

## Sauvegarde

```bash
# Sauvegarder les données PocketBase
tar -czf backup-studio-ia-$(date +%Y%m%d).tar.gz pocketbase/pb_data/

# Restaurer
tar -xzf backup-studio-ia-YYYYMMDD.tar.gz
```

## Dépannage

### PocketBase inaccessible

```bash
# Vérifier les logs
docker compose logs pocketbase

# Vérifier le statut
docker compose ps
```

### Erreur OpenRouter

Vérifiez votre clé API dans **Paramètres** et testez la connexion. Assurez-vous que votre compte OpenRouter a du crédit.

### L'app ne démarre pas

```bash
# Voir les logs Next.js
docker compose logs nextjs

# Rebuild complet
docker compose down
docker compose up -d --build --force-recreate
```

## Clés API

### OpenRouter

1. Créez un compte sur [openrouter.ai](https://openrouter.ai)
2. Générez une clé API dans les paramètres
3. Alimentez votre compte (minimum 5$)

### Fal.ai

1. Créez un compte sur [fal.ai](https://fal.ai)
2. Générez une clé API
3. Des crédits gratuits sont disponibles au départ

## Licence

MIT — Utilisation libre pour usage personnel et commercial.
