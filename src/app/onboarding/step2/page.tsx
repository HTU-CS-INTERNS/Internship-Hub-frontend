'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ClipboardList } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-yellow-800 scale-110' : 'bg-yellow-800/50'}`} />
);

export default function OnboardingStep2Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-8 sm:pt-12 px-4 sm:px-6 md:px-8">
        <div 
            className="relative w-full max-w-sm sm:max-w-md p-2 bg-white rounded-2xl shadow-lg"
            style={{ filter: 'drop-shadow(0px 10px 30px rgba(250,204,21,0.35))' }} // Yellow glow
        >
          <Image 
            src="https://placehold.co/600x400.png"
            alt="App task list preview"
            width={600}
            height={400}
            className="rounded-lg object-cover"
            data-ai-hint="task list"
          />
        </div>
      </div>

      <div className="relative w-full bg-yellow-400 rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] text-yellow-900 flex flex-col mt-8"
        style={{ minHeight: '50vh' }}
      >
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between flex-grow p-6 sm:p-8 text-center">
          <div className="sm:pt-2">
            <div className="flex justify-center items-center mb-2">
              <div className="p-1.5 bg-yellow-900/20 rounded-full shadow-md">
                 <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-900" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Effortlessly Track Your Progress
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed mt-1.5 opacity-90 max-w-[95%] mx-auto">
              Log daily tasks, capture learning objectives, and submit detailed reports. Showcase your work with InternHub.
            </p>
          </div>
          
          <div className="pb-2 text-center mt-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={true}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
            </div>
            <div className="flex items-center w-full max-w-xs mx-auto gap-x-2">
                <Link href="/onboarding/step1" passHref className="flex-1">
                    <Button variant="link" size="sm" className="font-body text-yellow-800/80 hover:text-yellow-900 rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm group">
                        <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/login" passHref className="flex-1">
                    <Button variant="link" size="sm" className="font-body text-yellow-800/80 hover:text-yellow-900 rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm">
                        Skip
                    </Button>
                </Link>
                <Link href="/onboarding/step3" passHref className="flex-1">
                    <Button variant="default" size="sm" className="font-body bg-yellow-900 hover:bg-yellow-900/90 text-yellow-100 shadow-md rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm group">
                    Next <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                </Link>
            </div>
            <p className="text-xs text-yellow-800/70 mt-4">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
