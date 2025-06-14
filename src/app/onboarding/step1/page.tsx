
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-primary-foreground scale-110' : 'bg-primary scale-110') : (onGradientBg ? 'bg-primary-foreground/50' : 'bg-muted')}`} />
);

export default function OnboardingStep1Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Top content area for the illustration */}
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4 pt-8 sm:pt-12">
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

      {/* Bottom colored rectangle section */}
      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] bg-primary rounded-t-2xl md:rounded-t-3xl shadow-2xl flex flex-col">
        {/* Content layered on top of the rectangle */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center text-primary-foreground">
          {/* Top part: Icon, Title, Subtitle */}
          <div className="pt-2 sm:pt-4">
            <div className="flex justify-center items-center mb-2">
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
          </div>
          
          {/* Navigation Arrow Button - positioned relative to this inner content div */}
          <Link href="/onboarding/step2" passHref className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <Button variant="ghost" size="icon" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground rounded-full h-9 w-9 sm:h-10 sm:w-10">
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
                <Button variant="link" size="sm" className="font-body text-primary-foreground/80 hover:text-primary-foreground rounded-lg h-auto py-1 text-xs">
                Skip to Registration
                </Button>
            </Link>
            <p className="text-xs text-primary-foreground/70 mt-2">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
    