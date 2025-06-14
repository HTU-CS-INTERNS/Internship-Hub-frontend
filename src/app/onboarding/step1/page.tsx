
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-muted'}`} />
);

export default function OnboardingStep1Page() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-xs text-center"> {/* Reduced max-w for more compact view */}
          <div className="flex justify-center mb-6">
            <Image 
              src="https://placehold.co/400x250.png" 
              alt="Student actively engaged in a modern work environment"
              width={280} 
              height={175} 
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="student growth support professional modern"
            />
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-center items-center space-x-2">
              <div className="p-2 bg-primary rounded-full shadow-md">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-xl font-headline font-bold text-primary tracking-tight mt-2">
              Unlock Your Internship Potential!
            </h1>
            <p className="text-sm text-foreground/80 font-body leading-normal">
              Your seamless journey to success starts here. Stay connected, organized, and accountable.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto text-center py-4">
        <div className="flex justify-center items-center space-x-1.5 mb-6">
          <OnboardingStepDot isActive={true} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row-reverse sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
          <Link href="/onboarding/step2" passHref className="w-full sm:w-auto flex-1">
            <Button className="font-body text-sm px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg w-full group">
              Next <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/register" passHref className="w-full sm:w-auto flex-1">
             <Button variant="link" size="sm" className="font-body text-muted-foreground hover:text-primary rounded-lg w-full h-auto py-2.5">
              Skip
            </Button>
          </Link>
        </div>
      </div>
      <footer className="flex-shrink-0 py-4 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
