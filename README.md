# Sarah - Bot WhatsApp avec Personnalité Évolutive

Un bot WhatsApp intelligent utilisant Ollama (mistral-dolphin) avec une personnalité évolutive et une mémoire vectorielle.

## Prérequis

- Node.js ≥ 18
- Redis
- Ollama (avec le modèle mistral-dolphin)
- ChromaDB

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Copier `.env.example` vers `.env` et configurer les variables :
```bash
cp .env.example .env
```

4. Démarrer Ollama avec le modèle mistral-dolphin :
```bash
ollama run mistral-dolphin
```

5. Démarrer le bot :
```bash
npm start
```

## Variables d'environnement

- `WHATSAPP_SESSION_PATH` : Chemin pour stocker la session WhatsApp
- `REDIS_URL` : URL de connexion Redis
- `CHROMA_PATH` : Chemin pour la base de données vectorielle
- `OLLAMA_BASE_URL` : URL de l'API Ollama
- `OLLAMA_MODEL` : Modèle Ollama à utiliser

## Fonctionnalités

- Personnalité évolutive (mood, energy)
- Mémoire vectorielle avec ChromaDB
- Filtres de sécurité NSFW
- Gestion d'état avec Redis
- Réponses contextuelles et personnalisées

## Limitations

- Contenu NSFW strictement interdit
- Messages limités à 180 tokens
- Nécessite une connexion stable à Ollama

## Développement

Pour le développement avec rechargement automatique :
```bash
npm run dev
``` 