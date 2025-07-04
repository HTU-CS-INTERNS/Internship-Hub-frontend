
'use client';

// This file simulates a basic API client.
// In a real app, it would make HTTP requests to a backend.
// Here, it interacts with localStorage to mimic a persistent data store.

import type { UserProfileData } from "@/types";
import { FACULTIES, DEPARTMENTS } from './constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type ApiOptions = {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
};

// --- Mock Database in LocalStorage ---
const DB_KEYS = {
    USERS: 'internhub_users_db',
    LAST_ID: 'internhub_last_id',
};

const getDb = <T>(key: string): T[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const saveDb = <T>(key: string, data: T[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
};

const getLastId = (): number => {
    if (typeof window === "undefined") return 0;
    const lastId = localStorage.getItem(DB_KEYS.LAST_ID);
    return lastId ? parseInt(lastId, 10) : 0;
};

const setLastId = (id: number): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DB_KEYS.LAST_ID, id.toString());
};

const initializeUserDatabase = () => {
    if (typeof window === "undefined") return;
    const usersRaw = localStorage.getItem(DB_KEYS.USERS);
    if (!usersRaw) {
        // This simulates an admin having pre-uploaded student data.
        const preRegisteredUsers: UserProfileData[] = [
            {
                id: 1, email: 'sadick@htu.edu.gh', student_id_number: 'HTU001', role: 'STUDENT',
                first_name: 'Sadick', last_name: 'Issaka', status: 'PENDING_ACTIVATION',
                faculty_id: 1, department_id: 5 // Placeholder mapping
            },
            {
                id: 2, email: 'jane.doe@htu.edu.gh', student_id_number: 'HTU002', role: 'STUDENT',
                first_name: 'Jane', last_name: 'Doe', status: 'PENDING_ACTIVATION',
                faculty_id: 2, department_id: 3 // Placeholder mapping
            },
            {
                id: 3, email: 'active.student@htu.edu.gh', student_id_number: 'HTU003', role: 'STUDENT',
                first_name: 'Active', last_name: 'Student', status: 'ACTIVE',
                faculty_id: 3, department_id: 6 // Placeholder mapping
            },
            { id: 4, email: 'lecturer@htu.edu.gh', first_name: 'Lecturer', last_name: 'User', role: 'LECTURER', status: 'ACTIVE' },
            { id: 5, email: 'supervisor@company.com', first_name: 'Supervisor', last_name: 'User', role: 'SUPERVISOR', status: 'ACTIVE' },
            { id: 6, email: 'hod@htu.edu.gh', first_name: 'HOD', last_name: 'User', role: 'HOD', status: 'ACTIVE' },
            { id: 7, email: 'admin@htu.edu.gh', first_name: 'Admin', last_name: 'User', role: 'ADMIN', status: 'ACTIVE' },
        ];
        saveDb(DB_KEYS.USERS, preRegisteredUsers);
        setLastId(preRegisteredUsers.length);
    }
};

initializeUserDatabase();


// --- Mock API Endpoints ---
const mockEndpoints: Record<string, (options: ApiOptions) => Promise<any>> = {
    '/auth/verify-student': async (options) => { // New endpoint
        const { student_id_number, email } = options.body;
        const users = getDb<UserProfileData>(DB_KEYS.USERS);
        const student = users.find(u => 
            u.student_id_number?.toLowerCase() === student_id_number.toLowerCase() && 
            u.email.toLowerCase() === email.toLowerCase() &&
            u.role === 'STUDENT'
        );

        if (!student) {
            throw new Error('Student record not found. Please check your School ID and Email or contact administration.');
        }

        if (student.status === 'ACTIVE') {
            throw new Error('This account has already been activated. Please log in.');
        }
        
        if (student.status === 'INACTIVE') {
            throw new Error('This account is currently inactive. Please contact administration.');
        }
        
        // Return public-facing data
        const { id, first_name, last_name, faculty_id, department_id } = student;
        return { id, first_name, last_name, faculty_id, department_id };
    },

    '/auth/signup': async (options) => { // Modified to be an "activation" endpoint
        const { email, password } = options.body;
        const users = getDb<UserProfileData>(DB_KEYS.USERS);
        const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

        if (userIndex === -1) {
            throw new Error('User not found. Cannot complete registration.');
        }
        if (users[userIndex].status !== 'PENDING_ACTIVATION') {
             throw new Error('This account is not pending activation.');
        }

        // "Set password" and activate account
        users[userIndex].status = 'ACTIVE';
        saveDb(DB_KEYS.USERS, users);
        
        const activatedUser = users[userIndex];
        const token = `mock_token_for_${activatedUser.email}`;
        
        return { user: activatedUser, session: { access_token: token } };
    },

    '/auth/login': async (options) => {
        const { email, password, role } = options.body;
        const users = getDb<UserProfileData>(DB_KEYS.USERS);
        const user = users.find(u => u.email === email && u.role === role);

        if (!user) {
            throw new Error('Invalid credentials or role mismatch.');
        }
        if (user.status === 'PENDING_ACTIVATION') {
            throw new Error('This account has not been activated yet. Please complete the registration process.');
        }
        if (user.status === 'INACTIVE') {
            throw new Error('This account is inactive. Please contact administration.');
        }

        const token = `mock_token_for_${user.email}`;
        return { user, session: { access_token: token } };
    },

    '/auth/me': async (options) => {
        const token = typeof window !== "undefined" ? localStorage.getItem('authToken') : null;
        if (!token || !token.startsWith('mock_token_for_')) {
            throw new Error('Not authenticated.');
        }
        const email = token.replace('mock_token_for_', '');
        const users = getDb<UserProfileData>(DB_KEYS.USERS);
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error('User for token not found.');
        }
        if (user.status !== 'ACTIVE') {
            throw new Error(`Account status is ${user.status}. Access denied.`);
        }
        return user;
    }
};

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    console.log(`Mock API call to: ${endpoint}`, options);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const handler = mockEndpoints[endpoint];
    if (handler) {
        try {
            return await handler(options);
        } catch (error: any) {
            console.error(`Mock API Error at ${endpoint}:`, error.message);
            throw new Error(error.message);
        }
    }

    throw new Error(`Mock API endpoint not found: ${endpoint}`);
}

export default api;
