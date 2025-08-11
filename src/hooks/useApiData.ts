'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/supabase-api-client';
import type { Faculty, Department } from '@/types';
import { useRealtimeFaculties, useRealtimeDepartments } from './use-realtime-data';

export function useFaculties() {
  const { data: faculties, loading, error } = useRealtimeFaculties();

  // Transform data to match expected Faculty type
  const transformedFaculties = faculties.map((faculty: any) => ({
    id: faculty.id,
    name: faculty.name,
    hod_id: 0, // This would need to be added to the schema if needed
  }));

  return {
    faculties: transformedFaculties,
    loading,
    error,
    refetch: () => window.location.reload()
  };
}

export function useDepartments(facultyId?: string | number) {
  const numericFacultyId = facultyId ? (typeof facultyId === 'string' ? parseInt(facultyId) : facultyId) : undefined;
  const { data: departments, loading, error } = useRealtimeDepartments(numericFacultyId);

  // Transform data to match expected Department type
  const transformedDepartments = departments.map((department: any) => ({
    id: department.id,
    name: department.name,
    faculty_id: department.faculty_id,
    hod_id: 0, // This would need to be added to the schema if needed
  }));

  return {
    departments: transformedDepartments,
    loading,
    error,
    refetch: () => window.location.reload()
  };
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
