
"use client";

import Image from "next/image";
import image from "@/components/images/logo.png";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  loading: boolean;
}

export default function LoadingSpinner({ loading }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 pointer-events-none",
        loading ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="animate-pulse">
        <Image
          src={image}
          alt="Samriddh Kheti Logo"
          width={120}
          height={120}
          priority
        />
      </div>
      <p className="mt-4 text-lg font-headline text-primary">
        Samriddh Kheti
      </p>
    </div>
  );
}
