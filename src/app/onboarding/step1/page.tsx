'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap, CalendarCheck, FileText, MapPin, PlusCircle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

const InfoDetailCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string }) => (
    <div className="bg-white/80 dark:bg-gray-700/80 p-3 rounded-lg shadow backdrop-blur-sm">
        <div className="flex items-center">
            <Icon className="h-5 w-5 text-orange-600 mr-2"/>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-md font-bold text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    </div>
);

export default function OnboardingStep1Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-white p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
           <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
              <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
                <CarouselContent>
                    {/* Slide 1: Progress Overview */}
                    <CarouselItem>
                        <div className="p-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Progress at a Glance</h3>
                            <div className="space-y-2">
                                <InfoDetailCard icon={CalendarCheck} title="Days Completed" value="14 / 90"/>
                                <InfoDetailCard icon={FileText} title="Reports Submitted" value="12"/>
                            </div>
                        </div>
                    </CarouselItem>
                    {/* Slide 2: Quick Actions */}
                    <CarouselItem>
                         <div className="p-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Quick Actions</h3>
                             <div className="space-y-2">
                                <div className="bg-red-500 text-white p-3 rounded-lg shadow-md flex items-center justify-center">
                                    <MapPin className="h-5 w-5 mr-2"/>
                                    <span className="font-semibold text-sm">Check-in Now</span>
                                </div>
                                <div className="bg-white/80 dark:bg-gray-700/80 p-3 rounded-lg shadow flex items-center justify-center">
                                    <PlusCircle className="h-5 w-5 mr-2 text-orange-600"/>
                                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Submit New Report</span>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                     {/* Slide 3: Key Contacts */}
                    <CarouselItem>
                        <div className="p-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Key Contacts</h3>
                             <div className="space-y-2">
                                <InfoDetailCard icon={UserCheck} title="Your Supervisor" value="Mr. John Smith"/>
                                <InfoDetailCard icon={GraduationCap} title="Faculty Lecturer" value="Dr. Elara Vance"/>
                            </div>
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
              <div className="p-3 bg-orange-100 text-orange-600 rounded-full shadow-inner">
                 <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline font-bold tracking-tight text-foreground">
              Unlock Your Internship Potential!
            </CardTitle>
            <CardDescription className="text-base font-body leading-relaxed mt-2 text-muted-foreground">
              Your central dashboard for a seamless internship. Stay connected, organized, and accountable with InternHub.
            </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 bg-muted/50">
            <div className="flex justify-center items-center space-x-2">
              <OnboardingStepDot isActive={true} />
              <OnboardingStepDot isActive={false} />
              <OnboardingStepDot isActive={false} />
              <OnboardingStepDot isActive={false} />
              <OnboardingStepDot isActive={false} />
            </div>
            <div className="flex items-center w-full gap-x-3">
                <Link href="/login" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="font-body rounded-lg w-full h-11 text-sm">
                        Skip
                    </Button>
                </Link>
                <Link href="/onboarding/step2" passHref className="flex-1">
                    <Button variant="default" size="lg" className="font-body bg-orange-500 hover:bg-orange-600 text-white shadow-md rounded-lg w-full h-11 text-sm group">
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
