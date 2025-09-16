import { useState, useEffect, useCallback } from 'react';
import { 
    AuthState, 
    LoginRequest, 
    LoginFormErrors, 
    User, 
    Permission 
} from '@/types/auth';
import { AuthService } from '@/services/authService';

const initialAuthState: AuthState = {
    user: null,
    permissions: [],
    session: null,
    oauth: null,
    isAuthenticated: false,
    isLoading: false, // Set back to false to show login page immediately
    error: null,
};

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>(initialAuthState);
    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

    /**
     * Initialize auth state from localStorage
     */
    const initializeAuth = useCallback(() => {
        setAuthState(prev => ({ ...prev, isLoading: true })); // Set loading true during check
        
        // Add small delay to ensure localStorage is ready
        setTimeout(() => {
            try {
                const storedData = AuthService.getStoredAuthData();
                const isAuthenticated = AuthService.isAuthenticated();

                if (storedData && isAuthenticated) {
                    setAuthState({
                        user: storedData.user,
                        permissions: storedData.permissions,
                        session: storedData.session,
                        oauth: storedData.oauth,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } else {
                    // Only clear if there's actually invalid data
                    if (storedData && !isAuthenticated) {
                        AuthService.clearAuthData();
                    }
                    setAuthState({
                        ...initialAuthState,
                        isLoading: false, // Make sure loading is false to show login page
                    });
                }
            } catch (error) {
                console.error('💥 initializeAuth: Failed to initialize auth:', error);
                // AuthService.clearAuthData();
                setAuthState({
                    ...initialAuthState,
                    isLoading: false,
                });
            }
        }, 100); // Small delay to ensure localStorage is ready
    }, []);

    /**
     * Login function
     */
    const login = useCallback(async (credentials: LoginRequest) => {
        try {
            // Clear previous errors
            setFormErrors({});
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            // Validate form
            const validationErrors = AuthService.validateLoginForm(credentials);
            if (AuthService.hasValidationErrors(validationErrors)) {
                setFormErrors(validationErrors);
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            // Perform login
            const response = await AuthService.login(credentials);

            // Store auth data
            AuthService.storeAuthData(response.data);

            // Update state
            setAuthState({
                user: response.data.user,
                permissions: response.data.permissions,
                session: response.data.session,
                oauth: response.data.oauth,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            
            // Set general error for form
            setFormErrors({ general: errorMessage });
        }
    }, []);

    /**
     * Logout function
     */
    const logout = useCallback(async () => {
        try {
            AuthService.clearAuthData();
            setAuthState(initialAuthState);
            setFormErrors({});
        } catch (error) {
            console.error('❌ useAuth: Error during logout:', error);
            throw error;
        }
    }, []);

    /**
     * Clear error function
     */
    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
        setFormErrors({});
    }, []);

    /**
     * Check if user has specific permission
     */
    const hasPermission = useCallback((permissionName: string, menuUrl?: string): boolean => {
        if (!authState.isAuthenticated || !authState.permissions.length) {
            return false;
        }

        return authState.permissions.some((permission: Permission) => {
            const hasPermissionName = permission.permission_name === permissionName;
            const hasMenuMatch = menuUrl ? permission.menu_url === menuUrl : true;
            return hasPermissionName && hasMenuMatch;
        });
    }, [authState.isAuthenticated, authState.permissions]);

    /**
     * Check if user has role
     */
    const hasRole = useCallback((roleName: string): boolean => {
        return authState.user?.role_name === roleName;
    }, [authState.user]);

    /**
     * Get user permissions for specific menu
     */
    const getMenuPermissions = useCallback((menuUrl: string): string[] => {
        if (!authState.isAuthenticated || !authState.permissions.length) {
            return [];
        }

        return authState.permissions
            .filter((permission: Permission) => permission.menu_url === menuUrl)
            .map((permission: Permission) => permission.permission_name);
    }, [authState.isAuthenticated, authState.permissions]);

    /**
     * Check if session is still valid
     */
    const isSessionValid = useCallback((): boolean => {
        return AuthService.isAuthenticated();
    }, []);

    /**
     * Get current user info
     */
    const getCurrentUser = useCallback((): User | null => {
        return authState.user;
    }, [authState.user]);

    /**
     * Initialize auth on component mount - only once
     */
    useEffect(() => {
        initializeAuth();
    }, []); // Empty dependency array to run only once

    return {
        // State
        authState,
        formErrors,
        
        // Actions
        login,
        logout,
        clearError,
        
        // Utilities
        hasPermission,
        hasRole,
        getMenuPermissions,
        isSessionValid,
        getCurrentUser,
        initializeAuth,
        
        // Computed properties
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user,
        permissions: authState.permissions,
        error: authState.error,
    };
};