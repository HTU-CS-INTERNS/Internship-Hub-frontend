
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4 text-center">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="space-y-6 max-w-md w-full">
          <div className="animate-in fade-in-0 slide-in-from-top-12 duration-1000">
            <Image
              src="https://placehold.co/400x300.png" 
              alt="Students collaborating in a modern tech environment"
              width={400} 
              height={300}
              className="rounded-xl shadow-xl object-cover aspect-[4/3] mx-auto"
              data-ai-hint="students technology collaboration success"
              priority
            />
          </div>

          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-300">
            <div className="flex justify-center items-center space-x-3">
              <div className="p-3 bg-primary rounded-full shadow-lg">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight mt-2">
              Elevate Your Internship Experience with InternHub
            </h1>
            <p className="text-base text-foreground/80 font-body leading-relaxed max-w-sm mx-auto">
              The Official Internship Platform for Ho Technical University.
            </p>
          </div>

          <div className="pt-4 animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
              <Link href="/welcome/get-started" passHref className="w-full sm:w-auto">
                <Button
                  className="font-headline text-base px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full group"
                >
                  Discover InternHub <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login" passHref className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="font-headline text-base px-6 py-3 border-primary text-primary hover:bg-primary/5 shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full group"
                >
                   <LogIn className="mr-2 h-5 w-5"/> Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex-shrink-0 py-6 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Empowering Futures.</p>
      </footer>
    </main>
  );
}
