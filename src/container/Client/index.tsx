import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '@/components/common/Loading';
import { hasMenuAccess } from '@/helpers/routeProtection';

interface ClientProps {
    children: ReactNode;
    isProtected?: boolean;
    isUnProtected?: boolean;
    roles?: string[];
}

const Client = ({ children, isProtected, isUnProtected, roles }: ClientProps) => {
    const { authState, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [allowed, setAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        // Jika masih loading, jangan cek dulu
        if (authState.isLoading) {
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
            // NEW: Check menu access for authenticated users on protected routes
            const currentPath = location.pathname;
            const userMenu = authState.menu || [];
            
            const hasAccess = hasMenuAccess(currentPath, userMenu);
            if (!hasAccess) {
                isAllowed = false;
                navigate('/403', { replace: true });
            }
        } else if (roles && roles.length > 0) {
            const userRole = authState.user?.role_name?.toUpperCase();
            if (!userRole || !roles.map((r) => r.toUpperCase()).includes(userRole)) {
                navigate('/403', { replace: true });
                isAllowed = false;
            }
        }

        setAllowed(isAllowed);
    }, [isProtected, isUnProtected, roles, authState, location, navigate, logout]);

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
