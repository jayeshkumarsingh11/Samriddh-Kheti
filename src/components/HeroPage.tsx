
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroPageProps {
    onNavigate: (page: 'Dashboard') => void;
    onLearnMoreClick: () => void;
}

export default function HeroPage({ onNavigate, onLearnMoreClick }: HeroPageProps) {
  const { t } = useLanguage();

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
      <Image
        src="https://khetibuddy.com/wp-content/uploads/2024/06/Crops.jpg"
        alt="A vibrant corn field at sunset with a dramatic cloudy sky"
        fill
        style={{objectFit: "cover"}}
        className="z-0"
        data-ai-hint="corn field"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">
          {t('hero_title')}
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mb-8">
          {t('hero_subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => onNavigate('Dashboard')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('hero_cta_primary')}
          </Button>
          <Button size="lg" variant="outline" onClick={onLearnMoreClick} className="bg-transparent border-white text-white hover:bg-white hover:text-black">
            {t('hero_cta_secondary')}
          </Button>
        </div>
      </div>
    </div>
  );
}
