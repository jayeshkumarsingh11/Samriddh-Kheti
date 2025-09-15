
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sun, CloudRain, Droplets, Thermometer, Wind, Leaf, MapPin, TrendingUp, Info, Landmark, Wheat, CalendarDays, BarChartHorizontal, Loader2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cropPriceInfo, type CropPriceInfoOutput } from "@/ai/flows/crop-price-info";
import { Separator } from "@/components/ui/separator";
import WeatherIcon from "./WeatherIcon";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NavItem } from "./SamriddhKhetiApp";


const generateMspData = (basePrice: number, volatility: number, trend: number) => {
  const data = [];
  // Use a static list of months to prevent hydration errors from new Date()
  const months = ["Jul '23", "Aug '23", "Sep '23", "Oct '23", "Nov '23", "Dec '23", "Jan '24", "Feb '24", "Mar '24", "Apr '24", "May '24", "Jun '24"];
  
  for (let i = 0; i < 12; i++) {
    const name = months[i];
    
    // Use a predictable pattern instead of Math.random()
    const trendFactor = i * trend * (basePrice / 1000);
    const volatilityFactor = ((i % 5) - 2) * volatility; // Predictable fluctuation

    const mspValue = basePrice + trendFactor + volatilityFactor;
    const localPriceValue = mspValue * (1.05 + ((i % 3) - 1) * 0.05); // Predictable premium
    
    data.push({ name, msp: Math.round(mspValue), local: Math.round(localPriceValue) });
  }
  return data;
};

const generateAllMspData = () => ({
    'Overall': generateMspData(2500, 50, 5),
    'Wheat': generateMspData(2275, 50, 7),
    'Rice': generateMspData(2183, 60, 6),
    'Maize': generateMspData(2090, 70, 5),
    'Sugarcane': generateMspData(315, 15, 1),
    'Cotton': generateMspData(6620, 300, 10),
    'Soybean': generateMspData(4600, 250, 8),
    'Groundnut': generateMspData(6377, 200, 9),
    'Mustard': generateMspData(5650, 220, 8),
    'Potato': generateMspData(1200, 150, 4),
    'Onion': generateMspData(1500, 200, 3),
    'Tomato': generateMspData(1300, 180, 2),
    'Mango': generateMspData(4000, 500, 6),
    'Banana': generateMspData(1500, 200, 4),
    'Pulses': generateMspData(6000, 300, 7),
    'Jute': generateMspData(5050, 250, 8),
    'Tea': generateMspData(200, 20, 1),
    'Coffee': generateMspData(7500, 400, 10),
    'Millet': generateMspData(2500, 150, 6),
    'Barley': generateMspData(1735, 80, 5),
    'Lentil': generateMspData(6000, 250, 7),
    'Gram': generateMspData(5440, 200, 6),
    'Sorghum': generateMspData(3180, 180, 7),
    'Bajra': generateMspData(2500, 170, 6),
    'Turmeric': generateMspData(8000, 500, 12),
    'Ginger': generateMspData(9000, 600, 15),
    'Chilli': generateMspData(15000, 1000, 18),
    'Capsicum': generateMspData(3500, 300, 5),
    'Brinjal': generateMspData(1800, 200, 4),
    'Okra': generateMspData(2500, 250, 5),
    'Cabbage': generateMspData(1000, 150, 3),
    'Cauliflower': generateMspData(1200, 180, 3),
    'Grapes': generateMspData(5000, 400, 8),
    'Apple': generateMspData(8000, 600, 10),
    'Pomegranate': generateMspData(12000, 800, 15),
    'Guava': generateMspData(2000, 200, 5),
    'Papaya': generateMspData(1500, 150, 4),
});

type MspData = ReturnType<typeof generateAllMspData>;
type MspDataKey = keyof MspData;
const allMspData = generateAllMspData();

interface WeatherData {
  temperature: number;
  precipitation_probability: number;
  relative_humidity: number;
  wind_speed: number;
  is_day: number;
  weathercode: number;
}

interface ForecastDay {
  date: string;
  day: string;
  weathercode: number;
  temp_max: number;
  temp_min: number;
  precipitation_probability_max: number;
}

interface DashboardViewProps {
  onNavigate: (view: NavItem) => void;
}


