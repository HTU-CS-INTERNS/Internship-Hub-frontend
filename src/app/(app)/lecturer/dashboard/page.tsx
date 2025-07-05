
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, ClipboardList, FileCheck, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

const LecturerDashboardStatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  description?: string; 
  actionLink?: string; 
  actionLabel?: string; 
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}> = ({ title, value, icon: Icon, description, actionLink, actionLabel, isLoading, variant = 'default' }) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    destructive: 'border-red-200 bg-red-50',
  };

  return (
    <Card className={`shadow-lg rounded-xl ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[36px] flex items-center"> 
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
        {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
      {actionLink && actionLabel && !isLoading && (
        <CardFooter>
          <Link href={actionLink} className="w-full">
            <Button variant="outline" className="w-full rounded-lg">{actionLabel}</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

interface AssignedStudent {
  id: string; name: string; department: string; avatar: string; dataAiHint: string; overdueTasks: number; pendingReports: number;
}
interface LecturerStats {
  totalStudents: number;
  activeInternships: number;
  pendingReports: number;
  completedReports: number;
  pendingTasks: number;
  averageScore: number;
  messagesUnread: number;
}
const LecturerStudentCardMobile: React.FC<{ student: AssignedStudent }> = ({ student }) => (
  <Card className="shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.dataAiHint} />
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{student.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{student.department}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 space-y-1.5 text-xs">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Overdue Tasks:</span>
        <Badge variant={student.overdueTasks > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{student.overdueTasks}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Pending Reports:</span>
        <Badge variant={student.pendingReports > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{student.pendingReports}</Badge>
      </div>
    </CardContent>
    <CardFooter className="p-3 border-t bg-muted/20">
      <Link href={`/assignments/student/${student.id}`} passHref className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
           View Details
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

export default function LecturerDashboardPage() {
  const [lecturerStats, setLecturerStats] = React.useState<LecturerStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Lecturer' : 'Lecturer';
  const isMobile = useIsMobile();
  const assignedStudents: AssignedStudent[] = [
        { id: 'std1', name: 'Alice Wonderland', department: 'Software Engineering', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', overdueTasks: 1, pendingReports: 0 },
        { id: 'std2', name: 'Bob The Intern', department: 'Mechanical Engineering', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', overdueTasks: 0, pendingReports: 1 },
        { id: 'std3', name: 'Charlie Brown', department: 'Marketing', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', overdueTasks: 2, pendingReports: 2 },
    ];

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 900));
        
        const fetchedData: LecturerStats = {
          totalStudents: 24,
          activeInternships: 22,
          pendingReports: 8,
          completedReports: 156,
          pendingTasks: 5,
          averageScore: 87.5,
          messagesUnread: 3,
        };
        setLecturerStats(fetchedData);
      } catch (err) {
        console.error("Error fetching lecturer dashboard stats:", err);
        setError("Failed to load dashboard statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Lecturer Dashboard"
        description="Monitor and guide your students' internship progress."
        icon={BookOpen}
        breadcrumbs={[{ href: "/lecturer/dashboard", label: "Lecturer Dashboard" }]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <LecturerDashboardStatCard 
          title="Total Students" 
          value={lecturerStats?.totalStudents ?? '...'} 
          icon={Users} 
          description="Students under supervision"
          actionLink="/lecturer/students"
          actionLabel="View Students"
          isLoading={isLoading} 
        />
        <LecturerDashboardStatCard 
          title="Active Internships" 
          value={lecturerStats?.activeInternships ?? '...'} 
          icon={CheckCircle} 
          description="Currently ongoing"
          variant="success"
          isLoading={isLoading}
        />
        <LecturerDashboardStatCard 
          title="Pending Reports" 
          value={lecturerStats?.pendingReports ?? '...'} 
          icon={FileCheck} 
          description="Awaiting review"
          actionLink="/lecturer/reports"
          actionLabel="Review Reports"
          variant={lecturerStats && lecturerStats.pendingReports > 10 ? "warning" : "default"}
          isLoading={isLoading}
        />
        <LecturerDashboardStatCard 
          title="Unread Messages" 
          value={lecturerStats?.messagesUnread ?? '...'} 
          icon={MessageSquare} 
          description="Student communications"
          actionLink="/lecturer/messages"
          actionLabel="View Messages"
          variant={lecturerStats && lecturerStats.messagesUnread > 5 ? "warning" : "default"}
          isLoading={isLoading}
        />
      </div>

       <Card className="shadow-lg rounded-xl mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">My Students</CardTitle>
                    <CardDescription>Quick overview of students you are supervising.</CardDescription>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
                    {isMobile ? (
                        assignedStudents.map(student => <LecturerStudentCardMobile key={student.id} student={student} />)
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-center">Overdue Tasks</TableHead>
                                    <TableHead className="text-center">Pending Reports</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignedStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.dataAiHint} />
                                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{student.department}</TableCell>
                                        <TableCell className="text-center"><Badge variant={student.overdueTasks > 0 ? "destructive" : "secondary"}>{student.overdueTasks}</Badge></TableCell>
                                        <TableCell className="text-center"><Badge variant={student.pendingReports > 0 ? "destructive" : "secondary"}>{student.pendingReports}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/assignments/student/${student.id}`} passHref>
                                                <Button variant="ghost" size="sm">View Details</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                 <CardFooter className="justify-end p-4 border-t">
                    <Button variant="outline" size="sm" asChild><Link href="/assignments">View All Students</Link></Button>
                </CardFooter>
            </Card>
    </div>
  );
}
