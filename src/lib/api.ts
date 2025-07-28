
'use client';

// This file provides compatibility with any legacy code that used the 'api' function.
// It now delegates directly to the new, purely client-side ApiClient.

import type { UserProfileData } from "@/types";
import { apiClient } from './api-client';

type ApiOptions = {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
};

// The legacy API function now maps to the new API client methods.
async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    // This function can be expanded with more specific endpoint handling if needed,
    // but the goal is to phase out its use in favor of direct service calls.
    console.log(`Legacy api() call for endpoint: ${endpoint}`);

    // Example mapping for login
    if (endpoint === '/auth/login' && options.method === 'POST') {
        const { user, access_token } = await apiClient.login(options.body);
        // Match the expected legacy response structure
        return { user, session: { access_token } } as T;
    }
    
    // For now, other unmapped endpoints will show a warning.
    console.warn(`Unhandled legacy api() call to endpoint: ${endpoint}`);
    // You could throw an error or return a default value.
    // Throwing an error is better for identifying parts of the code still using the old system.
    throw new Error(`Legacy api() call to unhandled endpoint: ${endpoint}`);
}

export default api;
