import { ComponentType, lazy, LazyExoticComponent } from 'react';
const AppLayout = lazy(() => import('@/layout/AppLayout'));
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const Forbidden = lazy(() => import('@/pages/OtherPage/Forbidden'));
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('@/pages/AuthPages/SignUp'));
const Home = lazy(() => import('@/pages/Dashboard/Home'));
const Blank = lazy(() => import('@/pages/Blank'));
const FormElements = lazy(() => import('@/pages/Forms/FormElements'));
const Alerts = lazy(() => import('@/pages/UiElements/Alerts'));
const Avatars = lazy(() => import('@/pages/UiElements/Avatars'));
const Badges = lazy(() => import('@/pages/UiElements/Badges'));
const Buttons = lazy(() => import('@/pages/UiElements/Buttons'));
const UserProfiles = lazy(() => import('@/pages/UserProfiles'));
const ManageMenu = lazy(() => import('@/pages/Administration/ManageMenu'));
const ManageCompany = lazy(() => import('@/pages/Administration/ManageCompany'));
const ManageDepartment = lazy(() => import('@/pages/Administration/ManageDepartment'));
const ManageEmployee = lazy(() => import('@/pages/Administration/ManageEmployee'));
const ManageRole = lazy(() => import('@/pages/Administration/ManageRole'));
const ManagePosition = lazy(() => import('@/pages/Administration/ManagePosition'));
const DashboardPowerBI = lazy(() => import('@/pages/PowerBI/DashboardPowerBI'));
const ManagePowerBi = lazy(() => import('@/pages/PowerBI/ManagePowerBi'));
const CategoryPowerBi = lazy(() => import('@/pages/PowerBI/CategoryPowerBi'));
const CreatePowerBi = lazy(() => import('@/pages/PowerBI/CreatePowerBi'));
const EditPowerBi = lazy(() => import('@/pages/PowerBI/EditPowerBi'));
// const TextingPartCatalogue = lazy(() => import('@/pages/PartCatalogue/postDiagram'));
// PowerBiForm is imported by Create and Edit components, no need to add here

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
        roles: ['ADMIN'],
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
        roles: ['Forms'],
        component: FormElements,
        layout: AppLayout,
    },
    {
        path: '/alerts',
        name: 'Alerts',
        isProtected: true,
        roles: ['Alerts'],
        component: Alerts,
        layout: AppLayout,
    },
    {
        path: '/avatars',
        name: 'Avatars',
        isProtected: true,
        roles: ['Avatars'],
        component: Avatars,
        layout: AppLayout,
    },
    {
        path: '/badge',
        name: 'Badges',
        isProtected: true,
        roles: ['Badges'],
        component: Badges,
        layout: AppLayout,
    },
    {
        path: '/buttons',
        name: 'Buttons',
        isProtected: true,
        roles: ['Buttons'],
        component: Buttons,
        layout: AppLayout,
    },
    {
        path: '/403',
        name: 'Forbidden',
        component: Forbidden,
    },
    {
        path: '*',
        name: 'Not Found',
        component: NotFound,
    },
    {
        path: '/settings',
        name: 'Settings',
        isProtected: true,
        roles: ['Settings'],
        component: Alerts,
        layout: AppLayout,
    },
    {
        path: '/reports',
        name: 'Reports',
        isProtected: true,
        roles: ['Reports'],
        component: Alerts,
        layout: AppLayout,
    },
    {
        path: '/employees',
        name: 'Employees',
        isProtected: true,
        roles: ['Employees'],
        component: ManageEmployee,
        layout: AppLayout,
    },
    {
        path: '/departments',
        name: 'Departments',
        isProtected: true,
        roles: ['Departments'],
        component: ManageDepartment,
        layout: AppLayout,
    },
    {
        path: '/companies',
        name: 'Companies',
        isProtected: true,
        roles: ['Companies'],
        component: ManageCompany,
        layout: AppLayout,
    },
    {
        path: '/roles',
        name: 'Roles',
        isProtected: true,
        roles: ['Roles'],
        component: ManageRole,
        layout: AppLayout,
    },
    {
        path: '/profile',
        name: 'Profile',
        isProtected: true,
        roles: ['ADMIN'],
        component: UserProfiles,
        layout: AppLayout,
    },
    {
        path: '/menu',
        name: 'Menu',
        isProtected: true,
        roles: ['Menu'],
        component: ManageMenu,
        layout: AppLayout,
    },
    {
        path: '/position',
        name: 'Positions',
        isProtected: true,
        roles: ['Positions'],
        component: ManagePosition,
        layout: AppLayout,
    },
    {
        path: '/power-bi/dashboard',
        name: 'Dashboard Power BI',
        isProtected: true,
        roles: ['Dashboard Power BI'],
        component: DashboardPowerBI,
        layout: AppLayout,
    },
    {
        path: '/power-bi/manage/create',
        name: 'Manage Power BI',
        isProtected: true,
        roles: ['Manage Power BI'],
        component: CreatePowerBi,
        layout: AppLayout,
    },
    {
        path: '/power-bi/manage/edit/:id',
        name: 'Manage Power BI',
        isProtected: true,
        roles: ['Manage Power BI'],
        component: EditPowerBi,
        layout: AppLayout,
    },
    {
        path: '/power-bi/manage',
        name: 'Manage Power BI',
        isProtected: true,
        roles: ['Manage Power BI'],
        component: ManagePowerBi,
        layout: AppLayout,
    },
    {
        path: '/power-bi/category',
        name: 'Category Power BI',
        isProtected: true,
        roles: ['Category Power BI'],
        component: CategoryPowerBi,
        layout: AppLayout,
    },
    // {
    //     path: '/example-part-catalogue',
    //     name: 'Example Part Catalogue',
    //     isProtected: false,
    //     roles: ['Example Part Catalogue'],
    //     component: TextingPartCatalogue,
    //     layout: AppLayout,
    // },
];
