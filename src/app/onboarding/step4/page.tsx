
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-125' : 'bg-muted'}`} />
);

export default function OnboardingStep4Page() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-6">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-8">
            <Image 
              src="https://placehold.co/600x400.png"
              alt="Location pin with shield or check-in confirmation"
              width={300}
              height={200}
              className="rounded-xl shadow-xl object-contain aspect-[3/2]"
              data-ai-hint="location security trust check-in"
            />
          </div>
          
          <div className="space-y-3 mb-10">
            <div className="flex justify-center items-center space-x-3">
              <div className="p-3 bg-primary rounded-full shadow-lg">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-headline font-bold text-primary tracking-tight mt-4">
              Build Your Verifiable Professional Record
            </h1>
            <p className="text-md text-foreground/80 font-body leading-relaxed">
              Securely check-in at your internship site and verify your presence to build a strong, trusted record of your dedication. Your privacy is paramount.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md text-center py-6">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={true} />
          <OnboardingStepDot isActive={false} />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Link href="/onboarding/step3" passHref className="flex-1">
            <Button variant="outline" size="lg" className="font-body text-primary border-primary hover:bg-primary/10 rounded-xl w-full group">
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
            </Button>
          </Link>
           <Link href="/register" passHref className="flex-1 sm:hidden"> {/* Skip for mobile, hidden on larger */}
            <Button variant="ghost" size="lg" className="font-body text-muted-foreground hover:text-primary rounded-xl w-full">
              Skip
            </Button>
          </Link>
          <Link href="/onboarding/step5" passHref className="flex-1">
            <Button size="lg" className="font-body text-lg px-10 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl w-full group">
              Next <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
         <div className="hidden sm:flex justify-center mt-4"> {/* Skip for desktop */}
            <Link href="/register" passHref>
                <Button variant="ghost" size="sm" className="font-body text-muted-foreground hover:text-primary rounded-xl">
                Skip
                </Button>
            </Link>
        </div>
      </div>
      <footer className="flex-shrink-0 py-8 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500 delay-700">
        <p>&copy; {new Date().getFullYear()} InternHub. Your Success, Our Priority.</p>
      </footer>
    </main>
  );
}
