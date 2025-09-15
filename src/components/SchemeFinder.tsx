
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { governmentSchemeSuggestions, type GovernmentSchemeSuggestionsOutput } from "@/ai/flows/government-scheme-suggestions";
import { Loader2, Bot, LocateFixed } from "lucide-react";
import { CROP_KEYS } from "./SoilQualityAdvisor";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  location: z.string().optional(),
  cropType: z.string().optional(),
  landArea: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SchemeFinder() {
  const { t, languageCode } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GovernmentSchemeSuggestionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [isPersonalizedSearch, setIsPersonalizedSearch] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cropInputRef = useRef<HTMLDivElement>(null);
  const [cropSearch, setCropSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      cropType: "",
      landArea: undefined,
    },
  });
  
  const handleCropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCropSearch(value);
    if (value) {
      const filtered = CROP_KEYS.filter(key =>
        t(key).toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (key: string) => {
    form.setValue("cropType", key, { shouldValidate: true });
    setCropSearch(t(key));
    setShowSuggestions(false);
  };
  
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
              address.city,
              address.state,
            ]
              .filter(Boolean)
              .join(", ");
            form.setValue("location", locationString || data.display_name);
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

  const fetchSchemes = async (values?: FormValues) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setIsPersonalizedSearch(!!(values?.location || values?.cropType || values?.landArea));
    
    try {
      const res = await governmentSchemeSuggestions({...values, language: languageCode});
      setResult(res);
      if (values) {
         form.reset({ location: "", cropType: "", landArea: undefined });
         setCropSearch("");
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };


  async function onSubmit(values: FormValues) {
    fetchSchemes(values);
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">{t('scheme_finder_title')}</CardTitle>
          <CardDescription>{t('scheme_finder_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="location"
                render= {({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_location')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder={t('form_location_placeholder')}
                          {...field}
                          className="pr-10"
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
                name="cropType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_primary_crop')}</FormLabel>
                    <div className="relative" ref={cropInputRef}>
                      <FormControl>
                        <Input
                          placeholder={t('form_crop_type_placeholder')}
                          value={cropSearch}
                          onChange={handleCropInputChange}
                          onFocus={() => setShowSuggestions(true)}
                          autoComplete="off"
                        />
                      </FormControl>
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-background border border-input rounded-md shadow-lg mt-1">
                          <ul className="py-1 max-h-60 overflow-y-auto">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="landArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_land_area')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={t('form_land_area_placeholder')} 
                        step="0.1" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} 
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('find_schemes_button')}
                </Button>
                <Button type="button" variant="outline" onClick={() => fetchSchemes()} disabled={loading} className="w-full">
                  {t('popular_national_schemes_button')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {!result && !loading && (
           <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-muted/30 border-dashed">
             <h3 className="text-xl font-headline text-muted-foreground">{t('scheme_finder_initial_prompt')}</h3>
             <p className="text-muted-foreground">{t('scheme_finder_initial_prompt_desc')}</p>
           </Card>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <Bot className="h-16 w-16 text-primary" />
            <p className="font-headline text-xl">{t('loading_finding_schemes')}</p>
            <p className="text-muted-foreground">{t('loading_searching_programs')}</p>
          </div>
        )}
        {error && <p className="text-destructive p-8">{error}</p>}
        {result && !loading && (
          <div className="animate-slide-up-fade">
            <h2 className="text-2xl font-headline mb-4">
              {isPersonalizedSearch ? t('results_suggested_schemes') : t('results_popular_schemes')}
            </h2>
            {result.schemes.length > 0 ? (
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {result.schemes.map((scheme, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-headline text-lg text-left">{scheme.name}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div>
                        <h4 className="font-semibold text-base">{t('results_description')}</h4>
                        <p className="text-muted-foreground">{scheme.description}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-base">{t('results_eligibility')}</h4>
                        <p className="text-muted-foreground">{scheme.eligibilityCriteria}</p>
                      </div>
                       <div>
                        <h4 className="font-semibold text-base">{t('results_benefits')}</h4>
                        <p className="text-muted-foreground">{scheme.benefits}</p>
                      </div>
                       <div>
                        <h4 className="font-semibold text-base">{t('results_how_to_apply')}</h4>
                        <p className="text-muted-foreground">{scheme.applicationProcedure}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center">
                    <CardHeader>
                        <CardTitle className="font-headline">{t('results_no_schemes_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t('results_no_schemes_description')}</p>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

    
