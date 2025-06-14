'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-white scale-110' : 'bg-primary scale-110') : (onGradientBg ? 'bg-white/50' : 'bg-muted')}`} />
);

export default function OnboardingStep1Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-hidden p-4">
      {/* Top content area for the illustration */}
      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-8 sm:pt-12">
        <div className="w-full max-w-xs">
          <Image
            src="https://placehold.co/280x175.png"
            alt="Student actively engaged in a modern work environment"
            width={280}
            height={175}
            className="rounded-lg shadow-lg object-contain aspect-[16/10]"
            data-ai-hint="student growth support professional modern"
          />
        </div>
      </div>

      {/* Bottom colored shape and its content */}
      <div className="relative w-full h-[60vh] sm:h-[55vh] md:h-[50vh] z-0">
        {/* The SVG shape itself */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wavyGradientStep1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#1B5E20"/> 
              <stop offset="50%" stop-color="#00796B"/> 
              <stop offset="100%" stop-color="#004D40"/> 
            </linearGradient>
          </defs>
          <path
            d="M0 80 C 180 150, 360 10, 540 80 C 720 150, 900 10, 1080 80 C 1260 150, 1440 10, 1440 80 V 200 H 0 V 80 Z"
            fill="url(#wavyGradientStep1)"
          />
        </svg>

        {/* Content layered on top of the SVG shape */}
        <div className="relative z-10 p-4 text-white w-full max-w-md mx-auto flex flex-col justify-between h-full">
          {/* Top part: Icon, Title, Subtitle */}
          <div className="text-center pt-6 sm:pt-8">
            <div className="flex justify-center items-center mb-2">
              <div className="p-1.5 bg-white/20 rounded-full shadow-md">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
            <h1 className="text-lg font-headline font-bold tracking-tight">
              Unlock Your Internship Potential!
            </h1>
            <p className="text-xs font-body leading-normal mt-1 opacity-90 max-w-[90%] mx-auto">
              Your seamless journey to a successful internship experience starts here. Stay connected, organized, and accountable.
            </p>
          </div>
          
          {/* Navigation Arrow Button */}
          <Link href="/onboarding/step2" passHref className="absolute top-1/2 right-4 sm:right-6 md:right-8 transform -translate-y-1/2 mt-2">
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-9 w-9 sm:h-10 sm:w-10">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          {/* Bottom part: Dots, Skip/Back, Copyright */}
          <div className="pb-2 text-center">
            <div className="flex justify-center items-center space-x-1.5 mb-2">
              <OnboardingStepDot isActive={true} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
            </div>
            <Link href="/register" passHref>
                <Button variant="link" size="sm" className="font-body text-white/80 hover:text-white rounded-lg h-auto py-1 text-xs">
                Skip to Registration
                </Button>
            </Link>
            <p className="text-xs text-white/70 mt-2">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
