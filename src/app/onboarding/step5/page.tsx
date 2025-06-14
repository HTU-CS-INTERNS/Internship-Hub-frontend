
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-125' : 'bg-muted'}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-6">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-8">
            <Image 
              src="https://placehold.co/600x400.png"
              alt="Student confidently walking towards opportunity"
              width={300}
              height={200}
              className="rounded-xl shadow-xl object-contain aspect-[3/2]"
              data-ai-hint="student success future opportunity"
            />
          </div>
          
          <div className="space-y-3 mb-10">
            <div className="flex justify-center items-center space-x-3">
              <div className="p-3 bg-green-500 rounded-full shadow-lg">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-headline font-bold text-green-600 tracking-tight mt-4">
              Your Internship Success Awaits!
            </h1>
            <p className="text-md text-foreground/80 font-body leading-relaxed">
              InternHub is here to support you every step of the way. Get ready to make the most of your experience.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto text-center py-6">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={true} />
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link href="/onboarding/step4" passHref className="w-full sm:w-auto flex-1">
            <Button variant="outline" size="lg" className="font-body text-primary border-primary hover:bg-primary/10 rounded-xl w-full group">
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
            </Button>
          </Link>
          <Link href="/register" passHref className="w-full sm:w-auto flex-1">
            <Button size="lg" className="font-body text-lg px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl w-full group">
              Let&apos;s Start Your Journey! <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
            </Button>
          </Link>
        </div>
      </div>
      <footer className="flex-shrink-0 py-8 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
        <p>&copy; {new Date().getFullYear()} InternHub - Ho Technical University. Your Success, Our Priority.</p>
      </footer>
    </main>
  );
}
