// Liste de mots à filtrer
const NSFW_WORDS = [
  // TODO: Ajouter une liste de mots sensibles
];

// Vérification du contenu NSFW
export function checkNSFW(content) {
  const words = content.toLowerCase().split(/\s+/);
  return words.some(word => NSFW_WORDS.includes(word));
}

// Vérification de la longueur du message
export function checkLength(content, maxLength = 180) {
  return content.length <= maxLength;
}

// Vérification du contenu consensuel
export function checkConsent(content) {
  // TODO: Implémenter une vérification plus sophistiquée
  return true;
}

// Vérification globale de sécurité
export function safetyCheck(content) {
  if (checkNSFW(content)) {
    throw new Error('Contenu NSFW détecté');
  }
  if (!checkLength(content)) {
    throw new Error('Message trop long');
  }
  if (!checkConsent(content)) {
    throw new Error('Contenu non consensuel détecté');
  }
  return true;
} 