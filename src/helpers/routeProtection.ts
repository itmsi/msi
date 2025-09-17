import { Menu } from '@/types/auth';

/**
 * Check if user has access to a specific path based on auth_menu
 * @param path - The route path to check
 * @param authMenu - Array of menu items from backend
 * @returns boolean - true if user has access
 */
export const hasMenuAccess = (path: string, authMenu: Menu[]): boolean => {
    // Always allow access to unprotected routes
    const unprotectedPaths = ['/', '/signup', '/home'];
    if (unprotectedPaths.includes(path)) {
        return true;
    }
    
    // Check if path exists in auth_menu
    return authMenu.some(menu => menu.url === path);
};