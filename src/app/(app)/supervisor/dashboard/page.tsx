
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
  id: string; name: string; university: string; avatar: string; dataAiHint: string; pendingTasks: number; pendingReports: number;
}
interface SupervisorStats {
  totalInterns: number;
  activeInterns: number;
  pendingEvaluations: number;
  averageRating: number;
  completedTasks: number;
  overdueReports: number;
  monthlyHours: number;
}

const SupervisorInternCardMobile: React.FC<{ intern: SupervisorIntern }> = ({ intern }) => (
  <Card className="shadow-lg rounded-xl overflow-hidden">
    <CardHeader className="p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint={intern.dataAiHint} />
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
        <span className="text-muted-foreground">Pending Tasks:</span>
        <Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{intern.pendingTasks}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Pending Reports:</span>
        <Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0.5">{intern.pendingReports}</Badge>
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
  const [supervisorStats, setSupervisorStats] = React.useState<SupervisorStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Supervisor' : 'Supervisor';
  const isMobile = useIsMobile();
  const supervisedInterns: SupervisorIntern[] = [
        { id: 'intern1', name: 'Samuel Green', university: 'State University - CompSci', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', pendingTasks: 2, pendingReports: 1 },
        { id: 'intern2', name: 'Olivia Blue', university: 'Tech Institute - Design', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'person portrait', pendingTasks: 0, pendingReports: 0 },
    ];


  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fetchedData: SupervisorStats = {
          totalInterns: 6,
          activeInterns: 5,
          pendingEvaluations: 2,
          averageRating: 4.2,
          completedTasks: 28,
          overdueReports: 1,
          monthlyHours: 168,
        };
        setSupervisorStats(fetchedData);
      } catch (err) {
        console.error("Error fetching supervisor dashboard stats:", err);
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
          title="Pending Approvals" 
          value={supervisorStats?.pendingEvaluations ?? '...'} 
          icon={CheckSquare} 
          description="3 Tasks, 1 Report"
          actionLink="/supervisor/interns/approve-reports"
          actionLabel="Review Submissions"
          variant="warning"
          isLoading={isLoading}
        />
        <SupervisorDashboardStatCard 
          title="Intern Activity" 
          value={'High'} 
          icon={Activity} 
          description="Most interns active daily"
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
                    {isMobile ? (
                        supervisedInterns.map(intern => <SupervisorInternCardMobile key={intern.id} intern={intern} />)
                    ) : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Intern</TableHead>
                                <TableHead>University/Program</TableHead>
                                <TableHead className="text-center">Pending Tasks</TableHead>
                                <TableHead className="text-center">Pending Reports</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisedInterns.map(intern => (
                                <TableRow key={intern.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={intern.avatar} alt={intern.name} data-ai-hint={intern.dataAiHint} />
                                                <AvatarFallback>{getInitials(intern.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{intern.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{intern.university}</TableCell>
                                    <TableCell className="text-center"><Badge variant={intern.pendingTasks > 0 ? "destructive" : "secondary"}>{intern.pendingTasks}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant={intern.pendingReports > 0 ? "destructive" : "secondary"}>{intern.pendingReports}</Badge></TableCell>
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
                 <CardFooter className="justify-end p-4 border-t">
                    <Button variant="outline" size="sm" asChild><Link href="/supervisor/interns">View All Interns</Link></Button>
                </CardFooter>
            </Card>
    </div>
  );
}
