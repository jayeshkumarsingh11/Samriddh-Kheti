
"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Target, Lightbulb, Rocket, Users, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import image from "@/components/images/indian-farmer-1610471656527.avif";
import image1 from "@/components/images/Aditya.jpg";
import image2 from "@/components/images/Jayesh.jpg";
import image3 from "@/components/images/Lavish.jpg";
import image4 from "@/components/images/Vidushi.jpeg";

const teamMembers = [
  {
    nameKey: "Aditya Adarsh",
    emailKey: "aditya18adarsh@gmail.com",
    image: image1,
    linkedin: "https://www.linkedin.com/in/aditya-adarsh/",
  },
  {
    nameKey: "Jayesh Kumar Singh",
    emailKey: "jayeshkumarsingh11@gmail.com",
    image: image2,
    linkedin: "https://www.linkedin.com/in/jayesh-singh-510953304/",
  },
  {
    nameKey: "Lavish Patel",
    emailKey: "patellavish.9336@gmail.com",
    image: image3,
    linkedin: "https://www.linkedin.com/in/lavishpatel/",
  },
  {
    nameKey: "Vidushi Srivastava",
    emailKey: "vidushi.official1012@gmail.com",
    image: image4,
    linkedin: "https://www.linkedin.com/in/srivastava-vidushi/",
  },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div id="about-us" className="container mx-auto px-16 py-16 space-y-16 scroll-mt-20">
      <header className="text-center">
        <h1 className="text-4xl font-headline text-primary">
          {t('about_title')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('about_subtitle')}
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg group">
           <Image
            src={image}
            alt="Indian farmer in a field"
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="indian farmer"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="max-w-3xl">
            <h2 className="text-3xl font-headline text-foreground">Welcome to Samriddh Kheti</h2>
            <p className="text-muted-foreground mt-2">
              We are dedicated to transforming the agricultural landscape of India by placing the power of data and artificial intelligence directly into the hands of our farmers. Our mission is to bridge the gap between traditional farming wisdom and modern technology, creating a future where every farmer can make informed decisions, optimize their resources, and cultivate a more prosperous and sustainable livelihood. We believe that by empowering farmers, we are cultivating a stronger nation.
            </p>
        </div>
        
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-primary">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-3">
                    <Target className="w-7 h-7 text-primary" />
                    Objective
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-muted-foreground">Empower farmers with intelligent, data-driven tools for decision-making.</p>
                <p className="text-muted-foreground">Integrate modern technology with traditional farming practices.</p>
                <p className="text-muted-foreground">Improve productivity, reduce risks, and promote sustainable outcomes.</p>
            </CardContent>
        </Card>
        <Card className="shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-primary">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-3">
                    <Lightbulb className="w-7 h-7 text-primary" />
                    Key Features
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <p className="text-muted-foreground"><span className="font-semibold text-foreground">AI-Powered Insights</span> → Smart irrigation and crop planning recommendations.</p>
               <p className="text-muted-foreground"><span className="font-semibold text-foreground">Weather Integration</span> → Real-time forecasts for better farm decisions.</p>
               <p className="text-muted-foreground"><span className="font-semibold text-foreground">Resource Optimization</span> → Efficient water, fertilizer, and energy usage.</p>
               <p className="text-muted-foreground"><span className="font-semibold text-foreground">User-Friendly Dashboard</span> → Simple interface with regional language support.</p>
            </CardContent>
        </Card>
        <Card className="shadow-lg transition-all hover:shadow-lg hover:scale-105 hover:border-primary ">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-3">
                    <Rocket className="w-7 h-7 text-primary" />
                    Vision & Mission
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
                <p>Empower every Indian farmer with accessible, data-driven tools and technology.</p>
                <p>Promote sustainable farming by optimizing resources and improving crop yields.</p>
                <p>Enhance farmer livelihoods by making modern solutions simple, affordable, and practical.</p>
            </CardContent>
        </Card>
      </div>

      <section className="text-center">
        <h2 className="text-3xl font-headline text-primary flex items-center justify-center gap-3">
          <Users className="w-8 h-8" />
          {t('meet_team_title')}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t('meet_team_subtitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="group">
              <Card className="text-center h-full transition-all duration-300 group-hover:shadow-xl group-hover:border-primary">
                <CardContent className="flex flex-col items-center p-6">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-accent transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage
                      src={typeof member.image === 'string' ? member.image : member.image.src}
                      alt={t(member.nameKey)}
                      width={100}
                      height={100}
                      data-ai-hint="person"
                    />
                    <AvatarFallback>{t(member.nameKey).substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold font-headline">
                    {t(member.nameKey)}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <p>{t(member.emailKey)}</p>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
