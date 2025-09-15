
'use server';

/**
 * @fileOverview Suggests a soil type based on a location in India.
 *
 * - suggestSoilType - A function that suggests a soil type.
 * - SuggestSoilTypeInput - The input type for the suggestSoilType function.
 * - SuggestSoilTypeOutput - The return type for the suggestSoilType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSoilTypeInputSchema = z.object({
  location: z.string().describe('The location in India (e.g., village, district, state).'),
});
export type SuggestSoilTypeInput = z.infer<typeof SuggestSoilTypeInputSchema>;

const SoilTypeEnum = z.enum([
    "Loamy",
    "Clay",
    "Sandy",
    "Alluvial",
    "Black Soil",
    "Red and Yellow Soil",
    "Laterite Soil",
]);

const SuggestSoilTypeOutputSchema = z.object({
  soilType: SoilTypeEnum.describe('The suggested soil type from the predefined list.'),
});
export type SuggestSoilTypeOutput = z.infer<typeof SuggestSoilTypeOutputSchema>;


export async function suggestSoilType(input: SuggestSoilTypeInput): Promise<SuggestSoilTypeOutput> {
  return suggestSoilTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSoilTypePrompt',
  input: {schema: SuggestSoilTypeInputSchema},
  output: {schema: SuggestSoilTypeOutputSchema},
  prompt: `Based on the provided location in India, suggest the most likely dominant soil type.
  
  Location: {{{location}}}

  You MUST choose one of the following predefined soil types:
  - Loamy
  - Clay
  - Sandy
  - Alluvial
  - Black Soil
  - Red and Yellow Soil
  - Laterite Soil

  Return only the name of the soil type in the specified JSON format.
`,
});

const suggestSoilTypeFlow = ai.defineFlow(
  {
    name: 'suggestSoilTypeFlow',
    inputSchema: SuggestSoilTypeInputSchema,
    outputSchema: SuggestSoilTypeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
