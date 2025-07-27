
'use client';
import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { ClipboardList, PlusCircle, Filter, Eye, Edit3, Loader2 } from 'lucide-react'; // Added Loader2
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
import { getTasksForStudent } from '@/lib/services/task.service'; // Import service
import { createTask, updateTaskStatus } from '@/lib/services/task.service';

const statusColors: Record<DailyTask['status'], string> = {
  PENDING: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.2)]',
  SUBMITTED: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]',
  APPROVED: 'bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.2)]',
  REJECTED: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.2)]',
};

export default function TasksPage() {
  const [allTasks, setAllTasks] = React.useState<DailyTask[]>([]);
  const [filteredTasks, setFilteredTasks] = React.useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<Record<DailyTask['status'], boolean>>({
    PENDING: true,
    SUBMITTED: true,
    APPROVED: true,
    REJECTED: true,
  });
  const isMobile = useIsMobile();
  const [studentId, setStudentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem('userEmail'); // Assuming studentId is stored as email
      setStudentId(id);
    }
  }, []);

  React.useEffect(() => {
    async function loadTasks() {
      if (!studentId) return;
      setIsLoading(true);
      const tasksFromService = await getTasksForStudent(studentId);
      setAllTasks(tasksFromService);
      setFilteredTasks(tasksFromService.filter(task => statusFilter[task.status]));
      setIsLoading(false);
    }
    loadTasks();
  }, [studentId, statusFilter]); // Re-fetch if studentId changes or filter changes
  
  const handleStatusFilterChange = (status: DailyTask['status']) => {
    setStatusFilter(prev => {
        const newFilter = { ...prev, [status]: !prev[status] };
        setFilteredTasks(allTasks.filter(task => newFilter[task.status]));
        return newFilter;
    });
  };

  const TaskCardMobile: React.FC<{ task: DailyTask }> = ({ task }) => (
    <Card className="shadow-lg rounded-xl overflow-hidden border-l-4" style={{borderColor: `hsl(var(--${task.status === 'APPROVED' ? 'chart-3' : task.status === 'SUBMITTED' ? 'primary' : task.status === 'REJECTED' ? 'destructive' : 'accent'}))`}}>
      <CardHeader className="p-3 bg-muted/30">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-semibold text-foreground">Task: {format(parseISO(task.date), "PPP")}</CardTitle>
          <Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusColors[task.status])}>
            {task.status}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">{format(parseISO(task.date), "EEEE")}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 text-xs">
        <p className="text-muted-foreground mb-1">Description:</p>
        <p className="text-foreground line-clamp-3">{task.description}</p>
      </CardContent>
      <CardFooter className="p-3 border-t bg-muted/20 flex gap-2">
          <Link href={`/student/tasks/${task.id}`} passHref className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
            </Button>
          </Link>
          {task.status === 'PENDING' && (
            <Link href={`/student/tasks/edit/${task.id}`} passHref className="flex-1">
              <Button variant="default" size="sm" className="w-full rounded-lg text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
            </Link>
          )}
      </CardFooter>
    </Card>
  );

  if (isLoading && !studentId) {
    return <div className="p-6 text-center">Authenticating...</div>;
  }
  if (isLoading && studentId) {
    return (
        <div className="flex items-center justify-center h-full p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Loading tasks...</p>
        </div>
      );
  }

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
        <CardContent className={cn(isMobile && filteredTasks.length > 0 ? "p-0 space-y-4" : "p-0")}>
          {filteredTasks.length > 0 ? (
             isMobile ? (
                filteredTasks.map((task) => <TaskCardMobile key={task.id} task={task} />)
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
             <p className="text-sm text-muted-foreground">Showing {filteredTasks.length} of {allTasks.length} tasks</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

    