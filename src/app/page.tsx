
"use client";

import { Suspense } from 'react';
import LandingPage from "@/components/LandingPage";
import { Skeleton } from '@/components/ui/skeleton';

function LandingPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
      <main className="flex-1">
        <div className="relative h-[calc(100vh-64px)] w-full">
            <Skeleton className="h-full w-full" />
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LandingPageSkeleton />}>
      <LandingPage />
    </Suspense>
  );
}
