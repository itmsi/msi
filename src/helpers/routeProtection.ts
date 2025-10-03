import { Menu } from '@/types/auth';
import { routes } from '@/Routes';

/**
 * Get route name from path, supports both static and dynamic routes
 * @param path - The current URL path
 * @returns Route name or empty string if not found
 */
export const getRouteNameFromPath = (path: string): string => {
    // First, try exact match for static routes (more efficient)
    let route = routes.find(route => route.path === path);

    // If no exact match found, try pattern matching for dynamic routes
    if (!route) {
        route = routes.find(routeItem => {
            const routePattern = routeItem.path;
            
            // Skip if no parameters in route pattern
            if (!routePattern.includes(':')) {
                return false;
            }
            
            // Convert route pattern to regex
            const regexPattern = routePattern
                .replace(/:[^/]+/g, '[^/]+')    // Replace :param with [^/]+
                .replace(/\//g, '\\/');          // Escape forward slashes
                
            const regex = new RegExp(`^${regexPattern}$`);
            
            return regex.test(path);
        });
    }
    
    return route?.name || '';
};

export const hasMenuAccess = (routeName: string, authMenu: Menu[]): boolean => {
    const unprotectedRouteNames = ['Sign In', 'Sign Up'];
    if (unprotectedRouteNames.includes(routeName)) {
        return true;
    }
    
    return authMenu.some(menu => menu.name === routeName);
};

export const hasPermissionAccess = (routeName: string, requiredPermission: string, authMenu: Menu[]): boolean => {
    const unprotectedRouteNames = ['Sign In', 'Sign Up'];
    if (unprotectedRouteNames.includes(routeName)) {
        return true;
    }
    
    const menu = authMenu.find(menu => menu.name === routeName);
    if (!menu) {
        return false;
    }
    
    // Check if user has the required permission for this menu
    return menu.permission.includes(requiredPermission);
};

export const getMenuPermissions = (routeName: string, authMenu: Menu[]): string[] => {
    const menu = authMenu.find(menu => menu.name === routeName);
    return menu?.permission || [];
};