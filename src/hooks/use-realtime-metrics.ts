'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';

// Base metrics interface
export interface BaseMetrics {
  lastUpdated: string;
}

// Student-specific metrics
export interface StudentMetrics extends BaseMetrics {
  totalCheckIns: number;
  totalReports: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  attendanceRate: number;
  averageRating: number;
  internshipStatus: 'NOT_SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  currentStreak: number; // consecutive check-ins
  thisWeekCheckIns: number;
  thisWeekReports: number;
}

// Admin-specific metrics
export interface AdminMetrics extends BaseMetrics {
  totalStudents: number;
  totalInternships: number;
  activeInternships: number;
  pendingApprovals: number;
  totalCompanies: number;
  totalLecturers: number;
  totalSupervisors: number;
  averageAttendanceRate: number;
  recentCheckIns: number;
  todayReports: number;
  activeAlerts: number;
}

// Lecturer-specific metrics
export interface LecturerMetrics extends BaseMetrics {
  totalStudents: number;
  studentsToReview: number;
  averagePerformance: number;
  pendingReports: number;
  completedEvaluations: number;
  activeTasks: number;
  studentsOnTime: number;
  studentsLate: number;
}

// Supervisor-specific metrics  
export interface SupervisorMetrics extends BaseMetrics {
  assignedStudents: number;
  todayAttendance: number;
  pendingTasks: number;
  completedProjects: number;
  averageProductivity: number;
  studentsNeedingAttention: number;
  recentSubmissions: number;
}

// Hook configuration
interface UseRealtimeMetricsConfig {
  role: 'student' | 'admin' | 'lecturer' | 'supervisor';
  userId?: string;
  refreshInterval?: number; // in milliseconds, default 30 seconds
  autoRefresh?: boolean;
}

// Return type based on role
type MetricsType<T extends string> = 
  T extends 'student' ? StudentMetrics :
  T extends 'admin' ? AdminMetrics :
  T extends 'lecturer' ? LecturerMetrics :
  T extends 'supervisor' ? SupervisorMetrics :
  BaseMetrics;

export function useRealtimeMetrics<T extends 'student' | 'admin' | 'lecturer' | 'supervisor'>(
  config: UseRealtimeMetricsConfig & { role: T }
) {
  const [metrics, setMetrics] = React.useState<MetricsType<T> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    role,
    userId = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'demo_user' : 'demo_user',
    refreshInterval = 30000, // 30 seconds
    autoRefresh = true
  } = config;

  const fetchMetrics = React.useCallback(async (): Promise<MetricsType<T>> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const baseMetrics = {
      lastUpdated: new Date().toISOString(),
    };

    switch (role) {
      case 'student':
        return {
          ...baseMetrics,
          totalCheckIns: Math.floor(Math.random() * 150) + 50,
          totalReports: Math.floor(Math.random() * 80) + 20,
          totalTasks: Math.floor(Math.random() * 45) + 15,
          completedTasks: Math.floor(Math.random() * 35) + 10,
          pendingTasks: Math.floor(Math.random() * 8) + 2,
          overdueTasks: Math.floor(Math.random() * 3),
          attendanceRate: Math.floor(Math.random() * 25) + 75, // 75-100%
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
          internshipStatus: ['NOT_SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 4)] as any,
          currentStreak: Math.floor(Math.random() * 20) + 1,
          thisWeekCheckIns: Math.floor(Math.random() * 7),
          thisWeekReports: Math.floor(Math.random() * 5),
        } as MetricsType<T>;

      case 'admin':
        return {
          ...baseMetrics,
          totalStudents: Math.floor(Math.random() * 500) + 750,
          totalInternships: Math.floor(Math.random() * 400) + 600,
          activeInternships: Math.floor(Math.random() * 350) + 500,
          pendingApprovals: Math.floor(Math.random() * 25) + 5,
          totalCompanies: Math.floor(Math.random() * 75) + 125,
          totalLecturers: Math.floor(Math.random() * 30) + 85,
          totalSupervisors: Math.floor(Math.random() * 150) + 200,
          averageAttendanceRate: Math.floor(Math.random() * 15) + 85, // 85-100%
          recentCheckIns: Math.floor(Math.random() * 100) + 50,
          todayReports: Math.floor(Math.random() * 80) + 20,
          activeAlerts: Math.floor(Math.random() * 10) + 2,
        } as MetricsType<T>;

      case 'lecturer':
        return {
          ...baseMetrics,
          totalStudents: Math.floor(Math.random() * 30) + 15,
          studentsToReview: Math.floor(Math.random() * 8) + 2,
          averagePerformance: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
          pendingReports: Math.floor(Math.random() * 12) + 3,
          completedEvaluations: Math.floor(Math.random() * 25) + 10,
          activeTasks: Math.floor(Math.random() * 15) + 5,
          studentsOnTime: Math.floor(Math.random() * 25) + 10,
          studentsLate: Math.floor(Math.random() * 5),
        } as MetricsType<T>;

      case 'supervisor':
        return {
          ...baseMetrics,
          assignedStudents: Math.floor(Math.random() * 12) + 3,
          todayAttendance: Math.floor(Math.random() * 10) + 5,
          pendingTasks: Math.floor(Math.random() * 8) + 2,
          completedProjects: Math.floor(Math.random() * 20) + 5,
          averageProductivity: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
          studentsNeedingAttention: Math.floor(Math.random() * 3),
          recentSubmissions: Math.floor(Math.random() * 15) + 5,
        } as MetricsType<T>;

      default:
        return baseMetrics as MetricsType<T>;
    }
  }, [role, userId]);

  const refreshMetrics = React.useCallback(async () => {
    try {
      setError(null);
      const newMetrics = await fetchMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      const errorMessage = `Failed to fetch ${role} metrics`;
      setError(errorMessage);
      console.error(errorMessage, err);
      toast({
        variant: 'destructive',
        title: 'Metrics Update Failed',
        description: `Unable to update ${role} dashboard metrics. Retrying...`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchMetrics, role, toast]);

  // Initial load
  React.useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  // Auto refresh
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refreshMetrics,
    lastUpdated: metrics?.lastUpdated,
  };
}

// Convenience hooks for specific roles
export const useStudentMetrics = (config?: Omit<UseRealtimeMetricsConfig, 'role'>) =>
  useRealtimeMetrics({ ...config, role: 'student' });

export const useAdminMetrics = (config?: Omit<UseRealtimeMetricsConfig, 'role'>) =>
  useRealtimeMetrics({ ...config, role: 'admin' });

export const useLecturerMetrics = (config?: Omit<UseRealtimeMetricsConfig, 'role'>) =>
  useRealtimeMetrics({ ...config, role: 'lecturer' });

export const useSupervisorMetrics = (config?: Omit<UseRealtimeMetricsConfig, 'role'>) =>
  useRealtimeMetrics({ ...config, role: 'supervisor' });
