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
// const ManageEmployee = lazy(() => import('@/pages/Administration/ManageEmployee'));
const ManageUser = lazy(() => import('@/pages/Administration/Users/Manage'));
const CreateEmployee = lazy(() => import('@/pages/Administration/CreateEmployee'));
const EditEmployee = lazy(() => import('@/pages/Administration/EditEmployee'));
const EditUser = lazy(() => import('@/pages/Administration/Users/Edit'));
const ManageRole = lazy(() => import('@/pages/Administration/ManageRole'));
const ManagePosition = lazy(() => import('@/pages/Administration/ManagePosition'));
const DashboardPowerBI = lazy(() => import('@/pages/PowerBI/DashboardPowerBI'));
const ManagePowerBi = lazy(() => import('@/pages/PowerBI/ManagePowerBi'));
const CategoryPowerBi = lazy(() => import('@/pages/PowerBI/CategoryPowerBi'));
const CreatePowerBi = lazy(() => import('@/pages/PowerBI/CreatePowerBi'));
const EditPowerBi = lazy(() => import('@/pages/PowerBI/EditPowerBi'));
// const Trackme = lazy(() => import('@/pages/Trackme/trackme'));
const ManageCustomers = lazy(() => import('@/pages/Administration/Customers/Manage'));
const CreateCustomers = lazy(() => import('@/pages/Administration/Customers/Create'));
const EditCustomers = lazy(() => import('@/pages/Administration/Customers/Edit'));
const ManageBank = lazy(() => import('@/pages/Administration/Bank/Manage'));
const CreateBank = lazy(() => import('@/pages/Administration/Bank/Create'));
const EditBank = lazy(() => import('@/pages/Administration/Bank/Edit'));
// ISLAND
const ManageIsland = lazy(() => import('@/pages/Administration/Island/Manage'));

const ManageItemsProduct = lazy(() => import('@/pages/Quotation/Product/Manage'));
const CreateItemsProduct = lazy(() => import('@/pages/Quotation/Product/Create'));
const EditItemsProduct = lazy(() => import('@/pages/Quotation/Product/Edit'));

const ManageQuotation = lazy(() => import('@/pages/Quotation/Manage/Manage'));
const CreateQuotation = lazy(() => import('@/pages/Quotation/Manage/Create'));
const EditQuotation = lazy(() => import('@/pages/Quotation/Manage/Edit'));
// const ManageItemsProduct = lazy(() => import('@/pages/Quotation/Product/Manage'));
const AccessoriesProduct = lazy(() => import('@/pages/Quotation/Accessories/Manage'));
const CreateAccessories = lazy(() => import('@/pages/Quotation/Accessories/Create'));
const EditAccessories = lazy(() => import('@/pages/Quotation/Accessories/Edit'));

const CreateTNC = lazy(() => import('@/pages/Quotation/TermCondition/Create'));
const TNCManage = lazy(() => import('@/pages/Quotation/TermCondition/Manage'));
const TNCEdit = lazy(() => import('@/pages/Quotation/TermCondition/Edit'));

const CreateROECalculator = lazy(() => import('@/pages/ROECalculator/Create'));
const ROECalculatorManage = lazy(() => import('@/pages/ROECalculator/Manage/Manage'));
const ROECalculatorEdit = lazy(() => import('@/pages/ROECalculator/Edit'));
const ROECalculatorBreakdown = lazy(() => import('@/pages/ROECalculator/Manage/BreakDown'));
const ROESettings = lazy(() => import('@/pages/ROECalculator/Settings/Settings'));

const Territory = lazy(() => import('@/pages/CRM/Territory'));
const ManageIUPManagement = lazy(() => import('@/pages/CRM/IUPManagement/Manage'));
const UserManagement = lazy(() => import('@/pages/CRM/UserManagement/Usermanagement'));
const CreateUserAccess = lazy(() => import('@/pages/CRM/UserManagement/CreateUserAccess'));
const EditUserAccess = lazy(() => import('@/pages/CRM/UserManagement/EditUserAccess'));

