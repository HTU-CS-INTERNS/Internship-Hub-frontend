
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-primary-foreground scale-110' : 'bg-primary scale-110') : (onGradientBg ? 'bg-primary-foreground/50' : 'bg-muted')}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4 pt-8 sm:pt-12">
        <div className="w-full max-w-xs">
          <Image
            src="https://placehold.co/250x156.png"
            alt="Student confidently walking towards opportunity"
            width={250}
            height={156}
            className="rounded-lg shadow-lg object-contain aspect-[16/10]"
            data-ai-hint="student success future opportunity"
          />
        </div>
      </div>
      
      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] bg-primary rounded-t-2xl md:rounded-t-3xl shadow-2xl flex flex-col">
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center text-primary-foreground">
          <div className="pt-2 sm:pt-4">
            <div className="flex justify-center items-center mb-2">
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
          
          <div className="pb-2 text-center">
            <div className="flex justify-center items-center space-x-1.5 mb-3">
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={true} onGradientBg={true}/>
            </div>
            <div className="flex flex-col space-y-2 max-w-xs mx-auto">
                <Link href="/register" passHref className="w-full">
                    <Button className="font-body text-sm bg-primary-foreground hover:bg-primary-foreground/90 text-primary shadow-md rounded-lg w-full group h-10">
                    Let&apos;s Start <Rocket className="ml-1.5 h-4 w-4 transition-transform group-hover:rotate-6" />
                    </Button>
                </Link>
                <Link href="/onboarding/step4" passHref className="w-full">
                    <Button variant="link" size="sm" className="font-body text-primary-foreground/80 hover:text-primary-foreground rounded-lg group h-auto py-1 text-xs w-full">
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
    