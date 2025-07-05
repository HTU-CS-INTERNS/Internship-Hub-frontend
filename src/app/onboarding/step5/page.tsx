'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, User, Briefcase, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 mr-2 text-purple-600"/>
        <span className="font-semibold text-gray-600 dark:text-gray-400">{label}:</span>
        <span className="ml-1">{value}</span>
    </div>
);

export default function OnboardingStep5Page() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-white p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="p-0">
           <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl overflow-hidden relative flex flex-col items-center justify-center">
             <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
                <CarouselContent>
                    {/* Slide 1: Profile */}
                    <CarouselItem>
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                            <div className="flex items-center mb-3">
                                <Avatar className="h-12 w-12 border-2 border-purple-300">
                                    <AvatarFallback className="bg-purple-200 text-purple-700">AS</AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                    <p className="font-bold text-gray-800 dark:text-gray-200">Alex Smith</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">alex.smith@htu.edu.gh</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <DetailRow icon={User} label="Status" value="Internship Approved"/>
                                <DetailRow icon={Briefcase} label="Company" value="Innovatech"/>
                            </div>
                        </div>
                    </CarouselItem>
                    {/* Slide 2: Evaluation */}
                    <CarouselItem>
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
                             <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-2">Final Evaluation</h3>
                             <div className="space-y-1">
                                <DetailRow icon={Star} label="Tech Skills" value="4/5"/>
                                <DetailRow icon={Star} label="Communication" value="5/5"/>
                                <DetailRow icon={Star} label="Professionalism" value="5/5"/>
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
