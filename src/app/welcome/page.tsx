'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, GraduationCap } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="relative flex flex-col min-h-screen bg-primary text-primary-foreground p-4 overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-[5vh] sm:pt-[8vh] z-0">
        <div className="relative z-10 mb-6 animate-in fade-in-0 slide-in-from-top-12 duration-1000">
          <div className="p-3 bg-primary-foreground/20 rounded-full inline-block shadow-lg backdrop-blur-sm">
            <GraduationCap className="h-12 w-12 sm:h-14 sm:w-14 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-headline font-bold text-primary-foreground tracking-tight">
            InternHub
          </h1>
        </div>
        <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-300 mt-4 sm:mt-6 max-w-xs mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-primary-foreground tracking-tight">
            Elevate Your Internship Experience
          </h2>
          <p className="text-xs sm:text-sm text-primary-foreground/80 font-body leading-normal">
            The Official Internship Platform for Ho Technical University.
          </p>
        </div>
      </div>
      <div className="w-full max-w-xs mx-auto text-center py-4 z-0 animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500">
        <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
          <Link href="/onboarding/step1" passHref className="w-full sm:w-auto">
            <Button
              className="font-body text-sm px-6 py-2.5 bg-primary-foreground hover:bg-primary-foreground/90 text-primary shadow-md rounded-lg w-full group h-10"
            >
              Discover InternHub <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login" passHref className="w-full sm:w-auto">
            <Button
              className="font-body text-sm px-6 py-2.5 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-md rounded-lg w-full group h-10"
            >
              <LogIn className="mr-2 h-4 w-4"/> Login
            </Button>
          </Link>
        </div>
      </div>
      <footer className="flex-shrink-0 py-6 text-center text-xs text-primary-foreground/70 z-0">
        <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Empowering Futures.</p>
      </footer>
    </main>
  );
}
