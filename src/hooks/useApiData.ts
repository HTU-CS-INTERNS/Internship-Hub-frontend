'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Faculty, Department } from '@/types';

export function useFaculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getFaculties();
        if (mounted) {
          // Map backend response to frontend Faculty type
          const mappedFaculties = data.map((faculty: any) => ({
            id: faculty.id,
            name: faculty.name,
            hod_id: faculty.hod_id || 0, // Provide default value if missing
          }));
          setFaculties(mappedFaculties);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching faculties:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch faculties');
          setFaculties([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFaculties();

    return () => {
      mounted = false;
    };
  }, []);

  return { faculties, loading, error, refetch: () => window.location.reload() };
}

export function useDepartments(facultyId?: string | number) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const numericFacultyId = facultyId ? (typeof facultyId === 'string' ? parseInt(facultyId) : facultyId) : undefined;
        const data = await apiClient.getDepartments(numericFacultyId);
        if (mounted) {
          // Map backend response to frontend Department type
          const mappedDepartments = data.map((department: any) => ({
            id: department.id,
            name: department.name,
            faculty_id: department.faculty_id,
            hod_id: department.hod_id || 0, // Provide default value if missing
          }));
          setDepartments(mappedDepartments);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching departments:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch departments');
          setDepartments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDepartments();

    return () => {
      mounted = false;
    };
  }, [facultyId]);

  return { departments, loading, error, refetch: () => window.location.reload() };
}

// Compatibility function for components that still use the old constants
export function getFacultiesSync(): Faculty[] {
  // This is a temporary fallback - components should migrate to useFaculties hook
  return [];
}

export function getDepartmentsSync(facultyId?: string): Department[] {
  // This is a temporary fallback - components should migrate to useDepartments hook
  return [];
}
