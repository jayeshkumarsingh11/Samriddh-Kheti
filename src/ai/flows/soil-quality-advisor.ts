
'use server';

/**
 * @fileOverview Provides soil quality recommendations based on farmer's inputs.
 *
 * - soilQualityAdvisor - A function that suggests how to improve soil health.
 * - SoilQualityAdvisorInput - The input type for the soilQualityAdvisor function.
 * - SoilQualityAdvisorOutput - The return type for the soilQualityAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SoilQualityAdvisorInputSchema = z.object({
  location: z.string().describe("The location of the farm (e.g., village, district, state)."),
  soilType: z.string().describe("The type of soil on the farm (e.g., Loamy, Clay, Sandy)."),
  pastCrops: z.string().describe("A comma-separated list of crops grown in the last 2-3 seasons."),
  mainConcern: z.string().describe("The farmer's primary concern regarding their soil (e.g., Increase Yield, Reduce Fertilizer Cost, Long-term Sustainability)."),
  language: z.string().optional().describe('The language to generate the response in (e.g., "Hindi", "Tamil"). Defaults to English if not provided.'),
});
export type SoilQualityAdvisorInput = z.infer<typeof SoilQualityAdvisorInputSchema>;

const SoilQualityAdvisorOutputSchema = z.object({
  soilHealthAnalysis: z.string().describe("A brief analysis of the potential current state of the soil based on the past crops and soil type."),
  recommendations: z.array(
    z.object({
      title: z.string().describe("The title of the recommendation (e.g., 'Crop Rotation', 'Green Manure')."),
      description: z.string().describe("A detailed description of what the recommendation involves."),
      implementation: z.string().describe("Step-by-step guidance on how to implement this recommendation."),
      benefits: z.string().describe("A clear explanation of why this is important and the long-term benefits for the farm."),
    })
  ).describe("A list of actionable recommendations to improve soil quality."),
});
export type SoilQualityAdvisorOutput = z.infer<typeof SoilQualityAdvisorOutputSchema>;

export async function soilQualityAdvisor(input: SoilQualityAdvisorInput): Promise<SoilQualityAdvisorOutput> {
  return soilQualityAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'soilQualityAdvisorPrompt',
  input: {schema: SoilQualityAdvisorInputSchema},
  output: {schema: SoilQualityAdvisorOutputSchema},
  prompt: `You are an expert soil scientist and agronomist advising a farmer in India.
  Your goal is to provide actionable advice to improve their soil quality.
  The user is requesting the information in {{language}}. It is a strict requirement that you MUST provide ALL textual descriptions (soilHealthAnalysis and all fields within recommendations, including title, description, implementation, and benefits) in {{language}}.

  Analyze the following information:
  - Location: {{{location}}}
  - Soil Type: {{{soilType}}}
  - Past Crops (last 2-3 seasons): {{{pastCrops}}}
  - Farmer's Main Concern: {{{mainConcern}}}

  Based on this, please perform the following steps:
  1.  **Soil Health Analysis**: Write a brief analysis of the current potential soil health. Consider how the sequence of past crops might have affected nutrient levels and soil structure. For example, continuous cultivation of cereal crops like wheat and rice can deplete nitrogen.
  2.  **Recommendations**: Provide 2-3 clear, actionable recommendations to improve soil quality. For each recommendation, you must provide:
      - A short, clear title.
      - A description of the practice.
      - A simple implementation guide.
      - A detailed explanation of the benefits, connecting it back to the farmer's main concern and long-term farm health. Explain *why* it's important.

  Focus on practical, low-cost, and sustainable methods like crop rotation, cover crops, green manure, composting, and reduced tillage where appropriate.

  Return the response in the specified JSON format. All text content must be in {{language}}.
`,
});

const soilQualityAdvisorFlow = ai.defineFlow(
  {
    name: 'soilQualityAdvisorFlow',
    inputSchema: SoilQualityAdvisorInputSchema,
    outputSchema: SoilQualityAdvisorOutputSchema,
  },
  async (input) => {
    const promptInput = { ...input, language: input.language || 'English' };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
