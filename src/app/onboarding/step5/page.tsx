
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Image from 'next/image';
import TopWave from '@/components/shared/top-wave';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-muted'}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-background overflow-x-clip p-4">
      <TopWave />
      <div className="flex-grow flex flex-col items-center justify-center text-center z-0 pt-12 sm:pt-16">
        <div className="w-full max-w-xs">
          <div className="flex justify-center mb-4 sm:mb-5">
            <Image
              src="https://placehold.co/250x156.png"
              alt="Student confidently walking towards opportunity"
              width={250}
              height={156}
              className="rounded-lg shadow-lg object-contain aspect-[16/10]"
              data-ai-hint="student success future opportunity"
            />
          </div>

          <div className="space-y-1 sm:space-y-1.5 mb-4 sm:mb-5">
            <div className="flex justify-center items-center space-x-2">
              <div className="p-2 bg-green-500 rounded-full shadow-md">
                <Rocket className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-headline font-bold text-green-600 tracking-tight mt-1">
              Your Internship Success Awaits!
            </h1>
            <p className="text-xs sm:text-sm text-foreground/80 font-body leading-normal">
              InternHub is here to support you. Get ready to make the most of your experience.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto text-center py-4 z-0">
        <div className="flex justify-center items-center space-x-1.5 mb-4 sm:mb-5">
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={true} />
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Link href="/onboarding/step4" passHref className="w-full sm:w-auto flex-1">
            <Button variant="ghost" className="font-body text-primary hover:bg-primary/10 rounded-lg w-full h-10 group py-2.5">
              <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
            </Button>
          </Link>
          <Link href="/register" passHref className="w-full sm:w-auto flex-1">
            <Button className="font-body text-sm py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg w-full group h-10">
              Let&apos;s Start <Rocket className="ml-1.5 h-4 w-4 transition-transform group-hover:rotate-6" />
            </Button>
          </Link>
        </div>
      </div>
      <footer className="flex-shrink-0 py-4 text-center text-xs text-muted-foreground z-0">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
