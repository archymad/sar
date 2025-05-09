import { createClient } from 'redis';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

console.log('Initialisation de la mémoire avec Redis...');

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: false
  }
});

await redisClient.connect();

const MEMORY_KEY = 'sarah:memories';
const MAX_MEMORIES = 100;

// Stockage d'un souvenir
export async function storeMemory(userId, message) {
  try {
    const memory = {
      timestamp: Date.now(),
      content: message,
      type: detectMemoryType(message)
    };

    const key = `${MEMORY_KEY}:${userId}`;
    const memories = await getMemories(userId);
    
    // Ajout du nouveau souvenir
    memories.unshift(memory);
    
    // Limite à MAX_MEMORIES souvenirs
    if (memories.length > MAX_MEMORIES) {
      memories.length = MAX_MEMORIES;
    }
    
    await redisClient.set(key, JSON.stringify(memories));
    console.log('Souvenir stocké avec succès');
  } catch (error) {
    console.error('Erreur lors du stockage du souvenir:', error);
  }
}

// Récupération des souvenirs
export async function recallMemories(userId) {
  try {
    const key = `${MEMORY_KEY}:${userId}`;
    const memories = await getMemories(userId);
    
    // Filtrage et formatage des souvenirs
    return memories
      .filter(memory => !isExpired(memory))
      .map(memory => formatMemory(memory));
  } catch (error) {
    console.error('Erreur lors de la récupération des souvenirs:', error);
    return [];
  }
}

// Détection du type de souvenir
function detectMemoryType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('je m\'appelle') || lowerMessage.includes('mon nom est')) {
    return 'user_info';
  } else if (lowerMessage.includes('j\'aime') || lowerMessage.includes('je préfère')) {
    return 'preference';
  } else if (lowerMessage.includes('bisous') || lowerMessage.includes('❤️')) {
    return 'affection';
  } else {
    return 'conversation';
  }
}

// Vérification si un souvenir est expiré (plus de 24h)
function isExpired(memory) {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return Date.now() - memory.timestamp > ONE_DAY;
}

// Formatage d'un souvenir pour l'affichage
function formatMemory(memory) {
  switch (memory.type) {
    case 'user_info':
      return `[INFO] ${memory.content}`;
    case 'preference':
      return `[PRÉFÉRENCE] ${memory.content}`;
    case 'affection':
      return `[AFFECTION] ${memory.content}`;
    default:
      return memory.content;
  }
}

// Récupération brute des souvenirs
async function getMemories(userId) {
  const key = `${MEMORY_KEY}:${userId}`;
  const memories = await redisClient.get(key);
  return memories ? JSON.parse(memories) : [];
}

// Nettoyage des vieux souvenirs
export async function cleanupOldMemories(maxAge = 7 * 24 * 60 * 60 * 1000) {
  try {
    const cutoff = Date.now() - maxAge;
    // Supprimer les clés plus anciennes que maxAge
    const keys = await redisClient.keys('memory:*');
    for (const key of keys) {
      const timestamp = parseInt(key.split(':')[2]);
      if (timestamp < cutoff) {
        await redisClient.del(key);
      }
    }
    console.log('Nettoyage des vieux souvenirs effectué');
  } catch (error) {
    console.error('Erreur lors du nettoyage des souvenirs:', error);
  }
} 