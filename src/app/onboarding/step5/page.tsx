'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, User, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

const DetailRow = ({ icon: Icon, label, value, valueClass }: { icon: React.ElementType, label: string, value: string, valueClass?: string }) => (
    <div className="flex items-center justify-between text-sm text-slate-700">
        <div className="flex items-center">
            <Icon className="h-4 w-4 mr-2 text-slate-400"/>
            <span className="text-slate-600">{label}:</span>
        </div>
        <span className={`font-semibold ${valueClass || 'text-slate-800'}`}>{value}</span>
    </div>
);

export default function OnboardingStep5Page() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      {/* Header Info */}
      <div className="p-4 sm:p-6 text-center bg-white border-b border-slate-200">
        <div className="flex justify-center items-center mb-2">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Star className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Your Internship Success Awaits!
        </h1>
        <p className="text-sm mt-1 text-slate-500 max-w-lg mx-auto">
          InternHub is here to support you. Get ready to make the most of your experience by putting all these tools to use.
        </p>
      </div>

      {/* Demo UI */}
      <div className="flex-1 w-full p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          <div className="w-full h-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform scale-[0.85] sm:scale-[0.9] origin-top flex flex-col sm:flex-row">
              {/* Left Pane - Profile */}
              <div className="w-full sm:w-1/3 p-4 border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center text-center">
                  <Avatar className="h-20 w-20 border-2 border-purple-300 mb-2">
                      <AvatarImage src="https://placehold.co/150x150.png" />
                      <AvatarFallback className="bg-purple-200 text-purple-700 text-2xl">AS</AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-slate-800">Alex Smith</p>
                  <p className="text-xs text-slate-500 mb-2">alex.smith@htu.edu.gh</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Student</Badge>
              </div>

              {/* Right Pane - Details */}
              <div className="w-full sm:w-2/3 p-4 space-y-4">
                 <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">INTERNSHIP DETAILS</h3>
                    <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-white">
                        <DetailRow icon={Briefcase} label="Company" value="Innovatech Solutions" />
                        <DetailRow icon={User} label="Supervisor" value="Mr. John Smith" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">LATEST EVALUATION</h3>
                     <div className="space-y-2 p-3 rounded-lg border border-slate-200 bg-white">
                        <DetailRow icon={Star} label="Technical Skills" value="4/5" valueClass="text-green-600"/>
                        <DetailRow icon={Star} label="Communication" value="5/5" valueClass="text-green-600"/>
                        <DetailRow icon={Star} label="Professionalism" value="5/5" valueClass="text-green-600"/>
                     </div>
                 </div>
              </div>
          </div>
      </div>

      {/* Navigation Footer */}
      <footer className="sticky bottom-0 w-full bg-white/70 backdrop-blur-sm p-4 border-t border-slate-200">
         <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
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
         </div>
      </footer>
    </main>
  );
}
