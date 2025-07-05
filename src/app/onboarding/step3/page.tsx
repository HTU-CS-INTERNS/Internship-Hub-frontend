
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Users, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const OnboardingStepDot = ({ isActive, step }: { isActive: boolean; step: number }) => (
    <Link href={`/onboarding/step${step}`}>
        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
    </Link>
);


const MessageBubble = ({ from, text, align, avatar }: { from: string, text: string, align: 'start' | 'end', avatar: React.ReactNode}) => (
    <div className={`flex items-end gap-2 ${align === 'end' ? 'flex-row-reverse' : ''}`}>
        {avatar}
        <div className={`p-2 rounded-lg shadow-sm max-w-[70%] text-xs sm:text-sm ${align === 'end' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
            <p className="font-bold mb-0.5">{from}</p>
            <p>{text}</p>
        </div>
    </div>
);

const ContactItem = ({ name, role, avatarUrl, active }: { name: string, role: string, avatarUrl: string, active?: boolean }) => (
    <div className={`flex items-center p-2 rounded-md ${active ? 'bg-blue-100' : ''}`}>
        <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="text-xs font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
        </div>
    </div>
)

export default function OnboardingStep3Page() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      <div className="p-4 sm:p-6 text-center bg-white border-b border-slate-200">
        <div className="flex justify-center items-center mb-2">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
          Stay Connected, Get Guided
        </h1>
        <p className="text-sm mt-1 text-slate-500 max-w-lg mx-auto">
          Communicate directly with your company supervisor and university lecturer. Receive timely feedback and get the support you need.
        </p>
      </div>

      <div className="flex-1 w-full p-2 sm:p-4 overflow-hidden flex items-center justify-center">
        <Carousel className="w-full max-w-5xl h-full" opts={{ loop: true }}>
            <CarouselContent className="-ml-2 md:-ml-4 h-full">
                <CarouselItem className="pl-2 md:pl-4">
                  <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex">
                      <div className="w-1/3 border-r border-slate-200 bg-slate-50 p-2 space-y-1">
                         <h3 className="text-xs font-semibold text-slate-500 px-2 mb-1">Contacts</h3>
                         <ContactItem name="Mr. John Smith" role="Supervisor" avatarUrl="https://placehold.co/100x100.png" active />
                         <ContactItem name="Dr. Elara Vance" role="Lecturer" avatarUrl="https://placehold.co/100x100.png" />
                      </div>
                      <div className="w-2/3 flex flex-col">
                          <div className="p-2 border-b border-slate-200 flex items-center">
                              <p className="font-semibold text-sm text-slate-700">Mr. John Smith</p>
                          </div>
                          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                            <MessageBubble from="Mr. Smith" text="Great work on the latest task. Could you push it to the dev branch?" align="start" avatar={<Avatar className="h-6 w-6"><AvatarImage src="https://placehold.co/100x100.png" /></Avatar>} />
                            <MessageBubble from="You" text="Will do! Pushing it now." align="end" avatar={<Avatar className="h-6 w-6"><AvatarFallback>U</AvatarFallback></Avatar>} />
                          </div>
                           <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                               <input type="text" placeholder="Type a message..." className="flex-1 bg-white border border-slate-300 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                               <Button size="sm" className="h-7 rounded-full bg-blue-500 hover:bg-blue-600"><Send className="h-3 w-3"/></Button>
                           </div>
                      </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="pl-2 md:pl-4">
                     <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden p-4 flex flex-col justify-center text-center">
                         <h3 className="font-semibold text-slate-700 text-lg">Receive Timely Feedback</h3>
                         <p className="text-xs text-slate-500 mt-1 mb-4">Your lecturers and supervisors can comment directly on your reports and tasks.</p>
                         <div className="p-3 bg-slate-100 rounded-lg text-left text-xs border border-slate-200">
                             <p className="font-bold text-slate-600">Supervisor Feedback on "Weekly Report #4"</p>
                             <p className="mt-1 text-slate-500 italic">"Excellent summary, Alice. The section on challenges was particularly insightful. Keep up the great work."</p>
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
              {[1, 2, 3, 4, 5].map((s) => <OnboardingStepDot key={s} isActive={s === 3} step={s} />)}
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
         </div>
      </footer>
    </main>
  );
}
