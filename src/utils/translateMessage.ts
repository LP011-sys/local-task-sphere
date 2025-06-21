
// Simple mock translation service - in production, use Google Translate API or DeepL
const translations: Record<string, Record<string, string>> = {
  en: {
    hello: "Hello",
    "how are you": "How are you?",
    "good morning": "Good morning",
    "thank you": "Thank you",
    yes: "Yes",
    no: "No"
  },
  sr: {
    hello: "Zdravo",
    "how are you": "Kako si?",
    "good morning": "Dobro jutro",
    "thank you": "Hvala",
    yes: "Da",
    no: "Ne"
  },
  es: {
    hello: "Hola",
    "how are you": "¿Cómo estás?",
    "good morning": "Buenos días",
    "thank you": "Gracias",
    yes: "Sí",
    no: "No"
  }
};

export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> {
  // This is a mock implementation
  // In production, you would call a real translation API like Google Translate or DeepL
  
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const targetTranslations = translations[targetLanguage];
  
  if (targetTranslations && targetTranslations[lowerText]) {
    return targetTranslations[lowerText];
  }

  // Fallback: return original text with translation indicator
  return `[Translated from ${sourceLanguage}] ${text}`;
}

export function detectLanguage(text: string): string {
  // Simple language detection based on common words
  // In production, use a proper language detection service
  
  const lowerText = text.toLowerCase();
  
  // Serbian detection (Cyrillic or Latin with Serbian words)
  if (lowerText.includes('здраво') || lowerText.includes('kako') || lowerText.includes('hvala')) {
    return 'sr';
  }
  
  // Spanish detection
  if (lowerText.includes('hola') || lowerText.includes('gracias') || lowerText.includes('cómo')) {
    return 'es';
  }
  
  // Default to English
  return 'en';
}
