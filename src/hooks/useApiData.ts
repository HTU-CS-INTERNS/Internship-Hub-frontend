
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Faculty, Department } from '@/types';

// These functions now directly read from localStorage as a fallback.
const getFacultiesFromStorage = (): Faculty[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem('internshipHub_faculties');
  return data ? JSON.parse(data) : [];
};

const getDepartmentsFromStorage = (): Department[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem('internshipHub_departments');
  return data ? JSON.parse(data) : [];
};


export function useFaculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaculties = useCallback(() => {
     setLoading(true);
     setError(null);
    try {
        const storedFaculties = getFacultiesFromStorage();
        setFaculties(storedFaculties);
    } catch (err) {
        console.error('Error fetching faculties from localStorage:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch faculties');
        setFaculties([]);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  return { faculties, loading, error, refetch: fetchFaculties };
}

export function useDepartments(facultyId?: string | number) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
        const allDepartments = getDepartmentsFromStorage();
        if (facultyId) {
            const numericFacultyId = typeof facultyId === 'string' ? facultyId : facultyId.toString();
            setDepartments(allDepartments.filter(d => d.facultyId === numericFacultyId));
        } else {
            setDepartments(allDepartments);
        }
    } catch (err) {
        console.error('Error fetching departments from localStorage:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch departments');
        setDepartments([]);
    } finally {
        setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, loading, error, refetch: fetchDepartments };
}
