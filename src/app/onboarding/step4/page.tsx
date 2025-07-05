'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck, MapPin, Camera, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

const CheckinCard = ({ icon: Icon, title, description, iconColor }: { icon: React.ElementType, title: string, description: string, iconColor: string}) => (
    <div className="bg-white/80 dark:bg-gray-700/80 p-3 rounded-lg shadow-sm backdrop-blur-sm flex items-center">
        <Icon className={`h-6 w-6 mr-3 ${iconColor}`}/>
        <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);


export default function OnboardingStep4Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-white p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
            <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
              <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
                <CarouselContent>
                    {/* Slide 1: GPS Check-in */}
                    <CarouselItem>
                        <div className="p-1 space-y-2">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">GPS Verification</h3>
                            <CheckinCard icon={MapPin} title="Geofence Check-in" description="Verify you're at your workplace instantly." iconColor="text-green-600"/>
                        </div>
                    </CarouselItem>
                    {/* Slide 2: Manual Check-in */}
                    <CarouselItem>
                        <div className="p-1 space-y-2">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Manual Options</h3>
                            <CheckinCard icon={Info} title="Provide Reason" description="Working remotely or GPS issues? Just let us know." iconColor="text-blue-600"/>
                        </div>
                    </CarouselItem>
                     {/* Slide 3: Secure Photo */}
                    <CarouselItem>
                        <div className="p-1 space-y-2">
                             <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Photo Capture</h3>
                            <CheckinCard icon={Camera} title="Secure Photo" description="Optionally add a photo of your setup for verification." iconColor="text-purple-600"/>
                        </div>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-[-1rem] bg-white/50 hover:bg-white"/>
                <CarouselNext className="right-[-1rem] bg-white/50 hover:bg-white"/>
              </Carousel>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="p-3 bg-sky-100 text-sky-600 rounded-full shadow-inner">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline font-bold tracking-tight text-foreground">
              Build Your Verifiable Professional Record
            </CardTitle>
            <CardDescription className="text-base font-body leading-relaxed mt-2 text-muted-foreground">
              Securely check-in at your internship site with InternHub and verify your presence to build a strong, trusted record of your dedication. Your privacy is paramount.
            </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 bg-muted/50">
            <div className="flex justify-center items-center space-x-2">
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={true}/>
              <OnboardingStepDot isActive={false}/>
            </div>
            <div className="flex items-center w-full gap-x-3">
                <Link href="/onboarding/step3" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="font-body rounded-lg w-full h-11 text-sm group">
                        <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/onboarding/step5" passHref className="flex-1">
                    <Button variant="default" size="lg" className="font-body bg-sky-500 hover:bg-sky-600 text-white shadow-md rounded-lg w-full h-11 text-sm group">
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
