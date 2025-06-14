
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onAccentBg }: { isActive: boolean; onAccentBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onAccentBg ? 'bg-accent-foreground scale-110' : 'bg-primary scale-110') : (onAccentBg ? 'bg-accent-foreground/50' : 'bg-muted')}`} />
);

export default function OnboardingStep4Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      {/* Top Blob SVG - Accent */}
      <svg viewBox="0 0 200 100" className="absolute top-0 left-0 w-[50%] sm:w-[35%] md:w-[30%] max-w-[220px] h-auto z-[-1]" fill="hsl(var(--accent))" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C70 70 130 -30 200 70 L200 0 Z" />
      </svg>

      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-12 sm:pt-16">
        <div className="w-full max-w-xs">
          <div className="flex justify-center mb-4 sm:mb-5">
            <Image
              src="https://placehold.co/250x156.png"
              alt="Location pin with shield or check-in confirmation"
              width={250}
              height={156}
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="location security trust check-in"
            />
          </div>
          <div className="h-[2vh] sm:h-[4vh]"></div>
        </div>
      </div>

      {/* Bottom Blob with Text and Next Button - Accent */}
      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] z-0 flex flex-col items-center justify-end">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 left-0 w-full h-full z-0" fill="hsl(var(--accent))" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,70 C180,170 380,40 720,80 C1000,130 1150,0 1440,60 L1440,320 L0,320 Z" />
        </svg>
        <div className="relative z-10 p-4 text-center text-accent-foreground w-full max-w-xs mx-auto flex flex-col justify-between h-full">
          <div className="pt-6 sm:pt-8">
            <div className="flex justify-center items-center space-x-2 mb-1">
              <div className="p-1.5 bg-accent-foreground/20 rounded-full shadow-md">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-lg font-headline font-bold tracking-tight">
              Build Your Verifiable Professional Record
            </h1>
            <p className="text-xs font-body leading-normal mt-1 opacity-90 max-w-[90%] mx-auto">
              Securely check-in at your internship site and verify your presence to build a strong, trusted record of your dedication. Your privacy is paramount.
            </p>
            <Link href="/onboarding/step5" passHref>
              <Button variant="ghost" size="icon" className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 mt-2 bg-accent-foreground/20 hover:bg-accent-foreground/30 text-accent-foreground rounded-full h-9 w-9 sm:h-10 sm:w-10">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="pb-2">
            <div className="flex justify-center items-center space-x-1.5 mb-2">
              <OnboardingStepDot isActive={false} onAccentBg={true}/>
              <OnboardingStepDot isActive={false} onAccentBg={true}/>
              <OnboardingStepDot isActive={false} onAccentBg={true}/>
              <OnboardingStepDot isActive={true} onAccentBg={true}/>
              <OnboardingStepDot isActive={false} onAccentBg={true}/>
            </div>
            <div className="flex items-center justify-between w-full">
              <Link href="/onboarding/step3" passHref>
                <Button variant="ghost" size="sm" className="font-body text-accent-foreground/80 hover:text-accent-foreground rounded-lg group h-auto py-1 text-xs">
                  <ArrowLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="link" size="sm" className="font-body text-accent-foreground/80 hover:text-accent-foreground rounded-lg h-auto py-1 text-xs">
                  Skip
                </Button>
              </Link>
            </div>
            <p className="text-xs text-accent-foreground/70 mt-2">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
