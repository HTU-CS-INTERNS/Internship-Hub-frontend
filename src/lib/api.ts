
'use client';

// This file simulates a basic API client.
// In a real app, it would make HTTP requests to a backend.
// Here, it interacts with localStorage to mimic a persistent data store.

import type { UserProfileData } from "@/types";

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


// --- Mock API Endpoints ---
const mockEndpoints: Record<string, (options: ApiOptions) => Promise<any>> = {
    '/auth/signup': async (options) => {
        const { body } = options;
        const users = getDb<UserProfileData>(DB_KEYS.USERS);

        if (users.find(u => u.email === body.email)) {
            throw new Error('An account with this email already exists.');
        }
        
        const lastId = getLastId();
        const newUser: UserProfileData = {
            id: lastId + 1,
            email: body.email,
            role: 'STUDENT',
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number,
            student_id_number: body.student_id_number,
            faculty_id: body.faculty_id,
            department_id: body.department_id,
            is_active: true,
            // password is not stored in mock
        };
        users.push(newUser);
        saveDb(DB_KEYS.USERS, users);
        setLastId(newUser.id);

        // Simulate login after signup
        const token = `mock_token_for_${newUser.email}`;
        localStorage.setItem('authToken', token);
        
        return { user: newUser, session: { access_token: token } };
    },

    '/auth/login': async (options) => {
        const { email, password, role } = options.body;
        const users = getDb<UserProfileData>(DB_KEYS.USERS);
        const user = users.find(u => u.email === email && u.role === role);

        if (!user) {
            throw new Error('Invalid credentials or role mismatch.');
        }
        if (!user.is_active) {
            throw new Error('This account is inactive.');
        }
        // Password check is skipped in mock

        const token = `mock_token_for_${user.email}`;
        localStorage.setItem('authToken', token);

        return { user, session: { access_token: token } };
    },

    '/auth/me': async (options) => {
        const token = localStorage.getItem('authToken');
        if (!token || !token.startsWith('mock_token_for_')) {
            throw new Error('Not authenticated.');
        }
        const email = token.replace('mock_token_for_', '');
        const users = getDb<UserProfileData>(DB_KEYS.USERS);
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error('User for token not found.');
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
            // Re-throw to be caught by the calling component
            throw new Error(error.message);
        }
    }

    throw new Error(`Mock API endpoint not found: ${endpoint}`);
}

export default api;