export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const { t, languageCode } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationName, setLocationName] = useState<string | null>("Loading location...");
  const [selectedCrop, setSelectedCrop] = useState<MspDataKey>('Overall');

  const [cropInput, setCropInput] = useState<string>('Overall');
  const [cropSuggestions, setCropSuggestions] = useState<string[]>([]);
  const [showCropSuggestions, setShowCropSuggestions] = useState(false);
  const cropInputRef = useRef<HTMLDivElement>(null);
  
  const [priceInfo, setPriceInfo] = useState<CropPriceInfoOutput | null>(null);
  const [loadingPriceInfo, setLoadingPriceInfo] = useState(false);
  const [animateWeather, setAnimateWeather] = useState(false);


  const handleCropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCropInput(value);
    if (value) {
      const filtered = Object.keys(allMspData).filter(crop =>
        crop.toLowerCase().startsWith(value.toLowerCase())
      );
      setCropSuggestions(filtered);
      setShowCropSuggestions(true);
    } else {
      setShowCropSuggestions(false);
      setCropSuggestions(Object.keys(allMspData));
    }
  };

  const handleCropSuggestionClick = (suggestion: MspDataKey) => {
    setSelectedCrop(suggestion);
    setCropInput(suggestion);
    setShowCropSuggestions(false);
  };

  const handleCropInputFocus = () => {
    if (cropInput === 'Overall') {
      setCropInput('');
    }
    setCropSuggestions(Object.keys(allMspData));
    setShowCropSuggestions(true);
  };

  const handleCropInputBlur = () => {
    if (!cropInput) {
      setCropInput(selectedCrop);
    }
  }
  
  const fetchPriceInfo = async () => {
      if (selectedCrop && selectedCrop !== 'Overall') {
          setLoadingPriceInfo(true);
          setPriceInfo(null);
          try {
              const info = await cropPriceInfo({ cropName: selectedCrop, language: languageCode });
              setPriceInfo(info);
          } catch (error) {
              console.error("Error fetching price info:", error);
              setPriceInfo(null);
          } finally {
              setLoadingPriceInfo(false);
          }
      } else {
          setPriceInfo(null);
      }
  };

  useEffect(() => {
    setPriceInfo(null);
  }, [selectedCrop]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cropInputRef.current && !cropInputRef.current.contains(event.target as Node)) {
        setShowCropSuggestions(false);
        if (!cropInput) {
            setCropInput(selectedCrop);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [cropInput, selectedCrop]);

  useEffect(() => {
    const fetchWeatherAndLocation = async (latitude: number, longitude: number) => {
      setLoadingWeather(true);
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,is_day,wind_speed_10m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5`
        );
        const weatherData = await weatherResponse.json();
        if (weatherData && weatherData.current) {
          setWeatherData({
            temperature: Math.round(weatherData.current.temperature_2m),
            precipitation_probability: weatherData.current.precipitation_probability,
            relative_humidity: weatherData.current.relative_humidity_2m,
            wind_speed: Math.round(weatherData.current.wind_speed_10m),
            is_day: weatherData.current.is_day,
            weathercode: weatherData.current.weathercode,
          });
           setAnimateWeather(true);
          setTimeout(() => setAnimateWeather(false), 500);
        }
        if (weatherData && weatherData.daily) {
          const forecast: ForecastDay[] = weatherData.daily.time.map((date: string, index: number) => ({
            date: date,
            day: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
            weathercode: weatherData.daily.weathercode[index],
            temp_max: Math.round(weatherData.daily.temperature_2m_max[index]),
            temp_min: Math.round(weatherData.daily.temperature_2m_min[index]),
            precipitation_probability_max: weatherData.daily.precipitation_probability_max[index],
          }));
          setForecastData(forecast);
        }

        try {
            const locationResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const locationData = await locationResponse.json();
            if (locationData && locationData.address) {
                const { address } = locationData;
                const locationString = [
                    address.village || address.town || address.city || address.county,
                    address.state,
                ]
                .filter(Boolean)
                .join(", ");
                setLocationName(locationString || t('current_location'));
            } else {
                setLocationName(t('unknown_location'));
            }
        } catch (locationError) {
             console.error("Error fetching location name:", locationError);
             setLocationName(t('could_not_fetch_location'));
        }

      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        setWeatherData(null);
        setLocationName(t('could_not_fetch_location'));
      } finally {
        setLoadingWeather(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            fetchWeatherAndLocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Delhi
          fetchWeatherAndLocation(28.61, 77.23);
        }
      );
    } else {
        // Fallback to Delhi for browsers that don't support geolocation
        fetchWeatherAndLocation(28.61, 77.23);
    }
  }, [t]);

  return (
    <div className="grid gap-6 md:gap-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('Govt. Schemes')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('latest_schemes')}</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="text-sm">
                    <p className="font-semibold truncate">{t('scheme_pm_kisan_title')}</p>
                    <p className="text-xs text-muted-foreground">{t('scheme_pm_kisan_desc')}</p>
                </div>
                <div className="text-sm">
                    <p className="font-semibold truncate">{t('scheme_fasal_bima_title')}</p>
                    <p className="text-xs text-muted-foreground">{t('scheme_fasal_bima_desc')}</p>
                </div>
              </div>
            </CardContent>
             <div className="absolute bottom-4 right-4 text-muted-foreground group-hover:text-primary transition-colors">
                <ArrowRight className="h-5 w-5" />
            </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('current_weather')}</CardTitle>
             <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {loadingWeather ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>{locationName}</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className={cn("flex items-center justify-around pt-2", animateWeather && "animate-pulse-once")}>
            {loadingWeather ? (
                <>
                    <Skeleton className="h-12 w-14" />
                    <Skeleton className="h-12 w-14" />
                    <Skeleton className="h-12 w-14" />
                    <Skeleton className="h-12 w-14" />
                </>
            ) : weatherData ? (
              <>
                <div className="flex flex-col items-center gap-1">
                  <WeatherIcon code={weatherData.weathercode} className="h-6 w-6 text-accent" />
                  <span className="font-bold text-lg">{weatherData.temperature}°C</span>
                  <span className="text-xs text-muted-foreground">
                    {t('weather_temperature')}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CloudRain className="h-6 w-6 text-muted-foreground" />
                  <span className="font-bold text-lg">{weatherData.precipitation_probability}%</span>
                  <span className="text-xs text-muted-foreground">{t('weather_rain_chance')}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Thermometer className="h-6 w-6 text-muted-foreground" />
                  <span className="font-bold text-lg">{weatherData.relative_humidity}%</span>
                  <span className="text-xs text-muted-foreground">{t('weather_humidity')}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Wind className="h-6 w-6 text-muted-foreground" />
                  <span className="font-bold text-lg">{weatherData.wind_speed} km/h</span>
                  <span className="text-xs text-muted-foreground">{t('weather_wind')}</span>
                </div>
              </>
            ) : (
                <p className="text-sm text-muted-foreground col-span-4 text-center">{t('weather_could_not_load')}</p>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-5">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CalendarDays className="h-5 w-5"/>
                {t('forecast_title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWeather ? (
                <div className="flex justify-around">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Skeleton className="h-5 w-8" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-4 w-10 mt-1" />
                    </div>
                  ))}
                </div>
              ) : forecastData.length > 0 ? (
                <div className="grid grid-cols-5 gap-4 text-center">
                  {forecastData.map((day) => (
                    <div key={day.date} className="flex flex-col items-center gap-1">
                      <p className="font-semibold text-sm">{day.day}</p>
                      <WeatherIcon code={day.weathercode} className="h-7 w-7 text-accent" />
                      <p className="text-sm font-bold">{day.temp_max}°</p>
                      <p className="text-xs text-muted-foreground">{day.temp_min}°</p>
                      <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                        <CloudRain className="h-3 w-3" />
                        <span>{day.precipitation_probability_max}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">{t('forecast_not_available')}</p>
              )}
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="font-headline">{t('price_comparison_title')}</CardTitle>
              <CardDescription>{t('price_comparison_description')}</CardDescription>
            </div>
             <div className="relative w-40" ref={cropInputRef}>
                <Input
                  placeholder={t('price_search_crop_placeholder')}
                  value={cropInput}
                  onChange={handleCropInputChange}
                  onFocus={handleCropInputFocus}
                  onBlur={handleCropInputBlur}
                  autoComplete="off"
                />
                {showCropSuggestions && cropSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-background border border-input rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      {cropSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                          onMouseDown={() => handleCropSuggestionClick(suggestion as MspDataKey)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
             </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            {allMspData ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={allMspData[selectedCrop]}>
                    <defs>
                        <linearGradient id="colorMsp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorLocal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                        wrapperClassName="!bg-card !border-border !rounded-lg !shadow-lg"
                        labelClassName="font-bold"
                        formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name === 'msp' ? t('price_msp_full') : t('price_local_full')]}
                    />
                    <Legend verticalAlign="top" height={36} formatter={(value) => value === 'msp' ? t('price_msp_full') : t('price_local_full')} />
                    <Area type="monotone" dataKey="local" stroke="hsl(var(--chart-4))" fillOpacity={1} fill="url(#colorLocal)" />
                    <Area type="monotone" dataKey="msp" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorMsp)" />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t('price_analysis_title')}
                </CardTitle>
                <CardDescription>{t('price_analysis_description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {selectedCrop !== 'Overall' && (
                    <Button onClick={fetchPriceInfo} disabled={loadingPriceInfo} className="mb-4 w-full">
                        {loadingPriceInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('get_price_analysis_button')}
                    </Button>
                )}
                {loadingPriceInfo ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-around items-center pt-2">
                           <Skeleton className="h-12 w-20" />
                           <Skeleton className="h-12 w-20" />
                        </div>
                    </div>
                ) : priceInfo ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">{priceInfo.analysis}</p>
                        <div className="flex justify-around items-end pt-2 text-center">
                            <div>
                                <div className="text-xs text-muted-foreground">{t('price_last_year_msp')}</div>
                                <div className="font-bold text-lg">₹{priceInfo.lastYearMsp}</div>
                            </div>
                            <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
                             <div>
                                <div className="text-xs text-muted-foreground">{t('price_current_msp')}</div>
                                <div className="font-bold text-lg text-primary">₹{priceInfo.currentMsp}</div>
                            </div>
                             <div>
                                <div className="text-xs text-muted-foreground">{t('price_local_price')}</div>
                                <div className="font-bold text-lg text-accent">₹{priceInfo.currentLocalPrice}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">
                        <p>{t('price_analysis_select_crop_prompt')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    

    
