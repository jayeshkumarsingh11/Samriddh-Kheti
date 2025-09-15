
"use client"

import { useState, useEffect, useRef } from 'react';
import SamriddhKhetiApp from '@/components/SamriddhKhetiApp';
import TopNavBar from './TopNavBar';
import AboutPage from './AboutPage';
import HeroPage from './HeroPage';
import ContactUs from './ContactUs';
import type { NavItem } from './SamriddhKhetiApp';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';


const APP_VIEWS: NavItem[] = ["Dashboard", "Irrigation Planner", "Crop Advisor", "Soil Advisor", "Govt. Schemes"];
const HOME_SECTIONS: NavItem[] = ["Home", "About Us", "Contact Us"];

export default function LandingPage() {
  const [activeView, setActiveView] = useState<NavItem>('Home');
  const [isLoading, setIsLoading] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    // Show loading spinner on initial load
    const timer = setTimeout(() => {
      setIsLoading(false);

      // On initial load, always reset to home view and scroll to top smoothly
      const url = new URL(window.location.href);
      if (url.searchParams.has('view')) {
        url.searchParams.delete('view');
        window.history.replaceState({}, '', url.toString());
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

    }, 1500); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    sectionRefs.current['Home'] = document.getElementById('hero-page');
    sectionRefs.current['About Us'] = document.getElementById('about-us');
    sectionRefs.current['Contact Us'] = document.getElementById('contact-us');

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);

        if (visibleSections.length > 0) {
            // Find the section that is most visible
            const mostVisibleSection = visibleSections.reduce((prev, current) => {
                return prev.intersectionRatio > current.intersectionRatio ? prev : current;
            });
            
            const view = Object.keys(sectionRefs.current).find(
              (key) => sectionRefs.current[key] === mostVisibleSection.target
            ) as NavItem | undefined;

            if (view && HOME_SECTIONS.includes(view) && !APP_VIEWS.includes(activeView)) {
              setActiveView(view);
            }
        }
      },
      // Create thresholds at every 5% increment
      { threshold: Array.from({ length: 21 }, (_, i) => i * 0.05) }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isLoading, activeView]);


  const handleNavigation = (item: NavItem) => {
    const isCurrentlyOnAppView = APP_VIEWS.includes(activeView);

    const url = new URL(window.location.href);
    if (item === 'Home') {
      url.search = '';
    } else {
      url.searchParams.set('view', item);
    }
    
    window.history.pushState({}, '', url.toString());
    
    if (HOME_SECTIONS.includes(item)) {
        if (isCurrentlyOnAppView) {
            setActiveView(item); 
            setTimeout(() => {
                const elementId = item === 'Home' ? 'hero-page' : item.toLowerCase().replace(' ', '-');
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 50); 
        } else {
            const elementId = item === 'Home' ? 'hero-page' : item.toLowerCase().replace(' ', '-');
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    } else {
        setActiveView(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleLearnMoreClick = () => {
    const aboutSection = document.getElementById('about-us');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderContent = () => {
      if (APP_VIEWS.includes(activeView)) {
        return <SamriddhKhetiApp initialView={activeView} onNavigate={handleNavigation} />;
      }
      
      return (
        <>
          <div id="hero-page">
            <HeroPage onNavigate={handleNavigation} onLearnMoreClick={handleLearnMoreClick} />
          </div>
          <div id="about-us">
            <AboutPage />
          </div>
          <div id="contact-us">
            <ContactUs />
          </div>
        </>
      );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
        <LoadingSpinner loading={isLoading} />
        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <TopNavBar activeItem={activeView} setActiveItem={handleNavigation} />
            <main className="flex-1">
                {renderContent()}
            </main>
            <Footer onNavigate={handleNavigation} />
        </div>
    </div>
  )
}
