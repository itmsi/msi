import { ComponentType, lazy, LazyExoticComponent } from 'react';
const AppLayout = lazy(() => import('@/layout/AppLayout'));
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('@/pages/AuthPages/SignUp'));
const Home = lazy(() => import('@/pages/Dashboard/Home'));
const Blank = lazy(() => import('@/pages/Blank'));
const FormElements = lazy(() => import('@/pages/Forms/FormElements'));
const Alerts = lazy(() => import('@/pages/UiElements/Alerts'));
const Avatars = lazy(() => import('@/pages/UiElements/Avatars'));
const Badges = lazy(() => import('@/pages/UiElements/Badges'));
const Buttons = lazy(() => import('@/pages/UiElements/Buttons'));

export type TAppRoute = {
    path: string;
    name: string;
    component: LazyExoticComponent<ComponentType<object>> | ComponentType<object>;
    layout?:
        | LazyExoticComponent<ComponentType<{ children: React.ReactNode }>>
        | ComponentType<{ children: React.ReactNode }>;
    isProtected?: boolean;
    isUnProtected?: boolean;
    roles?: string[];
    subRoutes?: TAppRoute[];
};

// semua routes ini masih menerima semua role karena blm dapet dokumen terkait page mana aja yang bisa di akses sama role mana aja, kedepannya tinggal remove dan add saja apabila sudah ada klasifikasi nya.

// const ROLES_PRODUCTION = import.meta.env.VITE_ALL_ROLE_CODE_PRODUCTION?.split(',') ?? [];
// const ROLES_SUPERADMIN = import.meta.env.VITE_ROLE_CODE_SUPER_ADMIN?.split(',') ?? [];

// const ROLES_PRODUCTION_ADMIN = [...ROLES_PRODUCTION, ...ROLES_SUPERADMIN];
export const routes: TAppRoute[] = [
    {
        path: '/',
        name: 'Sign In',
        isUnProtected: true,
        component: SignIn,
    },
    {
        path: '/signup',
        name: 'Sign Up',
        isUnProtected: true,
        component: SignUp,
    },
    {
        path: '/home',
        name: 'Dashboard',
        isProtected: true,
        component: Home,
        layout: AppLayout,
    },
    {
        path: '/blank',
        name: 'Blank Page',
        isProtected: true,
        component: Blank,
        layout: AppLayout,
    },
    {
        path: '/form-elements',
        name: 'Form Elements',
        isProtected: true,
        component: FormElements,
        layout: AppLayout,
    },
    {
        path: '/alerts',
        name: 'Alerts',
        isProtected: true,
        component: Alerts,
        layout: AppLayout,
    },
    {
        path: '/avatars',
        name: 'Avatars',
        isProtected: true,
        component: Avatars,
        layout: AppLayout,
    },
    {
        path: '/badge',
        name: 'Badges',
        isProtected: true,
        component: Badges,
        layout: AppLayout,
    },
    {
        path: '/buttons',
        name: 'Buttons',
        isProtected: true,
        component: Buttons,
        layout: AppLayout,
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFound,
    },
];
