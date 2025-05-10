import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../assets/images/photos');

// Mapping des mots-clés vers les catégories de photos
const PHOTO_CATEGORIES = {
  'cul': ['cul', 'fesses', 'derriere', 'butt', 'ass'],
  'poitrine': ['poitrine', 'seins', 'boobs', 'tits', 'chest'],
  'jambes': ['jambes', 'cuisses', 'thighs', 'legs'],
  'visage': ['visage', 'face', 'tete', 'head', 'face'],
  'corps': ['corps', 'body', 'full', 'entier'],
  'lingerie': ['lingerie', 'sous-vetements', 'underwear', 'lingerie'],
  'bikini': ['bikini', 'maillot', 'swimsuit'],
  'selfie': ['selfie', 'photo', 'picture', 'photo']
};

// Vérification de la demande de photo
export function isPhotoRequest(message) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('photo') || 
         lowerMessage.includes('image') || 
         lowerMessage.includes('picture') ||
         lowerMessage.includes('envoie') ||
         lowerMessage.includes('montre');
}

// Extraction de la catégorie demandée
export function extractPhotoCategory(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(PHOTO_CATEGORIES)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  
  return 'selfie'; // Par défaut
}

// Recherche d'une photo appropriée
export async function findPhoto(category) {
  try {
    const files = await fs.readdir(PHOTOS_DIR);
    const categoryFiles = files.filter(file => {
      const fileName = file.toLowerCase();
      return PHOTO_CATEGORIES[category].some(keyword => fileName.includes(keyword)) &&
             (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png'));
    });

    if (categoryFiles.length === 0) {
      console.log('Aucune photo trouvée pour la catégorie:', category);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * categoryFiles.length);
    const selectedFile = categoryFiles[randomIndex];
    console.log('Photo sélectionnée:', selectedFile);
    return path.join(PHOTOS_DIR, selectedFile);
  } catch (error) {
    console.error('Erreur lors de la recherche de photo:', error);
    return null;
  }
}

// Génération de la réponse pour une demande de photo
export function generatePhotoResponse(message) {
  const category = extractPhotoCategory(message);
  
  const responses = {
    cul: [
      "Wesh frère, tu veux voir mon petit cul ? 😏",
      "Sah t'as raison, j'ai un cul de ouf ! 😈",
      "Je vais te montrer mon plus bel atout... 😘",
      "Wallah mon derrière est trop bon ! 💋",
      "Tu veux voir mon petit cul de beurette ? 😏"
    ],
    poitrine: [
      "Wesh, tu veux voir ma poitrine ? 😏",
      "Sah mes seins sont trop beaux ! 😈",
      "Je vais te montrer ce que tu veux voir... 😘",
      "Wallah j'ai une poitrine de ouf ! 💋",
      "Tu veux voir mes seins de beurette ? 😏"
    ],
    jambes: [
      "Wesh, tu veux voir mes jambes ? 😏",
      "Sah mes cuisses sont trop belles ! 😈",
      "Je vais te montrer mes gambettes... 😘",
      "Wallah j'ai des jambes de ouf ! 💋",
      "Tu veux voir mes cuisses de beurette ? 😏"
    ],
    visage: [
      "Wesh, tu veux voir mon visage ? 😏",
      "Sah je suis trop belle ! 😈",
      "Je vais te montrer mon plus beau sourire... 😘",
      "Wallah j'ai un visage de ouf ! 💋",
      "Tu veux voir ma tête de beurette ? 😏"
    ],
    corps: [
      "Wesh, tu veux voir mon corps ? 😏",
      "Sah j'ai un corps de ouf ! 😈",
      "Je vais te montrer tout ce que tu veux... 😘",
      "Wallah je suis trop bonne ! 💋",
      "Tu veux voir mon corps de beurette ? 😏"
    ],
    lingerie: [
      "Wesh, tu veux voir ma lingerie ? 😏",
      "Sah je suis trop sexy dedans ! 😈",
      "Je vais te montrer mes plus beaux sous-vêtements... 😘",
      "Wallah je suis trop chaude ! 💋",
      "Tu veux voir ma lingerie de beurette ? 😏"
    ],
    bikini: [
      "Wesh, tu veux voir mon bikini ? 😏",
      "Sah je suis trop bonne dedans ! 😈",
      "Je vais te montrer mon maillot... 😘",
      "Wallah je suis trop chaude ! 💋",
      "Tu veux voir mon bikini de beurette ? 😏"
    ],
    selfie: [
      "Wesh, tu veux une photo de moi ? 😏",
      "Sah je suis trop belle ! 😈",
      "Je vais te montrer mon plus beau selfie... 😘",
      "Wallah je suis trop bonne ! 💋",
      "Tu veux voir ma photo de beurette ? 😏"
    ]
  };

  const categoryResponses = responses[category] || responses.selfie;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
} 