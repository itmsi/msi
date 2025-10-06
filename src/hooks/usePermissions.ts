import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRouteNameFromPath, getMenuPermissions } from '@/helpers/routeProtection';

export interface PagePermissions {
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    permissions: string[];
    routeName: string;
}

/**
 * Hook untuk mengecek permission user pada halaman current
 * @returns PagePermissions object dengan informasi CRUD permissions
 */
export const usePermissions = (): PagePermissions => {
    const location = useLocation();
    const { authState } = useAuth();
    
    const routeName = getRouteNameFromPath(location.pathname);
    const userMenu = authState.menu || [];
    const permissions = getMenuPermissions(routeName, userMenu);
    
    // Check if user is admin (bypass all permission checks)
    const isAdmin = userMenu.some(menu => 
        menu.name.toUpperCase() === 'ADMIN' || 
        menu.name.toUpperCase().includes('ADMINISTRATOR')
    );
    
    return {
        canCreate: isAdmin || permissions.includes('create'),
        canRead: isAdmin || permissions.includes('read'),
        canUpdate: isAdmin || permissions.includes('update'),
        canDelete: isAdmin || permissions.includes('delete'),
        permissions,
        routeName
    };
};

/**
 * Hook untuk mengecek permission pada route/menu tertentu (bukan current page)
 * @param targetRouteName - Nama route yang ingin dicek permissionnya
 * @returns PagePermissions object untuk route tersebut
 */
export const usePermissionsFor = (targetRouteName: string): PagePermissions => {
    const { authState } = useAuth();
    const userMenu = authState.menu || [];
    const permissions = getMenuPermissions(targetRouteName, userMenu);
    
    // Check if user is admin
    const isAdmin = userMenu.some(menu => 
        menu.name.toUpperCase() === 'ADMIN' || 
        menu.name.toUpperCase().includes('ADMINISTRATOR')
    );
    
    return {
        canCreate: isAdmin || permissions.includes('create'),
        canRead: isAdmin || permissions.includes('read'),
        canUpdate: isAdmin || permissions.includes('update'),
        canDelete: isAdmin || permissions.includes('delete'),
        permissions,
        routeName: targetRouteName
    };
};

/**
 * Hook untuk mengecek permission spesifik
 * @param permission - Permission yang ingin dicek ('create', 'read', 'update', 'delete')
 * @param targetRouteName - Optional: nama route tertentu (default: current route)
 * @returns boolean apakah user punya permission tersebut
 */
export const useHasPermission = (
    permission: 'create' | 'read' | 'update' | 'delete',
    targetRouteName?: string
): boolean => {
    const location = useLocation();
    const { authState } = useAuth();
    
    const routeName = targetRouteName || getRouteNameFromPath(location.pathname);
    const userMenu = authState.menu || [];
    const permissions = getMenuPermissions(routeName, userMenu);
    
    // Check if user is admin
    const isAdmin = userMenu.some(menu => 
        menu.name.toUpperCase() === 'ADMIN' || 
        menu.name.toUpperCase().includes('ADMINISTRATOR')
    );
    
    return isAdmin || permissions.includes(permission);
};