# Sarah - Bot WhatsApp IA

Un bot WhatsApp intelligent et coquin utilisant Ollama (mistral-dolphin) pour des conversations naturelles et engageantes.

## 🚀 Fonctionnalités

- 🤖 Bot WhatsApp avec personnalité évolutive
- 💭 Mémoire conversationnelle avec Redis
- 🧠 Modèle d'IA local avec Ollama
- 😏 Personnalité coquine et séductrice
- 🔄 État d'humeur dynamique
- 💾 Stockage des préférences utilisateur

## 📋 Prérequis

- Node.js ≥ 18
- Redis
- Ollama avec le modèle mistral-dolphin
- WhatsApp Web

## 🛠️ Installation

1. Clone le repository :
```bash
git clone [URL_DU_REPO]
cd sarah-whatsapp-bot
```

2. Installe les dépendances :
```bash
npm install
```

3. Configure les variables d'environnement :
```bash
cp .env.example .env
# Édite .env avec tes configurations
```

4. Installe Ollama et le modèle :
```bash
# Suit les instructions sur https://ollama.ai
ollama pull dolphin-mistral:v2.6
```

## 🚀 Démarrage

```bash
npm start
```

Scanne le QR code avec WhatsApp pour connecter le bot.

## ⚙️ Configuration

Le bot est configurable via :
- `.env` : Variables d'environnement
- `sarah.yaml` : Configuration du bot
- `prompts/system.txt` : Personnalité et règles

## 🧠 Personnalité

Sarah est une femme de 25 ans, coquine et séductrice. Elle :
- Communique exclusivement en français
- S'adapte à l'humeur de son interlocuteur
- Garde une mémoire des conversations
- Reste cohérente dans ses réponses

## 🔒 Sécurité

- Vérification des messages inappropriés
- Protection des données utilisateur
- Connexion sécurisée à Redis

## 📝 Licence

[Choisis ta licence]

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésite pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request 