
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-white scale-110' : 'bg-green-700 scale-110') : (onGradientBg ? 'bg-white/50' : 'bg-green-200')}`} />
);

export default function OnboardingStep3Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden p-4">
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-8 sm:pt-10 md:pt-12">
        <div className="w-full max-w-[250px] sm:max-w-xs">
          <Image
            src="https://placehold.co/270x170.png"
            alt="Chat bubbles between student, supervisor, and lecturer avatars"
            width={270}
            height={170}
            className="rounded-lg shadow-lg object-contain aspect-[27/17]"
            data-ai-hint="communication chat feedback avatars"
          />
        </div>
      </div>

      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[48vh] bg-green-500 rounded-t-[3rem] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1),_0_-20px_15px_-10px_rgba(0,0,0,0.08)] flex flex-col">
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center text-white">
          <div className="pt-3 sm:pt-4">
            <div className="flex justify-center items-center mb-3">
              <div className="p-2 bg-white/20 rounded-full shadow-md">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Stay Connected, Get Guided
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed mt-2 opacity-90 max-w-[95%] mx-auto">
              Communicate directly with your company supervisor and university lecturer. Receive timely feedback and get the support you need.
            </p>
          </div>
          
          <Link href="/onboarding/step4" passHref className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12">
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>

          <div className="pb-2 text-center">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={true} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
            </div>
            <div className="flex items-center justify-between w-full max-w-xs mx-auto">
              <Link href="/onboarding/step2" passHref>
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
    