'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive, onGradientBg }: { isActive: boolean; onGradientBg?: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? (onGradientBg ? 'bg-white scale-110' : 'bg-purple-700 scale-110') : (onGradientBg ? 'bg-white/50' : 'bg-purple-200')}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-8 sm:pt-10 md:pt-12 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-[250px] sm:max-w-xs">
          <Image
            src="https://placehold.co/270x175.png"
            alt="Student confidently walking towards opportunity"
            width={270}
            height={175}
            className="rounded-lg shadow-lg object-contain aspect-[54/35]"
            data-ai-hint="student success future opportunity"
          />
        </div>
      </div>
      
      <div className="relative w-full h-[55vh] sm:h-[50vh] md:h-[45vh] bg-purple-500 rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] flex flex-col">
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center text-white">
          <div className="sm:pt-2">
            <div className="flex justify-center items-center mb-2">
              <div className="p-2 bg-white/20 rounded-full shadow-md">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Your Internship Success Awaits!
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed mt-1.5 opacity-90 max-w-[95%] mx-auto">
              InternHub is here to support you. Get ready to make the most of your experience.
            </p>
          </div>
          
          <div className="pb-2 text-center mt-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={false} onGradientBg={true}/>
              <OnboardingStepDot isActive={true} onGradientBg={true}/>
            </div>
            <div className="flex items-center w-full max-w-xs mx-auto gap-x-2">
                <Link href="/onboarding/step4" passHref className="flex-1">
                    <Button variant="ghost" size="sm" className="font-body text-white/80 hover:text-white rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm group">
                    <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/register" passHref className="flex-1">
                    <Button className="font-body text-sm sm:text-base bg-white hover:bg-gray-100 text-purple-600 shadow-lg rounded-lg w-full group h-11 sm:h-12">
                    Let's Start <Rocket className="ml-2 h-4 sm:h-5 w-4 sm:w-5 transition-transform group-hover:rotate-6" />
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
