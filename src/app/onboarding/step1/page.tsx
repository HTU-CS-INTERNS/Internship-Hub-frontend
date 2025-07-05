'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarCheck, FileText, LayoutDashboard, ListChecks, StarIcon } from 'lucide-react';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
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

export default function OnboardingStep1Page() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      {/* Header Info */}
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
      
      {/* Demo UI */}
      <div className="flex-1 w-full p-2 sm:p-4 overflow-hidden">
          <div className="w-full h-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform scale-[0.85] sm:scale-[0.9] origin-top">
              <div className="p-3 bg-slate-100/70 border-b border-slate-200">
                  <h2 className="text-base font-semibold text-slate-700">Student Dashboard</h2>
              </div>
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {/* Grid for stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <DemoStatCard icon={CalendarCheck} title="Days Completed" value="14 / 90" detail="15.5% progress" iconColor="text-indigo-600" bgColor="bg-indigo-50"/>
                      <DemoStatCard icon={FileText} title="Reports Submitted" value="12" detail="10 Approved" iconColor="text-green-600" bgColor="bg-green-50"/>
                      <DemoStatCard icon={StarIcon} title="Supervisor Rating" value="4.8" detail="Excellent" iconColor="text-yellow-600" bgColor="bg-yellow-50"/>
                  </div>
                   {/* Task List */}
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
      </div>

      {/* Navigation Footer */}
       <footer className="sticky bottom-0 w-full bg-white/70 backdrop-blur-sm p-4 border-t border-slate-200">
         <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center items-center space-x-2 mb-4">
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
         </div>
      </footer>
    </main>
  );
}
