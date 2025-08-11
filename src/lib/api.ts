
'use client';

// This file provides compatibility with the legacy API interface
// while delegating to the new Supabase API client.

import type { UserProfileData } from "@/types";
import { apiClient } from './supabase-api-client';

type ApiOptions = {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
};

// Legacy API function that maps to the new Supabase API client
async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    // Map legacy endpoints to new Supabase API client methods
    switch (endpoint) {
        case '/auth/login':
            if (options.body) {
                const { email, password } = options.body;
                const response = await apiClient.login({ email, password });
                return { user: response.user, session: { access_token: response.access_token } } as T;
            }
            break;

        case '/auth/signup':
            if (options.body) {
                const response = await apiClient.signup(options.body);
                return { user: response.user, session: { access_token: response.access_token } } as T;
            }
            break;

        case '/auth/me':
            return await apiClient.getCurrentUser() as T;

        case '/auth/verify-student':
            if (options.body) {
                const { student_id_number, email } = options.body;
                return await apiClient.verifyStudent(student_id_number, email) as T;
            }
            break;

        case '/faculties':
            return await apiClient.getFaculties() as T;

        case '/departments':
            const facultyId = options.body?.faculty_id;
            return await apiClient.getDepartments(facultyId) as T;

        case '/companies':
            return await apiClient.getCompanies() as T;

        case '/students':
            return await apiClient.getStudents() as T;

        case '/internships':
            return await apiClient.getInternships() as T;

        case '/daily-reports':
            return await apiClient.getDailyReports() as T;

        case '/daily-tasks':
            return await apiClient.getDailyTasks() as T;

        case '/lecturers':
            return await apiClient.getLecturers() as T;

        case '/issues':
            return await apiClient.getIssues() as T;

        default:
            throw new Error(`API endpoint not implemented: ${endpoint}`);
    }

    throw new Error(`API endpoint not implemented: ${endpoint}`);
}

export default api;
