import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
// Base configuration for axios
const api = axios.create({
    baseURL: '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
    (config) => {
        // Try to get token from new auth system first, then fallback to legacy
        const token = localStorage.getItem('auth_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Generic API response type
export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    message?: string;
}

// Generic error type
export interface ApiError {
    message: string;
    status?: number;
}

// API Error Response interface
interface ApiErrorResponse {
    message?: string;
    error?: string;
    [key: string]: unknown;
}

// GET request helper
export const apiGet = async <T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.get(url, { params });
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// POST request helper
export const apiPost = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.post(url, data, config);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// PUT request helper
export const apiPut = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.put(url, data);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// PATCH request helper
export const apiPatch = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.patch(url, data);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// DELETE request helper
export const apiDelete = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.delete(url);
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// POST request helper for multipart/form-data
export const apiPostMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// PUT request helper for multipart/form-data
export const apiPutMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse<T> = await api.put(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw handleApiError(error as AxiosError<ApiErrorResponse>);
    }
};

// Error handling helper
const handleApiError = (error: AxiosError<ApiErrorResponse>): ApiError => {
    if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData?.success === false) {
            // // Clear all auth data from localStorage
            // localStorage.removeItem('auth_token');
            // localStorage.removeItem('auth_user');
            // localStorage.removeItem('auth_permissions');
            // localStorage.removeItem('auth_session');
            // localStorage.removeItem('auth_oauth');
            // localStorage.removeItem('isLoggedIn');
            // // Also clear legacy items for backward compatibility
            // localStorage.removeItem('keepLogin');
            // localStorage.removeItem('profile');
            
            // Redirect to login page
            // window.location.href = '/';
        }
        return {
            message: errorData?.message || errorData?.error || error.message,
            status: error.response.status,
        };
        
    } else if (error.request) {
        // Request was made but no response received
        console.log({'api error request': error.request});
        return {
            message: 'Network error - no response from server',
        };
    } else {
        // Something else happened
        console.log({'api error message': error.message});
        return {
            message: error.message || 'An unexpected error occurred',
        };
    }
};

export default api;
