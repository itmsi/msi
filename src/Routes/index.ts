import { ComponentType, lazy, LazyExoticComponent } from 'react';
const AppLayout = lazy(() => import('@/layout/AppLayout'));
const NotFound = lazy(() => import('@/pages/OtherPage/NotFound'));
const Forbidden = lazy(() => import('@/pages/OtherPage/Forbidden'));
const SignIn = lazy(() => import('@/pages/AuthPages/SignIn'));
const SignUp = lazy(() => import('@/pages/AuthPages/SignUp'));
const Home = lazy(() => import('@/pages/Dashboard/Home'));
const Blank = lazy(() => import('@/pages/Blank'));
const UserProfiles = lazy(() => import('@/pages/UserProfiles'));
const ManageMenu = lazy(() => import('@/pages/Administration/ManageMenu'));
const ManageCompany = lazy(() => import('@/pages/Administration/ManageCompany'));
const ManageDepartment = lazy(() => import('@/pages/Administration/ManageDepartment'));
const ManageEmployee = lazy(() => import('@/pages/Administration/ManageEmployee'));
const CreateEmployee = lazy(() => import('@/pages/Administration/CreateEmployee'));
const EditEmployee = lazy(() => import('@/pages/Administration/EditEmployee'));
const ManageRole = lazy(() => import('@/pages/Administration/ManageRole'));
const ManagePosition = lazy(() => import('@/pages/Administration/ManagePosition'));
const DashboardPowerBI = lazy(() => import('@/pages/PowerBI/DashboardPowerBI'));
const ManagePowerBi = lazy(() => import('@/pages/PowerBI/ManagePowerBi'));
const CategoryPowerBi = lazy(() => import('@/pages/PowerBI/CategoryPowerBi'));
const CreatePowerBi = lazy(() => import('@/pages/PowerBI/CreatePowerBi'));
const EditPowerBi = lazy(() => import('@/pages/PowerBI/EditPowerBi'));
const Trackme = lazy(() => import('@/pages/Trackme/trackme'));
const ManageCustomers = lazy(() => import('@/pages/Administration/Customers/Manage'));
const CreateCustomers = lazy(() => import('@/pages/Administration/Customers/Create'));
const EditCustomers = lazy(() => import('@/pages/Administration/Customers/Edit'));
const ManageBank = lazy(() => import('@/pages/Administration/Bank/Manage'));
const CreateBank = lazy(() => import('@/pages/Administration/Bank/Create'));
const EditBank = lazy(() => import('@/pages/Administration/Bank/Edit'));

const ManageItemsProduct = lazy(() => import('@/pages/Quotation/Product/Manage'));
const CreateItemsProduct = lazy(() => import('@/pages/Quotation/Product/Create'));
const EditItemsProduct = lazy(() => import('@/pages/Quotation/Product/Edit'));

const ManageQuotation = lazy(() => import('@/pages/Quotation/Manage/Manage'));
const CreateQuotation = lazy(() => import('@/pages/Quotation/Manage/Create'));
// const EditItemsProduct = lazy(() => import('@/pages/Quotation/Product/Edit'));
// const ManageItemsProduct = lazy(() => import('@/pages/Quotation/Product/Manage'));
const AccessoriesProduct = lazy(() => import('@/pages/Quotation/Accessories/Manage'));

