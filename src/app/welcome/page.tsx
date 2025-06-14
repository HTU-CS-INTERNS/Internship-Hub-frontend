
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, LogIn } from 'lucide-react';

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      viewBox="0 0 1440 320" // Increased viewBox height for a more substantial wave
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[220px] sm:h-[280px] md:h-[320px]" // Responsive height for the wave
    >
      <path
        fill="hsl(195, 47%, 32%)" // Dark Teal/Blue
        fillOpacity="1"
        d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,122.7C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      ></path>
    </svg>
  </div>
);

export default function WelcomePage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-clip">
      <TopWave />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 z-0 pt-[5vh] sm:pt-[8vh]"> {/* Content starts lower now */}
        
        {/* Logo and App Name within the wave area */}
        <div className="relative z-10 mb-8 animate-in fade-in-0 slide-in-from-top-12 duration-1000">
          <div className="p-4 bg-primary-foreground/20 rounded-full inline-block shadow-lg backdrop-blur-sm">
            <GraduationCap className="h-16 w-16 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-4xl font-headline font-bold text-primary-foreground tracking-tight">
            InternHub
          </h1>
        </div>

        {/* Descriptive Text (below the main part of the wave) */}
        <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-300 mt-4 sm:mt-8">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Elevate Your Internship Experience
          </h2>
          <p className="text-base text-foreground/80 font-body leading-relaxed max-w-xs mx-auto">
            The Official Internship Platform for Ho Technical University.
          </p>
        </div>
      </div>

      {/* Buttons Area */}
      <div className="w-full max-w-xs mx-auto text-center py-6 sm:py-8 z-0 animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <Link href="/onboarding/step1" passHref className="w-full">
            <Button
              className="font-body text-sm px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg w-full group"
            >
              Discover InternHub <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login" passHref className="w-full">
            <Button
              variant="outline"
              className="font-body text-sm px-6 py-2.5 border-primary/50 text-primary hover:bg-primary/5 shadow-sm rounded-lg w-full group"
            >
              <LogIn className="mr-2 h-4 w-4"/> Already have an account? Login
            </Button>
          </Link>
        </div>
      </div>

      <footer className="flex-shrink-0 py-4 text-center text-xs text-muted-foreground z-0">
        <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Empowering Futures.</p>
      </footer>
    </main>
  );
}
    