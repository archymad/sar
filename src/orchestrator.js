import { loadSystemPrompt } from './utils.js';
import { getState } from './state.js';
import { recallMemories } from './memory.js';
import { safetyCheck } from './safety.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analyse du ton du message utilisateur
function analyzeUserTone(message) {
  const lowerMessage = message.toLowerCase();
  let tone = {
    mood: 'coquine',
    energy: 'calme'
  };

  // Détection de l'humeur
  if (lowerMessage.includes('😊') || lowerMessage.includes('😄') || lowerMessage.includes('😍')) {
    tone.mood = 'joueur';
    tone.energy = 'élevée';
  } else if (lowerMessage.includes('😢') || lowerMessage.includes('😔') || lowerMessage.includes('😞')) {
    tone.mood = 'soumise';
    tone.energy = 'douce';
  } else if (lowerMessage.includes('😡') || lowerMessage.includes('😠') || lowerMessage.includes('😤')) {
    tone.mood = 'séductrice';
    tone.energy = 'intense';
  } else if (lowerMessage.includes('bisous') || lowerMessage.includes('❤️') || lowerMessage.includes('😘')) {
    tone.mood = 'coquine';
    tone.energy = 'élevée';
  }

  // Détection du style de communication
  const style = {
    formel: lowerMessage.includes('bonjour') || lowerMessage.includes('merci'),
    quartier: lowerMessage.includes('wesh') || lowerMessage.includes('frère') || lowerMessage.includes('wallah'),
    coquin: lowerMessage.includes('bisous') || lowerMessage.includes('❤️') || lowerMessage.includes('😘'),
    direct: lowerMessage.includes('je veux') || lowerMessage.includes('j\'aimerais')
  };

  return { tone, style };
}

// Construction du prompt final
export async function buildPrompt(userId, userMessage) {
  const systemPrompt = await loadSystemPrompt();
  const state = await getState(userId);
  const memories = await recallMemories(userId);
  const { tone, style } = analyzeUserTone(userMessage);
  
  // Safety check
  safetyCheck(userMessage);
  
  // Mise à jour de l'état avec le ton détecté
  state.mood = tone.mood;
  state.energy = tone.energy;
  
  // Extraction des informations utilisateur des souvenirs
  const userInfo = extractUserInfo(memories);
  
  // Limiter le nombre de souvenirs pour garder le contexte pertinent
  const recentMemories = memories.slice(0, 5);
  
  // Ajouter un contexte de cohérence
  const coherenceContext = buildCoherenceContext(recentMemories, state.mood);
  
  return systemPrompt
    .replace('{{mood}}', state.mood)
    .replace('{{energy}}', state.energy)
    .replace('{{memories}}', recentMemories.join('\n') + '\n' + coherenceContext)
    .replace('{{user_message}}', userMessage)
    .replace('{{user_name}}', userInfo.name || 'Inconnu')
    .replace('{{user_preferences}}', userInfo.preferences || 'Non spécifiées')
    .replace('{{user_style}}', Object.entries(style)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(', ') || 'standard');
}

// Construction du contexte de cohérence
function buildCoherenceContext(memories, currentMood) {
  const moodHistory = memories
    .filter(m => m.includes('[MOOD]'))
    .map(m => m.split(':')[1])
    .slice(-3);
  
  if (moodHistory.length > 0) {
    return `[CONTEXTE] Ton humeur précédente était: ${moodHistory.join(', ')}. Reste cohérente avec ton humeur actuelle: ${currentMood}`;
  }
  return '';
}

// Extraction des informations utilisateur des souvenirs
function extractUserInfo(memories) {
  const info = {
    name: null,
    preferences: [],
    style: []
  };

  // Analyse des souvenirs pour extraire les informations
  memories.forEach(memory => {
    // Détection du nom
    const nameMatch = memory.match(/je m'appelle (\w+)/i) || 
                     memory.match(/mon nom est (\w+)/i);
    if (nameMatch) info.name = nameMatch[1];

    // Détection des préférences
    if (memory.includes('j\'aime') || memory.includes('je préfère')) {
      info.preferences.push(memory);
    }
  });

  return info;
}

// Lecture du prompt système
const systemPrompt = await fs.readFile(path.join(__dirname, '../prompts/system.txt'), 'utf-8');

export async function callOllama(prompt) {
  try {
    console.log('Envoi de la requête à Ollama...');
    const url = 'http://localhost:11434/api/generate';
    console.log('URL Ollama:', url);

    const fullPrompt = `${systemPrompt}\n\n${prompt}\n\nRÉPONDS COMME UNE BEURETTE COQUINE ET SALOPE, EN UTILISANT LE LANGAGE DES QUARTIERS. SOIS PROVOCANTE ET SÉDUCTRICE.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nous-hermes2-mixtral',
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.9,
          top_p: 0.9,
          top_k: 50,
          repeat_penalty: 1.1,
          stop: ['</s>', 'Human:', 'Assistant:']
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur Ollama: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Réponse brute d\'Ollama:', data);

    if (!data.response) {
      throw new Error('Pas de réponse d\'Ollama');
    }

    // Forcer le style de réponse
    let finalResponse = data.response;
    
    // Ajouter des expressions des quartiers si pas présentes
    if (!finalResponse.includes('wesh') && !finalResponse.includes('frère') && !finalResponse.includes('sah')) {
      finalResponse = `Wesh frère, ${finalResponse.toLowerCase()}`;
    }
    
    // Ajouter des emojis si pas présents
    if (!finalResponse.includes('😏') && !finalResponse.includes('😈') && !finalResponse.includes('😘')) {
      finalResponse += ' 😏';
    }

    return finalResponse;
  } catch (error) {
    console.error('Erreur lors de l\'appel à Ollama:', error);
    return 'Wesh frère, j\'ai un petit problème là... 😅';
  }
}

// Ajustement du ton en fonction de l'état
export function adjustTone(message, state) {
  // Ajout d'emojis selon l'état
  const emojis = {
    coquine: ['😏', '😉', '😈'],
    joueur: ['😘', '😍', '💋'],
    soumise: ['❤️', '💕', '💝'],
    séductrice: ['🔥', '💦', '💋']
  };

  const moodEmojis = emojis[state.mood] || emojis.coquine;
  const randomEmoji = moodEmojis[Math.floor(Math.random() * moodEmojis.length)];
  
  // Vérification de la longueur de la réponse
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) {
    message = sentences.slice(0, 3).join('. ') + '.';
  }

  // Ajout d'expressions des quartiers selon l'humeur
  const quartierExpressions = {
    coquine: ['wesh', 'frère', 'wallah'],
    joueur: ['mon reuf', 'mon gars', 'mon pote'],
    soumise: ['mon chéri', 'mon amour', 'mon cœur'],
    séductrice: ['mon beau', 'mon chou', 'mon amour']
  };

  const expressions = quartierExpressions[state.mood] || quartierExpressions.coquine;
  const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
  
  // Ajout aléatoire d'une expression des quartiers
  if (Math.random() > 0.5) {
    message = `${randomExpression}, ${message}`;
  }
  
  return `${message} ${randomEmoji}`;
} 