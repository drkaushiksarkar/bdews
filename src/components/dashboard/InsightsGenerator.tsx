
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insightsFormSchema, type InsightsFormValues } from '@/lib/schemas';
import { handleGenerateInsights } from '@/app/actions';
import { useDashboardContext } from '@/context/DashboardContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { 
    selectedRegion, 
    availableRegions, 
    availableDiseases, 
    dataLoading, 
    dataError 
  } = useDashboardContext();

  const form = useForm<InsightsFormValues>({
    resolver: zodResolver(insightsFormSchema),
    defaultValues: {
      region: '',
      timePeriod: '',
      disease: undefined,
      climateConditions: [],
    },
  });

  useEffect(() => {
    if (selectedRegion && form.getValues('region') !== selectedRegion) {
      form.setValue('region', selectedRegion);
    }
     if (!form.getValues('disease') && availableDiseases.length > 0) {
      form.setValue('disease', availableDiseases[0]);
    }
  }, [selectedRegion, form, availableDiseases]);

  async function onSubmit(values: InsightsFormValues) {
    setIsLoading(true);
    setGeneratedSummary(null);
    toast({ title: 'Generating Insights...', description: 'Please wait while the AI processes your request.' });

    const result = await handleGenerateInsights(values);

    setIsLoading(false);
    if (result.success && result.data) {
      setGeneratedSummary(result.data.summary);
      toast({ title: 'Insights Generated!', description: 'The AI summary is now available.', variant: 'default' });
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

  if (dataLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI-Powered Insights
        </SidebarGroupLabel>
        <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full mt-4" />
            <p className="text-xs text-center text-muted-foreground">Loading AI insights generator...</p>
          </div>
        </SidebarGroupContent>
         <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
           <Sparkles className="h-6 w-6 text-sidebar-foreground" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (dataError) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI-Powered Insights
        </SidebarGroupLabel>
        <SidebarGroupContent className="group-data-[collapsible=icon]:hidden">
          <p className="p-4 text-xs text-center text-destructive">Error loading insights generator: {dataError}</p>
        </SidebarGroupContent>
        <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
           <Sparkles className="h-6 w-6 text-destructive" />
        </SidebarGroupContent>
      </SidebarGroup>
    )
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
                   <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={availableRegions.length === 0}
                    >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRegions.map((regionName) => (
                        <SelectItem key={regionName} value={regionName}>
                          {regionName}
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
                  <Select onValueChange={field.onChange} value={field.value || undefined} disabled={availableDiseases.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a disease" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDiseases.map((disease) => (
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
            
            <Button type="submit" disabled={isLoading || dataLoading} className="w-full">
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
       <SidebarGroupContent className="group-data-[collapsible=icon]:not-hidden hidden justify-center p-2">
         <Sparkles className="h-6 w-6 text-sidebar-foreground" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
