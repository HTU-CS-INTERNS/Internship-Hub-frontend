
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ClipboardList, Eye, Filter, PlusCircle, Paperclip } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const OnboardingStepDot = ({ isActive, step }: { isActive: boolean; step: number }) => (
  <Link href={`/onboarding/step${step}`}>
    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${isActive ? 'bg-primary scale-110' : 'bg-primary/30'}`} />
  </Link>
);


const ReportItemRow = ({ date, title, status, statusColor, statusBg }: { date: string, title: string, status: string, statusColor: string, statusBg: string }) => (
    <tr className="border-b border-slate-200">
        <td className="p-2 text-xs text-slate-600">{date}</td>
        <td className="p-2 text-xs font-medium text-slate-800">{title}</td>
        <td className="p-2 text-center">
             <span className={`text-xs font-semibold ${statusColor} ${statusBg} px-2 py-0.5 rounded-full`}>{status}</span>
        </td>
        <td className="p-2 text-right">
            <button className="text-xs text-slate-500 hover:text-slate-800"><Eye className="h-3 w-3 inline-block" /></button>
        </td>
    </tr>
);

export default function OnboardingStep2Page() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      <div className="p-4 sm:p-6 text-center bg-white border-b border-slate-200">
        <div className="flex justify-center items-center mb-2">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <ClipboardList className="h-5 w-5" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
          Effortlessly Track Your Progress
        </h1>
        <p className="text-sm mt-1 text-slate-500 max-w-lg mx-auto">
          Log daily tasks, capture learning objectives, and submit detailed reports. Showcase your work with a clear, organized history.
        </p>
      </div>

      <div className="flex-1 w-full p-2 sm:p-4 overflow-hidden flex items-center justify-center">
        <Carousel className="w-full max-w-5xl h-full" opts={{ loop: true }}>
            <CarouselContent className="-ml-2 md:-ml-4 h-full">
              <CarouselItem className="pl-2 md:pl-4">
                <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-base font-semibold text-slate-700">Work Reports</h2>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" className="h-7 text-xs rounded-md bg-white">
                               <Filter className="mr-1 h-3 w-3"/> Filter
                           </Button>
                            <Button size="sm" className="h-7 text-xs rounded-md bg-blue-500 hover:bg-blue-600 text-white">
                               <PlusCircle className="mr-1 h-3 w-3"/> New Report
                           </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="p-2 text-left text-xs font-medium text-slate-500">Date</th>
                                    <th className="p-2 text-left text-xs font-medium text-slate-500">Summary</th>
                                    <th className="p-2 text-center text-xs font-medium text-slate-500">Status</th>
                                    <th className="p-2 text-right text-xs font-medium text-slate-500"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <ReportItemRow date="July 26, 2024" title="Weekly Auth Module Summary" status="Approved" statusColor="text-green-700" statusBg="bg-green-100" />
                                <ReportItemRow date="July 27, 2024" title="Mid-Internship Presentation Prep" status="Submitted" statusColor="text-blue-700" statusBg="bg-blue-100" />
                                <ReportItemRow date="July 25, 2024" title="New Feature X Planning" status="Pending" statusColor="text-yellow-700" statusBg="bg-yellow-100" />
                                <ReportItemRow date="July 24, 2024" title="Bug Fixing Sprint v1.2" status="Rejected" statusColor="text-red-700" statusBg="bg-red-100" />
                            </tbody>
                        </table>
                    </div>
                </div>
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4">
                  <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden p-4">
                    <h3 className="font-semibold text-slate-700 mb-2">Detailed Submissions</h3>
                    <p className="text-xs text-slate-500 mb-4">Go beyond summaries. Add multimedia attachments like images, documents, and even secure photos to vividly showcase your work.</p>
                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
                        <Paperclip className="h-8 w-8 mx-auto text-slate-400 mb-2"/>
                        <p className="text-sm font-semibold text-slate-600">Drag & Drop Attachments</p>
                        <p className="text-xs text-slate-500">PDFs, images, documents</p>
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
              {[1, 2, 3, 4, 5].map((s) => <OnboardingStepDot key={s} isActive={s === 2} step={s} />)}
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
         </div>
      </footer>
    </main>
  );
}
