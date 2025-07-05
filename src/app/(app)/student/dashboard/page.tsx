'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GraduationCap, CheckSquare, FileText, MapPin, CalendarDays, Building, Clock, TrendingUp, Loader2 } from 'lucide-react';

const StudentDashboardStatCard: React.FC<{ 
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

interface StudentStats {
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
  attendanceRate: number;
  reportsSubmitted: number;
  daysRemaining: number;
  currentWeek: number;
  totalWeeks: number;
}

export default function StudentDashboardPage() {
  const [studentStats, setStudentStats] = React.useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const fetchedData: StudentStats = {
          completedTasks: 15,
          pendingTasks: 3,
          totalTasks: 18,
          attendanceRate: 92,
          reportsSubmitted: 8,
          daysRemaining: 45,
          currentWeek: 7,
          totalWeeks: 12,
        };
        setStudentStats(fetchedData);
      } catch (err) {
        console.error("Error fetching student dashboard stats:", err);
        setError("Failed to load dashboard statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const completionRate = studentStats ? ((studentStats.completedTasks / studentStats.totalTasks) * 100).toFixed(0) : '0';

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <PageHeader
        title="Student Dashboard"
        description="Track your internship progress and manage your tasks."
        icon={GraduationCap}
        breadcrumbs={[{ href: "/student/dashboard", label: "Student Dashboard" }]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StudentDashboardStatCard 
          title="Completed Tasks" 
          value={studentStats?.completedTasks ?? '...'} 
          icon={CheckSquare} 
          description={!isLoading && studentStats ? `${completionRate}% completion rate` : undefined}
          variant="success"
          isLoading={isLoading} 
        />
        <StudentDashboardStatCard 
          title="Pending Tasks" 
          value={studentStats?.pendingTasks ?? '...'} 
          icon={Clock} 
          description="Tasks awaiting completion"
          actionLink="/student/tasks"
          actionLabel="View Tasks"
          variant={studentStats && studentStats.pendingTasks > 5 ? "warning" : "default"}
          isLoading={isLoading}
        />
        <StudentDashboardStatCard 
          title="Attendance Rate" 
          value={studentStats ? `${studentStats.attendanceRate}%` : '...'} 
          icon={MapPin} 
          description="Check-in consistency"
          actionLink="/student/check-in"
          actionLabel="Check In"
          variant={studentStats && studentStats.attendanceRate < 80 ? "warning" : "success"}
          isLoading={isLoading}
        />
        <StudentDashboardStatCard 
          title="Days Remaining" 
          value={studentStats?.daysRemaining ?? '...'} 
          icon={CalendarDays} 
          description={!isLoading && studentStats ? `Week ${studentStats.currentWeek} of ${studentStats.totalWeeks}` : undefined}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>Your submitted weekly reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Week 7 Report</span>
                  <span className="text-sm text-green-600">Submitted</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Week 6 Report</span>
                  <span className="text-sm text-green-600">Approved</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">Week 8 Report</span>
                  <span className="text-sm text-yellow-600">Pending</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/student/reports" className="w-full">
              <Button variant="outline" className="w-full">View All Reports</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Your internship placement details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="font-medium">TechCorp Ghana</p>
                  <p className="text-sm text-muted-foreground">Software Development</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Supervisor:</p>
                  <p className="text-sm text-muted-foreground">Michael Brown</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department:</p>
                  <p className="text-sm text-muted-foreground">IT Development</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/student/company" className="w-full">
              <Button variant="outline" className="w-full">View Details</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
