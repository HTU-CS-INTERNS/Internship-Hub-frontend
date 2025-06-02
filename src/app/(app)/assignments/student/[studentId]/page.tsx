
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { User, Briefcase, FileText, AlertTriangle, Loader2, Activity, MessageSquare, CalendarPlus, Building, Clock, MapPin, CheckCircle, Star, Edit, Eye, ListChecks, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DUMMY_ASSIGNMENTS } from '@/app/(app)/assignments/page';
import { DUMMY_STUDENTS_DATA, SCORING_METRICS } from '@/lib/constants';
import { DUMMY_REPORTS } from '@/app/(app)/student/reports/page'; // Updated import
import { DUMMY_TASKS } from '@/app/(app)/student/tasks/page'; // Updated import
import type { DailyReport, DailyTask, InternEvaluation } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, subDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { FormField, FormItem } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import * as z from 'zod';

interface StudentActivityLogEntry {
  id: string;
  timestamp: Date;
  type: 'report_submitted' | 'report_approved_lecturer' | 'report_rejected_lecturer' | 'task_declared' | 'task_completed' | 'feedback_from_lecturer' | 'visit_scheduled';
  description: string;
  details?: string;
}

const DUMMY_STUDENT_ACTIVITY_LOG: StudentActivityLogEntry[] = [
  { id: 'act1', timestamp: subDays(new Date(), 1), type: 'report_submitted', description: 'Submitted Weekly Report #5', details: 'Covered frontend UI development.' },
  { id: 'act2', timestamp: subDays(new Date(), 2), type: 'task_completed', description: 'Completed task: User Profile UI', details: 'All profile fields implemented.' },
  { id: 'act3', timestamp: subDays(new Date(), 3), type: 'feedback_from_lecturer', description: 'Lecturer feedback on Report #4', details: 'Dr. Vance: "Good detail on the challenges faced."' },
  { id: 'act4', timestamp: subDays(new Date(), 5), type: 'visit_scheduled', description: 'Site visit scheduled by Dr. Vance', details: 'For next Tuesday at 10 AM at Acme Corp.' },
  { id: 'act5', timestamp: subDays(new Date(), 7), type: 'report_approved_lecturer', description: 'Report #4 approved by Dr. Vance' },
];

const activityIconMap: Record<StudentActivityLogEntry['type'], React.ElementType> = {
  report_submitted: FileText,
  report_approved_lecturer: CheckCircle,
  report_rejected_lecturer: AlertTriangle,
  task_declared: Briefcase,
  task_completed: CheckCircle,
  feedback_from_lecturer: MessageSquare,
  visit_scheduled: CalendarPlus,
};

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

const scheduleVisitSchema = z.object({
  visitDate: z.date({ required_error: 'Visit date is required.' }),
  visitTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)."}),
  location: z.string().min(3, { message: "Location is required (min 3 chars)."}).max(150),
  purpose: z.string().min(5, { message: "Purpose is required (min 5 chars)."}).max(500),
});
type ScheduleVisitFormValues = z.infer<typeof scheduleVisitSchema>;

const evaluationSchemaDefinition: z.ZodRawShape = {};
SCORING_METRICS.forEach(metric => {
  evaluationSchemaDefinition[`scores.${metric.id}`] = z.coerce.number().min(1, "Score required").max(5, "Score between 1-5").optional();
});
evaluationSchemaDefinition.overallComments = z.string().min(10, "Comments must be at least 10 characters.").max(1000, "Comments too long.");

const evaluationSchema = z.object(evaluationSchemaDefinition);
type EvaluationFormValues = z.infer<typeof evaluationSchema>;

