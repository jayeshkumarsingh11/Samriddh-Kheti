
'use server';

/**
 * @fileOverview Provides information about government-set crop prices (MSP).
 *
 * - cropPriceInfo - A function that provides analysis on crop prices.
 * - CropPriceInfoInput - The input type for the cropPriceInfo function.
 * - CropPriceInfoOutput - The return type for the cropPriceInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropPriceInfoInputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
  language: z.string().optional().describe('The language to generate the response in (e.g., "Hindi", "Tamil"). Defaults to English if not provided.'),
});
export type CropPriceInfoInput = z.infer<typeof CropPriceInfoInputSchema>;

const CropPriceInfoOutputSchema = z.object({
  analysis: z.string().describe('A brief analysis of the price trend for the specified crop, considering both MSP and local vendor prices.'),
  currentMsp: z.number().describe('The current Minimum Support Price (MSP) in rupees per quintal.'),
  lastYearMsp: z.number().describe('The Minimum Support Price (MSP) from the previous year in rupees per quintal.'),
  currentLocalPrice: z.number().describe('The current local vendor price in rupees per quintal.'),
});
export type CropPriceInfoOutput = z.infer<typeof CropPriceInfoOutputSchema>;


export async function cropPriceInfo(input: CropPriceInfoInput): Promise<CropPriceInfoOutput> {
  return cropPriceInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropPriceInfoPrompt',
  input: {schema: CropPriceInfoInputSchema},
  output: {schema: CropPriceInfoOutputSchema},
  prompt: `You are an agricultural economist specializing in Indian crop prices.
  Analyze the provided crop name and generate a brief analysis of its Minimum Support Price (MSP) and local vendor price trends.
  The user is requesting the information in {{language}}. It is a strict requirement that you MUST provide the 'analysis' field in {{language}}.

  Assume the current year is the latest data point. Provide a mock current MSP, last year's MSP, and a mock current local vendor price for the crop.
  The local vendor price is typically slightly higher than the MSP, but can be more volatile.
  The price should be in rupees per quintal.

  Crop Name: {{{cropName}}}

  Based on this, provide a short analysis, the current MSP, last year's MSP, and the current local vendor price.
  For example, if the crop is Wheat, the current MSP might be 2275, last year's 2125, and the current local price 2350.
  The analysis could be: "The MSP for Wheat has shown a steady increase. The local market price is currently trading at a premium to the MSP, indicating strong demand."
  
  Return the response in the specified JSON format. The analysis MUST be in {{language}}.
`,
});

const cropPriceInfoFlow = ai.defineFlow(
  {
    name: 'cropPriceInfoFlow',
    inputSchema: CropPriceInfoInputSchema,
    outputSchema: CropPriceInfoOutputSchema,
  },
  async (input) => {
    const promptInput = { ...input, language: input.language || 'English' };
    const {output} = await prompt(promptInput);
    return output!;
  }
);

