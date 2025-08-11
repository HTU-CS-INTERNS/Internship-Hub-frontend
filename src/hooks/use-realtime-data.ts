'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

/**
 * Hook for real-time data subscription
 * @param table - The table name to subscribe to
 * @param filter - Optional filter for the subscription
 */
export function useRealtimeData<T extends keyof Tables>(
  table: T,
  filter?: {
    column: string;
    value: any;
  }
) {
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let query = supabase.from(table).select('*');
    
    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    // Initial data fetch
    const fetchData = async () => {
      try {
        const { data: initialData, error: fetchError } = await query;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(initialData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as string,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload) => {
          console.log(`Real-time update for ${table}:`, payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setData(prev => [...prev, payload.new as Tables[T]['Row']]);
              break;
            case 'UPDATE':
              setData(prev => 
                prev.map(item => 
                  (item as any).id === (payload.new as any).id 
                    ? payload.new as Tables[T]['Row']
                    : item
                )
              );
              break;
            case 'DELETE':
              setData(prev => 
                prev.filter(item => (item as any).id !== (payload.old as any).id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

/**
 * Hook for real-time user data
 */
export function useRealtimeUser(userId?: string) {
  return useRealtimeData('users', userId ? { column: 'id', value: userId } : undefined);
}

/**
 * Hook for real-time student data
 */
export function useRealtimeStudents(facultyId?: number) {
  return useRealtimeData('students', facultyId ? { column: 'faculty_id', value: facultyId } : undefined);
}

/**
 * Hook for real-time internship data
 */
export function useRealtimeInternships(studentId?: string) {
  return useRealtimeData('internships', studentId ? { column: 'student_id', value: studentId } : undefined);
}

/**
 * Hook for real-time daily reports
 */
export function useRealtimeDailyReports(internshipId?: number) {
  return useRealtimeData('daily_reports', internshipId ? { column: 'internship_id', value: internshipId } : undefined);
}

/**
 * Hook for real-time daily tasks
 */
export function useRealtimeDailyTasks(internshipId?: number) {
  return useRealtimeData('daily_tasks', internshipId ? { column: 'internship_id', value: internshipId } : undefined);
}

/**
 * Hook for real-time location check-ins
 */
export function useRealtimeLocationCheckIns(internshipId?: number) {
  return useRealtimeData('location_check_ins', internshipId ? { column: 'internship_id', value: internshipId } : undefined);
}

/**
 * Hook for real-time companies
 */
export function useRealtimeCompanies() {
  return useRealtimeData('companies');
}

/**
 * Hook for real-time faculties
 */
export function useRealtimeFaculties() {
  return useRealtimeData('faculties');
}

/**
 * Hook for real-time departments
 */
export function useRealtimeDepartments(facultyId?: number) {
  return useRealtimeData('departments', facultyId ? { column: 'faculty_id', value: facultyId } : undefined);
}

/**
 * Hook for real-time issues
 */
export function useRealtimeIssues(userId?: string) {
  return useRealtimeData('issues', userId ? { column: 'reported_by_user_id', value: userId } : undefined);
}

/**
 * Hook for real-time evaluations
 */
export function useRealtimeEvaluations(internshipId?: number) {
  return useRealtimeData('evaluations', internshipId ? { column: 'internship_id', value: internshipId } : undefined);
}
