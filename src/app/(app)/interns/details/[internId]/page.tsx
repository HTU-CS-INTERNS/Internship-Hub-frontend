
'use client';
import * // DUMMY_REPORTS needs to be accessible here
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { User, Briefcase, FileText, Eye, MessageSquare, ThumbsUp, ThumbsDown, Edit, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport } from '@/types'; // Assuming DailyReport covers tasks too for simplicity
import { DUMMY_INTERNS } from '@/app/(app)/interns/page'; // Import DUMMY_INTERNS
// For reports, we'll use a shared source or manage it locally
import { DUMMY_REPORTS as ALL_DUMMY_REPORTS } from '@/app/(app)/reports/page';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A';

const reportStatusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};


export default function InternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const internId = params.internId as string;

  const [intern, setIntern] = React.useState<typeof DUMMY_INTERNS[0] | null>(null);
  const [internReports, setInternReports] = React.useState<DailyReport[]>([]);
  
  // States for inline feedback on this page (optional, could be modal too)
  const [selectedReportForFeedback, setSelectedReportForFeedback] = React.useState<DailyReport | null>(null);
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);

  React.useEffect(() => {
    const foundIntern = DUMMY_INTERNS.find(i => i.id === internId);
    if (foundIntern) {
      setIntern(foundIntern);
      // Simulate fetching reports for this intern
      // In a real app, studentId in report would match internId
      // For dummy data, we'll assume 'stu1' is the ID for all reports and link it to first intern.
      const reports = ALL_DUMMY_REPORTS.filter(report => {
        if (internId === 'intern1') return report.studentId === 'stu1'; // Map first intern to stu1 reports
        // Add more mappings if needed for other dummy interns
        return false;
      });

      // Attempt to load feedback from localStorage
      const storedReportsFeedback = JSON.parse(localStorage.getItem(`reportsFeedback_${internId}`) || '{}');
      const reportsWithFeedback = reports.map(report => ({
        ...report,
        status: storedReportsFeedback[report.id]?.status || report.status,
        supervisorComments: storedReportsFeedback[report.id]?.supervisorComments || report.supervisorComments,
      }));
      setInternReports(reportsWithFeedback);

    } else {
      // router.push('/interns'); // Or show a not found page
    }
  }, [internId, router]);
  
  const handleOpenFeedback = (report: DailyReport) => {
    setSelectedReportForFeedback(report);
    setFeedbackComment(report.supervisorComments || '');
  };

  const handleFeedbackSubmit = (action: 'APPROVE' | 'REJECT') => {
    if (!selectedReportForFeedback) return;
    setIsSubmittingFeedback(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedReports = internReports.map(r => 
        r.id === selectedReportForFeedback.id 
        ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', supervisorComments: feedbackComment } 
        : r
      );
      setInternReports(updatedReports);

      // Save to localStorage
      const storedReportsFeedback = JSON.parse(localStorage.getItem(`reportsFeedback_${internId}`) || '{}');
      storedReportsFeedback[selectedReportForFeedback.id] = {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        supervisorComments: feedbackComment,
      };
      localStorage.setItem(`reportsFeedback_${internId}`, JSON.stringify(storedReportsFeedback));


      toast({
        title: `Report ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        description: `Feedback for "${selectedReportForFeedback.description.substring(0,30)}..." has been recorded.`,
      });
      setSelectedReportForFeedback(null);
      setFeedbackComment('');
      setIsSubmittingFeedback(false);
    }, 1000);
  };


  if (!intern) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading intern details...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={intern.name}
        description={`Details and submissions for ${intern.university}.`}
        icon={User}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/interns", label: "My Interns" },
          { label: intern.name }
        ]}
        actions={
            <Link href={`/communication?chatWith=${intern.id}`} passHref>
                 <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4"/>Contact Intern</Button>
            </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-lg rounded-xl">
            <CardHeader className="p-6 border-b text-center bg-primary/10">
              <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-primary/30 shadow-lg">
                <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint="person student"/>
                <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(intern.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-xl text-primary">{intern.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{intern.email}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-sm space-y-2">
              <p><strong className="text-foreground">University:</strong> {intern.university}</p>
              <p><strong className="text-foreground">Pending Tasks:</strong> <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"}>{intern.pendingTasks}</Badge></p>
              <p><strong className="text-foreground">Pending Reports:</strong> <Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"}>{intern.pendingReports}</Badge></p>
              <p><strong className="text-foreground">Last Activity:</strong> {intern.lastActivity}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Submitted Reports</CardTitle>
              <CardDescription>Review reports submitted by {intern.name}.</CardDescription>
            </CardHeader>
            <CardContent>
              {internReports.length > 0 ? (
                <div className="space-y-4">
                  {internReports.map(report => (
                    <Card key={report.id} className="bg-muted/30 shadow-sm rounded-lg">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-foreground">Report: {format(parseISO(report.date), "PPP")}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{report.description}</p>
                            </div>
                            <Badge variant="outline" className={cn("text-xs shrink-0", reportStatusColors[report.status])}>{report.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs">
                        {report.supervisorComments && (
                            <blockquote className="border-l-2 border-primary pl-2 italic text-muted-foreground mb-2">"{report.supervisorComments}"</blockquote>
                        )}
                        <p className="line-clamp-2 mb-1"><strong className="text-foreground">Outcomes:</strong> {report.outcomes}</p>
                        <p className="line-clamp-2"><strong className="text-foreground">Learnings:</strong> {report.learningObjectives}</p>
                      </CardContent>
                      <CardFooter className="justify-end gap-2 pt-2">
                        <Link href={`/interns/reports/${report.id}?internId=${intern.id}`} passHref>
                            <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4"/> View Full Report</Button>
                        </Link>
                         <Button variant="outline" size="sm" onClick={() => handleOpenFeedback(report)} disabled={report.status === 'APPROVED' || report.status === 'REJECTED'}>
                           <Edit className="mr-1 h-4 w-4"/> {report.status === 'SUBMITTED' || report.status === 'PENDING' ? 'Provide Feedback' : 'View Feedback'}
                         </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-50" />
                  <p>{intern.name} has not submitted any reports yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedReportForFeedback && (
         <Card className="mt-6 shadow-lg rounded-xl fixed bottom-0 right-0 left-0 md:left-auto md:max-w-md m-4 border-t-4 border-primary z-50 bg-card animate-in slide-in-from-bottom-full duration-500">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Feedback for Report: {format(parseISO(selectedReportForFeedback.date), "PPP")}</CardTitle>
                <CardDescription className="line-clamp-2">{selectedReportForFeedback.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    placeholder="Enter your feedback here..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    rows={4}
                    className="rounded-lg"
                />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedReportForFeedback(null)} disabled={isSubmittingFeedback} className="w-full sm:w-auto rounded-lg">Cancel</Button>
                <Button onClick={() => handleFeedbackSubmit('REJECT')} variant="destructive" disabled={isSubmittingFeedback || !feedbackComment.trim()} className="w-full sm:w-auto rounded-lg">
                    {isSubmittingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsDown className="mr-2 h-4 w-4"/>} Reject
                </Button>
                <Button onClick={() => handleFeedbackSubmit('APPROVE')} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto rounded-lg" disabled={isSubmittingFeedback}>
                    {isSubmittingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ThumbsUp className="mr-2 h-4 w-4"/>} Approve
                </Button>
            </CardFooter>
         </Card>
      )}
    </div>
  );
}
