'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

export default function OnboardingStep3Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-white p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
           <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
              <div className="w-full max-w-sm space-y-2 transform scale-75">
                  <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm max-w-[70%]">
                          <p className="text-xs font-bold text-blue-500">Dr. Vance</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200">Great job on the last report. Keep up the good work!</p>
                      </div>
                  </div>
                  <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-2 rounded-lg shadow-sm max-w-[70%]">
                          <p className="text-sm">Thank you, Dr. Vance! I appreciate the feedback.</p>
                      </div>
                  </div>
              </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full shadow-inner">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline font-bold tracking-tight text-foreground">
              Stay Connected, Get Guided
            </CardTitle>
            <CardDescription className="text-base font-body leading-relaxed mt-2 text-muted-foreground">
              Communicate directly with your company supervisor and university lecturer. Receive timely feedback and get the support you need with InternHub.
            </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 bg-muted/50">
            <div className="flex justify-center items-center space-x-2">
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={true}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
            </div>
            <div className="flex items-center w-full gap-x-3">
                <Link href="/onboarding/step2" passHref className="flex-1">
                     <Button variant="outline" size="lg" className="font-body rounded-lg w-full h-11 text-sm group">
                        <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/onboarding/step4" passHref className="flex-1">
                    <Button variant="default" size="lg" className="font-body bg-green-600 hover:bg-green-700 text-white shadow-md rounded-lg w-full h-11 text-sm group">
                    Next <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                </Link>
            </div>
        </CardFooter>
      </Card>
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/80">
        <p>&copy; {new Date().getFullYear()} InternHub - HTU</p>
      </footer>
    </main>
  );
}
