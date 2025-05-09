'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insightsFormSchema, type InsightsFormValues } from '@/lib/schemas';
import { handleGenerateInsights } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';

const diseases = ['Malaria', 'Dengue', 'Diarrhoea'] as const;
const climateOptions = [
  { id: 'Temperature', label: 'Temperature' },
  { id: 'Rainfall', label: 'Rainfall' },
  { id: 'Humidity', label: 'Humidity' },
  { id: 'Vegetation', label: 'Vegetation' },
] as const;

export function InsightsGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<InsightsFormValues>({
    resolver: zodResolver(insightsFormSchema),
    defaultValues: {
      region: '',
      timePeriod: '',
      disease: undefined,
      climateConditions: [],
    },
  });

  async function onSubmit(values: InsightsFormValues) {
    setIsLoading(true);
    setGeneratedSummary(null);
    toast({ title: 'Generating Insights...', description: 'Please wait while the AI processes your request.' });

    const result = await handleGenerateInsights(values);

    setIsLoading(false);
    if (result.success && result.data) {
      setGeneratedSummary(result.data.summary);
      toast({ title: 'Insights Generated!', description: 'The AI summary is now available.', variant: 'default' });
      form.reset(); // Optionally reset form on success
    } else {
      if (result.fieldErrors) {
         Object.entries(result.fieldErrors).forEach(([field, errors]) => {
           if (errors && errors.length > 0) {
            form.setError(field as keyof InsightsFormValues, { type: 'manual', message: errors[0]});
           }
         });
      }
      toast({
        title: 'Error Generating Insights',
        description: result.error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" />
        AI-Powered Insights
      </SidebarGroupLabel>
      <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., District Name, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timePeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Period</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Next 3 months, 2024 Q1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disease"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disease</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a disease" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {diseases.map((disease) => (
                        <SelectItem key={disease} value={disease}>
                          {disease}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="climateConditions"
              render={() => (
                <FormItem>
                  <FormLabel>Climate Conditions</FormLabel>
                  {climateOptions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="climateConditions"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </form>
        </Form>

        {generatedSummary && (
          <Card className="m-4 mt-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">AI Generated Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{generatedSummary}</p>
            </CardContent>
          </Card>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
