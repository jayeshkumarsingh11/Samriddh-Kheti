
'use server';

/**
 * @fileOverview Provides government scheme suggestions based on farmer's location, crop type, and land area.
 *
 * - governmentSchemeSuggestions - A function that suggests relevant government subsidies.
 * - GovernmentSchemeSuggestionsInput - The input type for the governmentSchemeSuggestions function.
 * - GovernmentSchemeSuggestionsOutput - The return type for the governmentSchemeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovernmentSchemeSuggestionsInputSchema = z.object({
  location: z.string().optional().describe('The location of the farm (e.g., village, district).'),
  cropType: z.string().optional().describe('The type of crop being cultivated.'),
  landArea: z.number().optional().describe('The size of the farm land in acres.'),
  language: z.string().optional().describe('The language to generate the response in (e.g., "Hindi", "Tamil"). Defaults to English if not provided.'),
});
export type GovernmentSchemeSuggestionsInput = z.infer<typeof GovernmentSchemeSuggestionsInputSchema>;

const GovernmentSchemeSuggestionsOutputSchema = z.object({
  schemes: z.array(
    z.object({
      name: z.string().describe('The name of the government scheme.'),
      description: z.string().describe('A brief description of the scheme.'),
      eligibilityCriteria: z.string().describe('The eligibility criteria for the scheme.'),
      benefits: z.string().describe('The benefits offered under the scheme.'),
      applicationProcedure: z.string().describe('The procedure to apply for the scheme.'),
    })
  ).describe('A list of relevant government schemes.'),
});
export type GovernmentSchemeSuggestionsOutput = z.infer<typeof GovernmentSchemeSuggestionsOutputSchema>;

export async function governmentSchemeSuggestions(input: GovernmentSchemeSuggestionsInput): Promise<GovernmentSchemeSuggestionsOutput> {
  return governmentSchemeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'governmentSchemeSuggestionsPrompt',
  input: {schema: GovernmentSchemeSuggestionsInputSchema.extend({ location_provided: z.boolean() })},
  output: {schema: GovernmentSchemeSuggestionsOutputSchema},
  prompt: `You are an expert in Indian agricultural government schemes.
  The user is requesting information in {{language}}. It is a strict requirement that you MUST provide the entire response (name, description, eligibility, benefits, application procedure) for each scheme in {{language}}. Every single text field must be in {{language}}.

  {{#if location_provided}}
  Based on the farmer's details, suggest relevant government subsidies. If a field is not provided, make reasonable assumptions or focus on the provided information.

  Location: {{location}}
  Crop Type: {{cropType}}
  Land Area: {{landArea}} acres

  Suggest government schemes that are most relevant to the farmer based on these specific inputs.
  {{else}}
  The user has not provided specific details. Provide a list of 3-5 of the most popular, high-impact, and currently active national-level government schemes for farmers in India.
  {{/if}}
  
  For each scheme, provide the name, a brief description, general eligibility criteria, key benefits, and the typical application procedure. All text must be in {{language}}.
  Return the list in the specified JSON format.
`,
});

const governmentSchemeSuggestionsFlow = ai.defineFlow(
  {
    name: 'governmentSchemeSuggestionsFlow',
    inputSchema: GovernmentSchemeSuggestionsInputSchema,
    outputSchema: GovernmentSchemeSuggestionsOutputSchema,
  },
  async input => {
    // Determine if any personalized data was provided to guide the prompt.
    const location_provided = !!(input.location || input.cropType || input.landArea);
    
    const promptInput = { ...input, language: input.language || 'English', location_provided };
    const {output} = await prompt(promptInput);
    return output!;
  }
);
