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

// Dummy task data - replace with actual data fetching
const DUMMY_TASK_DETAIL: DailyTask = {
  id: 'task1',
  date: '2024-07-28',
  description: 'Developed the user authentication module, including registration, login, and password reset functionalities. Implemented JWT for secure session management and integrated with the frontend login form.',
  outcomes: 'Successfully completed user authentication flow. All endpoints tested and functional. Secure session management achieved.',
  learningObjectives: 'Gained hands-on experience with JWT implementation, secure coding practices for authentication, and backend-frontend integration for auth systems.',
  studentId: 'stu1',
  status: 'APPROVED',
  departmentOutcomeLink: "DO1.2 - Applied problem-solving skills",
  attachments: ['auth_diagram.png', 'api_spec.pdf'],
  supervisorComments: "Excellent work on the authentication module. The implementation is robust and well-documented. Consider adding rate limiting for enhanced security.",
};

const statusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  SUBMITTED: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  APPROVED: 'bg-green-500/20 text-green-700 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-700 border-red-500/30',
};

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const task = DUMMY_TASK_DETAIL; // In a real app, fetch task by params.taskId

  if (!task) {
    return <div>Task not found.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Task Details: ${format(new Date(task.date), "PPP")}`}
        description="Comprehensive view of your declared daily task."
        icon={ClipboardList}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/tasks", label: "Daily Tasks" },
          { label: `Task - ${task.id}` }
        ]}
        actions={
          task.status === 'PENDING' && ( // Allow editing only if pending
            <Link href={`/tasks/edit/${task.id}`} passHref> {/* Assuming an edit route */}
              <Button>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Task
              </Button>
            </Link>
          )
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">Task Overview</CardTitle>
              <CardDescription>Submitted on {format(new Date(task.date), "MMMM d, yyyy")}</CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm px-3 py-1", statusColors[task.status])}>
              {task.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Calendar className="mr-2 h-4 w-4 text-primary" />Date</h3>
              <p className="text-foreground">{format(new Date(task.date), "PPP")}</p>
            </div>
             <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Award className="mr-2 h-4 w-4 text-primary" />Department Outcome Link</h3>
              <p className="text-foreground">{task.departmentOutcomeLink || 'N/A'}</p>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" />Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{task.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Target className="mr-2 h-5 w-5 text-primary" />Outcomes/Results</h3>
            <p className="text-muted-foreground whitespace-pre-line">{task.outcomes}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Award className="mr-2 h-5 w-5 text-primary" />Learning Objectives Achieved</h3>
            <p className="text-muted-foreground whitespace-pre-line">{task.learningObjectives}</p>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Paperclip className="mr-2 h-5 w-5 text-primary" />Attachments</h3>
              <ul className="list-disc pl-5 space-y-1">
                {task.attachments.map((file, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-base text-accent hover:text-accent/80" asChild>
                      <a href={`/path/to/attachments/${file}`} target="_blank" rel="noopener noreferrer" data-ai-hint="document file">
                        {file}
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
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Supervisor Comments</h3>
                <Card className="bg-muted/50 p-4 border-l-4 border-primary">
                    <p className="text-foreground whitespace-pre-line">{task.supervisorComments}</p>
                </Card>
            </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
