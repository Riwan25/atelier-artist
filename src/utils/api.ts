// API utilities for making authenticated requests
import { useAuth } from '../context/AuthContext';

// Base API URL
const API_BASE_URL = 'http://localhost/atelier/atelier-artist/api';

/**
 * Make an authenticated API request
 * @param endpoint The API endpoint (without the base URL)
 * @param options Request options
 * @param token JWT token for authentication
 * @returns Promise with the API response
 */
export const apiRequest = async (
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
) => {
    // Get token from localStorage if not provided
    if (token === undefined) {
        token = localStorage.getItem('auth_token');
    }

    // Prepare headers with authorization token if available
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    // Include credentials and merge with provided options
    const requestOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    // For non-2xx responses, throw an error
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
    }

    // For 204 No Content responses, return null
    if (response.status === 204) {
        return null;
    }

    // Otherwise parse and return JSON response
    return await response.json();
};

/**
 * Hook to use the API utilities with authentication
 */
export const useApi = () => {
    const { isAuthenticated, user, getToken } = useAuth();

    return {
        get: (endpoint: string, options: RequestInit = {}) =>
            apiRequest(endpoint, { ...options, method: 'GET' }, getToken()),

        post: (endpoint: string, data: any, options: RequestInit = {}) =>
            apiRequest(
                endpoint,
                {
                    ...options,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    body: JSON.stringify(data),
                },
                getToken()
            ),

        put: (endpoint: string, data: any, options: RequestInit = {}) =>
            apiRequest(
                endpoint,
                {
                    ...options,
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    body: JSON.stringify(data),
                },
                getToken()
            ),

        delete: (endpoint: string, options: RequestInit = {}) =>
            apiRequest(endpoint, { ...options, method: 'DELETE' }, getToken()),

        isAuthenticated,
        user,
    };
};
