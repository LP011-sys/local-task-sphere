
/**
 * Mock translation function for demonstration purposes.
 * In the future, connect to a real translation API.
 *
 * @param text Text to translate
 * @param targetLang Language code to translate to (e.g. "en", "sr", "es")
 * @returns Promise<string> Translated text
 */
export async function translateMessage(text: string, targetLang: string): Promise<string> {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 200));
  return `[${targetLang}] ${text}`;
}
