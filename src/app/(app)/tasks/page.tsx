'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { ClipboardList, PlusCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DailyTask } from '@/types';

const DUMMY_TASKS: DailyTask[] = [
  { id: 'task1', date: '2024-07-28', description: 'Develop user authentication module.', outcomes: 'Authentication flow completed.', learningObjectives: 'Learned JWT implementation.', studentId: 'stu1', status: 'APPROVED', departmentOutcomeLink: "DO1.2" },
  { id: 'task2', date: '2024-07-29', description: 'Design database schema for posts.', outcomes: 'Schema designed and reviewed.', learningObjectives: 'Understanding of relational databases.', studentId: 'stu1', status: 'SUBMITTED' },
  { id: 'task3', date: '2024-07-30', description: 'Write API documentation.', outcomes: 'Initial draft completed.', learningObjectives: 'API documentation best practices.', studentId: 'stu1', status: 'PENDING' },
];


const statusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  SUBMITTED: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  APPROVED: 'bg-green-500/20 text-green-700 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-700 border-red-500/30',
};


export default function TasksPage() {
  const [filteredTasks, setFilteredTasks] = React.useState<DailyTask[]>(DUMMY_TASKS);
  const [statusFilter, setStatusFilter] = React.useState<Record<DailyTask['status'], boolean>>({
    PENDING: true,
    SUBMITTED: true,
    APPROVED: true,
    REJECTED: true,
  });

  React.useEffect(() => {
    setFilteredTasks(DUMMY_TASKS.filter(task => statusFilter[task.status]));
  }, [statusFilter]);
  
  const handleStatusFilterChange = (status: DailyTask['status']) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Daily Tasks"
        description="Declare your daily tasks, track progress, and view history."
        icon={ClipboardList}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Daily Tasks" }]}
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(statusFilter) as Array<DailyTask['status']>).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter[status]}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/tasks/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Declare New Task
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Task History</CardTitle>
          <CardDescription>A log of all your declared daily tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{new Date(task.date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/tasks/${task.id}`} passHref>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No tasks found.</p>
              <p>Declare a new task or adjust your filters.</p>
            </div>
          )}
        </CardContent>
         {filteredTasks.length > 0 && (
          <CardFooter className="justify-end">
             <p className="text-sm text-muted-foreground">Showing {filteredTasks.length} of {DUMMY_TASKS.length} tasks</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
