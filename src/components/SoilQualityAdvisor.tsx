
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { soilQualityAdvisor, type SoilQualityAdvisorOutput } from "@/ai/flows/soil-quality-advisor";
import { suggestSoilType } from "@/ai/flows/suggest-soil-type";
import { Loader2, Bot, LocateFixed, TestTube2, Sparkles } from "lucide-react";
import image from "./images/crop.webp";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  location: z.string().min(1, "Location is required."),
  soilType: z.string().min(1, "Soil type is required."),
  pastCrops: z.string().min(3, "Please list at least one past crop."),
  mainConcern: z.string().min(1, "Please select your main concern."),
});

type FormValues = z.infer<typeof formSchema>;

export const CROP_KEYS = [
  "apple", "bajra", "banana", "barley", "brinjal", "cabbage", "capsicum", "cauliflower",
  "chilli", "coffee", "cotton", "ginger", "gram", "grapes", "groundnut", "guava",
  "jute", "lentil", "maize", "mango", "millet", "mustard", "okra", "onion", "papaya",
  "pomegranate", "potato", "pulses", "rice", "sorghum", "soybean", "sugarcane",
  "tea", "tomato", "turmeric", "wheat"
];

// This is kept for mapping keys to English names if needed, but the primary source of truth for UI is the translation function.
export const CROP_NAMES: {[key: string]: string} = {
    "apple": "Apple", "bajra": "Bajra", "banana": "Banana", "barley": "Barley", "brinjal": "Brinjal", "cabbage": "Cabbage", "capsicum": "Capsicum", "cauliflower": "Cauliflower",
    "chilli": "Chilli", "coffee": "Coffee", "cotton": "Cotton", "ginger": "Ginger", "gram": "Gram", "grapes": "Grapes", "groundnut": "Groundnut", "guava": "Guava",
    "jute": "Jute", "lentil": "Lentil", "maize": "Maize", "mango": "Mango", "millet": "Millet", "mustard": "Mustard", "okra": "Okra", "onion": "Onion", "papaya": "Papaya",
    "pomegranate": "Pomegranate", "potato": "Potato", "pulses": "Pulses", "rice": "Rice", "sorghum": "Sorghum", "soybean": "Soybean", "sugarcane": "Sugarcane",
    "tea": "Tea", "tomato": "Tomato", "turmeric": "Turmeric", "wheat": "Wheat"
};


export default function SoilQualityAdvisor() {
  const { t, languageCode } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilQualityAdvisorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [fetchingSoilType, setFetchingSoilType] = useState(false);

  const [cropSearch, setCropSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cropInputRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      soilType: "",
      pastCrops: "",
      mainConcern: "Increase Yield",
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

  const handleCropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setCropSearch(e.target.value);
    if (value) {
      const existingCrops = form.getValues('pastCrops').split(',').map(c => c.trim().toLowerCase());
      const filtered = CROP_KEYS.filter(key =>
        t(key).toLowerCase().startsWith(value) && !existingCrops.includes(key)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (key: string) => {
    const currentCrops = form.getValues('pastCrops');
    // We store the key, and translate it for display.
    const newCropsValue = currentCrops ? `${currentCrops}, ${key}` : key;
    form.setValue("pastCrops", newCropsValue, { shouldValidate: true });
    setCropSearch('');
    setShowSuggestions(false);
  };
  
  const displayPastCrops = form.getValues('pastCrops')
    .split(',')
    .filter(c => c.trim())
    .map(key => t(key.trim()))
    .join(', ');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cropInputRef.current && !cropInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      // Translate the crop keys to the current language before sending to the AI
      const translatedPastCrops = values.pastCrops
        .split(',')
        .filter(c => c.trim())
        .map(key => t(key.trim()))
        .join(', ');

      const res = await soilQualityAdvisor({
          ...values, 
          pastCrops: translatedPastCrops,
          language: languageCode
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message || t('error_unexpected'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">{t('soil_advisor_title')}</CardTitle>
          <CardDescription>{t('soil_advisor_description')}</CardDescription>
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
              <FormField
                control={form.control}
                name="pastCrops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_past_crops')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form_past_crops_placeholder')}
                        value={displayPastCrops}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                     <div className="relative" ref={cropInputRef}>
                      <Input
                        placeholder={t('form_past_crops_search_placeholder')}
                        value={cropSearch}
                        onChange={handleCropInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-background border border-input rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            <ul className="py-1">
                              {suggestions.map((key) => (
                                <li
                                  key={key}
                                  className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                                  onMouseDown={() => handleSuggestionClick(key)}
                                >
                                  {t(key)}
                                </li>
                              ))}
                            </ul>
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      {t('form_past_crops_description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="mainConcern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_primary_goal_soil')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form_primary_goal_soil_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Increase Yield">{t('goal_increase_yield')}</SelectItem>
                          <SelectItem value="Reduce Fertilizer Cost">{t('goal_reduce_fertilizer')}</SelectItem>
                          <SelectItem value="Long-term Sustainability">{t('goal_long_term_sustainability')}</SelectItem>
                          <SelectItem value="Improve Water Retention">{t('goal_improve_water_retention')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('get_soil_advice_button')}
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
            <h3 className="text-xl font-headline text-muted-foreground">{t('soil_advisor_initial_prompt')}</h3>
            <p className="text-muted-foreground">{t('soil_advisor_initial_prompt_desc')}</p>
          </Card>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <Bot className="h-16 w-16 text-primary" />
            <p className="font-headline text-xl">{t('loading_analyzing_soil')}</p>
            <p className="text-muted-foreground">{t('loading_preparing_soil_recommendations')}</p>
          </div>
        )}
        {error && <p className="text-destructive p-8">{error}</p>}
        {result && (
          <div className="space-y-6 animate-slide-up-fade">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-3">
                        <TestTube2 className="h-6 w-6 text-primary" />
                        {t('results_soil_health_analysis')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{result.soilHealthAnalysis}</p>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-headline pt-4">{t('results_improvement_recommendations')}</h2>

            {result.recommendations.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {result.recommendations.map((rec, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="font-headline text-lg text-left">{rec.title}</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                        <div>
                            <h4 className="font-semibold text-base">{t('results_what_to_do')}</h4>
                            <p className="text-muted-foreground">{rec.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-base">{t('results_how_to_implement')}</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap">{rec.implementation}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-base flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-accent" />
                                {t('results_why_important')}
                            </h4>
                            <p className="text-muted-foreground">{rec.benefits}</p>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
              </Accordion>
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

    
