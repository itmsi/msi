import { Menu } from '@/types/auth';
import { routes } from '@/Routes';

export const getRouteNameFromPath = (path: string): string => {
    const route = routes.find(route => route.path === path);
    return route?.name || '';
};

export const hasMenuAccess = (routeName: string, authMenu: Menu[]): boolean => {
    const unprotectedRouteNames = ['Sign In', 'Sign Up'];
    if (unprotectedRouteNames.includes(routeName)) {
        return true;
    }
    
    return authMenu.some(menu => menu.name === routeName);
};