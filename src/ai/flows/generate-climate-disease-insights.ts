'use server';
/**
 * @fileOverview A flow to generate climate-disease insights for a selected region and time period.
 *
 * - generateClimateDiseaseInsights - A function that generates climate-disease insights.
 * - GenerateClimateDiseaseInsightsInput - The input type for the generateClimateDiseaseInsights function.
 * - GenerateClimateDiseaseInsightsOutput - The return type for the generateClimateDiseaseInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClimateDiseaseInsightsInputSchema = z.object({
  region: z.string().describe('The specific region for which to generate insights.'),
  timePeriod: z.string().describe('The time period for which to generate insights.'),
  disease: z.string().describe('The disease for which to analyze climate correlations.'),
  climateConditions: z
    .array(z.string())
    .describe('The relevant climate conditions to consider (e.g., temperature, rainfall, humidity).'),
});
export type GenerateClimateDiseaseInsightsInput = z.infer<
  typeof GenerateClimateDiseaseInsightsInputSchema
>;

const GenerateClimateDiseaseInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise AI-generated summary explaining the correlation between climate conditions and disease outbreaks.'),
});
export type GenerateClimateDiseaseInsightsOutput = z.infer<
  typeof GenerateClimateDiseaseInsightsOutputSchema
>;

export async function generateClimateDiseaseInsights(
  input: GenerateClimateDiseaseInsightsInput
): Promise<GenerateClimateDiseaseInsightsOutput> {
  return generateClimateDiseaseInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClimateDiseaseInsightsPrompt',
  input: {schema: GenerateClimateDiseaseInsightsInputSchema},
  output: {schema: GenerateClimateDiseaseInsightsOutputSchema},
  prompt: `You are an expert in public health and climate science. Your task is to analyze the relationship between climate conditions and disease outbreaks.

  Specifically, you need to generate a concise summary explaining the correlation between climate conditions and disease outbreaks for a given region and time period.

  Region: {{{region}}}
  Time Period: {{{timePeriod}}}
  Disease: {{{disease}}}
  Climate Conditions: {{#each climateConditions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Based on the provided information, generate a summary explaining how the specified climate conditions may have influenced the outbreak of the specified disease in the given region during the specified time period.
  The summary should be easily understandable by public health officials and should highlight the key drivers of disease spread.
`,
});

const generateClimateDiseaseInsightsFlow = ai.defineFlow(
  {
    name: 'generateClimateDiseaseInsightsFlow',
    inputSchema: GenerateClimateDiseaseInsightsInputSchema,
    outputSchema: GenerateClimateDiseaseInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
