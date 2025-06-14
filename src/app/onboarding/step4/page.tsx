
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image'; // Import NextImage

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-accent-foreground scale-110' : 'bg-accent-foreground/50'}`} />
);

export default function OnboardingStep4Page() {
  return (
    <main className="relative flex flex-col min-h-screen bg-white overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center pt-8 sm:pt-12 px-4 sm:px-6 md:px-8">
        <div 
          className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-white rounded-full flex items-center justify-center"
          style={{ filter: 'drop-shadow(0px 0px 35px rgba(217, 38, 38, 0.35))' }} // Glow with Accent HTU Red
        >
          <ShieldCheck className="h-20 w-20 sm:h-24 sm:h-24 md:h-28 md:w-28 text-accent" strokeWidth={1.5}/>
        </div>
      </div>

      <div className="relative w-full bg-accent rounded-t-[3rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.07)] text-accent-foreground flex flex-col"
        style={{ minHeight: '55vh' }}
      >
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-between h-full p-6 sm:p-8 text-center">
          <div className="sm:pt-2">
            <div className="flex justify-center items-center mb-2">
              <div className="p-1.5 bg-accent-foreground/20 rounded-full shadow-md">
                <Image 
                    src="https://firebase.so/docs/studio/guides/images/internship-track-logo.png" 
                    alt="HTU Logo" 
                    width={20} 
                    height={20} 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                 />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">
              Build Your Verifiable Professional Record
            </h1>
            <p className="text-sm sm:text-base font-body leading-relaxed mt-1.5 opacity-90 max-w-[95%] mx-auto">
              Securely check-in at your internship site and verify your presence to build a strong, trusted record of your dedication. Your privacy is paramount.
            </p>
          </div>
          
          <div className="pb-2 text-center mt-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={true}/>
              <OnboardingStepDot isActive={false}/>
            </div>
            <div className="flex items-center w-full max-w-xs mx-auto gap-x-2">
                <Link href="/onboarding/step3" passHref className="flex-1">
                    <Button variant="link" size="sm" className="font-body text-accent-foreground/80 hover:text-accent-foreground rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm group">
                        <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/register" passHref className="flex-1">
                    <Button variant="link" size="sm" className="font-body text-accent-foreground/80 hover:text-accent-foreground rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm">
                        Skip
                    </Button>
                </Link>
                <Link href="/onboarding/step5" passHref className="flex-1">
                    <Button variant="default" size="sm" className="font-body bg-accent-foreground hover:bg-accent-foreground/90 text-accent shadow-md rounded-lg w-full h-10 sm:h-11 text-xs sm:text-sm group">
                    Next <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                </Link>
            </div>
            <p className="text-xs text-accent-foreground/70 mt-4">&copy; {new Date().getFullYear()} InternHub - HTU</p>
          </div>
        </div>
      </div>
    </main>
  );
}
    