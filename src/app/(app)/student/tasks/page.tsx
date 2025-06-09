
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { ClipboardList, PlusCircle, Filter, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { DailyTask } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO } from 'date-fns';

export const DUMMY_TASKS: DailyTask[] = [
  { id: 'task1', date: '2024-07-28', description: 'Develop user authentication module.', outcomes: 'Authentication flow completed.', learningObjectives: 'Learned JWT implementation.', studentId: 'stu1', status: 'APPROVED', departmentOutcomeLink: "DO1.2" },
  { id: 'task2', date: '2024-07-29', description: 'Design database schema for posts.', outcomes: 'Schema designed and reviewed.', learningObjectives: 'Understanding of relational databases.', studentId: 'stu1', status: 'SUBMITTED' },
  { id: 'task3', date: '2024-07-30', description: 'Write API documentation.', outcomes: 'Initial draft completed.', learningObjectives: 'API documentation best practices.', studentId: 'stu1', status: 'PENDING' },
  { id: 'task4', date: '2024-07-27', description: 'Refactor old legacy code module for payments.', outcomes: 'Improved performance by 15%.', learningObjectives: 'Code refactoring strategies.', studentId: 'stu1', status: 'REJECTED' },
];

const statusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

export default function TasksPage() {
  const [filteredTasks, setFilteredTasks] = React.useState<DailyTask[]>(DUMMY_TASKS);
  const [statusFilter, setStatusFilter] = React.useState<Record<DailyTask['status'], boolean>>({
    PENDING: true,
    SUBMITTED: true,
    APPROVED: true,
    REJECTED: true,
  });
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setFilteredTasks(DUMMY_TASKS.filter(task => statusFilter[task.status]));
  }, [statusFilter]);
  
  const handleStatusFilterChange = (status: DailyTask['status']) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const TaskCardMobile: React.FC<{ task: DailyTask }> = ({ task }) => (
    <Card className="shadow-md rounded-lg overflow-hidden border-l-4" style={{borderColor: `hsl(var(--${task.status === 'APPROVED' ? 'chart-3' : task.status === 'SUBMITTED' ? 'primary' : task.status === 'REJECTED' ? 'destructive' : 'accent'}))`}}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground">Task Date</p>
            <p className="font-semibold text-foreground text-sm">{format(parseISO(task.date), "PPP")}</p>
          </div>
          <Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusColors[task.status])}>
            {task.status}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="text-sm text-foreground line-clamp-3">{task.description}</p>
        </div>
        <div className="pt-2 flex gap-2">
          <Link href={`/student/tasks/${task.id}`} passHref className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-md text-xs">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
            </Button>
          </Link>
          {task.status === 'PENDING' && (
            <Link href={`/student/tasks/edit/${task.id}`} passHref className="flex-1">
              <Button variant="default" size="sm" className="w-full rounded-md text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Daily Tasks"
        description="Declare your daily tasks, track progress, and view history."
        icon={ClipboardList}
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }, { label: "Daily Tasks" }]}
        actions={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card hover:bg-accent hover:text-accent-foreground rounded-lg">
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
            <Link href="/student/tasks/new" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                <PlusCircle className="mr-2 h-4 w-4" /> Declare New Task
              </Button>
            </Link>
          </div>
        }
      />

      <Card className={cn("shadow-lg rounded-xl", isMobile ? "bg-transparent border-none shadow-none" : "overflow-hidden")}>
        {!isMobile && (
            <CardHeader>
            <CardTitle className="font-headline text-lg">Task History</CardTitle>
            <CardDescription>A log of all your declared daily tasks.</CardDescription>
            </CardHeader>
        )}
        <CardContent className={cn(isMobile ? "p-0" : "p-0")}>
          {filteredTasks.length > 0 ? (
             isMobile ? (
                <div className="space-y-4">
                  {filteredTasks.map((task) => <TaskCardMobile key={task.id} task={task} />)}
                </div>
              ) : (
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
                    <TableCell>{format(parseISO(task.date), "PPP")}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusColors[task.status])}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Link href={`/student/tasks/${task.id}`} passHref>
                        <Button variant="ghost" size="sm" className="rounded-md"><Eye className="mr-1 h-4 w-4"/>View</Button>
                      </Link>
                       {task.status === 'PENDING' && (
                        <Link href={`/student/tasks/edit/${task.id}`} passHref>
                            <Button variant="ghost" size="sm" className="rounded-md"><Edit3 className="mr-1 h-4 w-4"/>Edit</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             )
          ) : (
            <div className={cn("text-center py-12 text-muted-foreground", isMobile ? "p-0 pt-8" : "p-6")}>
              <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold">No tasks found.</p>
              <p>Declare a new task or adjust your filters.</p>
            </div>
          )}
        </CardContent>
         {!isMobile && filteredTasks.length > 0 && (
          <CardFooter className="justify-end p-4 border-t">
             <p className="text-sm text-muted-foreground">Showing {filteredTasks.length} of {DUMMY_TASKS.length} tasks</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
