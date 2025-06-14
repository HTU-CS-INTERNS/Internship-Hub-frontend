'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-white scale-110' : 'bg-primary scale-110') : (onGradientBg ? 'bg-white/50' : 'bg-muted')}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-8 sm:pt-12">
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
      
      <div className="relative w-full h-[60vh] sm:h-[55vh] md:h-[50vh] z-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wavyGradientStep5" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#1B5E20"/> 
              <stop offset="50%" stop-color="#00796B"/> 
              <stop offset="100%" stop-color="#004D40"/> 
            </linearGradient>
          </defs>
          <path
            d="M0 80 C 180 150, 360 10, 540 80 C 720 150, 900 10, 1080 80 C 1260 150, 1440 10, 1440 80 V 200 H 0 V 80 Z"
            fill="url(#wavyGradientStep5)"
          />
        </svg>

        <div className="relative z-10 p-4 text-white w-full max-w-md mx-auto flex flex-col justify-between h-full">
          <div className="text-center pt-6 sm:pt-8">
            <div className="flex justify-center items-center mb-2">
              <div className="p-1.5 bg-white/20 rounded-full shadow-md">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
                    <Button className="font-body text-sm bg-white hover:bg-white/90 text-green-700 shadow-md rounded-lg w-full group h-10">
                    Let&apos;s Start <Rocket className="ml-1.5 h-4 w-4 transition-transform group-hover:rotate-6" />
                    </Button>
                </Link>
                <Link href="/onboarding/step4" passHref className="w-full">
                    <Button variant="link" size="sm" className="font-body text-white/80 hover:text-white rounded-lg group h-auto py-1 text-xs w-full">
                    <ArrowLeft className="mr-1 h-3 w-3 transition-transform group-hover:-translate-x-0.5" /> Back
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
