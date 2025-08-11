'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, BookOpen, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/supabase-auth-context';
import { 
  useRealtimeStudents, 
  useRealtimeCompanies, 
  useRealtimeInternships,
  useRealtimeDailyReports,
  useRealtimeLocationCheckIns,
  useRealtimeIssues
} from '@/hooks/use-realtime-data';

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<any>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

function MetricCard({ title, value, description, icon: Icon, trend, loading }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          ) : (
            value.toLocaleString()
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RealtimeMetrics() {
  const { user, role } = useAuth();
  
  // Real-time data hooks
  const { data: students, loading: studentsLoading } = useRealtimeStudents();
  const { data: companies, loading: companiesLoading } = useRealtimeCompanies();
  const { data: internships, loading: internshipsLoading } = useRealtimeInternships();
  const { data: dailyReports, loading: reportsLoading } = useRealtimeDailyReports();
  const { data: checkIns, loading: checkInsLoading } = useRealtimeLocationCheckIns();
  const { data: issues, loading: issuesLoading } = useRealtimeIssues();

  // Calculate metrics based on real-time data
  const metrics = React.useMemo(() => {
    const activeInternships = internships.filter(i => i.status === 'IN_PROGRESS').length;
    const pendingInternships = internships.filter(i => i.status === 'PENDING').length;
    const completedInternships = internships.filter(i => i.status === 'COMPLETED').length;
    
    const recentReports = dailyReports.filter(r => {
      const reportDate = new Date(r.report_date);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return reportDate >= lastWeek;
    }).length;

    const recentCheckIns = checkIns.filter(c => {
      const checkInDate = new Date(c.check_in_timestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return checkInDate >= today;
    }).length;

    const openIssues = issues.filter(i => i.status === 'OPEN').length;

    return {
      totalStudents: students.length,
      totalCompanies: companies.length,
      activeInternships,
      pendingInternships,
      completedInternships,
      recentReports,
      recentCheckIns,
      openIssues,
    };
  }, [students, companies, internships, dailyReports, checkIns, issues]);

  // Role-based metric configuration
  const getMetricsForRole = () => {
    const baseMetrics = [
      {
        title: "Total Students",
        value: metrics.totalStudents,
        description: "Registered students",
        icon: Users,
        loading: studentsLoading,
      },
      {
        title: "Partner Companies",
        value: metrics.totalCompanies,
        description: "Active company partners",
        icon: Building2,
        loading: companiesLoading,
      },
      {
        title: "Active Internships",
        value: metrics.activeInternships,
        description: "Currently in progress",
        icon: Calendar,
        loading: internshipsLoading,
      },
    ];

    if (role === 'ADMIN' || role === 'LECTURER') {
      return [
        ...baseMetrics,
        {
          title: "Pending Approvals",
          value: metrics.pendingInternships,
          description: "Awaiting review",
          icon: BookOpen,
          loading: internshipsLoading,
        },
        {
          title: "Recent Reports",
          value: metrics.recentReports,
          description: "Reports this week",
          icon: BookOpen,
          loading: reportsLoading,
        },
        {
          title: "Today's Check-ins",
          value: metrics.recentCheckIns,
          description: "Location verifications",
          icon: MapPin,
          loading: checkInsLoading,
        },
      ];
    }

    if (role === 'STUDENT') {
      const userInternships = internships.filter(i => i.student_id === user?.id);
      const userReports = dailyReports.filter(r => r.student_id === parseInt(user?.id || '0'));
      
      return [
        {
          title: "My Internships",
          value: userInternships.length,
          description: "Total internships",
          icon: Calendar,
          loading: internshipsLoading,
        },
        {
          title: "Reports Submitted",
          value: userReports.length,
          description: "All time reports",
          icon: BookOpen,
          loading: reportsLoading,
        },
        {
          title: "Check-ins Today",
          value: checkIns.filter(c => 
            c.student_id === parseInt(user?.id || '0') &&
            new Date(c.check_in_timestamp).toDateString() === new Date().toDateString()
          ).length,
          description: "Location verifications",
          icon: MapPin,
          loading: checkInsLoading,
        },
      ];
    }

    return baseMetrics;
  };

  const displayMetrics = getMetricsForRole();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Metrics</h2>
          <p className="text-muted-foreground">
            Real-time overview of your internship management system
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          ● Live Data
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {(role === 'ADMIN' || role === 'LECTURER') && metrics.openIssues > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Attention Required</CardTitle>
            <CardDescription className="text-orange-700">
              There are {metrics.openIssues} open issues that need attention.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}