
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onPrimaryBg }: { isActive: boolean; onPrimaryBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onPrimaryBg ? 'bg-primary-foreground scale-110' : 'bg-primary scale-110') : (onPrimaryBg ? 'bg-primary-foreground/50' : 'bg-muted')}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      {/* Top Blob SVG - Primary */}
      <svg viewBox="0 0 200 100" className="absolute top-0 left-0 w-[50%] sm:w-[35%] md:w-[30%] max-w-[220px] h-auto z-[-1]" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C50 100 150 -20 200 50 L200 0 Z" />
      </svg>

      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-12 sm:pt-16">
        <div className="w-full max-w-xs">
          <div className="flex justify-center mb-4 sm:mb-5">
            <Image
              src="https://placehold.co/250x156.png"
              alt="Student confidently walking towards opportunity"
              width={250}
              height={156}
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="student success future opportunity"
            />
          </div>
          <div className="h-[2vh] sm:h-[4vh]"></div>
        </div>
      </div>
      
      {/* Bottom Blob with Text and Next Button - Primary */}
      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] z-0 flex flex-col items-center justify-end">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 left-0 w-full h-full z-0" fill="hsl(var(--primary))" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,100 C200,200 400,50 720,100 C1000,150 1200,0 1440,80 L1440,320 L0,320 Z" />
        </svg>
        <div className="relative z-10 p-4 text-center text-primary-foreground w-full max-w-xs mx-auto flex flex-col justify-between h-full">
          <div className="pt-6 sm:pt-8">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <div className="p-1.5 bg-primary-foreground/20 rounded-full shadow-md">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-headline font-bold tracking-tight">
              Your Internship Success Awaits!
            </h1>
            <p className="text-xs sm:text-sm font-body leading-normal mt-1 opacity-90">
              InternHub is here to support you. Get ready to make the most of your experience.
            </p>
          </div>
          
          <div className="pb-2">
            <div className="flex justify-center items-center space-x-1.5 mb-3">
              <OnboardingStepDot isActive={false} onPrimaryBg={true}/>
              <OnboardingStepDot isActive={false} onPrimaryBg={true}/>
              <OnboardingStepDot isActive={false} onPrimaryBg={true}/>
              <OnboardingStepDot isActive={false} onPrimaryBg={true}/>
              <OnboardingStepDot isActive={true} onPrimaryBg={true}/>
            </div>
            <div className="flex flex-col space-y-2">
                <Link href="/register" passHref className="w-full">
                    <Button className="font-body text-sm bg-primary-foreground hover:bg-primary-foreground/90 text-primary shadow-md rounded-lg w-full group h-10">
                    Let&apos;s Start <Rocket className="ml-1.5 h-4 w-4 transition-transform group-hover:rotate-6" />
                    </Button>
                </Link>
                <Link href="/onboarding/step4" passHref className="w-full">
                    <Button variant="ghost" size="sm" className="font-body text-primary-foreground/80 hover:text-primary-foreground rounded-lg group h-auto py-1 text-xs w-full">
                    <ArrowLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-2">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
