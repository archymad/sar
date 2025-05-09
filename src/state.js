import { createClient } from 'redis';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config();

console.log('Redis URL:', process.env.REDIS_URL);

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: false
  }
});

// Gestion des événements Redis
redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis Client Connected'));

await redis.connect();

// Gestion de l'état dynamique
export async function getState(userId) {
  const state = await redis.hGetAll(`state:${userId}`);
  return {
    mood: state.mood || 'espiègle',
    energy: state.energy || 'calme',
    heatMeter: parseInt(state.heatMeter || '0')
  };
}

export async function updateState(userId, updates) {
  await redis.hSet(`state:${userId}`, updates);
}

// Gestion des limites de sécurité
export async function incrementHeatMeter(userId) {
  return await redis.hIncrBy(`state:${userId}`, 'heatMeter', 1);
}

export async function resetHeatMeter(userId) {
  await redis.hSet(`state:${userId}`, 'heatMeter', 0);
} 