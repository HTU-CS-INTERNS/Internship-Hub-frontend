
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { FileText, Calendar, Edit3, MessageSquare, Paperclip, ThumbsUp, ThumbsDown, User, Briefcase, Loader2, CheckCircle, XCircle, AlertTriangle, Save, ListChecks } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyTask } from '@/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DUMMY_TASKS } from '@/app/(app)/tasks/page'; // Assuming tasks are exported here
import { DUMMY_STUDENTS_DATA } from '@/lib/constants';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const taskStatusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};

type ExtendedDailyTask = DailyTask & {
  lecturerComments?: string;
};

export default function LecturerTaskReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const taskId = params.taskId as string;
  const studentIdQuery = searchParams.get('studentId');

  const [task, setTask] = React.useState<ExtendedDailyTask | null>(null);
  const [student, setStudent] = React.useState<(typeof DUMMY_STUDENTS_DATA[0]) | null>(null);
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [initialComment, setInitialComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const foundTask = DUMMY_TASKS.find(t => t.id === taskId) as ExtendedDailyTask | undefined;
    const foundStudent = DUMMY_STUDENTS_DATA.find(s => s.id === studentIdQuery);

    if (foundTask && foundStudent) {
      const feedbackStorageKey = `lecturerTaskFeedback_${studentIdQuery}_${taskId}`;
      const storedFeedback = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(feedbackStorageKey) || '{}') : {};
      
      const initialLecturerComment = storedFeedback?.comment || foundTask.lecturerComments || '';
      
      setTask({
        ...foundTask,
        status: storedFeedback?.status || foundTask.status,
        lecturerComments: initialLecturerComment,
      });
      setStudent(foundStudent);
      setFeedbackComment(initialLecturerComment);
      setInitialComment(initialLecturerComment);
    }
    setIsLoading(false);
  }, [taskId, studentIdQuery]);

  const handleSubmitFeedback = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!task || !student) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedTaskData = { ...task, status: newStatus, lecturerComments: feedbackComment };
    setTask(updatedTaskData);
    setInitialComment(feedbackComment);

    const feedbackStorageKey = `lecturerTaskFeedback_${student.id}_${task.id}`;
    localStorage.setItem(feedbackStorageKey, JSON.stringify({ status: newStatus, comment: feedbackComment }));

    const taskIndex = DUMMY_TASKS.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
        DUMMY_TASKS[taskIndex] = { ...DUMMY_TASKS[taskIndex], status: newStatus, lecturerComments: feedbackComment } as DailyTask & { lecturerComments?: string };
    }

    setIsSubmitting(false);
    toast({
      title: `Task ${newStatus === 'APPROVED' ? 'Approved' : 'Rejected'} by Lecturer`,
      description: `The task has been updated with your feedback for ${student.name}.`,
    });
    router.push(`/assignments/student/${student.id}`);
  };

  const handleSaveComments = async () => {
    if (!task || !student || feedbackComment === initialComment) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedTaskData = { ...task, lecturerComments: feedbackComment };
    setTask(updatedTaskData);
    setInitialComment(feedbackComment);

    const feedbackStorageKey = `lecturerTaskFeedback_${student.id}_${task.id}`;
    const currentStored = JSON.parse(localStorage.getItem(feedbackStorageKey) || '{}');
    localStorage.setItem(feedbackStorageKey, JSON.stringify({ status: currentStored.status || task.status, comment: feedbackComment }));
    
    const taskIndex = DUMMY_TASKS.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
        (DUMMY_TASKS[taskIndex] as ExtendedDailyTask).lecturerComments = feedbackComment;
    }

    setIsSubmitting(false);
    toast({
      title: "Comments Saved by Lecturer",
      description: "Your comments for the task have been saved.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading task details...</p>
      </div>
    );
  }

  if (!task || !student) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader title="Error Loading Task" icon={AlertTriangle} breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { href: "/assignments", label: "Assignments" }, { label: "Error" }]} />
        <Card className="shadow-lg rounded-xl"><CardContent className="p-10 text-center"><p className="text-xl font-semibold text-destructive">Could not load task or student details.</p><Button asChild className="mt-6 rounded-lg"><Link href="/assignments">Back to Assignments</Link></Button></CardContent></Card>
      </div>
    );
  }

  const canProvideFeedback = task.status === 'SUBMITTED' || task.status === 'PENDING';
  const commentsChanged = feedbackComment !== initialComment && feedbackComment.trim() !== '';
  const taskTitle = `Task - ${format(parseISO(task.date), "PPP")}`;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={`Review Task: ${taskTitle}`}
        description={`Submitted by ${student.name} on ${format(parseISO(task.date), "MMMM d, yyyy")}.`}
        icon={ListChecks}
        breadcrumbs={[ { href: "/dashboard", label: "Dashboard" }, { href: "/assignments", label: "Assignments" }, { href: `/assignments/student/${student.id}`, label: student.name }, { label: "Review Task" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="p-6 border-b"><div className="flex flex-col sm:flex-row justify-between items-start gap-2"><div><CardTitle className="font-headline text-xl md:text-2xl">Task Details</CardTitle><CardDescription className="text-sm">Student: {student.name} | Date: {format(parseISO(task.date), "MMMM d, yyyy")}</CardDescription></div><Badge variant="outline" className={cn("text-sm px-3 py-1 self-start sm:self-center", taskStatusColors[task.status])}>{task.status}</Badge></div></CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-1"><h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3><p className="text-foreground text-base">{format(parseISO(task.date), "PPP")}</p></div>
                    <Separator />
                    <div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" />Description</h3><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{task.description}</p></div>
                    <div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ThumbsUp className="mr-2 h-5 w-5 text-primary" />Outcomes/Results</h3><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{task.outcomes}</p></div>
                    <div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><GraduationCap className="mr-2 h-5 w-5 text-primary" />Learning Objectives</h3><p className="text-muted-foreground whitespace-pre-line leading-relaxed">{task.learningObjectives}</p></div>
                    {task.departmentOutcomeLink && (<div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Link className="mr-2 h-5 w-5 text-primary" />Department Outcome Link</h3><p className="text-muted-foreground">{task.departmentOutcomeLink}</p></div>)}
                    {task.attachments && task.attachments.length > 0 && (<div><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3><ul className="list-none space-y-2">{task.attachments.map((file, index) => (<li key={index}><Button variant="link" className="p-0 h-auto text-base text-accent hover:text-accent/80 font-normal" asChild><a href={`/placeholder-download/${file}`} target="_blank" rel="noopener noreferrer" data-ai-hint="document file"><Paperclip className="mr-1 h-4 w-4" /> {file}</a></Button></li>))}</ul></div>)}
                    {task.supervisorComments && !task.lecturerComments && (<><Separator /><div className="pt-4"><h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Company Supervisor Comments</h3><Card className="bg-muted/30 p-3 border-l-4 border-primary/50 shadow-inner"><p className="text-sm text-foreground italic">"{task.supervisorComments}"</p></Card></div></>)}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-xl sticky top-24">
                <CardHeader><CardTitle className="font-headline text-lg flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/> Lecturer Feedback</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {(task.status === 'APPROVED' || task.status === 'REJECTED') && task.lecturerComments && !canProvideFeedback && (<div className="p-3 bg-muted/50 rounded-md border border-input"><p className="text-sm font-medium text-foreground mb-1">Your Feedback:</p><p className="text-sm text-muted-foreground italic">"{task.lecturerComments}"</p></div>)}
                    {canProvideFeedback && (<Textarea placeholder="Enter your feedback for the student's task..." value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} rows={6} className="rounded-lg"/>)}
                    {!canProvideFeedback && !task.lecturerComments && (<p className="text-sm text-muted-foreground">No lecturer feedback provided yet, or task is not in a state that accepts new feedback.</p>)}
                </CardContent>
                {canProvideFeedback && (<CardFooter className="flex flex-col gap-2 border-t pt-4"><Button variant="outline" onClick={handleSaveComments} disabled={isSubmitting || !commentsChanged} className="w-full rounded-lg">{isSubmitting && feedbackComment === initialComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>} Save Comments</Button><div className="flex w-full gap-2"><Button variant="destructive" onClick={() => handleSubmitFeedback('REJECTED')} disabled={isSubmitting || !feedbackComment.trim()} className="flex-1 rounded-lg">{isSubmitting && feedbackComment !== initialComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4"/>} Reject</Button><Button onClick={() => handleSubmitFeedback('APPROVED')} disabled={isSubmitting} className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white">{isSubmitting && feedbackComment !== initialComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>} Approve</Button></div></CardFooter>)}
            </Card>
        </div>
      </div>
    </div>
  );
}
