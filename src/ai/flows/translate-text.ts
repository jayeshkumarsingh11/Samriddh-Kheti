
'use server';

/**
 * @fileOverview Translates a batch of text to a specified language.
 *
 * - translateTexts - A function that handles the text translation process.
 * - TranslateTextsInput - The input type for the translateTexts function.
 * - TranslateTextsOutput - The return type for the translateTexts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextsInputSchema = z.object({
  texts: z.array(z.string()).describe('An array of texts to be translated.'),
  targetLanguage: z.string().describe('The target language to translate the texts into (e.g., "Hindi", "Tamil", "French").'),
});
export type TranslateTextsInput = z.infer<typeof TranslateTextsInputSchema>;

const TranslateTextsOutputSchema = z.object({
  translations: z.array(z.string()).describe('The array of translated texts.'),
});
export type TranslateTextsOutput = z.infer<typeof TranslateTextsOutputSchema>;

export async function translateTexts(input: TranslateTextsInput): Promise<TranslateTextsOutput> {
  return translateTextsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextsPrompt',
  input: {schema: TranslateTextsInputSchema},
  output: {schema: TranslateTextsOutputSchema},
  // Use a model better suited for simple translation.
  model: 'googleai/gemini-1.5-flash-latest', 
  prompt: `Translate the following array of texts into {{targetLanguage}}.
Return the translated texts as an array in the 'translations' field of the JSON output.
The order of the translated texts must match the order of the input texts.

Input Texts:
{{#each texts}}
- {{{this}}}
{{/each}}
`,
});

const translateTextsFlow = ai.defineFlow(
  {
    name: 'translateTextsFlow',
    inputSchema: TranslateTextsInputSchema,
    outputSchema: TranslateTextsOutputSchema,
  },
  async (input) => {
    if (!input.texts || input.texts.length === 0) {
        return { translations: [] };
    }
    
    // The Gemini API works best with smaller batches.
    // We can split larger requests into chunks to avoid hitting limits and improve reliability.
    const CHUNK_SIZE = 100; 
    const chunks: string[][] = [];
    for (let i = 0; i < input.texts.length; i += CHUNK_SIZE) {
        chunks.push(input.texts.slice(i, i + CHUNK_SIZE));
    }

    const allTranslations: string[] = [];
    
    for (const chunk of chunks) {
        let attempts = 0;
        let success = false;
        while (attempts < 3 && !success) {
            try {
                const {output} = await prompt({ texts: chunk, targetLanguage: input.targetLanguage });
                if (output?.translations) {
                    allTranslations.push(...output.translations);
                    success = true; // Mark as success to exit the while loop
                } else {
                    // This case is for when the API call succeeds but returns no data.
                    // We'll treat it like a failure and retry.
                    throw new Error('Translation returned no output.');
                }
            } catch (e: any) {
                attempts++;
                if (attempts >= 3) {
                    // If we've exhausted all retries, throw the final error.
                    console.error(`Failed to translate chunk after 3 attempts. Error: ${e.message}`);
                    throw e; // Re-throw the error to be caught by the caller
                } else {
                    // Wait before retrying. The delay increases with each attempt.
                    const delay = Math.pow(2, attempts) * 500; // 1s, 2s
                    console.warn(`Translation chunk failed, attempt ${attempts}. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }
    
    return { translations: allTranslations };
  }
);
