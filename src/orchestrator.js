import { loadSystemPrompt } from './utils.js';
import { getState } from './state.js';
import { recallMemories } from './memory.js';
import { safetyCheck } from './safety.js';

// Analyse du ton du message utilisateur
function analyzeUserTone(message) {
  const lowerMessage = message.toLowerCase();
  let tone = {
    mood: 'espiègle',
    energy: 'calme'
  };

  // Détection de l'humeur
  if (lowerMessage.includes('😊') || lowerMessage.includes('😄') || lowerMessage.includes('😍')) {
    tone.mood = 'joueur';
    tone.energy = 'élevée';
  } else if (lowerMessage.includes('😢') || lowerMessage.includes('😔') || lowerMessage.includes('😞')) {
    tone.mood = 'attentionné';
    tone.energy = 'douce';
  } else if (lowerMessage.includes('😡') || lowerMessage.includes('😠') || lowerMessage.includes('😤')) {
    tone.mood = 'séducteur';
    tone.energy = 'intense';
  } else if (lowerMessage.includes('bisous') || lowerMessage.includes('❤️') || lowerMessage.includes('😘')) {
    tone.mood = 'coquin';
    tone.energy = 'élevée';
  }

  // Détection du style de communication
  const style = {
    formel: lowerMessage.includes('bonjour') || lowerMessage.includes('merci'),
    sms: lowerMessage.includes('cc') || lowerMessage.includes('tkt') || lowerMessage.includes('ptdr'),
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

// Appel à Ollama
export async function callOllama(prompt) {
  try {
    console.log('Envoi de la requête à Ollama...');
    const ollamaUrl = 'http://localhost:11434/api/generate';
    console.log('URL Ollama:', ollamaUrl);
    
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'dolphin-mistral:v2.6',
        prompt,
        stream: false,
        options: {
          temperature: 0.7, // Réduit pour plus de cohérence
          top_p: 0.8,      // Réduit pour plus de cohérence
          max_tokens: 100,  // Réduit pour des réponses plus courtes
          presence_penalty: 0.6, // Encourage la diversité
          frequency_penalty: 0.6,  // Évite la répétition
          stop: ["\n\n", "RÉPONDS À:", "IMPORTANT:"] // Arrête la génération aux séparateurs
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Réponse d\'erreur Ollama:', errorText);
      throw new Error(`Erreur Ollama: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Réponse brute d\'Ollama:', data);
    
    if (!data.response) {
      throw new Error('Pas de réponse d\'Ollama');
    }
    
    return data.response;
  } catch (error) {
    console.error('Erreur lors de l\'appel à Ollama:', error);
    throw error;
  }
}

// Ajustement du ton en fonction de l'état
export function adjustTone(message, state) {
  // Ajout d'emojis selon l'état
  const emojis = {
    espiègle: ['😏', '😉', '😈'],
    joueur: ['😘', '😍', '💋'],
    attentionné: ['❤️', '💕', '💝'],
    séducteur: ['🔥', '💦', '💋'],
    coquin: ['😈', '💋', '🔥']
  };

  const moodEmojis = emojis[state.mood] || emojis.espiègle;
  const randomEmoji = moodEmojis[Math.floor(Math.random() * moodEmojis.length)];
  
  // Vérification de la longueur de la réponse
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) {
    message = sentences.slice(0, 3).join('. ') + '.';
  }
  
  return `${message} ${randomEmoji}`;
} 