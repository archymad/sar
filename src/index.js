import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { handleError } from './utils.js';
import { buildPrompt, callOllama, adjustTone } from './orchestrator.js';
import { storeMemory } from './memory.js';
import { getState, updateState } from './state.js';
import { isPhotoRequest, findPhoto, generatePhotoResponse, extractPhotoCategory } from './photos.js';
import fs from 'fs/promises';

// Configuration
dotenv.config();

// Initialisation du client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'sarah-bot',
    dataPath: process.env.WHATSAPP_SESSION_PATH
  })
});

// Gestion de la connexion
client.on('qr', (qr) => {
  console.log('QR Code reçu, scannez-le avec WhatsApp :');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Sarah est connectée !');
});

// Gestion des messages
client.on('message', async msg => {
  try {
    console.log('Message reçu:', msg.body);
    
    // Vérifier si c'est une demande de photo
    if (isPhotoRequest(msg.body)) {
      console.log('Demande de photo détectée');
      const category = extractPhotoCategory(msg.body);
      console.log('Catégorie détectée:', category);
      
      const photoPath = await findPhoto(category);
      console.log('Chemin de la photo:', photoPath);
      
      if (photoPath) {
        try {
          const response = generatePhotoResponse(msg.body);
          console.log('Réponse générée:', response);
          await msg.reply(response);
          
          // Envoyer la photo
          console.log('Lecture du fichier photo...');
          const media = await fs.readFile(photoPath);
          console.log('Envoi de la photo...');
          const mediaMessage = new pkg.MessageMedia('image/png', media.toString('base64'));
          await msg.reply(mediaMessage, null, { caption: 'Voilà ce que tu voulais voir... 😏' });
          console.log('Photo envoyée avec succès');
          return;
        } catch (photoError) {
          console.error('Erreur lors de l\'envoi de la photo:', photoError);
          await msg.reply('Désolé, j\'ai eu un problème pour envoyer la photo... 😅');
          return;
        }
      } else {
        console.log('Aucune photo trouvée pour la catégorie:', category);
        await msg.reply('Désolé, je n\'ai pas de photo à te montrer pour le moment... 😅');
        return;
      }
    }

    // Récupérer l'état actuel
    const state = await getState();
    console.log('État récupéré:', state);

    // Construire le prompt
    const prompt = `[État actuel: ${state.mood}, Énergie: ${state.energy}]
[Message précédent: ${state.lastMessage || 'Aucun'}]
[Message actuel: ${msg.body}]`;

    console.log('Prompt construit:', prompt);

    // Obtenir la réponse d'Ollama
    const response = await callOllama(prompt);
    console.log('Réponse Ollama:', response);

    // Envoyer la réponse
    await msg.reply(response);
    console.log('Réponse envoyée');

    // Stocker la mémoire
    await storeMemory(msg.body, response);
    console.log('Mémoire stockée');

    // Mettre à jour l'état
    await updateState(msg.from, msg.body, response);
    console.log('État mis à jour');

  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    await msg.reply('Désolé, j\'ai eu un petit problème... 😅');
  }
});

// Démarrage du bot
client.initialize(); 