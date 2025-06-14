
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
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      {/* Top Blob SVG */}
      <svg viewBox="0 0 200 100" className="absolute top-0 left-0 w-[50%] sm:w-[35%] md:w-[30%] max-w-[220px] h-auto z-[-1]" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C50 100 150 -20 200 50 L200 0 Z" />
      </svg>

      {/* Content Wrapper */}
      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-12 sm:pt-16">
        <div className="w-full max-w-xs">
          <div className="flex justify-center mb-4 sm:mb-5">
            <Image
              src="https://placehold.co/280x175.png"
              alt="Student actively engaged in a modern work environment"
              width={280}
              height={175}
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="student growth support professional modern"
            />
          </div>
          {/* Spacer to push text content into the bottom blob area */}
          <div className="h-[4vh] sm:h-[6vh]"></div>
        </div>
      </div>

      {/* Bottom Blob with Text and Next Button */}
      <div className="relative w-full h-[45vh] sm:h-[40vh] md:h-[35vh] z-0 flex flex-col items-center justify-end">
        <svg viewBox="0 0 1440 300" className="absolute bottom-0 left-0 w-full h-full z-0" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,100 C200,200 400,50 720,100 C1000,150 1200,0 1440,80 L1440,300 L0,300 Z" />
        </svg>
        <div className="relative z-10 p-4 text-center text-primary-foreground w-full max-w-xs mx-auto mb-[calc(2rem+16px)] pr-12 sm:pr-14">
          <div className="flex justify-center items-center space-x-2 mb-1">
            <div className="p-1.5 bg-primary-foreground/20 rounded-full shadow-md">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-lg font-headline font-bold tracking-tight">
            Unlock Your Internship Potential!
          </h1>
          <p className="text-xs font-body leading-normal mt-1 opacity-90 max-w-[90%] mx-auto">
            Your seamless journey to a successful internship experience starts here. Stay connected, organized, and accountable.
          </p>
          <Link href="/onboarding/step2" passHref>
            <Button variant="ghost" size="icon" className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-full h-9 w-9 sm:h-10 sm:w-10">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="relative z-20 w-full max-w-xs mx-auto text-center py-4">
        <div className="flex justify-center items-center space-x-1.5 mb-3">
          <OnboardingStepDot isActive={true} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
        </div>
        <Link href="/register" passHref>
            <Button variant="link" size="sm" className="font-body text-muted-foreground hover:text-primary rounded-lg h-auto py-1 text-xs">
            Skip to Registration
            </Button>
        </Link>
      </div>
      <footer className="relative z-20 flex-shrink-0 py-2 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
