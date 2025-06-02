
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { ClipboardList, Calendar, Award, Target, Edit3, MessageSquare, Paperclip } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { DailyTask } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DUMMY_TASKS } from '@/app/(app)/student/tasks/page'; // Updated import path
import { useParams, useSearchParams } from 'next/navigation';

const statusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const searchParams = useSearchParams();
  const isInternView = searchParams.get('internView') === 'true'; // Check if it's supervisor viewing intern's task

  // Find the task from the DUMMY_TASKS array
  const task = DUMMY_TASKS.find(t => t.id === params.taskId);

  if (!task) {
    return <div className="p-6 text-center text-lg">Task not found.</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title={`Task Details: ${format(new Date(task.date), "PPP")}`}
        description="Comprehensive view of your declared daily task."
        icon={ClipboardList}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: isInternView ? "/supervisor/interns" : "/student/tasks", label: isInternView ? "My Interns" : "Daily Tasks" },
          // If internView, might need a breadcrumb to specific intern, then task. For simplicity, keeping it generic.
          { label: `Task - ${task.id}` }
        ]}
        actions={
          !isInternView && task.status === 'PENDING' && (
            <Link href={`/student/tasks/edit/${task.id}`} passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Task
              </Button>
            </Link>
          )
        }
      />

      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
              <CardTitle className="font-headline text-xl md:text-2xl">Task Overview</CardTitle>
              <CardDescription className="text-sm">Submitted on {format(new Date(task.date), "MMMM d, yyyy")}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm px-3 py-1 self-start sm:self-center", statusColors[task.status])}>
              {task.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3>
              <p className="text-foreground text-base">{format(new Date(task.date), "PPP")}</p>
            </div>
             <div className="space-y-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center"><Award className="mr-2 h-4 w-4 text-primary" />Department Outcome Link</h3>
              <p className="text-foreground text-base">{task.departmentOutcomeLink || 'N/A'}</p>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" />Description</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{task.description}</p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Target className="mr-2 h-5 w-5 text-primary" />Outcomes/Results</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{task.outcomes}</p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Award className="mr-2 h-5 w-5 text-primary" />Learning Objectives Achieved</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{task.learningObjectives}</p>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3>
              <ul className="list-none space-y-2">
                {task.attachments.map((file, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-base text-accent hover:text-accent/80 font-normal" asChild>
                      <a href={`/placeholder-download/${file}`} target="_blank" rel="noopener noreferrer" data-ai-hint="document file">
                        <Paperclip className="mr-1 h-4 w-4" /> {file}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {task.supervisorComments && (
            <>
            <Separator />
            <div>
                <h3 className="text-base font-semibold text-foreground mb-2 flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Supervisor Comments</h3>
                <Card className="bg-muted/30 p-4 border-l-4 border-primary shadow-inner">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">{task.supervisorComments}</p>
                </Card>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
