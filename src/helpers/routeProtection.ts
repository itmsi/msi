import { Menu } from '@/types/auth';
import { routes } from '@/Routes';

/**
 * Get route name from current path
 * @param path - Current path
 * @returns string - Route name or empty string if not found
 */
export const getRouteNameFromPath = (path: string): string => {
    const route = routes.find(route => route.path === path);
    return route?.name || '';
};

/**
 * Check if user has access to a specific route based on route name and auth_menu
 * @param routeName - The route name to check (e.g., 'Dashboard', 'Employees')
 * @param authMenu - Array of menu items from backend
 * @returns boolean - true if user has access
 */
export const hasMenuAccess = (routeName: string, authMenu: Menu[]): boolean => {
    // Always allow access to unprotected routes
    const unprotectedRouteNames = ['Sign In', 'Sign Up'];
    if (unprotectedRouteNames.includes(routeName)) {
        return true;
    }
    
    // Check if route name exists in auth_menu names
    return authMenu.some(menu => menu.name === routeName);
};