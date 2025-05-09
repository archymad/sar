import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { handleError } from './utils.js';
import { buildPrompt, callOllama, adjustTone } from './orchestrator.js';
import { storeMemory } from './memory.js';
import { getState, updateState } from './state.js';

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
client.on('message', async (message) => {
  try {
    console.log('Message reçu:', message.body);
    const userId = message.from;
    const userMessage = message.body;
    
    // Récupération de l'état
    console.log('Récupération de l\'état...');
    const state = await getState(userId);
    console.log('État récupéré:', state);
    
    // Construction et envoi du prompt
    console.log('Construction du prompt...');
    const prompt = await buildPrompt(userId, userMessage);
    console.log('Prompt construit:', prompt);
    
    console.log('Appel à Ollama...');
    const response = await callOllama(prompt);
    console.log('Réponse d\'Ollama:', response);
    
    // Ajustement du ton et envoi
    console.log('Ajustement du ton...');
    const finalResponse = adjustTone(response, state);
    console.log('Réponse finale:', finalResponse);
    
    console.log('Envoi de la réponse...');
    await message.reply(finalResponse);
    console.log('Réponse envoyée');
    
    // Stockage du souvenir
    console.log('Stockage du souvenir...');
    await storeMemory(userId, userMessage);
    console.log('Souvenir stocké');
    
  } catch (error) {
    console.error('Erreur complète:', error);
    const errorMessage = handleError(error);
    await message.reply(errorMessage);
  }
});

// Démarrage du bot
client.initialize(); 