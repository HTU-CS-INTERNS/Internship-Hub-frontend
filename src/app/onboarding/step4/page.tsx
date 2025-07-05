'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShieldCheck, MapPin, LocateFixed, CheckCircle } from 'lucide-react';

const OnboardingStepDot = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
);

export default function OnboardingStep4Page() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      {/* Header Info */}
      <div className="p-4 sm:p-6 text-center bg-white border-b border-slate-200">
        <div className="flex justify-center items-center mb-2">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-full">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Build a Verifiable Professional Record
        </h1>
        <p className="text-sm mt-1 text-slate-500 max-w-lg mx-auto">
          Securely check-in at your internship site and verify your presence to build a strong, trusted record of your dedication. Your privacy is paramount.
        </p>
      </div>

      {/* Demo UI */}
      <div className="flex-1 w-full p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          <div className="w-full h-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-[0.85] sm:scale-[0.9] origin-center flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <h2 className="font-bold text-lg text-slate-800 mb-1">Checked-in Successfully!</h2>
                <p className="text-xs text-slate-500 mb-4">Your attendance for July 31, 2024 is recorded.</p>
                <div className="w-full p-3 bg-slate-100 rounded-lg text-left text-xs">
                    <p><span className="font-semibold text-slate-600">Time:</span> 9:02 AM</p>
                    <p><span className="font-semibold text-slate-600">Location:</span> 123 Tech Park Ave (GPS Verified)</p>
                </div>
                <div className="w-full h-24 bg-slate-200 rounded-lg mt-3 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-slate-400"/>
                    <p className="text-xs text-slate-500 ml-2">Map Visualized Here</p>
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
         </div>
      </footer>
    </main>
  );
}
