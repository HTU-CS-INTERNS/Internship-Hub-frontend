'use client';

import * as React from 'react';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, ClipboardList, FileCheck, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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

interface LecturerStats {
  totalStudents: number;
  activeInternships: number;
  pendingReports: number;
  completedReports: number;
  pendingTasks: number;
  averageScore: number;
  messagesUnread: number;
}

export default function LecturerDashboardPage() {
  const [lecturerStats, setLecturerStats] = React.useState<LecturerStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>Reports requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">John Doe - Week 7</p>
                    <p className="text-sm text-muted-foreground">TechCorp Ghana</p>
                  </div>
                  <span className="text-sm text-yellow-600">Pending Review</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">Alice Wonderland - Week 6</p>
                    <p className="text-sm text-muted-foreground">Marketing Pro Ltd</p>
                  </div>
                  <span className="text-sm text-yellow-600">Pending Review</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bob Builder - Week 7</p>
                    <p className="text-sm text-muted-foreground">Engineering Corp</p>
                  </div>
                  <span className="text-sm text-green-600">Approved</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/lecturer/reports" className="w-full">
              <Button variant="outline" className="w-full">Review All Reports</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Student Performance
            </CardTitle>
            <CardDescription>Overall performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-2xl font-bold text-green-600">87.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Students Above 80%</span>
                  <span className="font-medium">18/24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Students Below 60%</span>
                  <span className="font-medium text-red-600">2/24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reports On Time</span>
                  <span className="font-medium">94%</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/lecturer/analytics" className="w-full">
              <Button variant="outline" className="w-full">View Analytics</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
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
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium">5 pending task assignments</p>
                  <p className="text-sm text-muted-foreground">Assign weekly tasks to students</p>
                </div>
                <Link href="/lecturer/tasks">
                  <Button size="sm" variant="outline">Assign</Button>
                </Link>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">3 unread messages</p>
                  <p className="text-sm text-muted-foreground">Student questions and updates</p>
                </div>
                <Link href="/lecturer/messages">
                  <Button size="sm" variant="outline">Reply</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
