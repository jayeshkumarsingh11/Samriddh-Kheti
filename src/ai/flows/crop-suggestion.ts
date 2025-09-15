
'use server';

/**
 * @fileOverview Suggests optimal crops based on farmer's input.
 *
 * - cropSuggestion - A function that suggests crops.
 * - CropSuggestionInput - The input type for the cropSuggestion function.
 * - CropSuggestionOutput - The return type for the cropSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropSuggestionInputSchema = z.object({
  location: z.string().describe('The location of the farm (e.g., village, district, state).'),
  soilType: z.string().describe('The type of soil in the farm (e.g., Loamy, Clay, Sandy).'),
  waterAvailability: z.string().describe('The availability of water for irrigation (e.g., Abundant, Moderate, Scarce).'),
  farmerPreference: z.string().describe('The farmer\'s primary goal (e.g., Maximize Profit, Drought Resistant, Low Maintenance).'),
  farmArea: z.coerce.number().describe('The area of the farm in acres.'),
  personalConsumption: z.string().describe("The farmer's primary usage for the crops (e.g., Personal Use, Local Market, Commercial Farming)."),
  language: z.string().optional().describe('The language to generate the response in (e.g., "Hindi", "Tamil"). Defaults to English if not provided.'),
});
export type CropSuggestionInput = z.infer<typeof CropSuggestionInputSchema>;

const CropSuggestionOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string().describe('The name of the suggested crop.'),
      justification: z.string().describe('Why this crop is a good choice based on the inputs.'),
      estimatedProfit: z.string().describe('A qualitative estimate of the profit potential (e.g., High, Medium, Low).'),
      waterNeeds: z.string().describe('The water requirement for this crop (e.g., High, Moderate, Low).'),
      growingSeason: z.string().describe('The typical growing season for this crop (e.g., Kharif, Rabi, All-season).'),
      landAllocation: z.string().describe('A suggestion on how much land to allocate for this crop based on the farm size and farmer needs.'),
    })
  ).describe('A list of recommended crops.'),
});
export type CropSuggestionOutput = z.infer<typeof CropSuggestionOutputSchema>;


export async function cropSuggestion(input: CropSuggestionInput): Promise<CropSuggestionOutput> {
  return cropSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropSuggestionPrompt',
  input: {schema: CropSuggestionInputSchema},
  output: {schema: CropSuggestionOutputSchema},
  prompt: `You are an expert agronomist providing crop recommendations to farmers in India.
  Based on the farmer's inputs, suggest up to 3 suitable crops.
  The user is requesting the information in {{language}}. It is a strict requirement that you MUST provide ALL textual descriptions (justification, landAllocation, estimatedProfit, waterNeeds, growingSeason) in {{language}}.

  Infer the general climate and weather patterns from the provided location.

  Farmer's Inputs:
  - Location: {{{location}}}
  - Soil Type: {{{soilType}}}
  - Water Availability: {{{waterAvailability}}}
  - Primary Goal: {{{farmerPreference}}}
  - Farm Area: {{{farmArea}}} acres
  - Primary Crop Usage: {{{personalConsumption}}}

  For each suggested crop, provide:
  1.  A clear justification explaining why it's suitable based on the combination of location (climate), soil, water, and the farmer's goal.
  2.  An estimated profit potential (e.g., High, Medium, or Low).
  3.  The crop's typical water needs (e.g., High, Moderate, or Low).
  4.  The typical growing season (e.g., Kharif, Rabi, Zaid, All-season).
  5.  A specific recommendation on land allocation (e.g., "Dedicate 0.5 acres to this crop for family needs," or "Plant on 8 out of 10 acres for commercial yield"). This should be tailored based on the farm area and the farmer's personal consumption needs.

  Return the response in the specified JSON format. All text fields must be in {{language}}.
`,
});

const cropSuggestionFlow = ai.defineFlow(
  {
    name: 'cropSuggestionFlow',
    inputSchema: CropSuggestionInputSchema,
    outputSchema: CropSuggestionOutputSchema,
  },
  async (input) => {
    const promptInput = { ...input, language: input.language || 'English' };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
