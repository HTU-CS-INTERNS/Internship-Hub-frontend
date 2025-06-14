'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-white scale-110' : 'bg-primary scale-110') : (onGradientBg ? 'bg-white/50' : 'bg-muted')}`} />
);

export default function OnboardingStep4Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-8 sm:pt-12">
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

      <div className="relative w-full h-[60vh] sm:h-[55vh] md:h-[50vh] z-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wavyGradientStep4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#AD1457"/>
              <stop offset="50%" stop-color="#D81B60"/>
              <stop offset="100%" stop-color="#880E4F"/>
            </linearGradient>
          </defs>
          <path
            d="M0 80 C 180 10, 360 150, 540 80 C 720 10, 900 150, 1080 80 C 1260 10, 1440 150, 1440 80 V 200 H 0 V 80 Z"
            fill="url(#wavyGradientStep4)"
          />
        </svg>

        <div className="relative z-10 p-4 text-white w-full max-w-md mx-auto flex flex-col justify-between h-full">
          <div className="text-center pt-6 sm:pt-8">
            <div className="flex justify-center items-center mb-2">
              <div className="p-1.5 bg-white/20 rounded-full shadow-md">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <h1 className="text-lg font-headline font-bold tracking-tight">
              Build Your Verifiable Professional Record
            </h1>
            <p className="text-xs font-body leading-normal mt-1 opacity-90 max-w-[90%] mx-auto">
              Securely check-in at your internship site and verify your presence to build a strong, trusted record of your dedication. Your privacy is paramount.
            </p>
          </div>
          
          <Link href="/onboarding/step5" passHref className="absolute top-1/2 right-4 sm:right-6 md:right-8 transform -translate-y-1/2 mt-2">
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-9 w-9 sm:h-10 sm:w-10">
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
                <Button variant="link" size="sm" className="font-body text-white/80 hover:text-white rounded-lg group h-auto py-1 text-xs">
                  <ArrowLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="link" size="sm" className="font-body text-white/80 hover:text-white rounded-lg h-auto py-1 text-xs">
                  Skip
                </Button>
              </Link>
            </div>
            <p className="text-xs text-white/70 mt-2">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
