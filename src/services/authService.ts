import { apiPost } from '@/helpers';
import { 
    LoginRequest, 
    LoginResponse, 
    LoginFormErrors 
} from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class AuthService {
    private static readonly ENDPOINT = `${API_BASE_URL}/auth/sso/login`;

    /**
     * Validate login form data
     */
    static validateLoginForm(credentials: LoginRequest): LoginFormErrors {
        const errors: LoginFormErrors = {};

        // Email validation
        if (!credentials.email) {
            errors.email = 'Email is required';
        } else if (credentials.email.length < 3) {
            errors.email = 'Email must be at least 3 characters';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!credentials.password) {
            errors.password = 'Password is required';
        } else if (credentials.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        return errors;
    }

    /**
     * Check if form has validation errors
     */
    static hasValidationErrors(errors: LoginFormErrors): boolean {
        return Object.keys(errors).length > 0;
    }

    /**
     * Login user with SSO
     */
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            // Validate form data first
            const validationErrors = this.validateLoginForm(credentials);
            if (this.hasValidationErrors(validationErrors)) {
                throw new Error('Validation failed: Please check your input');
            }

            // Make API call
            const response = await apiPost<LoginResponse>(this.ENDPOINT, {
                email: credentials.email,
                password: credentials.password
            });
            
            // Validate response structure
            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }

            if (!response.data.data || !response.data.data.user || !response.data.data.oauth) {
                throw new Error('Invalid response format from server');
            }

            return response.data;
        } catch (error) {
            // Handle different types of errors
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            
            // Handle API errors
            if (typeof error === 'object' && error !== null && 'message' in error) {
                throw new Error((error as any).message);
            }
            
            throw new Error('An unexpected error occurred during login');
        }
    }

    /**
     * Store authentication data in localStorage
     */
    static storeAuthData(data: LoginResponse['data']): void {
        try {
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            localStorage.setItem('auth_permissions', JSON.stringify(data.permissions));
            localStorage.setItem('auth_session', JSON.stringify(data.session));
            localStorage.setItem('auth_oauth', JSON.stringify(data.oauth));
            localStorage.setItem('auth_token', data.oauth.sso_token);
            localStorage.setItem('isLoggedIn', 'true');
        } catch (error) {
            console.error('Failed to store auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    /**
     * Get stored authentication data
     */
    static getStoredAuthData() {
        try {
            const user = localStorage.getItem('auth_user');
            const permissions = localStorage.getItem('auth_permissions');
            const session = localStorage.getItem('auth_session');
            const oauth = localStorage.getItem('auth_oauth');
            const token = localStorage.getItem('auth_token');

            if (!user || !permissions || !session || !oauth || !token) {
                return null;
            }

            return {
                user: JSON.parse(user),
                permissions: JSON.parse(permissions),
                session: JSON.parse(session),
                oauth: JSON.parse(oauth),
            };
        } catch (error) {
            console.error('Failed to parse stored auth data:', error);
            return null;
        }
    }

    /**
     * Clear all authentication data
     */
    static clearAuthData(): void {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_permissions');
        localStorage.removeItem('auth_session');
        localStorage.removeItem('auth_oauth');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('isLoggedIn');
    }

    /**
     * Check if user is authenticated (simple check based on stored data)
     */
    static isAuthenticated(): boolean {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('auth_user');
        
        // Simple check - if we have token and user data, consider authenticated
        // Session validation will be handled by backend
        return !!(token && user);
    }

    /**
     * Get current user from storage
     */
    static getCurrentUser() {
        try {
            const user = localStorage.getItem('auth_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    /**
     * Get user permissions from storage
     */
    static getUserPermissions() {
        try {
            const permissions = localStorage.getItem('auth_permissions');
            return permissions ? JSON.parse(permissions) : [];
        } catch (error) {
            console.error('Failed to get user permissions:', error);
            return [];
        }
    }
}