const CreateTNC = lazy(() => import('@/pages/Quotation/TermCondition/Create'));
const TNCManage = lazy(() => import('@/pages/Quotation/TermCondition/Manage'));
const TNCEdit = lazy(() => import('@/pages/Quotation/TermCondition/Edit'));
// const EditItemsProduct = lazy(() => import('@/pages/Quotation/Product/Edit'));

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
    requiredPermissions?: string[]; // New: required permissions for this route
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
        path: '/employees',
        name: 'Employees',
        isProtected: true,
        roles: ['Employees'],
        requiredPermissions: ['read'],
        component: ManageEmployee,
        layout: AppLayout,
    },
    {
        path: '/employees/create',
        name: 'Employees',
        isProtected: true,
        roles: ['Employees'],
        requiredPermissions: ['create'],
        component: CreateEmployee,
        layout: AppLayout,
    },
    {
        path: '/employees/edit/:id',
        name: 'Employees',
        isProtected: true,
        roles: ['Employees'],
        requiredPermissions: ['update'],
        component: EditEmployee,
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
        requiredPermissions: ['read'],
        component: DashboardPowerBI,
        layout: AppLayout,
    },
    {
        path: '/power-bi/manage/create',
        name: 'Manage Power BI',
        isProtected: true,
        roles: ['Manage Power BI'],
        requiredPermissions: ['create'],
        component: CreatePowerBi,
        layout: AppLayout,
    },
    {
        path: '/power-bi/manage/edit/:id',
        name: 'Manage Power BI',
        isProtected: true,
        roles: ['Manage Power BI'],
        requiredPermissions: ['update'],
        component: EditPowerBi,
        layout: AppLayout,
    },
    {
        path: '/power-bi/manage',
        name: 'Manage Power BI',
        isProtected: true,
        roles: ['Manage Power BI'],
        requiredPermissions: ['read'],
        component: ManagePowerBi,
        layout: AppLayout,
    },
    {
        path: '/power-bi/category',
        name: 'Category Power BI',
        isProtected: true,
        roles: ['Category Power BI'],
        requiredPermissions: ['read'],
        component: CategoryPowerBi,
        layout: AppLayout,
    },
    {
        path: '/customers',
        name: 'Customer Quotation',
        isProtected: true,
        roles: ['Customer Quotation'],
        component: ManageCustomers,
        layout: AppLayout,
    },
    {
        path: '/customers/create',
        name: 'Customer Quotation',
        isProtected: true,
        roles: ['Customer Quotation'],
        requiredPermissions: ['create'],
        component: CreateCustomers,
        layout: AppLayout,
    },
    {
        path: '/customers/edit/:id',
        name: 'Customer Quotation',
        isProtected: true,
        roles: ['Customer Quotation'],
        requiredPermissions: ['update'],
        component: EditCustomers,
        layout: AppLayout,
    },
    {
        path: '/bank-accounts',
        name: 'Bank Quotation',
        isProtected: true,
        roles: ['Bank Quotation'],
        component: ManageBank,
        layout: AppLayout,
    },
    {
        path: '/bank-accounts/create',
        name: 'Bank Quotation',
        isProtected: true,
        roles: ['Bank Quotation'],
        requiredPermissions: ['create'],
        component: CreateBank,
        layout: AppLayout,
    },
    {
        path: '/bank-accounts/edit/:id',
        name: 'Bank Quotation',
        isProtected: true,
        roles: ['Bank Quotation'],
        requiredPermissions: ['update'],
        component: EditBank,
        layout: AppLayout,
    },

    
    {
        path: '/quotations/products',
        name: 'Product Quotation',
        isProtected: true,
        roles: ['Product Quotation'],
        component: ManageItemsProduct,
        layout: AppLayout,
    },
    {
        path: '/quotations/products/create',
        name: 'Product Quotation',
        isProtected: true,
        roles: ['Product Quotation'],
        requiredPermissions: ['create'],
        component: CreateItemsProduct,
        layout: AppLayout,
    },
    {
        path: '/quotations/products/edit/:id',
        name: 'Product Quotation',
        isProtected: true,
        roles: ['Product Quotation'],
        requiredPermissions: ['update'],
        component: EditItemsProduct,
        layout: AppLayout,
    },

    {
        path: '/quotations/manage',
        name: 'Manage Quotation',
        isProtected: true,
        roles: ['Manage Quotation'],
        component: ManageQuotation,
        layout: AppLayout,
    },
    {
        path: '/quotations/manage/create',
        name: 'Manage Quotation',
        isProtected: true,
        roles: ['Manage Quotation'],
        requiredPermissions: ['create'],
        component: CreateQuotation,
        layout: AppLayout,
    },
    
    // {
    //     path: '/quotations/products',
    //     name: 'Product Quotation',
    //     isProtected: true,
    //     roles: ['Product Quotation'],
    //     component: ManageItemsProduct,
    //     layout: AppLayout,
    // },
    {
        path: '/quotations/accessories',
        name: 'Accessories Quotation',
        isProtected: true,
        roles: ['Accessories Quotation'],
        requiredPermissions: ['read'],
        component: AccessoriesProduct,
        layout: AppLayout,
    },
    
    {
        path: '/quotations/term-condition/create',
        name: 'TNC Quotation',
        isProtected: true,
        roles: ['TNC Quotation'],
        requiredPermissions: ['create'],
        component: CreateTNC,
        layout: AppLayout,
    },
    {
        path: '/quotations/term-condition',
        name: 'TNC Quotation',
        isProtected: false,
        roles: ['TNC Quotation'],
        requiredPermissions: ['read'],
        component: TNCManage,
        layout: AppLayout,
    },
    {
        path: '/quotations/term-condition/edit/:id',
        name: 'TNC Quotation',
        isProtected: true,
        roles: ['TNC Quotation'],
        requiredPermissions: ['update'],
        component: TNCEdit,
        layout: AppLayout,
    },


    // {
    //     path: '/customers/create',
    //     name: 'Customer Quotation',
    //     isProtected: true,
    //     roles: ['Customer Quotation'],
    //     requiredPermissions: ['create'],
    //     component: CreateCustomers,
    //     layout: AppLayout,
    // },


    {
        path: '/trackme',
        name: 'Trackme',
        isProtected: false,
        roles: ['Trackme'],
        component: Trackme,
    },
];
