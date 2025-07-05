'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

const ReportItemCard = ({ title, date, status, statusColor, statusBg }: { title: string, date: string, status: string, statusColor: string, statusBg: string }) => (
    <div className="bg-white/80 dark:bg-gray-700/80 p-3 rounded-lg shadow-sm flex justify-between items-center backdrop-blur-sm">
        <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
        </div>
        <span className={`text-xs font-semibold ${statusColor} ${statusBg} px-2 py-0.5 rounded-full`}>{status}</span>
    </div>
);

export default function OnboardingStep2Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-white to-white p-4 sm:p-6 md:p-8">
       <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
           <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
              <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
                <CarouselContent>
                    {/* Slide 1: Daily Tasks */}
                    <CarouselItem>
                        <div className="p-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Log Daily Tasks</h3>
                            <div className="bg-white/80 dark:bg-gray-700/80 p-3 rounded-lg shadow-sm backdrop-blur-sm">
                                <div className="flex items-start">
                                    <Clock className="h-4 w-4 mr-2 mt-0.5 text-yellow-600"/>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Develop auth module</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Outcomes: JWT flow working.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                    {/* Slide 2: Weekly Reports */}
                    <CarouselItem>
                         <div className="p-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Submit Reports</h3>
                            <ReportItemCard title="Weekly Summary #2" date="July 22, 2024" status="Approved" statusColor="text-green-700" statusBg="bg-green-100" />
                        </div>
                    </CarouselItem>
                    {/* Slide 3: Track Status */}
                    <CarouselItem>
                        <div className="p-1">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-3">Track Approvals</h3>
                            <div className="space-y-2">
                                <ReportItemCard title="Mid-term Prep" date="July 29, 2024" status="Submitted" statusColor="text-blue-700" statusBg="bg-blue-100" />
                                <ReportItemCard title="Bug-fixing Sprint" date="July 24, 2024" status="Rejected" statusColor="text-red-700" statusBg="bg-red-100" />
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
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full shadow-inner">
                 <ClipboardList className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline font-bold tracking-tight text-foreground">
              Effortlessly Track Your Progress
            </CardTitle>
            <CardDescription className="text-base font-body leading-relaxed mt-2 text-muted-foreground">
               Log daily tasks, capture learning objectives, and submit detailed reports. Showcase your work with InternHub.
            </CardDescription>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-6 bg-muted/50">
            <div className="flex justify-center items-center space-x-2">
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={true}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
              <OnboardingStepDot isActive={false}/>
            </div>
            <div className="flex items-center w-full gap-x-3">
                <Link href="/onboarding/step1" passHref className="flex-1">
                    <Button variant="outline" size="lg" className="font-body rounded-lg w-full h-11 text-sm group">
                        <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back
                    </Button>
                </Link>
                <Link href="/onboarding/step3" passHref className="flex-1">
                    <Button variant="default" size="lg" className="font-body bg-yellow-500 hover:bg-yellow-600 text-white shadow-md rounded-lg w-full h-11 text-sm group">
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
