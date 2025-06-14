
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-accent-foreground scale-110' : 'bg-primary scale-110') : (onGradientBg ? 'bg-accent-foreground/50' : 'bg-muted')}`} />
);

export default function OnboardingStep4Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4 pt-8 sm:pt-12">
        <div className="w-full max-w-xs">
          <Image
            src="https://placehold.co/250x156.png"
            alt="Location pin with shield or check-in confirmation"
            width={250}
            height={156}
            className="rounded-lg shadow-lg object-contain aspect-[16/10]"
            data-ai-hint="location security trust check-in"
          />
        </div>
      </div>

      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] bg-accent rounded-t-2xl md:rounded-t-3xl shadow-2xl flex flex-col">
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center text-accent-foreground">
          <div className="pt-2 sm:pt-4">
            <div className="flex justify-center items-center mb-2">
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
          </div>
          
          <Link href="/onboarding/step5" passHref className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <Button variant="ghost" size="icon" className="bg-accent-foreground/20 hover:bg-accent-foreground/30 text-accent-foreground rounded-full h-9 w-9 sm:h-10 sm:w-10">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <div className="pb-2 text-center">
            <div className="flex justify-center items-center space-x-1.5 mb-2">
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={true} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
            </div>
            <div className="flex items-center justify-between w-full max-w-xs mx-auto">
              <Link href="/onboarding/step3" passHref>
                <Button variant="link" size="sm" className="font-body text-accent-foreground/80 hover:text-accent-foreground rounded-lg group h-auto py-1 text-xs">
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
    