import fs from 'fs/promises';
import yaml from 'yaml';

// Chargement de la configuration de la personnalité
export async function loadPersona() {
  const personaFile = await fs.readFile('./persona/sarah.yaml', 'utf-8');
  return yaml.parse(personaFile);
}

// Chargement du prompt système
export async function loadSystemPrompt() {
  return await fs.readFile('./prompts/system.txt', 'utf-8');
}

// Gestionnaire d'erreurs global
export function handleError(error) {
  console.error('Erreur:', error);
  return "Je deviens toute timide... 🤭";
}

// Vérification de la longueur du message
export function checkMessageLength(message, maxLength = 180) {
  return message.length <= maxLength;
} 