'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-white p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
           <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
              <div className="w-full max-w-xs bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 transform scale-75">
                  <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-700 text-lg">AS</div>
                      <div className="ml-3">
                          <p className="font-bold text-gray-800 dark:text-gray-200">Alex Smith</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">alex.smith@htu.edu.gh</p>
                      </div>
                  </div>
                  <div className="mt-3 text-xs space-y-1">
                      <p><span className="font-semibold text-gray-600 dark:text-gray-300">Company:</span> Innovatech</p>
                      <p><span className="font-semibold text-gray-600 dark:text-gray-300">Status:</span> Internship Approved</p>
                  </div>
              </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full shadow-inner">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline font-bold tracking-tight text-foreground">
              Your Internship Success Awaits!
            </CardTitle>
            <CardDescription className="text-base font-body leading-relaxed mt-2 text-muted-foreground">
              InternHub is here to support you. Get ready to make the most of your experience.
            </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 bg-muted/50">
            <div className="flex justify-center items-center space-x-2">
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={true}/>
            </div>
            <div className="flex items-center w-full gap-x-3">
                <Link href="/onboarding/step4" passHref className="flex-1">
                     <Button variant="outline" size="lg" className="font-body rounded-lg w-full h-11 text-sm group">
                        <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/login" passHref className="flex-1">
                    <Button className="font-body bg-purple-600 hover:bg-purple-700 text-white shadow-lg rounded-lg w-full group h-12 text-base">
                    Let's Start <Star className="ml-2 h-5 w-5 transition-transform group-hover:rotate-6" />
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
