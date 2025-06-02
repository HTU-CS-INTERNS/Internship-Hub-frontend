
'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/page-header';
import { User, Briefcase, FileText, Eye, MessageSquare, ThumbsUp, ThumbsDown, Edit, CheckCircle, AlertCircle, Loader2, TrendingUp, Star, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyReport, InternEvaluation } from '@/types';
import { DUMMY_INTERNS } from '@/app/(app)/supervisor/interns/page'; 
import { DUMMY_REPORTS as ALL_DUMMY_REPORTS } from '@/app/(app)/student/reports/page'; // Updated import
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SCORING_METRICS } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import * as z from 'zod';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A';

const reportStatusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};

const evaluationSchemaDefinition: z.ZodRawShape = {};
SCORING_METRICS.forEach(metric => {
  evaluationSchemaDefinition[metric.id] = z.coerce.number().min(1, "Score required").max(5, "Score between 1-5").optional();
});
evaluationSchemaDefinition.overallComments = z.string().min(10, "Comments must be at least 10 characters.").max(1000, "Comments too long.");

const evaluationSchema = z.object(evaluationSchemaDefinition);
type EvaluationFormValues = z.infer<typeof evaluationSchema>;


export default function InternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const internId = params.internId as string;

  const [intern, setIntern] = React.useState<typeof DUMMY_INTERNS[0] | null>(null);
  const [internReports, setInternReports] = React.useState<DailyReport[]>([]);
  const [selectedReportForFeedback, setSelectedReportForFeedback] = React.useState<DailyReport | null>(null);
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = React.useState(false);
  
  const evaluationMethods = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
        scores: {},
        overallComments: ''
    }
  });

  React.useEffect(() => {
    const foundIntern = DUMMY_INTERNS.find(i => i.id === internId);
    if (foundIntern) {
      setIntern(foundIntern);
      const reports = ALL_DUMMY_REPORTS.filter(report => {
        if (internId === 'intern1') return report.studentId === 'stu1'; 
        return false;
      });
      const storedReportsFeedback = JSON.parse(localStorage.getItem(`reportsFeedback_${internId}`) || '{}');
      const reportsWithFeedback = reports.map(report => ({
        ...report,
        status: storedReportsFeedback[report.id]?.status || report.status,
        supervisorComments: storedReportsFeedback[report.id]?.supervisorComments || report.supervisorComments,
      }));
      setInternReports(reportsWithFeedback);

      const storedEvaluation = localStorage.getItem(`internEvaluation_${internId}`);
      if (storedEvaluation) {
          const parsedEval: InternEvaluation = JSON.parse(storedEvaluation);
          const scoresForForm: Record<string, number | undefined> = {};
          SCORING_METRICS.forEach(m => scoresForForm[m.id] = parsedEval.scores[m.id]);
          evaluationMethods.reset({ scores: scoresForForm, overallComments: parsedEval.overallComments });
      }

    } else {
      // router.push('/supervisor/interns'); 
    }
  }, [internId, router, evaluationMethods]);
  
  const handleOpenFeedback = (report: DailyReport) => {
    setSelectedReportForFeedback(report);
    setFeedbackComment(report.supervisorComments || '');
  };

  const handleFeedbackSubmit = (action: 'APPROVE' | 'REJECT') => {
    if (!selectedReportForFeedback) return;
    setIsSubmittingFeedback(true);
    
    setTimeout(() => {
      const updatedReports = internReports.map(r => 
        r.id === selectedReportForFeedback.id 
        ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', supervisorComments: feedbackComment } 
        : r
      );
      setInternReports(updatedReports);
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

  const onEvaluationSubmit = async (data: EvaluationFormValues) => {
    setIsSubmittingEvaluation(true);
    const evaluationData: InternEvaluation = {
        scores: data.scores as Record<string, number>, 
        overallComments: data.overallComments,
        evaluationDate: new Date().toISOString(),
    };
    localStorage.setItem(`internEvaluation_${internId}`, JSON.stringify(evaluationData));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmittingEvaluation(false);
    toast({
        title: "Evaluation Saved",
        description: `Performance evaluation for ${intern?.name} has been recorded.`,
    });
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
        description={`Details, submissions, and evaluation for ${intern.university}.`}
        icon={User}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/supervisor/interns", label: "My Interns" },
          { label: intern.name }
        ]}
        actions={
            <Link href={`/communication?chatWith=${intern.id}`} passHref>
                 <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4"/>Contact Intern</Button>
            </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
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
           <Card className="shadow-lg rounded-xl">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary"/> Performance Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Detailed analytics will provide insights into task completion, report submission trends, and more.
                </p>
            </CardContent>
            <CardFooter>
                <Link href={`/supervisor/interns/analytics/${internId}`} passHref className="w-full">
                    <Button variant="outline" className="w-full rounded-lg">View Detailed Analytics</Button>
                </Link>
            </CardFooter>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
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
                        <Link href={`/supervisor/interns/reports/${report.id}?internId=${intern.id}`} passHref>
                            <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4"/> View Full Report</Button>
                        </Link>
                         <Button variant="outline" size="sm" onClick={() => handleOpenFeedback(report)} disabled={isSubmittingFeedback || report.status === 'APPROVED' || report.status === 'REJECTED'}>
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

          <FormProvider {...evaluationMethods}>
            <form onSubmit={evaluationMethods.handleSubmit(onEvaluationSubmit)}>
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center"><Star className="mr-2 h-5 w-5 text-primary"/>Intern Performance Evaluation</CardTitle>
                        <CardDescription>Provide scores and overall feedback for {intern.name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {SCORING_METRICS.map(metric => (
                            <div key={metric.id} className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor={`score-${metric.id}`} className="col-span-1 text-sm font-medium">{metric.label}</Label>
                                <Controller
                                    name={`scores.${metric.id}` as any} 
                                    control={evaluationMethods.control}
                                    render={({ field, fieldState }) => (
                                        <div className="col-span-2">
                                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                                                <SelectTrigger id={`score-${metric.id}`} className="rounded-lg">
                                                    <SelectValue placeholder="Select score (1-5)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1,2,3,4,5].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
                                            {metric.description && <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>}
                                        </div>
                                    )}
                                />
                            </div>
                        ))}
                        <Separator/>
                        <div>
                            <Label htmlFor="overallComments" className="text-sm font-medium">Overall Comments</Label>
                             <Controller
                                name="overallComments"
                                control={evaluationMethods.control}
                                render={({ field, fieldState }) => (
                                    <>
                                    <Textarea 
                                        id="overallComments" 
                                        placeholder={`Provide overall feedback for ${intern.name}...`} 
                                        {...field} 
                                        rows={5} 
                                        className="mt-1 rounded-lg"
                                    />
                                    {fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="rounded-lg" disabled={isSubmittingEvaluation}>
                            {isSubmittingEvaluation && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            <Save className="mr-2 h-4 w-4"/> Save Evaluation
                        </Button>
                    </CardFooter>
                </Card>
            </form>
          </FormProvider>
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
