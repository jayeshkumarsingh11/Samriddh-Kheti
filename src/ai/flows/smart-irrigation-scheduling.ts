
'use server';
/**
 * @fileOverview An AI agent that analyzes weather and soil data to recommend optimal irrigation schedules.
 *
 * - smartIrrigationSchedule - A function that handles the smart irrigation scheduling process.
 * - SmartIrrigationScheduleInput - The input type for the smartIrrigationSchedule function.
 * - SmartIrrigationScheduleOutput - The return type for the smartIrrigationSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartIrrigationScheduleInputSchema = z.object({
  cropType: z.string().describe('The type of crop being grown.'),
  farmArea: z.number().describe('The area of the farm in acres.'),
  waterSource: z.string().describe('The source of water for irrigation.'),
  location: z.string().describe('The location of the farm.'),
  weatherData: z.string().describe('Real-time weather data for the location.'),
  soilData: z.string().describe('Real-time soil data for the location.'),
  language: z.string().optional().describe('The language to generate the response in (e.g., "Hindi", "Tamil"). Defaults to English if not provided.'),
});
export type SmartIrrigationScheduleInput = z.infer<typeof SmartIrrigationScheduleInputSchema>;

const SmartIrrigationScheduleOutputSchema = z.object({
  irrigationSchedule: z.string().describe('The recommended irrigation schedule.'),
  waterAmount: z.number().describe('The recommended amount of water to use for irrigation.'),
  justification: z.string().describe('The justification for the recommended irrigation schedule.'),
  bestTimeToIrrigate: z.string().describe('The best time of day to irrigate (e.g., early morning, late evening).'),
  precautions: z.string().describe('Precautions the farmer should take during irrigation.'),
  pesticideRecommendations: z.string().describe('Recommendations for any necessary pesticides based on crop and conditions.'),
});
export type SmartIrrigationScheduleOutput = z.infer<typeof SmartIrrigationScheduleOutputSchema>;

export async function smartIrrigationSchedule(input: SmartIrrigationScheduleInput): Promise<SmartIrrigationScheduleOutput> {
  return smartIrrigationScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartIrrigationSchedulePrompt',
  input: {schema: SmartIrrigationScheduleInputSchema},
  output: {schema: SmartIrrigationScheduleOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in irrigation. Based on the provided information, recommend an optimal irrigation schedule for the farmer.
  The user is requesting the information in {{language}}. It is a strict requirement that you MUST provide ALL textual descriptions (irrigationSchedule, justification, bestTimeToIrrigate, precautions, pesticideRecommendations) in {{language}}. Every single text field must be in {{language}}.

Crop Type: {{{cropType}}}
Farm Area: {{{farmArea}}} acres
Water Source: {{{waterSource}}}
Location: {{{location}}}
Weather Data: {{{weatherData}}}
Soil Data: {{{soilData}}}

Consider the crop's water requirements, the farm area, the water source, the weather conditions, and the soil conditions to determine the best irrigation schedule. Provide a justification for your recommendation.

In addition, provide the following:
1. The best time of day to irrigate (e.g., "Early morning to minimize evaporation").
2. Key precautions the farmer should take (e.g., "Check for leaks in the system," "Avoid waterlogging").
3. Any relevant pesticide recommendations that might be needed for this crop at this stage, assuming standard conditions. If none are typically needed, state that.

Output all the information in the specified JSON format. Make sure to output all text content in {{language}}.
`,
});

const smartIrrigationScheduleFlow = ai.defineFlow(
  {
    name: 'smartIrrigationScheduleFlow',
    inputSchema: SmartIrrigationScheduleInputSchema,
    outputSchema: SmartIrrigationScheduleOutputSchema,
  },
  async (input) => {
    const promptInput = { ...input, language: input.language || 'English' };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
