// src/context/AuthContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '../types/auth';
import { useAuth as useAuthHook } from '../hooks/useAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const authHook = useAuthHook();

    const contextValue: AuthContextType = {
        authState: authHook.authState,
        login: authHook.login,
        logout: authHook.logout,
        clearError: authHook.clearError,
        hasMenu: authHook.hasMenu,
        // Expose computed properties for easy access
        user: authHook.user,
        isAuthenticated: authHook.isAuthenticated,
        isLoading: authHook.isLoading,
        error: authHook.error,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
