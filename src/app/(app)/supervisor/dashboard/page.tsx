
'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, ClipboardList, Star, CheckCircle, Clock, AlertTriangle, Building, Loader2, Users2, Activity, CheckSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmptyState from '@/components/shared/empty-state';
import { SupervisorApiService } from '@/lib/services/supervisorApi';
import { useToast } from '@/hooks/use-toast';

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

const SupervisorDashboardStatCard: React.FC<{ 
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

interface SupervisorIntern {
  id: string; 
  name: string; 
  university: string; 
  department: string;
  avatar?: string | null; 
  pendingTasks: number; 
  progress: number;
  status: string;
}

interface SupervisorStats {
  totalInterns: number;
  activeInterns: number;
  pendingEvaluations: number;
  averageRating: number;
  completedTasks: number;
  overdueReports: number;
  monthlyHours: number;
  pendingTasks: number;
  pendingReports: number;
}

const SupervisorInternCardMobile: React.FC<{ intern: SupervisorIntern }> = ({ intern }) => (
  <Card className="shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={intern.avatar || undefined} alt={intern.name} />
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(intern.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{intern.name}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{intern.university}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 space-y-1.5 text-xs">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Progress:</span>
        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{intern.progress}%</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Pending Tasks:</span>
        <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{intern.pendingTasks}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Status:</span>
        <Badge variant={intern.status === 'active' ? "default" : "secondary"} className="text-xs px-1.5 py-0.5">
          {intern.status === 'active' ? 'Active' : intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
        </Badge>
      </div>
    </CardContent>
    <CardFooter className="p-3 border-t bg-muted/20">
      <Link href={`/supervisor/interns/details/${intern.id}`} passHref className="w-full">
        <Button variant="outline" size="sm" className="w-full rounded-lg text-xs py-2">
          View Profile
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

export default function SupervisorDashboardPage() {
  const { toast } = useToast();
  const [supervisorStats, setSupervisorStats] = React.useState<SupervisorStats | null>(null);
  const [supervisedInterns, setSupervisedInterns] = React.useState<SupervisorIntern[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingInterns, setIsLoadingInterns] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Supervisor' : 'Supervisor';
  const isMobile = useIsMobile();

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingInterns(true);
      
      const [statsData, internsData] = await Promise.all([
        SupervisorApiService.getDashboardStats(),
        SupervisorApiService.getMyInterns({ limit: 6 })
      ]);

      if (statsData && typeof statsData === 'object') {
        setSupervisorStats({
          totalInterns: (statsData as any).totalInterns || 0,
          activeInterns: (statsData as any).activeInterns || 0,
          pendingEvaluations: (statsData as any).pendingEvaluations || 0,
          averageRating: (statsData as any).averageRating || 0,
          completedTasks: (statsData as any).tasksCompleted || 0,
          overdueReports: (statsData as any).overdueReports || 0,
          monthlyHours: (statsData as any).monthlyHours || 0,
          pendingTasks: (statsData as any).activeTasks || 0,
          pendingReports: (statsData as any).pendingReports || 0
        });
      } else {
        // Fallback data if API fails
        setSupervisorStats({
          totalInterns: 0,
          activeInterns: 0,
          pendingEvaluations: 0,
          averageRating: 0,
          completedTasks: 0,
          overdueReports: 0,
          monthlyHours: 0,
          pendingTasks: 0,
          pendingReports: 0
        });
      }

      if (internsData && Array.isArray(internsData)) {
        setSupervisedInterns(internsData.map((intern: any) => {
          const student = intern.students;
          const user = student?.users;
          const internName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
          
          return {
            id: intern.id.toString(),
            name: internName,
            university: student?.faculties?.name || 'Unknown University',
            department: student?.departments?.name || 'Unknown Department',
            avatar: null, // Profile pictures not implemented
            pendingTasks: intern.pendingTasks || 0,
            progress: intern.progress || 0,
            status: intern.status || 'active'
          };
        }));
      } else {
        setSupervisedInterns([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsLoadingInterns(false);
    }
  };

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Supervisor Dashboard"
        description="Manage and evaluate your company's interns."
        icon={Briefcase}
        breadcrumbs={[{ href: "/supervisor/dashboard", label: "Supervisor Dashboard" }]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SupervisorDashboardStatCard 
          title="Assigned Interns" 
          value={supervisorStats?.totalInterns ?? '...'} 
          icon={Users2} 
          description="Under your supervision"
          actionLink="/supervisor/interns"
          actionLabel="View My Interns"
          isLoading={isLoading} 
        />
        <SupervisorDashboardStatCard 
          title="Pending Task Approvals" 
          value={supervisorStats?.pendingEvaluations ?? '...'} 
          icon={CheckSquare} 
          description="Tasks awaiting your review"
          actionLink="/supervisor/interns/approve-tasks"
          actionLabel="Review Tasks"
          variant="warning"
          isLoading={isLoading}
        />
        <SupervisorDashboardStatCard 
          title="Task Completion Rate" 
          value={supervisorStats && supervisorStats.totalInterns > 0 ? 
            `${Math.round(((supervisorStats.completedTasks || 0) / Math.max((supervisorStats.completedTasks || 0) + (supervisorStats.pendingTasks || 0), 1)) * 100)}%` : 
            '0%'
          } 
          icon={Activity} 
          description="Overall task completion"
          actionLink="/supervisor/interns"
          actionLabel="Monitor Activity"
          isLoading={isLoading}
        />
      </div>

       <Card className="shadow-lg rounded-xl mt-6">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">My Interns</CardTitle>
                    <CardDescription>Quick overview of interns you are supervising.</CardDescription>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-0 space-y-4" : "p-0")}>
                    {isLoadingInterns ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading interns...</span>
                        </div>
                    ) : supervisedInterns.length === 0 ? (
                        <EmptyState
                            icon={Users2}
                            title="No Interns Assigned"
                            description="You don't have any interns assigned to you yet. Contact your administrator if you expect to have interns."
                        />
                    ) : isMobile ? (
                        <div className="p-4 space-y-4">
                            {supervisedInterns.map(intern => <SupervisorInternCardMobile key={intern.id} intern={intern} />)}
                        </div>
                    ) : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Intern</TableHead>
                                <TableHead>University/Program</TableHead>
                                <TableHead className="text-center">Progress</TableHead>
                                <TableHead className="text-center">Pending Tasks</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisedInterns.map(intern => (
                                <TableRow key={intern.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={intern.avatar || undefined} alt={intern.name} />
                                                <AvatarFallback>{getInitials(intern.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{intern.name}</p>
                                                <p className="text-sm text-muted-foreground">{intern.department}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{intern.university}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{intern.progress}%</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"}>
                                            {intern.pendingTasks}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={intern.status === 'active' ? "default" : "secondary"}>
                                            {intern.status === 'active' ? 'Active' : intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/supervisor/interns/details/${intern.id}`} passHref>
                                            <Button variant="ghost" size="sm">View Profile</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
                {!isLoadingInterns && supervisedInterns.length > 0 && (
                    <CardFooter className="justify-end p-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/supervisor/interns">View All Interns</Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
    </div>
  );
}
