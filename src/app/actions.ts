'use server';

import { generateClimateDiseaseInsights, type GenerateClimateDiseaseInsightsInput, type GenerateClimateDiseaseInsightsOutput } from '@/ai/flows/generate-climate-disease-insights';
import { insightsFormSchema, type InsightsFormValues } from '@/lib/schemas';

interface ActionResult {
  success: boolean;
  data?: GenerateClimateDiseaseInsightsOutput;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function handleGenerateInsights(formData: InsightsFormValues): Promise<ActionResult> {
  const validationResult = insightsFormSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid form data.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const input: GenerateClimateDiseaseInsightsInput = {
    region: validationResult.data.region,
    timePeriod: validationResult.data.timePeriod,
    disease: validationResult.data.disease,
    climateConditions: validationResult.data.climateConditions,
  };

  try {
    const result = await generateClimateDiseaseInsights(input);
    return { success: true, data: result };
  } catch (e) {
    console.error("Error generating insights:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating insights.";
    return { success: false, error: errorMessage };
  }
}
