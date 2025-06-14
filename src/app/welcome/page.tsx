
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, LogIn } from 'lucide-react';
import TopWave from '@/components/shared/top-wave';

export default function WelcomePage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-clip">
      <TopWave />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 z-0 pt-[5vh] sm:pt-[8vh]">
        <div className="relative z-10 mb-6 animate-in fade-in-0 slide-in-from-top-12 duration-1000">
          <div className="p-3 bg-primary-foreground/20 rounded-full inline-block shadow-lg backdrop-blur-sm">
            <GraduationCap className="h-12 w-12 sm:h-14 sm:w-14 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-headline font-bold text-primary-foreground tracking-tight">
            InternHub
          </h1>
        </div>
        <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-300 mt-4 sm:mt-6 max-w-xs mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Elevate Your Internship Experience
          </h2>
          <p className="text-xs sm:text-sm text-foreground/80 font-body leading-normal">
            The Official Internship Platform for Ho Technical University.
          </p>
        </div>
      </div>
      <div className="w-full max-w-xs mx-auto text-center py-4 z-0 animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500">
        <div className="flex flex-col items-center space-y-3">
          <Link href="/welcome/get-started" passHref className="w-full">
            <Button
              className="font-body text-sm px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg w-full group h-10"
            >
              Discover InternHub <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login" passHref className="w-full">
            <Button
              variant="outline"
              className="font-body text-sm px-6 py-2.5 border-primary/50 text-primary hover:bg-primary/5 shadow-sm rounded-lg w-full group h-10"
            >
              <LogIn className="mr-2 h-4 w-4"/> Login
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
