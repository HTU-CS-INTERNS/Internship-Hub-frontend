
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import Image from 'next/image';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-125' : 'bg-muted'}`} />
);

export default function OnboardingStep1Page() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-6">
      <div className="w-full max-w-md text-center mt-auto">
        <div className="flex justify-center mb-8">
          <Image 
            src="https://placehold.co/600x400.png"
            alt="Student actively engaged in a modern work environment"
            width={300}
            height={200}
            className="rounded-xl shadow-xl object-contain aspect-[3/2]"
            data-ai-hint="student growth support professional modern"
          />
        </div>
        
        <div className="space-y-3 mb-10">
          <div className="flex justify-center items-center space-x-3">
            <div className="p-3 bg-primary rounded-full shadow-lg">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary tracking-tight mt-4">
            Unlock Your Internship Potential with InternHub!
          </h1>
          <p className="text-md text-foreground/80 font-body leading-relaxed">
            Your seamless journey to a successful internship experience starts here. Stay connected, organized, and accountable every step of the way.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md text-center mb-6 mt-auto">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <OnboardingStepDot isActive={true} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
          <OnboardingStepDot isActive={false} />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Link href="/onboarding/step5" passHref className="flex-1">
            <Button variant="ghost" size="lg" className="font-body text-muted-foreground hover:text-primary rounded-xl w-full">
              Skip
            </Button>
          </Link>
          <Link href="/onboarding/step2" passHref className="flex-1">
            <Button size="lg" className="font-body text-lg px-10 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl w-full group">
              Next <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
