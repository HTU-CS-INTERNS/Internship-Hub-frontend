
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const TopWave = () => (
  <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -z-[1]">
    <svg
      viewBox="0 0 1440 260" 
      xmlns="http://www.w3.org/2000/svg"
      className="relative block w-full h-[180px] sm:h-[220px]"
    >
      <path
        fill="hsl(195, 47%, 32%)"
        fillOpacity="1"
        d="M0,128L60,138.7C120,149,240,171,360,165.3C480,160,600,128,720,112C840,96,960,96,1080,106.7C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
      ></path>
    </svg>
  </div>
);

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-muted'}`} />
);

export default function OnboardingStep1Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-clip p-4">
      <TopWave />
      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-8">
        <div className="w-full max-w-xs">
          <div className="flex justify-center mb-5">
            <Image 
              src="https://placehold.co/400x250.png" 
              alt="Student actively engaged in a modern work environment"
              width={250} 
              height={156} 
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="student growth support professional modern"
            />
          </div>
          
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-center items-center space-x-2">
              <div className="p-2 bg-primary rounded-full shadow-md">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-lg font-headline font-bold text-primary tracking-tight mt-1">
              Unlock Your Internship Potential!
            </h1>
            <p className="text-xs text-foreground/80 font-body leading-normal">
              Your seamless journey to success starts here. Stay connected, organized, and accountable.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto text-center py-4 z-0">
        <div className="flex justify-center items-center space-x-1.5 mb-5">
          <OnboardingStepDot isActive={true} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
        </div>
        <div className="flex flex-col space-y-2">
          <Link href="/onboarding/step2" passHref className="w-full">
            <Button className="font-body text-sm py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg w-full group h-10">
              Next <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/register" passHref className="w-full">
             <Button variant="link" size="sm" className="font-body text-muted-foreground hover:text-primary rounded-lg w-full h-auto py-2 text-xs">
              Skip to Registration
            </Button>
          </Link>
        </div>
      </div>
      <footer className="flex-shrink-0 py-3 text-center text-xs text-muted-foreground z-0">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
    