
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, ClipboardList, FileCheck, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Loader2, Search, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/shared/empty-state';
import { LecturerApiService } from '@/lib/services/lecturerApi';
import { useToast } from '@/hooks/use-toast';

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
  id: string; 
  name: string; 
  email: string;
  department: string; 
  university: string;
  avatar?: string; 
  overdueTasks: number; 
  pendingReports: number;
  progress: number;
  status: string;
  lastActivity?: string;
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
          <AvatarImage src={student.avatar} alt={student.name} />
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
        <span className="text-muted-foreground">Progress:</span>
        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{student.progress}%</Badge>
      </div>
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
      <Link href={`/lecturer/students/${student.id}`} passHref className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
           View Details
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

export default function LecturerDashboardPage() {
  const { toast } = useToast();
  const [lecturerStats, setLecturerStats] = React.useState<LecturerStats | null>(null);
  const [assignedStudents, setAssignedStudents] = React.useState<AssignedStudent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [error, setError] = React.useState<string | null>(null);
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Lecturer' : 'Lecturer';
  const isMobile = useIsMobile();

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingStudents(true);
      
      const [statsData, studentsData] = await Promise.all([
        LecturerApiService.getDashboardStats(),
        LecturerApiService.getMyStudents({ limit: 10 })
      ]);

      if (statsData && typeof statsData === 'object') {
        setLecturerStats({
          totalStudents: (statsData as any).totalStudents || 0,
          activeInternships: (statsData as any).activeInternships || 0,
          pendingReports: (statsData as any).pendingReports || 0,
          completedReports: (statsData as any).completedReports || 0,
          pendingTasks: (statsData as any).pendingTasks || 0,
          averageScore: (statsData as any).averageScore || 0,
          messagesUnread: (statsData as any).messagesUnread || 0
        });
      } else {
        // Fallback data if API fails
        setLecturerStats({
          totalStudents: 0,
          activeInternships: 0,
          pendingReports: 0,
          completedReports: 0,
          pendingTasks: 0,
          averageScore: 0,
          messagesUnread: 0
        });
      }

      if (studentsData && Array.isArray(studentsData)) {
        setAssignedStudents(studentsData.map((student: any) => ({
          id: student.id,
          name: student.name || student.user?.name || 'Unknown',
          email: student.email || student.user?.email || 'No email',
          department: student.department || 'Unknown Department',
          university: student.university || student.user?.university || 'Unknown University',
          avatar: student.avatar || student.user?.avatar,
          overdueTasks: student.overdueTasks || 0,
          pendingReports: student.pendingReports || 0,
          progress: student.progress || 0,
          status: student.status || 'active',
          lastActivity: student.lastActivity || 'No recent activity'
        })));
      } else {
        setAssignedStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsLoadingStudents(false);
    }
  };

  const filteredStudents = assignedStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        actions={
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh Data
          </Button>
        }
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
          actionLink="/lecturer/internships"
          actionLabel="View Internships"
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

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg rounded-xl mt-6">
        <CardHeader>
          <CardTitle className="font-headline text-lg">My Students</CardTitle>
          <CardDescription>Quick overview of students you are supervising.</CardDescription>
        </CardHeader>
        <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
          {isLoadingStudents ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading students...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm || statusFilter !== 'all' ? "No Students Found" : "No Students Assigned"}
              description={
                searchTerm || statusFilter !== 'all'
                  ? "No students match your current search criteria."
                  : "You don't have any students assigned to you currently."
              }
              actionLabel={
                (searchTerm || statusFilter !== 'all') ? "Clear Filters" : undefined
              }
              onAction={
                (searchTerm || statusFilter !== 'all') ? () => { 
                  setSearchTerm(''); 
                  setStatusFilter('all'); 
                } : undefined
              }
            />
          ) : isMobile ? (
            <div className="p-4 space-y-4">
              {filteredStudents.map(student => <LecturerStudentCardMobile key={student.id} student={student} />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-center">Overdue Tasks</TableHead>
                  <TableHead className="text-center">Pending Reports</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.department}</p>
                        <p className="text-xs text-muted-foreground">{student.university}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{student.progress}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={student.overdueTasks > 0 ? "destructive" : "secondary"}>
                        {student.overdueTasks}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={student.pendingReports > 0 ? "destructive" : "secondary"}>
                        {student.pendingReports}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/lecturer/students/${student.id}`} passHref>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {!isLoadingStudents && filteredStudents.length > 0 && (
          <CardFooter className="justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {assignedStudents.length} students
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/lecturer/students">View All Students</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
