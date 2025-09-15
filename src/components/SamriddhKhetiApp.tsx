
"use client"

import { useState, useEffect } from 'react'

import DashboardView from "@/components/DashboardView"
import IrrigationPlanner from "@/components/IrrigationPlanner"
import CropAdvisor from "@/components/CropAdvisor"
import SoilQualityAdvisor from "@/components/SoilQualityAdvisor"
import SchemeFinder from "@/components/SchemeFinder"

export type NavItem = "Dashboard" | "Irrigation Planner" | "Crop Advisor" | "Soil Advisor" | "Govt. Schemes" | "Home" | "About Us" | "Contact Us" | "Tools";

interface SamriddhKhetiAppProps {
  initialView?: NavItem;
  onNavigate: (item: NavItem) => void;
}


export default function SamriddhKhetiApp({ initialView = "Dashboard", onNavigate }: SamriddhKhetiAppProps) {
  const [activeView, setActiveView] = useState<NavItem>(initialView);

  // This effect ensures that if the initialView prop changes (e.g., due to browser back/forward),
  // the component re-renders with the correct view.
  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const renderContent = () => {
    switch (activeView) {
      case "Dashboard":
        return <DashboardView onNavigate={onNavigate} />;
      case "Irrigation Planner":
        return <IrrigationPlanner />;
      case "Crop Advisor":
        return <CropAdvisor />;
      case "Soil Advisor":
        return <SoilQualityAdvisor />;
      case "Govt. Schemes":
        return <SchemeFinder />;
      default:
        return <DashboardView onNavigate={onNavigate}/>;
    }
  };

  return (
    <main className="flex-1 p-4 lg:p-6">
      {renderContent()}
    </main>
  )
}