const Contractors = lazy(() => import('@/pages/CRM/Contractors/Contractors'));
const CreateContractors = lazy(() => import('@/pages/CRM/Contractors/CreateContractor'));
const CreateIUPManagement = lazy(() => import('@/pages/CRM/IUPManagement/CreateIup'));
const EditIupManagement = lazy(() => import('@/pages/CRM/IUPManagement/EditIup'));
const Brand = lazy(() => import('@/pages/CRM/Brand/Manage'));
const EditContractors = lazy(() => import('@/pages/CRM/Contractors/EditContractor'));

const Activities = lazy(() => import('@/pages/CRM/Activity/Activity'));
const CreateActivities = lazy(() => import('@/pages/CRM/Activity/CreateActivity'));
const EditActivities = lazy(() => import('@/pages/CRM/Activity/EditActivity'));

// CRM - Projects
const ManageCRMProject = lazy(() => import('@/pages/CRM/Project/Manage'));
const CreateCRMProject = lazy(() => import('@/pages/CRM/Project/CreateProject'));
const EditCRMProject = lazy(() => import('@/pages/CRM/Project/EditProject'));

// ========================================
// QUOTATION ITI
const ManageCustomersITI = lazy(() => import('@/pages/QuotationITI/Administration/Customers/Manage'));
const CreateCustomersITI = lazy(() => import('@/pages/QuotationITI/Administration/Customers/Create'));
const EditCustomersITI = lazy(() => import('@/pages/QuotationITI/Administration/Customers/Edit'));
const ManageBankITI = lazy(() => import('@/pages/QuotationITI/Administration/Bank/Manage'));
const CreateBankITI = lazy(() => import('@/pages/QuotationITI/Administration/Bank/Create'));
const EditBankITI = lazy(() => import('@/pages/QuotationITI/Administration/Bank/Edit'));
// ISLAND
const ManageIslandITI = lazy(() => import('@/pages/Administration/Island/Manage'));

const ManageItemsProductITI = lazy(() => import('@/pages/QuotationITI/Product/Manage'));
const CreateItemsProductITI = lazy(() => import('@/pages/QuotationITI/Product/Create'));
const EditItemsProductITI = lazy(() => import('@/pages/QuotationITI/Product/Edit'));

const ManageQuotationITI = lazy(() => import('@/pages/QuotationITI/Manage/Manage'));
const CreateQuotationITI = lazy(() => import('@/pages/QuotationITI/Manage/Create'));
const EditQuotationITI = lazy(() => import('@/pages/QuotationITI/Manage/Edit'));
// const ManageItemsProductITI = lazy(() => import('@/pages/QuotationITI/Product/Manage'));
const AccessoriesProductITI = lazy(() => import('@/pages/QuotationITI/Accessories/Manage'));
const CreateAccessoriesITI = lazy(() => import('@/pages/QuotationITI/Accessories/Create'));
const EditAccessoriesITI = lazy(() => import('@/pages/QuotationITI/Accessories/Edit'));

const CreateTNCITI = lazy(() => import('@/pages/QuotationITI/TermCondition/Create'));
const TNCManageITI = lazy(() => import('@/pages/QuotationITI/TermCondition/Manage'));
const TNCEditITI = lazy(() => import('@/pages/QuotationITI/TermCondition/Edit'));

// ========================================
// PURCHASE ORDER NETSUITE
const ManagePurchaseOrder = lazy(() => import('@/pages/Netsuite/PurchaseOrder/Manage'));
const CreatePurchaseOrder = lazy(() => import('@/pages/Netsuite/PurchaseOrder/Create'));
const ManageInvoiceSalesOrder = lazy(() => import('@/pages/Netsuite/InvoiceSalesOrders/Manage'));
const EditPurchaseOrder = lazy(() => import('@/pages/Netsuite/PurchaseOrder/Edit'));
const ViewInvoiceSalesOrder = lazy(() => import('@/pages/Netsuite/InvoiceSalesOrders/View'));
const EditInvoiceSalesOrder = lazy(() => import('@/pages/Netsuite/InvoiceSalesOrders/Edit'));
const Receive = lazy(() => import('@/pages/Netsuite/PurchaseOrder/Receive'));
// ========================================

