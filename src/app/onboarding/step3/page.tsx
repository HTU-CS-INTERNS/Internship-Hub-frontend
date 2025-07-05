'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Users, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

const MessageBubble = ({ from, text, align, color, bg }: { from: string, text: string, align: 'start' | 'end', color: string, bg: string}) => (
    <div className={`flex justify-${align}`}>
        <div className={`${bg} ${color} p-2 rounded-lg shadow-sm max-w-[80%]`}>
            <p className="text-xs font-bold">{from}</p>
            <p className="text-sm">{text}</p>
        </div>
    </div>
);

export default function OnboardingStep3Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-white p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
           <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
             <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
                <CarouselContent>
                    {/* Slide 1: Chat with Supervisor */}
                    <CarouselItem>
                        <div className="p-1 space-y-2">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-1">Message Supervisor</h3>
                            <MessageBubble from="Mr. Smith (Supervisor)" text="Great work on the latest task. Could you push it to the dev branch?" align="start" color="text-gray-800 dark:text-gray-200" bg="bg-white dark:bg-gray-700"/>
                            <MessageBubble from="You" text="Will do! Pushing it now." align="end" color="text-white" bg="bg-blue-500"/>
                        </div>
                    </CarouselItem>
                     {/* Slide 2: Contact Lecturer */}
                    <CarouselItem>
                        <div className="p-1 space-y-2">
                             <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-1">Contact Lecturer</h3>
                             <MessageBubble from="You" text="Dr. Vance, I have a question about the report format." align="end" color="text-white" bg="bg-blue-500"/>
                             <MessageBubble from="Dr. Vance" text="Of course, let me know how I can help." align="start" color="text-gray-800 dark:text-gray-200" bg="bg-white dark:bg-gray-700"/>
                        </div>
                    </CarouselItem>
                    {/* Slide 3: Get Feedback */}
                    <CarouselItem>
                        <div className="p-1 space-y-2">
                             <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-1">Get Feedback</h3>
                              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow">
                                <p className="text-xs font-bold text-gray-500">Feedback on "Weekly Report #2"</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 italic">"Good detail, but please elaborate more on the challenges faced."</p>
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
