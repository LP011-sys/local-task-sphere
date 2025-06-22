
// Enhanced translation service - integrates with existing mock translations and prepares for DeepL
const translations: Record<string, Record<string, string>> = {
  en: {
    hello: "Hello",
    "how are you": "How are you?",
    "good morning": "Good morning",
    "thank you": "Thank you",
    yes: "Yes",
    no: "No",
    "task completed": "Task completed",
    "payment received": "Payment received",
    "offer accepted": "Offer accepted"
  },
  sr: {
    hello: "Zdravo",
    "how are you": "Kako si?",
    "good morning": "Dobro jutro",
    "thank you": "Hvala",
    yes: "Da",
    no: "Ne",
    "task completed": "Zadatak završen",
    "payment received": "Plaćanje primljeno",
    "offer accepted": "Ponuda prihvaćena"
  },
  ru: {
    hello: "Привет",
    "how are you": "Как дела?",
    "good morning": "Доброе утро",
    "thank you": "Спасибо",
    yes: "Да",
    no: "Нет", 
    "task completed": "Задание выполнено",
    "payment received": "Платеж получен",
    "offer accepted": "Предложение принято"
  }
};

export async function translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<string> {
  // Return original if same language
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  const lowerText = text.toLowerCase().trim();
  const targetTranslations = translations[targetLanguage];
  
  // Check for exact matches first
  if (targetTranslations && targetTranslations[lowerText]) {
    return targetTranslations[lowerText];
  }

  // TODO: In production, integrate with DeepL API here
  // For now, return with translation indicator
  const languageNames = {
    en: 'English',
    sr: 'Serbian', 
    ru: 'Russian'
  };
  
  return `[Translated from ${languageNames[sourceLanguage as keyof typeof languageNames] || sourceLanguage}] ${text}`;
}

export function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Serbian detection (Cyrillic or common Serbian words)
  if (/[а-ђж-љњ-шћџ]/.test(lowerText) || 
      lowerText.includes('zdravo') || 
      lowerText.includes('kako') || 
      lowerText.includes('hvala') ||
      lowerText.includes('dobro')) {
    return 'sr';
  }
  
  // Russian detection (Cyrillic with Russian specifics)
  if (/[а-яё]/.test(lowerText) &&
      (lowerText.includes('привет') || 
       lowerText.includes('спасибо') ||
       lowerText.includes('как дела') ||
       lowerText.includes('доброе'))) {
    return 'ru';
  }
  
  // Default to English
  return 'en';
}

export function getLanguageName(code: string): string {
  const names = {
    en: 'English',
    sr: 'Српски',
    ru: 'Русский'
  };
  return names[code as keyof typeof names] || code.toUpperCase();
}
