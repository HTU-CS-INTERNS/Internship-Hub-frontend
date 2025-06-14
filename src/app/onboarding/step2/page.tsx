
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ListChecks } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-muted'}`} />
);

export default function OnboardingStep2Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      {/* Top Blob SVG - Orange (Accent) */}
      <svg viewBox="0 0 200 100" className="absolute top-0 left-0 w-[50%] sm:w-[35%] md:w-[30%] max-w-[220px] h-auto z-0" fill="hsl(var(--accent))" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C60 90 140 -10 200 40 L200 0 Z" />
      </svg>

      {/* Content Wrapper */}
      <div className="flex-grow flex flex-col items-center justify-center text-center z-10 pt-16 sm:pt-20">
        <div className="w-full max-w-xs">
          <div className="flex justify-center mb-4 sm:mb-5">
            <Image
              src="https://placehold.co/250x156.png"
              alt="App mock-up of task or report submission"
              width={250}
              height={156}
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="app interface task report progress"
            />
          </div>
          <div className="h-[4vh] sm:h-[6vh]"></div>
        </div>
      </div>
      
      {/* Bottom Blob with Text and Next Button - Orange (Accent) */}
      <div className="relative w-full h-[45vh] sm:h-[40vh] md:h-[35vh] z-10 flex flex-col items-center justify-end">
        <svg viewBox="0 0 1440 300" className="absolute bottom-0 left-0 w-full h-full z-0" fill="hsl(var(--accent))" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,80 C150,180 350,30 720,90 C1000,140 1200,10 1440,70 L1440,300 L0,300 Z" />
        </svg>
        <div className="relative z-10 p-6 pb-4 text-center text-accent-foreground w-full max-w-md mx-auto mb-[calc(2rem+16px)]">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <div className="p-1.5 bg-accent-foreground/20 rounded-full shadow-md">
              <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-headline font-bold tracking-tight">
            Effortlessly Track Your Progress
          </h1>
          <p className="text-xs sm:text-sm font-body leading-normal mt-1 opacity-90">
            Log daily tasks, capture learning objectives, and submit detailed reports. Showcase your work.
          </p>
          <Link href="/onboarding/step3" passHref>
            <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 bg-accent-foreground/20 hover:bg-accent-foreground/30 text-accent-foreground rounded-full h-10 w-10 sm:h-12 sm:w-12">
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Footer (Dots, Back, Skip Buttons) */}
      <div className="relative z-20 w-full max-w-xs mx-auto text-center py-4">
        <div className="flex justify-center items-center space-x-1.5 mb-3">
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={true} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
        </div>
        <div className="flex items-center justify-between w-full">
          <Link href="/onboarding/step1" passHref>
            <Button variant="ghost" size="sm" className="font-body text-muted-foreground hover:text-accent rounded-lg group h-auto py-1 text-xs">
              <ArrowLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back
            </Button>
          </Link>
          <Link href="/register" passHref>
             <Button variant="link" size="sm" className="font-body text-muted-foreground hover:text-accent rounded-lg h-auto py-1 text-xs">
              Skip
            </Button>
          </Link>
        </div>
      </div>
      <footer className="relative z-20 flex-shrink-0 py-2 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
