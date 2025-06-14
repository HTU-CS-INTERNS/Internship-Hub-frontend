
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-6 text-center">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="space-y-10 max-w-xl w-full">
          <div className="animate-in fade-in-0 slide-in-from-top-12 duration-1000">
            <Image
              src="https://placehold.co/800x600.png"
              alt="Students collaborating in a modern tech environment"
              width={800}
              height={600}
              className="rounded-2xl shadow-2xl object-cover aspect-[4/3] mx-auto"
              data-ai-hint="students technology collaboration success"
              priority
            />
          </div>

          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-10 duration-1000 delay-300">
            <div className="flex justify-center items-center space-x-3">
              <div className="p-4 bg-primary rounded-full shadow-lg">
                <GraduationCap className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight mt-4">
              Elevate Your Internship Experience with InternHub
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-body leading-relaxed max-w-md mx-auto">
              The Official Internship Platform for Ho Technical University.
            </p>
          </div>

          <div className="pt-6 animate-in fade-in-0 slide-in-from-bottom-12 duration-1000 delay-500 flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
            <Link href="/welcome/get-started" passHref className="w-full sm:w-auto">
              <Button
                className="font-headline text-base px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full group"
              >
                Discover InternHub <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login" passHref className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="font-headline text-base px-8 py-3 border-primary text-primary hover:bg-primary/5 shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 rounded-xl w-full group"
              >
                 <LogIn className="mr-2 h-5 w-5"/> Already have an account? Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <footer className="flex-shrink-0 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Empowering Futures.</p>
      </footer>
    </main>
  );
}
