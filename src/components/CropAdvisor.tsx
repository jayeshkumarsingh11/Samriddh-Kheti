
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cropSuggestion, type CropSuggestionOutput } from "@/ai/flows/crop-suggestion";
import { suggestSoilType } from "@/ai/flows/suggest-soil-type";
import { Loader2, Bot, LocateFixed, Leaf, Droplets, Banknote, CalendarDays, Rss } from "lucide-react";
import image from "./images/crop.webp";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  location: z.string().min(1, "Location is required."),
  soilType: z.string().min(1, "Soil type is required."),
  waterAvailability: z.string().min(1, "Water availability is required."),
  farmerPreference: z.string().min(1, "Please select a preference."),
  farmArea: z.coerce.number().min(0.1, "Farm area must be positive."),
  personalConsumption: z.string().min(1, "Please select your crop usage."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CropAdvisor() {
  const { t, languageCode } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropSuggestionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [fetchingSoilType, setFetchingSoilType] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      soilType: "",
      waterAvailability: "",
      farmerPreference: "Maximize Profit",
      farmArea: 1,
      personalConsumption: "Local Market",
    },
  });
  
  const handleLocationUpdate = async (location: string) => {
    form.setValue("location", location);
    if (location) {
      setFetchingSoilType(true);
      try {
        const soilResult = await suggestSoilType({ location });
        if (soilResult && soilResult.soilType) {
          form.setValue("soilType", soilResult.soilType, { shouldValidate: true });
        }
      } catch (err) {
        console.error("Failed to fetch soil type", err);
        // Do not show error to user, they can select manually
      } finally {
        setFetchingSoilType(false);
      }
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const { address } = data;
            const locationString = [
              address.village || address.town || address.city_district,
              address.city,
              address.state,
            ]
              .filter(Boolean)
              .join(", ");
            const finalLocation = locationString || data.display_name;
            await handleLocationUpdate(finalLocation);
          } catch (error) {
            console.error("Error fetching location name:", error);
          } finally {
            setFetchingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setFetchingLocation(false);
        }
      );
    }
  };

  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await cropSuggestion({...values, language: languageCode});
      setResult(res);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">{t('crop_advisor_title')}</CardTitle>
          <CardDescription>{t('crop_advisor_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_location')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder={t('form_location_placeholder')}
                          {...field}
                          className="pr-10"
                          onBlur={(e) => handleLocationUpdate(e.target.value)}
                        />
                      </FormControl>
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                        onClick={getLocation}
                        disabled={fetchingLocation}
                        aria-label={t('get_current_location_label')}
                      >
                        {fetchingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LocateFixed className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="farmArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form_farm_area')}</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form_soil_type')}</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                               <SelectTrigger>
                                  <div className="flex items-center gap-2">
                                  {fetchingSoilType && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                  <SelectValue placeholder={t('form_soil_type_placeholder')} />
                                  </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Loamy">{t('soil_loamy')}</SelectItem>
                              <SelectItem value="Clay">{t('soil_clay')}</SelectItem>
                              <SelectItem value="Sandy">{t('soil_sandy')}</SelectItem>
                              <SelectItem value="Alluvial">{t('soil_alluvial')}</SelectItem>
                              <SelectItem value="Black Soil">{t('soil_black')}</SelectItem>
                              <SelectItem value="Red and Yellow Soil">{t('soil_red_yellow')}</SelectItem>
                              <SelectItem value="Laterite Soil">{t('soil_laterite')}</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
                <FormField
                control={form.control}
                name="waterAvailability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_water_availability')}</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form_water_availability_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Abundant">{t('water_abundant')}</SelectItem>
                          <SelectItem value="Moderate">{t('water_moderate')}</SelectItem>
                          <SelectItem value="Scarce">{t('water_scarce')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="farmerPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_primary_goal')}</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form_primary_goal_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Maximize Profit">{t('goal_maximize_profit')}</SelectItem>
                          <SelectItem value="Drought Resistant">{t('goal_drought_resistant')}</SelectItem>
                          <SelectItem value="Low Maintenance">{t('goal_low_maintenance')}</SelectItem>
                          <SelectItem value="Improve Soil Health">{t('goal_improve_soil')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="personalConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_crop_usage')}</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form_crop_usage_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Personal Use">{t('usage_personal')}</SelectItem>
                          <SelectItem value="Local Market">{t('usage_local_market')}</SelectItem>
                          <SelectItem value="Commercial Farming">{t('usage_commercial')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('get_recommendations_button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {!result && !loading && (
          <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-muted/30 border-dashed">
            <Image 
              src={image}
              alt="Illustration of a seedling"
              width={400}
              height={300}
              className="mb-4 rounded-lg opacity-80"
              data-ai-hint="seedling illustration"
            />
            <h3 className="text-xl font-headline text-muted-foreground">{t('crop_advisor_initial_prompt')}</h3>
            <p className="text-muted-foreground">{t('crop_advisor_initial_prompt_desc')}</p>
          </Card>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <Bot className="h-16 w-16 text-primary" />
            <p className="font-headline text-xl">{t('loading_analyzing_farm')}</p>
            <p className="text-muted-foreground">{t('loading_finding_crops')}</p>
          </div>
        )}
        {error && <p className="text-destructive p-8">{error}</p>}
        {result && (
          <div className="space-y-6 animate-slide-up-fade">
            <h2 className="text-2xl font-headline mb-4">{t('results_top_recommendations')}</h2>
            {result.suggestions.length > 0 ? (
                result.suggestions.map((crop, index) => (
                  <Card key={index}>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-3">
                            <Leaf className="h-6 w-6 text-primary" />
                            {crop.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div>
                            <h4 className="font-semibold text-base">{t('results_why_suggested')}</h4>
                            <p className="text-muted-foreground">{crop.justification}</p>
                       </div>
                       <div className="border-t pt-4">
                            <h4 className="font-semibold text-base flex items-center gap-2 mb-2"><Rss className="h-4 w-4" />{t('results_land_tip')}</h4>
                            <p className="text-muted-foreground">{crop.landAllocation}</p>
                       </div>
                       <div className="grid grid-cols-3 gap-4 text-sm pt-4 border-t">
                           <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">{t('results_profit_potential')}</p>
                                    <p className="text-muted-foreground">{crop.estimatedProfit}</p>
                                </div>
                           </div>
                           <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4 text-muted-foreground"/>
                                 <div>
                                    <p className="font-semibold">{t('results_water_needs')}</p>
                                    <p className="text-muted-foreground">{crop.waterNeeds}</p>
                                </div>
                           </div>
                           <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                                 <div>
                                    <p className="font-semibold">{t('results_growing_season')}</p>
                                    <p className="text-muted-foreground">{crop.growingSeason}</p>
                                </div>
                           </div>
                       </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center">
                    <CardHeader>
                        <CardTitle className="font-headline">{t('results_no_recommendations_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('results_no_recommendations_description')}</p>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

    