const reportStatusColors: Record<DailyReport['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};
const taskStatusColors = reportStatusColors; 

export default function LecturerStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = params.studentId as string;

  const [student, setStudent] = React.useState<(typeof DUMMY_STUDENTS_DATA[0]) | null>(null);
  const [assignment, setAssignment] = React.useState<(typeof DUMMY_ASSIGNMENTS[0]) | null>(null);
  const [studentReports, setStudentReports] = React.useState<DailyReport[]>([]);
  const [studentTasks, setStudentTasks] = React.useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activityLog] = React.useState<StudentActivityLogEntry[]>(DUMMY_STUDENT_ACTIVITY_LOG);
  const [isVisitSheetOpen, setIsVisitSheetOpen] = React.useState(false);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = React.useState(false);

  const visitFormMethods = useForm<ScheduleVisitFormValues>({
    resolver: zodResolver(scheduleVisitSchema),
    defaultValues: { visitDate: new Date(), visitTime: "10:00", location: '', purpose: '' }
  });

  const evaluationMethods = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { scores: {}, overallComments: '' }
  });

  React.useEffect(() => {
    setIsLoading(true);
    const foundStudent = DUMMY_STUDENTS_DATA.find(s => s.id === studentId);
    const foundAssignment = DUMMY_ASSIGNMENTS.find(a => a.id === studentId);

    if (foundStudent) setStudent(foundStudent);
    if (foundAssignment) {
      setAssignment(foundAssignment);
      visitFormMethods.setValue("location", foundAssignment.companyName ? `${foundAssignment.companyName} (Supervisor: ${foundAssignment.companySupervisor || 'TBD'})` : 'Company Visit Location');
    }
    setStudentReports(DUMMY_REPORTS.filter(r => r.studentId === studentId).slice(0, 5)); 
    setStudentTasks(DUMMY_TASKS.filter(t => t.studentId === studentId).slice(0, 5));   

    const storedEvaluation = typeof window !== "undefined" ? localStorage.getItem(`lecturerStudentEvaluation_${studentId}`) : null;
    if (storedEvaluation) {
        const parsedEval: InternEvaluation = JSON.parse(storedEvaluation);
        const scoresForForm: Record<string, number | undefined> = {};
        SCORING_METRICS.forEach(m => scoresForForm[m.id] = parsedEval.scores[m.id]);
        evaluationMethods.reset({ scores: scoresForForm, overallComments: parsedEval.overallComments });
    }

    setIsLoading(false);
  }, [studentId, visitFormMethods, evaluationMethods]);

  const handleScheduleVisitSubmit = async (values: ScheduleVisitFormValues) => {
    visitFormMethods.formState.isSubmitting;
    const visitDateTime = setMinutes(setHours(startOfDay(values.visitDate), parseInt(values.visitTime.split(':')[0])), parseInt(values.visitTime.split(':')[1]));

    console.log("Scheduling visit:", { studentId: student?.id, dateTime: visitDateTime, location: values.location, purpose: values.purpose });
    await new Promise(resolve => setTimeout(resolve, 1000));

    visitFormMethods.formState.isSubmitting;
    setIsVisitSheetOpen(false);
    visitFormMethods.reset();
    toast({
      title: "Site Visit Scheduled!",
      description: `Visit for ${student?.name} on ${format(visitDateTime, "PPP 'at' p")}. Student and supervisor notified (simulated).`,
    });
  };

  const onEvaluationSubmit = async (data: EvaluationFormValues) => {
    setIsSubmittingEvaluation(true);
    const evaluationData: InternEvaluation = {
        scores: data.scores as Record<string, number>,
        overallComments: data.overallComments,
        evaluationDate: new Date().toISOString(),
    };
    localStorage.setItem(`lecturerStudentEvaluation_${studentId}`, JSON.stringify(evaluationData));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmittingEvaluation(false);
    toast({
        title: "Evaluation Saved",
        description: `Performance evaluation for ${student?.name} has been recorded by lecturer.`,
    });
  };

  if (isLoading && !student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <PageHeader title="Student Not Found" icon={AlertTriangle} breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { href: "/assignments", label: "Assignments" }, { label: "Error" }]} />
        <Card className="shadow-lg rounded-xl"><CardContent className="p-10 text-center"><p className="text-xl font-semibold text-destructive">Could not find details for student ID: {studentId}</p><Button asChild className="mt-6 rounded-lg"><Link href="/assignments">Back to Assignments</Link></Button></CardContent></Card>
      </div>
    );
  }

  const companyName = assignment?.companyName || "Not Assigned Yet";

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={student.name}
        description={`Oversee tasks, reports, and feedback for ${student.name} (${student.department}).`}
        icon={User}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { href: "/assignments", label: "Assignments" }, { label: student.name }]}
        actions={
          <Sheet open={isVisitSheetOpen} onOpenChange={setIsVisitSheetOpen}>
            <SheetTrigger asChild><Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"><CalendarPlus className="mr-2 h-4 w-4"/> Schedule Visit</Button></SheetTrigger>
            <SheetContent className="bg-card text-card-foreground border-border sm:max-w-lg"><SheetHeader><SheetTitle className="font-headline text-xl">Schedule Site Visit for {student.name}</SheetTitle><SheetDescription>Arrange a visit to the student's internship company. Notifications will be simulated.</SheetDescription></SheetHeader>
              <FormProvider {...visitFormMethods}><form onSubmit={visitFormMethods.handleSubmit(handleScheduleVisitSubmit)} className="py-4 space-y-4">
                  <FormField control={visitFormMethods.control} name="visitDate" render={({ field }) => (<FormItem className="flex flex-col"><Label>Visit Date</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal rounded-lg border-input", !field.value && "text-muted-foreground")}><CalendarDays className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 bg-card"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="bg-card text-card-foreground" /></PopoverContent></Popover>{visitFormMethods.formState.errors.visitDate && <p className="text-xs text-destructive mt-1">{visitFormMethods.formState.errors.visitDate.message}</p>}</FormItem>)}/>
                  <FormField control={visitFormMethods.control} name="visitTime" render={({ field }) => (<FormItem><Label htmlFor="visit-time">Visit Time</Label><Input id="visit-time" type="time" {...field} className="mt-1 rounded-lg border-input"/>{visitFormMethods.formState.errors.visitTime && <p className="text-xs text-destructive mt-1">{visitFormMethods.formState.errors.visitTime.message}</p>}</FormItem>)}/>
                  <FormField control={visitFormMethods.control} name="location" render={({ field }) => (<FormItem><Label htmlFor="visit-location">Location / Meeting Link</Label><Input id="visit-location" placeholder="e.g., Company Address or Zoom Link" {...field} className="mt-1 rounded-lg border-input"/>{visitFormMethods.formState.errors.location && <p className="text-xs text-destructive mt-1">{visitFormMethods.formState.errors.location.message}</p>}</FormItem>)}/>
                  <FormField control={visitFormMethods.control} name="purpose" render={({ field }) => (<FormItem><Label htmlFor="visit-purpose">Purpose / Notes</Label><Textarea id="visit-purpose" placeholder="e.g., Mid-term review, progress check..." {...field} className="mt-1 rounded-lg border-input" rows={3}/>{visitFormMethods.formState.errors.purpose && <p className="text-xs text-destructive mt-1">{visitFormMethods.formState.errors.purpose.message}</p>}</FormItem>)}/>
                  <SheetFooter className="mt-6"><SheetClose asChild><Button type="button" variant="outline" className="rounded-lg border-input">Cancel</Button></SheetClose><Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={visitFormMethods.formState.isSubmitting}>{visitFormMethods.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Schedule Visit</Button></SheetFooter>
              </form></FormProvider>
            </SheetContent>
          </Sheet>
        }
      />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg rounded-xl"><CardHeader className="p-6 border-b text-center bg-primary/10"><Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-primary/30 shadow-lg"><AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person student"/><AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(student.name)}</AvatarFallback></Avatar><CardTitle className="font-headline text-xl text-primary">{student.name}</CardTitle><CardDescription className="text-muted-foreground">{student.email}</CardDescription></CardHeader><CardContent className="p-6 text-sm space-y-3"><p><strong className="text-foreground">Department:</strong> {student.department}</p><p><strong className="text-foreground">Faculty:</strong> {student.faculty}</p><p><strong className="text-foreground">Internship Company:</strong> {companyName}</p>{assignment?.companySupervisor && (<><p><strong className="text-foreground">Company Supervisor:</strong> {assignment.companySupervisor}</p><Button variant="outline" size="sm" asChild className="w-full rounded-lg mt-2"><Link href={`/communication?contact=${encodeURIComponent(assignment.companySupervisor)}&company=${encodeURIComponent(assignment.companyName || '')}`}><MessageSquare className="mr-2 h-4 w-4" /> Contact Supervisor</Link></Button></>)}</CardContent></Card>

            <Card className="shadow-xl rounded-xl"><CardHeader><CardTitle className="font-headline text-lg flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Student Activity Log</CardTitle><CardDescription>Recent interactions and submissions.</CardDescription></CardHeader><CardContent className="p-0">{activityLog.length > 0 ? (<ScrollArea className="h-[300px] w-full"><div className="p-4 space-y-4">{activityLog.map((item) => { const IconComponent = activityIconMap[item.type] || Activity; return (<div key={item.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg shadow-sm border border-input"><div className="flex-shrink-0 mt-0.5"><IconComponent className={cn("h-5 w-5", item.type.includes('approved') ? 'text-green-500' : item.type.includes('rejected') ? 'text-red-500' : item.type.includes('submitted') || item.type.includes('declared') ? 'text-blue-500' : item.type.includes('visit_scheduled') ? 'text-purple-500' : 'text-primary')} /></div><div className="flex-1"><p className="text-sm font-medium text-foreground">{item.description}</p>{item.details && <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>}<p className="text-xs text-muted-foreground mt-1">{format(item.timestamp, "MMMM d, yyyy 'at' h:mm a")}</p></div></div>);})}</div></ScrollArea>) : (<div className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground"><Activity className="h-16 w-16 opacity-30 mb-4"/><p>No recent activity for {student.name}.</p></div>)}</CardContent></Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl rounded-xl">
                <CardHeader><CardTitle className="font-headline text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Student Reports</CardTitle><CardDescription>Review submitted reports. ({studentReports.length} recent shown)</CardDescription></CardHeader>
                <CardContent className="p-4 space-y-3">{studentReports.length > 0 ? studentReports.map(report => (
                    <Card key={report.id} className="bg-muted/30 shadow-sm rounded-lg">
                        <CardHeader className="pb-2"><div className="flex justify-between items-start"><div><h4 className="font-semibold text-foreground">{report.title || `Report: ${format(parseISO(report.date), "PPP")}`}</h4><p className="text-xs text-muted-foreground line-clamp-1">{report.description}</p></div><Badge variant="outline" className={cn("text-xs shrink-0", reportStatusColors[report.status])}>{report.status}</Badge></div></CardHeader>
                        <CardFooter className="justify-end gap-2 pt-1 pb-2">
                            <Link href={`/assignments/reports/${report.id}?studentId=${student.id}`} passHref><Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4"/> View & Comment</Button></Link>
                        </CardFooter>
                    </Card>
                )) : <p className="text-muted-foreground text-sm text-center py-4">No reports submitted by this student yet.</p>}
                </CardContent>
                 { DUMMY_REPORTS.filter(r => r.studentId === studentId).length > 5 && <CardFooter><Button variant="link" asChild className="mx-auto"><Link href={`/student/reports?studentId=${studentId}`}>View All Reports ({DUMMY_REPORTS.filter(r => r.studentId === studentId).length})</Link></Button></CardFooter>}
            </Card>
             <Card className="shadow-xl rounded-xl">
                <CardHeader><CardTitle className="font-headline text-lg flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Student Tasks</CardTitle><CardDescription>Review declared tasks. ({studentTasks.length} recent shown)</CardDescription></CardHeader>
                <CardContent className="p-4 space-y-3">{studentTasks.length > 0 ? studentTasks.map(task => (
                    <Card key={task.id} className="bg-muted/30 shadow-sm rounded-lg">
                        <CardHeader className="pb-2"><div className="flex justify-between items-start"><div><h4 className="font-semibold text-foreground">{`Task: ${format(parseISO(task.date), "PPP")}`}</h4><p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p></div><Badge variant="outline" className={cn("text-xs shrink-0", taskStatusColors[task.status])}>{task.status}</Badge></div></CardHeader>
                        <CardFooter className="justify-end gap-2 pt-1 pb-2">
                             <Link href={`/assignments/tasks/${task.id}?studentId=${student.id}`} passHref><Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4"/> View & Comment</Button></Link>
                        </CardFooter>
                    </Card>
                )) : <p className="text-muted-foreground text-sm text-center py-4">No tasks declared by this student yet.</p>}
                </CardContent>
                 { DUMMY_TASKS.filter(t => t.studentId === studentId).length > 5 && <CardFooter><Button variant="link" asChild className="mx-auto"><Link href={`/student/tasks?studentId=${studentId}`}>View All Tasks ({DUMMY_TASKS.filter(t => t.studentId === studentId).length})</Link></Button></CardFooter>}
            </Card>

            <FormProvider {...evaluationMethods}><form onSubmit={evaluationMethods.handleSubmit(onEvaluationSubmit)}>
                <Card className="shadow-lg rounded-xl"><CardHeader><CardTitle className="font-headline text-lg flex items-center"><Star className="mr-2 h-5 w-5 text-primary"/>Lecturer Performance Evaluation</CardTitle><CardDescription>Provide scores and overall feedback for {student.name}.</CardDescription></CardHeader><CardContent className="space-y-4 pt-6">
                    {SCORING_METRICS.map(metric => (<div key={metric.id} className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor={`score-${metric.id}`} className="col-span-1 text-sm font-medium">{metric.label}</Label>
                        <Controller name={`scores.${metric.id}` as any} control={evaluationMethods.control} render={({ field, fieldState }) => (
                            <div className="col-span-2"><Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}><SelectTrigger id={`score-${metric.id}`} className="rounded-lg"><SelectValue placeholder="Select score (1-5)" /></SelectTrigger><SelectContent>{[1,2,3,4,5].map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}</SelectContent></Select>{fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}{metric.description && <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>}</div>)}/>
                    </div>))}
                    <Separator/>
                    <div><Label htmlFor="overallComments" className="text-sm font-medium">Overall Comments</Label><Controller name="overallComments" control={evaluationMethods.control} render={({ field, fieldState }) => (<><Textarea id="overallComments" placeholder={`Provide overall feedback for ${student.name}...`} {...field} rows={5} className="mt-1 rounded-lg"/>{fieldState.error && <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>}</>)}/></div>
                </CardContent><CardFooter><Button type="submit" className="rounded-lg" disabled={isSubmittingEvaluation}>{isSubmittingEvaluation && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}<Star className="mr-2 h-4 w-4"/> Save Evaluation</Button></CardFooter></Card>
            </form></FormProvider>
        </div>
      </div>
    </div>
  );
}
