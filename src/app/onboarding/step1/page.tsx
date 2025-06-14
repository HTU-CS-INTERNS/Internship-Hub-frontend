
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-white scale-110' : 'bg-orange-700 scale-110') : (onGradientBg ? 'bg-white/50' : 'bg-orange-200')}`} />
);

export default function OnboardingStep1Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Top content area for the illustration */}
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-8 sm:pt-12 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-[260px] sm:max-w-xs">
          <Image
            src="https://placehold.co/280x180.png"
            alt="Student actively engaged in a modern work environment"
            width={280}
            height={180}
            className="rounded-lg shadow-lg object-contain aspect-[14/9]"
            data-ai-hint="student growth support professional modern"
          />
        </div>
      </div>

      {/* Bottom colored rectangle section */}
      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] bg-orange-500 rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] flex flex-col">
        {/* Content layered on top of the rectangle */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center text-white">
          
          {/* Top part: Icon, Title, Subtitle */}
          <div className="sm:pt-2">
            <div className="flex justify-center items-center mb-2">
              <div className="p-2 bg-white/20 rounded-full shadow-md">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Unlock Your Internship Potential!
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed mt-1.5 opacity-90 max-w-[95%] mx-auto">
              Your seamless journey to a successful internship experience starts here. Stay connected, organized, and accountable.
            </p>
          </div>
          
          {/* Bottom part: Dots, Buttons, Copyright */}
          <div className="pb-2 text-center mt-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <OnboardingStepDot isActive={true} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
              <OnboardingStepDot isActive={false} onGradientBg={true} />
            </div>
            <div className="flex items-center w-full max-w-xs mx-auto gap-x-2">
                <Link href="/register" passHref className="flex-1">
                    <Button variant="link" size="sm" className="font-body text-white/80 hover:text-white rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm">
                        Skip
                    </Button>
                </Link>
                <Link href="/onboarding/step2" passHref className="flex-1">
                    <Button variant="default" size="sm" className="font-body bg-white hover:bg-gray-100 text-orange-600 shadow-md rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm group">
                    Next <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                </Link>
            </div>
            <p className="text-xs text-white/70 mt-4">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
