
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { smartIrrigationSchedule, type SmartIrrigationScheduleInput, type SmartIrrigationScheduleOutput } from "@/ai/flows/smart-irrigation-scheduling";
import { Loader2, Droplets, Bot, LocateFixed, Clock, Shield, Leaf } from "lucide-react";
import image from "./images/IrrigationPlanner.webp"
import { CROP_KEYS } from "./SoilQualityAdvisor";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  cropType: z.string().min(1, "Crop type is required."),
  farmArea: z.coerce.number().min(0.1, "Farm area must be positive."),
  waterSource: z.string().min(1, "Water source is required."),
  location: z.string().min(1, "Location is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function IrrigationPlanner() {
  const { t, languageCode } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartIrrigationScheduleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [weatherAndSoilData, setWeatherAndSoilData] = useState<{weatherData: string; soilData: string} | null>(null);
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cropInputRef = useRef<HTMLDivElement>(null);
  const [cropSearch, setCropSearch] = useState("");


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "",
      farmArea: 1,
      waterSource: "",
      location: "",
    },
  });
  
  const handleCropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setCropSearch(e.target.value);
    if (value) {
      const filtered = CROP_KEYS.filter(key =>
        t(key).toLowerCase().startsWith(value)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (key: string) => {
    form.setValue("cropType", t(key), { shouldValidate: true });
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

  const fetchWeatherAndLocation = async (latitude: number, longitude: number) => {
    setFetchingLocation(true);
    try {
      // Fetch location name
      const locationResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const locationData = await locationResponse.json();
      const { address } = locationData;
      const locationString = [
        address.village || address.town || address.city_district,
        address.city,
        address.state,
      ]
        .filter(Boolean)
        .join(", ");
      form.setValue("location", locationString || locationData.display_name);

      // Fetch weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m`
      );
      const weatherData = await weatherResponse.json();
      if (weatherData && weatherData.current) {
        const { temperature_2m, relative_humidity_2m, precipitation_probability, wind_speed_10m } = weatherData.current;
        const weatherString = `Temperature: ${Math.round(temperature_2m)}°C, Humidity: ${relative_humidity_2m}%, Chance of rain: ${precipitation_probability}%, Wind: ${Math.round(wind_speed_10m)} km/h`;
        
        // Using static soil data as there is no free public API for it.
        const soilString = "Soil Moisture: 45%, Soil Temperature: 22°C, Type: Loamy";
        
        setWeatherAndSoilData({ weatherData: weatherString, soilData: soilString });
      }
    } catch (error) {
      console.error("Error fetching location or weather data:", error);
      setError(t('error_fetching_location_weather'));
    } finally {
      setFetchingLocation(false);
    }
  };


  const getLocation = () => {
    if (navigator.geolocation) {
      setFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherAndLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to a default location if geolocation fails/is denied
          fetchWeatherAndLocation(28.61, 77.23); // Delhi
          setFetchingLocation(false);
        }
      );
    } else {
        // Fallback for browsers that don't support geolocation
        fetchWeatherAndLocation(28.61, 77.23); // Delhi
    }
  };

  useEffect(() => {
    getLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormValues) {
    if (!weatherAndSoilData) {
        setError(t('error_weather_data_not_available'));
        return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const input: SmartIrrigationScheduleInput = {
        ...values,
        weatherData: weatherAndSoilData.weatherData,
        soilData: weatherAndSoilData.soilData,
        language: languageCode,
      };
      const res = await smartIrrigationSchedule(input);
      setResult(res);
    } catch (e: any) {
      setError(e.message || t('error_unexpected'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('irrigation_planner_title')}</CardTitle>
          <CardDescription>{t('irrigation_planner_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form_crop_type')}</FormLabel>
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
                  name="farmArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form_farm_area')}</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="waterSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form_water_source')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('form_water_source_placeholder')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Canal">{t('water_source_canal')}</SelectItem>
                          <SelectItem value="Well">{t('water_source_well')}</SelectItem>
                          <SelectItem value="Borewell">{t('water_source_borewell')}</SelectItem>
                          <SelectItem value="River">{t('water_source_river')}</SelectItem>
                          <SelectItem value="Rainwater Harvesting">{t('water_source_rainwater')}</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              
              <Button type="submit" disabled={loading || fetchingLocation} className="w-full">
                {(loading || fetchingLocation) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('get_schedule_button')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center h-full">
        {!result && !loading && (
            <Card className="flex flex-col items-center justify-center h-full p-8 text-center bg-muted/30 border-dashed">
              <Image 
                src={image}
                alt="Illustration of a water droplet"
                width={400}
                height={300}
                className="mb-4 rounded-lg opacity-80"
                data-ai-hint="stylized water droplet"
              />
              <h3 className="text-xl font-headline text-muted-foreground">{t('irrigation_planner_initial_prompt')}</h3>
              <p className="text-muted-foreground">{t('irrigation_planner_initial_prompt_desc')}</p>
            </Card>
        )}
        {loading && (
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <Bot className="h-16 w-16 text-primary" />
            <p className="font-headline text-xl">{t('loading_analyzing_farm_data')}</p>
            <p className="text-muted-foreground">{t('loading_preparing_plan')}</p>
          </div>
        )}
        {error && <p className="text-destructive p-8">{error}</p>}
        {result && (
          <Card className="w-full animate-slide-up-fade">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Droplets className="text-primary"/> {t('results_recommended_schedule')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" />{t('results_schedule')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap pl-6">{result.irrigationSchedule}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{t('results_best_time')}</h3>
                <p className="text-muted-foreground pl-6">{result.bestTimeToIrrigate}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />{t('results_precautions')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap pl-6">{result.precautions}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" />{t('results_pesticides')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap pl-6">{result.pesticideRecommendations}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('results_justification')}</h3>
                <p className="text-muted-foreground">{result.justification}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

    
