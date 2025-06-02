
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { CheckSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { DailyTask } from '@/types';
import { DUMMY_TASKS as ALL_DUMMY_TASKS } from '@/app/(app)/student/tasks/page'; // Updated import
import { DUMMY_INTERNS } from '@/app/(app)/supervisor/interns/page';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const getPendingTasksForSupervisor = () => {
  return ALL_DUMMY_TASKS.filter(task => 
    (task.status === 'SUBMITTED' || task.status === 'PENDING') && task.studentId === 'stu1' 
  );
};

const taskStatusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-500/30 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-500/30 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50',
  APPROVED: 'bg-green-100 text-green-700 border-green-500/30 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50',
  REJECTED: 'bg-red-100 text-red-700 border-red-500/30 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50',
};


export default function ApproveTasksPage() {
  const { toast } = useToast();
  const [pendingTasks, setPendingTasks] = React.useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setPendingTasks(getPendingTasksForSupervisor());
    setIsLoading(false);
  }, []);

  const handleApproveTask = (taskId: string) => {
    setPendingTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: 'APPROVED' } : task
    ));
    toast({ title: 'Task Approved', description: `Task ID ${taskId} has been marked as approved.` });
  };

  const handleRejectTask = (taskId: string) => {
     setPendingTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: 'REJECTED' } : task
    ));
    toast({ title: 'Task Rejected', description: `Task ID ${taskId} has been marked as rejected.`, variant: 'destructive' });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading tasks for approval...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Approve Intern Tasks"
        description="Review and approve/reject tasks submitted by your interns."
        icon={CheckSquare}
        breadcrumbs={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/supervisor/interns", label: "My Interns" },
            { label: "Approve Tasks" }
        ]}
      />
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Pending Task Submissions</CardTitle>
          <CardDescription>
            {pendingTasks.length > 0 
                ? `You have ${pendingTasks.length} task(s) awaiting your review.` 
                : "No tasks are currently pending your approval."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <div className="space-y-4">
              {pendingTasks.map(task => {
                const intern = DUMMY_INTERNS.find(i => i.id === 'intern1'); 
                return (
                  <Card key={task.id} className="bg-muted/30 shadow-sm rounded-lg">
                    <CardHeader className="pb-3">
                       <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-foreground">Task: {format(parseISO(task.date), "PPP")} {(intern ? `- ${intern.name}`: '')}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                            </div>
                            <Badge variant="outline" className={cn("text-xs shrink-0", taskStatusColors[task.status])}>{task.status}</Badge>
                        </div>
                    </CardHeader>
                     <CardContent className="text-xs">
                        <p><strong className="text-foreground">Outcomes:</strong> {task.outcomes}</p>
                     </CardContent>
                    <CardFooter className="justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleRejectTask(task.id)} className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">Reject</Button>
                      <Button variant="default" size="sm" onClick={() => handleApproveTask(task.id)} className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                       <Link href={`/student/tasks/${task.id}?internView=true`} passHref> 
                           <Button variant="ghost" size="sm">View Details</Button>
                       </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <CheckSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>All caught up! No tasks require your attention at this moment.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
