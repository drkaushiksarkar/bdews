import { z } from 'zod';

export const insightsFormSchema = z.object({
  region: z.string().min(3, { message: 'Region must be at least 3 characters long.' }),
  timePeriod: z.string().min(4, { message: 'Time period must be at least 4 characters long (e.g., "2023" or "Next 3 months").' }),
  disease: z.enum(['Malaria', 'Dengue', 'Diarrhoea'], { required_error: 'Please select a disease.' }),
  climateConditions: z.array(z.string()).min(1, { message: 'Select at least one climate condition.' }),
});

export type InsightsFormValues = z.infer<typeof insightsFormSchema>;
