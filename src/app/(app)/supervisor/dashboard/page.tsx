'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, ClipboardList, Star, CheckCircle, Clock, AlertTriangle, Building, Loader2 } from 'lucide-react';

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

interface SupervisorStats {
  totalInterns: number;
  activeInterns: number;
  pendingEvaluations: number;
  averageRating: number;
  completedTasks: number;
  overdueReports: number;
  monthlyHours: number;
}

export default function SupervisorDashboardPage() {
  const [supervisorStats, setSupervisorStats] = React.useState<SupervisorStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SupervisorDashboardStatCard 
          title="Total Interns" 
          value={supervisorStats?.totalInterns ?? '...'} 
          icon={Users} 
          description="Under your supervision"
          actionLink="/supervisor/interns"
          actionLabel="View Interns"
          isLoading={isLoading} 
        />
        <SupervisorDashboardStatCard 
          title="Active Interns" 
          value={supervisorStats?.activeInterns ?? '...'} 
          icon={CheckCircle} 
          description="Currently working"
          variant="success"
          isLoading={isLoading}
        />
        <SupervisorDashboardStatCard 
          title="Pending Evaluations" 
          value={supervisorStats?.pendingEvaluations ?? '...'} 
          icon={ClipboardList} 
          description="Require assessment"
          actionLink="/supervisor/evaluations"
          actionLabel="Complete"
          variant={supervisorStats && supervisorStats.pendingEvaluations > 3 ? "warning" : "default"}
          isLoading={isLoading}
        />
        <SupervisorDashboardStatCard 
          title="Average Rating" 
          value={supervisorStats ? `${supervisorStats.averageRating}/5` : '...'} 
          icon={Star} 
          description="Intern performance"
          variant="success"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Interns
            </CardTitle>
            <CardDescription>Interns currently under your supervision</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">Computer Science - Week 7</p>
                  </div>
                  <span className="text-sm text-green-600">On Track</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Alice Wonderland</p>
                    <p className="text-sm text-muted-foreground">Marketing - Week 6</p>
                  </div>
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bob Builder</p>
                    <p className="text-sm text-muted-foreground">Engineering - Week 5</p>
                  </div>
                  <span className="text-sm text-yellow-600">Needs Support</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/supervisor/interns" className="w-full">
              <Button variant="outline" className="w-full">Manage Interns</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Recent Evaluations
            </CardTitle>
            <CardDescription>Latest performance assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">John Doe - Monthly Review</p>
                    <p className="text-sm text-muted-foreground">Completed 2 days ago</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">4.5/5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Alice Wonderland - Weekly</p>
                    <p className="text-sm text-muted-foreground">Completed 1 week ago</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">4.8/5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bob Builder - Weekly</p>
                    <p className="text-sm text-muted-foreground">Due in 2 days</p>
                  </div>
                  <span className="text-sm text-yellow-600">Pending</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/supervisor/evaluations" className="w-full">
              <Button variant="outline" className="w-full">View All Evaluations</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Action Required
          </CardTitle>
          <CardDescription>Items that need your immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium">1 overdue report review</p>
                  <p className="text-sm text-muted-foreground">Bob Builder's weekly report is 2 days overdue</p>
                </div>
                <Link href="/supervisor/reports">
                  <Button size="sm" variant="outline">Review</Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium">2 pending evaluations</p>
                  <p className="text-sm text-muted-foreground">Monthly performance reviews due this week</p>
                </div>
                <Link href="/supervisor/evaluations">
                  <Button size="sm" variant="outline">Complete</Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Building className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">Update company profile</p>
                  <p className="text-sm text-muted-foreground">Review and update internship opportunities</p>
                </div>
                <Link href="/supervisor/company">
                  <Button size="sm" variant="outline">Update</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
