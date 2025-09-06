
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import DailyTaskForm from '@/components/forms/daily-task-form';
import { ClipboardList, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { getTaskById } from '@/lib/services/task.service';
import type { DailyTask } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [task, setTask] = React.useState<DailyTask | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (taskId) {
      const fetchTask = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedTask = await getTaskById(taskId);
          if (fetchedTask) {
            // Ensure attachments are handled correctly; service currently stores names
            // For editing, we might want to show current attachments but not repopulate File input
            setTask({
              ...fetchedTask,
              attachments: [], // File input cannot be pre-filled with actual File objects easily from names
            });
          } else {
            setError('Task not found.');
          }
        } catch (err) {
          console.error("Failed to fetch task for editing:", err);
          setError('Failed to load task details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTask();
    } else {
      setIsLoading(false);
      setError('No task ID provided.');
    }
  }, [taskId]);

  const handleSuccess = (updatedTaskId: string) => {
    router.push(`/student/tasks/${updatedTaskId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading task for editing...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <PageHeader
          title="Error Loading Task"
          icon={AlertTriangle}
          breadcrumbs={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/student/tasks", label: "Daily Tasks" },
            { label: "Edit Task Error" }
          ]}
        />
        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-10 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-xl font-semibold text-destructive-foreground">{error || 'Task could not be loaded.'}</p>
            <Button asChild className="mt-6 rounded-lg">
              <Link href="/student/tasks">Back to Tasks List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Prepare defaultValues for the form, ensuring date is a Date object
  const formDefaultValues = {
    ...task,
    date: task.date ? new Date(task.date) : new Date(),
    // attachments are intentionally not passed as File objects to defaultValues
    // The form handles new file uploads. Existing string attachment names could be displayed separately if needed.
  };


  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Edit Daily Task"
        description="Update the details of your previously declared task."
        icon={ClipboardList}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/student/tasks", label: "Daily Tasks" },
          { href: `/student/tasks/${taskId}`, label: `Task ${taskId.substring(0,6)}...`},
          { label: "Edit" }
        ]}
      />
      <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="p-6">
            <CardTitle className="font-headline text-xl">Edit Task Details</CardTitle>
            <CardDescription>Make necessary changes and save your task.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <DailyTaskForm 
            defaultValues={formDefaultValues} 
            taskIdToEdit={taskId}
            onSuccess={handleSuccess} 
          />
          {/* Display existing attachments as strings if needed, as File inputs can't be pre-filled */}
          {task.attachments && task.attachments.length > 0 && !formDefaultValues.attachments?.length && (
             <div className="mt-4 text-sm">
                <p className="font-medium text-foreground">Current attachments (read-only):</p>
                <ul className="list-disc list-inside text-muted-foreground">
                    {task.attachments.map(att => <li key={att}>{att}</li>)}
                </ul>
                <p className="text-xs text-muted-foreground">To change attachments, please upload new files. Old ones will be replaced.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
