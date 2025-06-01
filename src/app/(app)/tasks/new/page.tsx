'use client';
import PageHeader from '@/components/shared/page-header';
import DailyTaskForm from '@/components/forms/daily-task-form';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewTaskPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Declare New Daily Task"
        description="Fill in the details of the task you performed today."
        icon={ClipboardList}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/tasks", label: "Daily Tasks" },
          { label: "New Task" }
        ]}
      />
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-xl">Task Details</CardTitle>
            <CardDescription>Provide a clear description of your task, its outcomes, and what you learned.</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyTaskForm />
        </CardContent>
      </Card>
    </div>
  );
}
