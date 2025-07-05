
'use client';

// This file provides compatibility with the legacy API interface
// while delegating to the new API client that connects to the real backend.

import type { UserProfileData } from "@/types";
import { apiClient } from './api-client';

type ApiOptions = {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
};

// Legacy API function that maps to the new API client
async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    // Map legacy endpoints to new API client methods
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
            // This endpoint might need to be implemented in the backend
            // For now, we'll return a placeholder response
            throw new Error('Student verification endpoint needs to be implemented in backend');

        default:
            // For any other endpoint, use the direct API client request
            return await apiClient.request<T>(endpoint, options);
    }

    throw new Error(`API endpoint not implemented: ${endpoint}`);
}

export default api;
