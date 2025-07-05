
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarCheck, FileText, LayoutDashboard, ListChecks, StarIcon, Contact, PlusCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const OnboardingStepDot = ({ isActive, step }: { isActive: boolean; step: number }) => (
  <Link href={`/onboarding/step${step}`}>
    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
  </Link>
);


const DemoStatCard = ({ icon: Icon, title, value, detail, iconColor, bgColor }: { icon: React.ElementType, title: string, value: string, detail: string, iconColor: string, bgColor: string }) => (
    <div className={`p-3 rounded-lg shadow-sm ${bgColor}`}>
        <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <p className="text-lg font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
    </div>
);

const ContactCard = ({ name, role, avatarUrl }: { name: string, role: string, avatarUrl: string }) => (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold text-sm text-slate-800">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
        </div>
        <Button size="sm" variant="ghost" className="ml-auto h-8 text-xs"><Contact className="mr-1 h-3 w-3" />Message</Button>
    </div>
)

export default function OnboardingStep1Page() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      <div className="p-4 sm:p-6 text-center bg-white border-b border-slate-200">
        <div className="flex justify-center items-center mb-2">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <LayoutDashboard className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
          Your Central Dashboard
        </h1>
        <p className="text-sm mt-1 text-slate-500 max-w-lg mx-auto">
          This is your mission control. Get a complete overview of your progress, pending tasks, and key stats at a glance.
        </p>
      </div>
      
      <div className="flex-1 w-full p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          <Carousel className="w-full max-w-5xl h-full" opts={{ loop: true }}>
            <CarouselContent className="-ml-2 md:-ml-4 h-full">
              <CarouselItem className="pl-2 md:pl-4">
                  <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                      <div className="p-3 bg-slate-100/70 border-b border-slate-200">
                          <h2 className="text-base font-semibold text-slate-700">Student Dashboard</h2>
                      </div>
                      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                              <DemoStatCard icon={CalendarCheck} title="Days Completed" value="14 / 90" detail="15.5% progress" iconColor="text-indigo-600" bgColor="bg-indigo-50"/>
                              <DemoStatCard icon={FileText} title="Reports Submitted" value="12" detail="10 Approved" iconColor="text-green-600" bgColor="bg-green-50"/>
                              <DemoStatCard icon={StarIcon} title="Supervisor Rating" value="4.8" detail="Excellent" iconColor="text-yellow-600" bgColor="bg-yellow-50"/>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white">
                              <div className="p-2 sm:p-3 border-b border-slate-200">
                                  <h3 className="font-semibold text-sm text-slate-700">Today's Tasks</h3>
                              </div>
                              <div className="p-2 sm:p-3 text-xs sm:text-sm text-slate-600 divide-y divide-slate-100">
                                  <div className="flex items-center gap-2 py-1.5">
                                      <ListChecks className="h-4 w-4 text-slate-400"/>
                                      <p>Complete project documentation</p>
                                      <span className="ml-auto text-xs text-green-600 font-medium">Completed</span>
                                  </div>
                                  <div className="flex items-center gap-2 py-1.5">
                                      <ListChecks className="h-4 w-4 text-slate-400"/>
                                      <p>Submit daily report</p>
                                      <span className="ml-auto text-xs text-red-600 font-medium">Overdue</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </CarouselItem>
               <CarouselItem className="pl-2 md:pl-4">
                 <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="p-3 bg-slate-100/70 border-b border-slate-200">
                          <h2 className="text-base font-semibold text-slate-700">Your Support Team</h2>
                      </div>
                      <div className="p-3 sm:p-4 space-y-3">
                          <ContactCard name="Mr. John Smith" role="Industrial Supervisor" avatarUrl="https://placehold.co/100x100.png" />
                          <ContactCard name="Dr. Elara Vance" role="Faculty Lecturer" avatarUrl="https://placehold.co/100x100.png" />
                      </div>
                 </div>
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4">
                 <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="p-3 bg-slate-100/70 border-b border-slate-200">
                          <h2 className="text-base font-semibold text-slate-700">Quick Actions</h2>
                      </div>
                      <div className="p-3 sm:p-4 grid grid-cols-2 gap-3">
                          <Button variant="outline" className="h-20 flex-col gap-1 text-slate-700"><PlusCircle className="h-5 w-5"/><span>Add Task</span></Button>
                           <Button variant="outline" className="h-20 flex-col gap-1 text-slate-700"><FileText className="h-5 w-5"/><span>Submit Report</span></Button>
                      </div>
                 </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
      </div>

       <footer className="sticky bottom-0 w-full bg-white/70 backdrop-blur-sm p-4 border-t border-slate-200">
         <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => <OnboardingStepDot key={s} isActive={s === 1} step={s} />)}
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
         </div>
      </footer>
    </main>
  );
}
