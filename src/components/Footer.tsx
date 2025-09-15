
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NavItem } from "./SamriddhKhetiApp";

interface FooterProps {
    onNavigate: (item: NavItem) => void;
}


export default function Footer({ onNavigate }: FooterProps) {
    const { t } = useLanguage();

    const footerNavLinks: { nameKey: string, view: NavItem }[] = [
        { nameKey: "nav_home", view: "Home" },
        { nameKey: "nav_dashboard", view: "Dashboard" },
        { nameKey: "nav_about_us", view: "About Us" },
        { nameKey: "nav_contact_us", view: "Contact Us" },
    ];

    const footerToolLinks: { nameKey: string, view: NavItem }[] = [
        { nameKey: "nav_irrigation_planner", view: "Irrigation Planner" },
        { nameKey: "nav_crop_advisor", view: "Crop Advisor" },
        { nameKey: "nav_soil_advisor", view: "Soil Advisor" },
        { nameKey: "nav_govt_schemes", view: "Govt. Schemes" },
    ];

    const handleLinkClick = (e: React.MouseEvent, item: NavItem) => {
        e.preventDefault();
        onNavigate(item);
    }

    return (
        <footer className="bg-muted/40 border-t">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-headline font-semibold text-primary">Samriddh Kheti</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('hero_subtitle')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-headline text-lg font-semibold">{t('footer_quick_links')}</h3>
                        <ul className="space-y-2">
                            {footerNavLinks.map(link => (
                                <li key={link.nameKey}>
                                    <a 
                                        href="#"
                                        onClick={(e) => handleLinkClick(e, link.view)}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {t(link.nameKey)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tools Links */}
                    <div className="space-y-4">
                        <h3 className="font-headline text-lg font-semibold">{t('footer_tools')}</h3>
                        <ul className="space-y-2">
                            {footerToolLinks.map(link => (
                                <li key={link.nameKey}>
                                    <a 
                                        href="#"
                                        onClick={(e) => handleLinkClick(e, link.view)} 
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {t(link.nameKey)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter & Socials */}
                    <div className="space-y-4">
                        <h3 className="font-headline text-lg font-semibold">{t('footer_newsletter')}</h3>
                        <p className="text-sm text-muted-foreground">{t('footer_newsletter_desc')}</p>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input type="email" placeholder={t('form_email_placeholder')} />
                            <Button type="submit">{t('footer_subscribe')}</Button>
                        </div>
                        
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                    <p>© 2025 Team Seedsorrowers. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