// DIVISION
const ManageDivision = lazy(() => import('@/pages/CRM/Divisions/Manage'));

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
        component: ManageUser,
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
        path: '/users/edit/:id',
        name: 'Employees',
        isProtected: true,
        roles: ['Employees'],
        requiredPermissions: ['update'],
        component: EditUser,
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
        requiredPermissions: ['update', 'read'],
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
        path: '/quotations/administration/customers',
        name: 'Customer Quotation',
        isProtected: true,
        roles: ['Customer Quotation'],
        component: ManageCustomers,
        layout: AppLayout,
    },
    {
        path: '/quotations/administration/customers/create',
        name: 'Customer Quotation',
        isProtected: true,
        roles: ['Customer Quotation'],
        requiredPermissions: ['create'],
        component: CreateCustomers,
        layout: AppLayout,
    },
    {
        path: '/quotations/administration/customers/edit/:id',
        name: 'Customer Quotation',
        isProtected: true,
        roles: ['Customer Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditCustomers,
        layout: AppLayout,
    },
    {
        path: '/quotations/administration/bank-accounts',
        name: 'Bank Quotation',
        isProtected: true,
        roles: ['Bank Quotation'],
        component: ManageBank,
        layout: AppLayout,
    },
    {
        path: '/quotations/administration/bank-accounts/create',
        name: 'Bank Quotation',
        isProtected: true,
        roles: ['Bank Quotation'],
        requiredPermissions: ['create'],
        component: CreateBank,
        layout: AppLayout,
    },
    {
        path: '/quotations/administration/bank-accounts/edit/:id',
        name: 'Bank Quotation',
        isProtected: true,
        roles: ['Bank Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditBank,
        layout: AppLayout,
    },
    // ISLAND ROUTES
    {
        path: '/quotations/administration/islands',
        name: 'Island',
        isProtected: true,
        roles: ['Island'],
        component: ManageIsland,
        requiredPermissions: ['read'],
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
        requiredPermissions: ['update', 'read'],
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
    {
        path: '/quotations/manage/edit/:quotationId',
        name: 'Manage Quotation',
        isProtected: true,
        roles: ['Manage Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditQuotation,
        layout: AppLayout,
    },
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
        path: '/quotations/accessories/create',
        name: 'Accessories Quotation',
        isProtected: true,
        roles: ['Accessories Quotation'],
        requiredPermissions: ['create'],
        component: CreateAccessories,
        layout: AppLayout,
    },
    {
        path: '/quotations/accessories/edit/:id',
        name: 'Accessories Quotation',
        isProtected: true,
        roles: ['Accessories Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditAccessories,
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
        requiredPermissions: ['update', 'read'],
        component: TNCEdit,
        layout: AppLayout,
    },

    // ========================================
    // QUOTATION ITI ROUTES
    // ========================================
    {
        path: '/quotations-iti/administration/customers',
        name: 'Customer ITI Quotation',
        isProtected: true,
        roles: ['Customer ITI Quotation'],
        component: ManageCustomersITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/administration/customers/create',
        name: 'Customer ITI Quotation',
        isProtected: true,
        roles: ['Customer ITI Quotation'],
        requiredPermissions: ['create'],
        component: CreateCustomersITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/administration/customers/edit/:id',
        name: 'Customer ITI Quotation',
        isProtected: true,
        roles: ['Customer ITI Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditCustomersITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/administration/bank-accounts',
        name: 'Bank ITI Quotation',
        isProtected: true,
        roles: ['Bank ITI Quotation'],
        component: ManageBankITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/administration/bank-accounts/create',
        name: 'Bank ITI Quotation',
        isProtected: true,
        roles: ['Bank ITI Quotation'],
        requiredPermissions: ['create'],
        component: CreateBankITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/administration/bank-accounts/edit/:id',
        name: 'Bank ITI Quotation',
        isProtected: true,
        roles: ['Bank ITI Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditBankITI,
        layout: AppLayout,
    },
    // ISLAND ROUTES
    {
        path: '/quotations-iti/administration/islands',
        name: 'Island',
        isProtected: true,
        roles: ['Island'],
        component: ManageIslandITI,
        requiredPermissions: ['read'],
        layout: AppLayout,
    },
    
    {
        path: '/quotations-iti/products',
        name: 'Product ITI Quotation',
        isProtected: true,
        roles: ['Product ITI Quotation'],
        component: ManageItemsProductITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/products/create',
        name: 'Product ITI Quotation',
        isProtected: true,
        roles: ['Product ITI Quotation'],
        requiredPermissions: ['create'],
        component: CreateItemsProductITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/products/edit/:id',
        name: 'Product ITI Quotation',
        isProtected: true,
        roles: ['Product ITI Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditItemsProductITI,
        layout: AppLayout,
    },

    {
        path: '/quotations-iti/manage',
        name: 'Manage ITI Quotation',
        isProtected: true,
        roles: ['Manage ITI Quotation'],
        component: ManageQuotationITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/manage/create',
        name: 'Manage ITI Quotation',
        isProtected: true,
        roles: ['Manage ITI Quotation'],
        requiredPermissions: ['create'],
        component: CreateQuotationITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/manage/edit/:quotationId',
        name: 'Manage ITI Quotation',
        isProtected: true,
        roles: ['Manage ITI Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditQuotationITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/accessories',
        name: 'Accessories ITI Quotation',
        isProtected: true,
        roles: ['Accessories ITI Quotation'],
        requiredPermissions: ['read'],
        component: AccessoriesProductITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/accessories/create',
        name: 'Accessories ITI Quotation',
        isProtected: true,
        roles: ['Accessories ITI Quotation'],
        requiredPermissions: ['create'],
        component: CreateAccessoriesITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/accessories/edit/:id',
        name: 'Accessories ITI Quotation',
        isProtected: true,
        roles: ['Accessories ITI Quotation'],
        requiredPermissions: ['update', 'read'],
        component: EditAccessoriesITI,
        layout: AppLayout,
    },
    
    {
        path: '/quotations-iti/term-condition/create',
        name: 'TNC ITI Quotation',
        isProtected: true,
        roles: ['TNC ITI Quotation'],
        requiredPermissions: ['create'],
        component: CreateTNCITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/term-condition',
        name: 'TNC ITI Quotation',
        isProtected: false,
        roles: ['TNC ITI Quotation'],
        requiredPermissions: ['read'],
        component: TNCManageITI,
        layout: AppLayout,
    },
    {
        path: '/quotations-iti/term-condition/edit/:id',
        name: 'TNC ITI Quotation',
        isProtected: true,
        roles: ['TNC ITI Quotation'],
        requiredPermissions: ['update', 'read'],
        component: TNCEditITI,
        layout: AppLayout,
    },
    // ========================================
    // END QUOTATION ITI ROUTES
    // ========================================

    // ROE CALCULATOR ROUTES
    {
        path: '/roe-roa-calculator/manage/create',
        name: 'Manage ROA ROE Calculate',
        isProtected: true,
        roles: ['Manage ROA ROE Calculate'],
        requiredPermissions: ['create'],
        component: CreateROECalculator,
        layout: AppLayout,
    },
    {
        path: '/roe-roa-calculator/manage',
        name: 'Manage ROA ROE Calculate',
        isProtected: false,
        roles: ['Manage ROA ROE Calculate'],
        requiredPermissions: ['read'],
        component: ROECalculatorManage,
        layout: AppLayout,
    },
    {
        path: '/roe-roa-calculator/manage/breakdown/:calculatorId',
        name: 'Manage ROA ROE Calculate',
        isProtected: false,
        roles: ['Manage ROA ROE Calculate'],
        requiredPermissions: ['read'],
        component: ROECalculatorBreakdown,
        layout: AppLayout,
    },
    {
        path: '/roe-roa-calculator/manage/edit/:calculatorId',
        name: 'Manage ROA ROE Calculate',
        isProtected: true,
        roles: ['Manage ROA ROE Calculate'],
        requiredPermissions: ['update', 'read'],
        component: ROECalculatorEdit,
        layout: AppLayout,
    },
    {
        path: '/roe-roa-calculator/manage/view/:id',
        name: 'Manage ROA ROE Calculate',
        isProtected: true,
        roles: ['Manage ROA ROE Calculate'],
        requiredPermissions: ['read'],
        component: ROECalculatorEdit,
        layout: AppLayout,
    },
    {
        path: '/roe-roa-calculator/settings',
        name: 'Setting ROA ROE Calculate',
        isProtected: true,
        roles: ['Setting ROA ROE Calculate'],
        requiredPermissions: ['update', 'read'],
        component: ROESettings,
        layout: AppLayout,
    },

    // CRM MANAGE
    {
        path: '/brand',
        name: 'Brand CRM',
        isProtected: true,
        roles: ['Brand CRM'],
        component: Brand,
        layout: AppLayout,
    },
    {
        path: '/crm/area-structure',
        name: 'Area Structure CRM',
        isProtected: true,
        roles: ['Area Structure CRM'],
        component: Territory,
        layout: AppLayout,
    },
    {
        path: '/crm/iup-management',
        name: 'IUP Management CRM',
        isProtected: true,
        roles: ['IUP Management CRM'],
        component: ManageIUPManagement,
        layout: AppLayout,
    },
    {
        path: '/crm/iup-management/create',
        name: 'IUP Management CRM',
        isProtected: true,
        roles: ['IUP Management CRM'],
        component: CreateIUPManagement,
        layout: AppLayout,
    },
    {
        path: '/crm/iup-management/edit/:id',
        name: 'IUP Management CRM',
        isProtected: true,
        roles: ['IUP Management CRM'],
        component: EditIupManagement,
        layout: AppLayout,
    },
    {
        path: '/crm/user-management',
        name: 'User Management CRM',
        isProtected: true,
        roles: ['User Management CRM'],
        component: UserManagement,
        layout: AppLayout,
    },
    {
        path: '/crm/user-management/create',
        name: 'User Management CRM',
        isProtected: true,
        roles: ['User Management CRM'],
        requiredPermissions: ['create'],
        component: CreateUserAccess,
        layout: AppLayout,
    },
    {
        path: '/crm/user-management/edit/:id',
        name: 'User Management CRM',
        isProtected: true,
        roles: ['User Management CRM'],
        requiredPermissions: ['update', 'read'],
        component: EditUserAccess,
        layout: AppLayout,
    },

    // CRM - Contractors
    {
        path: '/crm/contractors',
        name: 'Contractors CRM',
        isProtected: true,
        roles: ['Contractors CRM'],
        component: Contractors,
        layout: AppLayout,
    },

    {
        path: '/crm/contractors/create',
        name: 'Contractors CRM',
        isProtected: true,
        roles: ['Contractors CRM'],
        requiredPermissions: ['create'],
        component: CreateContractors,
        layout: AppLayout,
    },
    {
        path: '/crm/contractors/edit/:iup_customer_id',
        name: 'Contractors CRM',
        isProtected: true,
        roles: ['Contractors CRM'],
        requiredPermissions: ['update', 'read'],
        component: EditContractors,
        layout: AppLayout,
    },
    {
        path: '/crm/activity',
        name: 'Activities CRM',
        isProtected: true,
        roles: ['Activities CRM'],
        component: Activities,
        layout: AppLayout,
    },

    // CRM - Projects
    {
        path: '/crm/project',
        name: 'Project CRM',
        isProtected: true,
        roles: ['Project CRM'],
        component: ManageCRMProject,
        layout: AppLayout,
    },
    {
        path: '/crm/project/create',
        name: 'Project CRM',
        isProtected: true,
        roles: ['Project CRM'],
        requiredPermissions: ['create'],
        component: CreateCRMProject,
        layout: AppLayout,
    },
    {
        path: '/crm/project/edit/:id',
        name: 'Project CRM',
        isProtected: true,
        roles: ['Project CRM'],
        requiredPermissions: ['update', 'read'],
        component: EditCRMProject,
        layout: AppLayout,
    },

    {
        path: '/crm/activity/create',
        name: 'Activities CRM',
        isProtected: true,
        roles: ['Activities CRM'],
        requiredPermissions: ['create'],
        component: CreateActivities,
        layout: AppLayout,
    },
    {
        path: '/crm/activity/edit/:transactions_id',
        name: 'Activities CRM',
        isProtected: true,
        roles: ['Activities CRM'],
        component: EditActivities,
        layout: AppLayout,
    },
    {
        path: '/crm/manage-division',
        name: 'Division CRM',
        isProtected: true,
        roles: ['Division CRM'],
        requiredPermissions: ['update', 'read'],
        component: ManageDivision,
        layout: AppLayout,
    },
    {
        path: '/netsuite/purchase-order',
        name: 'Purchase Orders Netsuite',
        isProtected: true,
        roles: ['Purchase Orders Netsuite'],
        component: ManagePurchaseOrder,
        layout: AppLayout,
    },
    {
        path: '/netsuite/purchase-order/create',
        name: 'Purchase Orders Netsuite',
        isProtected: true,
        roles: ['Purchase Orders Netsuite'],
        component: CreatePurchaseOrder,
        layout: AppLayout,
    },
    {
        path: '/netsuite/invoice-sales-order',
        name: 'Sales Invoice Netsuite',
        isProtected: true,
        roles: ['Sales Invoice Netsuite'],
        component: ManageInvoiceSalesOrder,
        layout: AppLayout,
    },
    {
        path: '/netsuite/purchase-order/edit/:id',
        name: 'Purchase Orders Netsuite',
        isProtected: true,
        roles: ['Purchase Orders Netsuite'],
        requiredPermissions: ['update', 'read'],
        component: EditPurchaseOrder,
        layout: AppLayout,
    },
    {
        path: '/netsuite/purchase-order/:id/receive',
        name: 'Purchase Orders Netsuite',
        isProtected: true,
        roles: ['Purchase Orders Netsuite'],
        requiredPermissions: ['update', 'read'],
        component: Receive,
        layout: AppLayout,
    },
    {
        path: '/netsuite/purchase-order/:id/receive/:receipt_id',
        name: 'Purchase Orders Netsuite',
        isProtected: true,
        roles: ['Purchase Orders Netsuite'],
        requiredPermissions: ['update', 'read'],
        component: Receive,
        layout: AppLayout,
    },
    {
        path: '/netsuite/invoice-sales-order/view/:tranid',
        name: 'Sales Invoice Netsuite',
        isProtected: true,
        roles: ['Sales Invoice Netsuite'],
        requiredPermissions: ['read'],
        component: ViewInvoiceSalesOrder,
        layout: AppLayout,
    },
    {
        path: '/netsuite/invoice-sales-order/edit/:id',
        name: 'Sales Invoice Netsuite',
        isProtected: true,
        roles: ['Sales Invoice Netsuite'],
        requiredPermissions: ['update', 'read'],
        component: EditInvoiceSalesOrder,
        layout: AppLayout,
    }
];
