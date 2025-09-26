import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '@/components/common/Loading';
import { hasMenuAccess, getRouteNameFromPath } from '@/helpers/routeProtection';

interface ClientProps {
    children: ReactNode;
    isProtected?: boolean;
    isUnProtected?: boolean;
    roles?: string[];
}

const Client = ({ children, isProtected, isUnProtected, roles }: ClientProps) => {
    const { authState } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [allowed, setAllowed] = useState<boolean | null>(null);

    // Reset allowed state when location changes
    useEffect(() => {
        setAllowed(null);
    }, [location.pathname]);

    useEffect(() => {
        // Jika masih loading, jangan cek dulu
        if (authState.isLoading) {
            return;
        }

        // Additional check: if not authenticated but we have user data,
        if (!authState.isAuthenticated && authState.user) {
            return;
        }

        let isAllowed = true;

        // Protected route, user harus login
        if (isProtected && !authState.isAuthenticated) {
            isAllowed = false;
            navigate('/', { state: { from: location }, replace: true });
        } else if (isUnProtected && authState.isAuthenticated) {
            navigate('/home', { replace: true });
            isAllowed = false;
        } else if (isProtected && authState.isAuthenticated) {
            const currentPath = location.pathname;
            const routeName = getRouteNameFromPath(currentPath);
            const userMenu = authState.menu || [];
            
            // Check if user is admin first (static role)
            let isAdmin = false;
            if (roles && roles.length > 0) {
                const requiredRoles = roles.map(role => role.toUpperCase());
                isAdmin = requiredRoles.includes('ADMIN');
            }
            
            // If admin, bypass all permission checks
            if (isAdmin) {
                // Admin can access everything, no need to check menu or role permissions
            } else {
                // For non-admin users, check normal permissions
                const hasMenuPermission = hasMenuAccess(routeName, userMenu);
                
                // Check role access if roles are specified
                let hasRoleAccess = true;
                if (roles && roles.length > 0) {
                    const userMenuNames = userMenu.map(menu => menu.name.toUpperCase());
                    const requiredRoles = roles.map(role => role.toUpperCase());
                    hasRoleAccess = requiredRoles.some(role => userMenuNames.includes(role));
                }
                
                // User must have both menu access AND role access
                if (!hasMenuPermission || !hasRoleAccess) {
                    isAllowed = false;
                    navigate('/403', { replace: true });
                }
            }
        }

        setAllowed(isAllowed);
    }, [
        isProtected, 
        isUnProtected, 
        roles, 
        authState.isLoading,
        authState.isAuthenticated,
        authState.user,
        authState.menu,
        location.pathname
    ]);

    // Tampilkan loading hanya saat auth masih loading atau butuh redirect protected route
    const shouldShowLoading = authState.isLoading || (isProtected && allowed === null);

    if (shouldShowLoading)
        return (
            <div className="w-full h-[100dvh] flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );

    // Jika tidak di-allow (redirect sudah jalan), jangan render apapun
    if (!allowed) return null;

    return children;
};

export default Client;
