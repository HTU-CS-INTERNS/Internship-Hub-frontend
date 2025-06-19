
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, Calendar, Edit3, MessageSquare, Paperclip, ThumbsUp, ThumbsDown, User, Briefcase, Loader2, CheckCircle, XCircle, AlertTriangle, Image as ImageIconLucide, Save } from 'lucide-react'; // Renamed ImageIcon
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DUMMY_INTERNS } from '@/app/(app)/supervisor/interns/page';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image'; 
import { getReportById, updateReportStatus } from '@/lib/services/report.service'; // Updated service import


const reportStatusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};

export default function SupervisorReportReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const reportId = params.reportId as string;
  const internIdQuery = searchParams.get('internId');

  const [report, setReport] = React.useState<DailyReport | null>(null);
  const [intern, setIntern] = React.useState<typeof DUMMY_INTERNS[0] | null>(null);
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [initialComment, setInitialComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);


  React.useEffect(() => {
    async function loadData() {
      if (!reportId || !internIdQuery) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const foundReport = await getReportById(reportId);
      const foundIntern = DUMMY_INTERNS.find(i => i.id === internIdQuery);
      
      if (foundReport && foundIntern) {
        setReport(foundReport);
        setIntern(foundIntern);
        const initialSupervisorComment = foundReport.supervisorComments || '';
        setFeedbackComment(initialSupervisorComment);
        setInitialComment(initialSupervisorComment);
      }
      setIsLoading(false);
    }
    loadData();
  }, [reportId, internIdQuery]);

  const handleSubmitFeedback = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!report || !intern) return;
    setIsSubmitting(true);
    
    const updatedReport = await updateReportStatus(report.id, newStatus, feedbackComment, 'supervisor');
    
    if (updatedReport) {
      setReport(updatedReport);
      setInitialComment(feedbackComment);
      toast({
        title: `Report ${newStatus === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        description: `The report for ${intern.name} has been updated with your feedback.`,
      });
      router.push(`/supervisor/interns/details/${intern.id}`);
    } else {
      toast({ title: "Error", description: "Failed to update report status.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSaveComments = async () => {
    if (!report || !intern || feedbackComment === initialComment) return;
    setIsSubmitting(true);

    const updatedReport = await updateReportStatus(report.id, report.status, feedbackComment, 'supervisor');
    
    if (updatedReport) {
      setReport(updatedReport);
      setInitialComment(feedbackComment);
      toast({
        title: "Comments Saved",
        description: "Your comments for the report have been saved.",
      });
    } else {
      toast({ title: "Error", description: "Failed to save comments.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading report details...</p>
      </div>
    );
  }

  if (!report || !intern) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader title="Error Loading Report" icon={AlertTriangle} breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { href: "/supervisor/interns", label: "My Interns" }, { label: "Error" }]} />
        <Card className="shadow-lg rounded-xl"><CardContent className="p-10 text-center"><p className="text-xl font-semibold text-destructive">Could not load report or intern details.</p><Button asChild className="mt-6 rounded-lg"><Link href="/supervisor/interns">Back to Interns List</Link></Button></CardContent></Card>
      </div>
    );
  }

  const canProvideFeedback = report.status === 'SUBMITTED' || report.status === 'PENDING';
  const commentsChanged = feedbackComment !== initialComment && feedbackComment.trim() !== '';
  const reportTitleDisplay = report.title || `Report - ${format(parseISO(report.date), "PPP")}`;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={`Review Report: ${reportTitleDisplay}`}
        description={`Submitted by ${intern.name} on ${format(parseISO(report.date), "MMMM d, yyyy")}.`}
        icon={Briefcase}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/supervisor/interns", label: "My Interns" },
          { href: `/supervisor/interns/details/${intern.id}`, label: intern.name },
          { label: "Review Report" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                    <CardTitle className="font-headline text-xl md:text-2xl">{report.title || 'Work Report Details'}</CardTitle>
                    <CardDescription className="text-sm">Submitted by {intern.name} on {format(parseISO(report.date), "MMMM d, yyyy")}</CardDescription>
                    </div>
                    <Badge variant="outline" className={cn("text-sm px-3 py-1 self-start sm:self-center", reportStatusColors[report.status])}>
                    {report.status}
                    </Badge>
                </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-1"><h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3><p className="text-foreground text-base">{format(parseISO(report.date), "PPP")}</p></div>
                    <Separator />
                    <div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Summary of Work Done</h3><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.description}</p></div>
                    {report.challengesFaced && (<div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary" />Challenges Faced</h3><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.challengesFaced}</p></div>)}
                    <div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-primary" />Key Learnings / Outcomes</h3><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{report.learningObjectives}</p></div>
                    {report.securePhotoUrl && (<div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ImageIconLucide className="mr-2 h-5 w-5 text-primary" />Secure Photo</h3><div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border shadow-sm" data-ai-hint="workplace photo"><NextImage src={report.securePhotoUrl} alt="Securely captured photo" layout="fill" objectFit="cover" /></div></div>)}
                    {report.attachments && report.attachments.length > 0 && (
                        <div>
                        <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3>
                        <ul className="list-none space-y-2">
                            {report.attachments.map((att, index) => (
                            <li key={index}>
                                <Button variant="link" className="p-0 h-auto text-base text-accent hover:text-accent/80 font-normal" asChild>
                                <a href={att.dataUri} target="_blank" rel="noopener noreferrer" download={att.name} data-ai-hint="document file">
                                    <Paperclip className="mr-1 h-4 w-4" /> {att.name} ({(att.size / 1024).toFixed(1)} KB)
                                </a>
                                </Button>
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-xl sticky top-24">
                <CardHeader><CardTitle className="font-headline text-lg flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/> Supervisor Feedback</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {(report.status === 'APPROVED' || report.status === 'REJECTED') && report.supervisorComments && !canProvideFeedback && (<div className="p-3 bg-muted/50 rounded-md border border-input"><p className="text-sm font-medium text-foreground mb-1">Your Feedback:</p><p className="text-sm text-muted-foreground italic">"{report.supervisorComments}"</p></div>)}
                    {canProvideFeedback && (<Textarea placeholder="Enter your feedback for the intern..." value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} rows={6} className="rounded-lg"/>)}
                    {!canProvideFeedback && !report.supervisorComments && (<p className="text-sm text-muted-foreground">No feedback provided yet, or report is not in a state that accepts new feedback.</p>)}
                </CardContent>
                {canProvideFeedback && (<CardFooter className="flex flex-col gap-2 border-t pt-4"><Button variant="outline" onClick={handleSaveComments} disabled={isSubmitting || !commentsChanged} className="w-full rounded-lg">{isSubmitting && feedbackComment === initialComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Comments</Button><div className="flex w-full gap-2"><Button variant="destructive" onClick={() => handleSubmitFeedback('REJECTED')} disabled={isSubmitting || !feedbackComment.trim()} className="flex-1 rounded-lg">{isSubmitting && feedbackComment !== initialComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4"/>} Reject</Button><Button onClick={() => handleSubmitFeedback('APPROVED')} disabled={isSubmitting} className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white">{isSubmitting && feedbackComment !== initialComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>} Approve</Button></div></CardFooter>)}
            </Card>
        </div>
      </div>
    </div>
  );
}
    