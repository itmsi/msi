// Master Production Types - Updated to match new API response
export interface Menu {
    menu_id: string;
    menu_name: string;
    menu_parent_id: string | null;
    menu_url: string;
    menu_icon: string;
    menu_order: number;
    created_at: string;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

// Legacy Menu interface for backward compatibility
export interface LegacyMenu {
    id: number;
    parent_id: number | null;
    menu_name: string;
    menu_code: string;
    icon: string;
    url: string;
    is_parent: boolean;
    sort_order: number;
    status: string;
    module: string;
    createdAt: string;
    createdBy: number | null;
    updatedAt: string;
    updatedBy: number | null;
    deletedAt: string | null;
    deletedBy: number | null;
    children: LegacyMenu[];
    menuHasPermissions: MenuPermissionDetail[];
    permissionIds: number[];
}

export interface MenuPermissionDetail {
    id: number;
    menu_id: number;
    permission_id: number;
    createdAt: string;
    createdBy: number | null;
    updatedAt: string;
    updatedBy: number | null;
    permission: {
        id: number;
        permission_name: string;
        permission_code: string;
        description: string;
        createdAt: string;
        createdBy: number | null;
        updatedAt: string;
        updatedBy: number | null;
        deletedAt: string | null;
        deletedBy: number | null;
    };
}

export interface MenuPermissionResponse {
    statusCode: number;
    message: string;
    data: MenuPermissionData[];
}

export interface MenuPermissionData {
    id: number;
    menu_id: number;
    data_permission: PermissionItem[];
}

export interface PermissionItem {
    permission_id: number;
    permission_name: string;
    has_status: boolean;
    mhp_id: number;
}

// export interface MenuPermissionItem {
//     id: number;
//     menu_id: number;
//     permission_id: number;
//     permission: {
//         id: number;
//         permission_name: string;
//         permission_code: string;
//         status: boolean;
//     };
// }

export interface MenuFormData {
    menu_name: string;
    menu_parent_id: string | null;
    menu_url: string;
    // menu_icon: string;
    menu_order: number;
}

// Legacy MenuFormData for backward compatibility
export interface LegacyMenuFormData {
    parent_id: number | null;
    menu_name: string;
    menu_code: string;
    icon: string;
    url: string;
    is_parent: boolean;
    sort_order: number;
    status: string;
    module: string;
    permissionIds: number[];
}

// New API request/response types
export interface MenuListRequest {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: string;
    search?: string;
    menu_name?: string;
}

export interface MenuListResponse {
    success: boolean;
    message: string;
    data: {
        data: Menu[];
        pagination: MenuPagination;
    };
    timestamp: string;
}

export interface MenuPagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
}

// Legacy API response for backward compatibility
export interface MenuApiResponse {
    statusCode: number;
    message: string;
    data: LegacyMenu[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}

export interface MenuDetailResponse {
    data: Menu | LegacyMenu;
}

// Updated Pagination type
export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// New validation errors interface
export interface MenuValidationErrors {
    menu_name?: string;
    menu_parent_id?: string;
    menu_icon?: string;
    menu_order?: string;
    menu_url?: string;
}

// Legacy validation errors for backward compatibility
export interface ValidationErrors {
    menu_name?: string;
    menu_code?: string;
    url?: string;
    sort_order?: string;
    module?: string;
    status?: string;
    icon?: string;
}

// export type TabType = 'manage-menu' | 'manage-role-permission' | 'manage-user-role-permission' | 'manage-employee' | 'manage-department';

export interface MenuPermission {
    id: number;
    menu_id: number;
    permission_id: number;
    role_id: number;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

export interface MenuPermissionFormData {
    menu_id: number;
    permission_id: number;
    role_id: number;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

// Filter state interface for menu management
export interface MenuFilters {
    search: string;
    menu_name: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Menu state management interface
export interface MenuState {
    menus: Menu[];
    loading: boolean;
    pagination: MenuPagination | null;
    filters: MenuFilters;
    selectedMenu: Menu | null;
    isModalOpen: boolean;
    editingMenu: Menu | null;
    formData: MenuFormData;
    validationErrors: MenuValidationErrors;
}

// =====================================================
// COMPANY MANAGEMENT TYPES
// =====================================================

// Company interface matching API response
export interface Company {
    company_id: string;
    company_name: string;
    company_parent_id: string | null;
    company_address: string | null;
    company_email: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

// Company form data for create/update
export interface CompanyFormData {
    company_name: string;
    company_parent_id?: string | null;
    company_address?: string | null;
    company_email?: string | null;
}

// Company validation errors
export interface CompanyValidationErrors {
    company_name?: string;
    company_parent_id?: string;
    company_address?: string;
    company_email?: string;
    general?: string; // For server errors, network errors, or other general validation issues
}

// Company list request parameters
export interface CompanyListRequest {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: string;
    search?: string;
    company_name?: string;
}

// Company list response
export interface CompanyListResponse {
    success: boolean;
    message: string;
    data: {
        data: Company[];
        pagination: CompanyPagination;
    };
    timestamp: string;
}

// Company pagination
export interface CompanyPagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
}

// Company filters
export interface CompanyFilters {
    search: string;
    company_name: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Company detail response
export interface CompanyDetailResponse {
    success: boolean;
    message: string;
    data: Company;
    timestamp: string;
}

// Company state management interface
export interface CompanyState {
    companies: Company[];
    loading: boolean;
    pagination: CompanyPagination | null;
    filters: CompanyFilters;
    selectedCompany: Company | null;
    isModalOpen: boolean;
    editingCompany: Company | null;
    formData: CompanyFormData;
    validationErrors: CompanyValidationErrors;
}
// ====================================
// COMPANY
// ====================================

// ====================================
// DEPARTMENT
// ====================================

// Department interface based on API response
export interface Department {
    department_id: string;
    department_name: string;
    department_parent_id: string | null;
    company_id: string;
    created_at: string;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    department_segmentasi: string;
    company_name: string;
}

// Department form data for create/update
export interface DepartmentFormData {
    department_name: string;
    department_parent_id?: string | null;
    company_id: string;
    department_segmentasi?: string;
}

// Department validation errors
export interface DepartmentValidationErrors {
    department_name?: string;
    department_parent_id?: string;
    company_id?: string;
    department_segmentasi?: string;
}

// Department list request parameters
export interface DepartmentListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    company_id?: string;
    company_name?: string;
    department_parent_id?: string;
    department_name?: string;
}

// Department list response
export interface DepartmentListResponse {
    success: boolean;
    message: string;
    data: {
        data: Department[];
        pagination: DepartmentPagination;
    };
    timestamp: string;
}

// Department pagination
export interface DepartmentPagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
}

// Department filters
export interface DepartmentFilters {
    search: string;
    company_id: string;
    company_name: string;
    department_parent_id: string;
    department_name: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Department detail response
export interface DepartmentDetailResponse {
    success: boolean;
    message: string;
    data: Department;
    timestamp: string;
}

// Department state management interface
export interface DepartmentState {
    departments: Department[];
    loading: boolean;
    pagination: DepartmentPagination | null;
    filters: DepartmentFilters;
    selectedDepartment: Department | null;
    isModalOpen: boolean;
    editingDepartment: Department | null;
    formData: DepartmentFormData;
    validationErrors: DepartmentValidationErrors;
}
// ====================================
// DEPARTMENT
// ====================================

// ====================================
// EMPLOYEE
// ====================================

// Employee interface based on API response
export interface Employee {
    employee_id: string;
    employee_name: string;
    employee_email: string;
    employee_status: string;
    is_sales_quotation: boolean;
    title_id: string;
    created_at: string;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    gender_id: string | null;
    company_id: string;
    department_id: string;
    employee_mobile: string | null;
    employee_office_number: string | null;
    employee_address: string | null;
    employee_channel: string | null;
    employee_activation_status: string | null;
    employee_disabled: boolean;
    employee_wechat_workplace: string | null;
    island_id: string;
    employee_phone: string | null;
    title_name: string;
    department_name: string;
    company_name: string;
}

// Permission detail interface for employee detail response
export interface EmployeePermissionDetail {
    permission_id: string;
    permission_name: string;
    permission_status: boolean;
}

// Menu permission interface for employee detail response
export interface EmployeeMenuPermission {
    menu_id: string;
    menu_name: string;
    permission_detail: EmployeePermissionDetail[];
}

// System permission interface for new nested structure
export interface EmployeeSystemPermission {
    system_id: string;
    system_name: string;
    permission_detail: EmployeeMenuPermission[];
}

// Employee detailed data interface (extends Employee with additional fields)
export interface EmployeeDetailData extends Employee {
    employee_exmail_account: string | null;
    password: string | null;
    employee_foto: string | null;
    permission_detail: EmployeeSystemPermission[]; // Updated to new structure
}

// Employee form data for create/update
export interface EmployeeFormData {
    employee_name: string;
    employee_email?: string;
    employee_status: string;
    is_sales_quotation: boolean;
    title_id: string;
    company_id: string;
    department_id: string;
    employee_mobile?: string | null;
    employee_office_number?: string | null;
    employee_address?: string | null;
    employee_phone?: string | null;
    gender_id?: string | null;
    island_id?: string;
    permission_detail?: EmployeeSystemPermission[]; // Updated to new structure
}

// Employee validation errors
export interface EmployeeValidationErrors {
    employee_name?: string;
    employee_email?: string;
    employee_password?: string;
    title_id?: string;
    department_id?: string;
    company_id?: string;
    employee_mobile?: string;
    employee_office_number?: string;
    employee_address?: string;
    employee_phone?: string;
    employee_status?: string;
    is_sales_quotation?: boolean;
    gender_id?: string;
    island_id?: string;
    employee_foto?: string;
}

// Employee list request parameters
export interface EmployeeListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    title_id?: string;
    company_name?: string;
    department_name?: string;
    title_name?: string;
    is_sales_quotation?: boolean;
}

// Employee list response
export interface EmployeeListResponse {
    success: boolean;
    message: string;
    data: {
        data: Employee[];
        pagination: EmployeePagination;
    };
    timestamp: string;
}

// Employee pagination
export interface EmployeePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Employee filters
export interface EmployeeFilters {
    search: string;
    title_id: string;
    company_name: string;
    department_name: string;
    title_name: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Employee detail response
export interface EmployeeDetailResponse {
    success: boolean;
    message: string;
    data: Employee;
    timestamp: string;
}

// Employee state management interface
export interface EmployeeState {
    employees: Employee[];
    loading: boolean;
    pagination: EmployeePagination | null;
    filters: EmployeeFilters;
    selectedEmployee: Employee | null;
    isModalOpen: boolean;
    editingEmployee: Employee | null;
    formData: EmployeeFormData;
    validationErrors: EmployeeValidationErrors;
}
// ====================================
// EMPLOYEE
// ====================================

// ====================================
// ROLE MANAGEMENT
// ====================================

// Role interface based on the API response
export interface Role {
    role_id: string;
    role_name: string;
    role_parent_id: string | null;
    created_at: string;
    created_by: string;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
}

// Role form data interface for creating/updating roles
export interface RoleFormData {
    role_name: string;
    role_parent_id: string | null;
}

// Role pagination interface
export interface RolePagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
}

// Role filters interface for search and filtering
export interface RoleFilters {
    search: string;
    sort_by: string;
    sort_order: string;
    role_name: string;
    role_parent_id: string;
}

// Role list request interface for API calls
export interface RoleListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    role_name?: string;
    role_parent_id?: string;
}

// Role validation errors interface
// Role validation errors interface
export interface RoleValidationErrors {
    role_name?: string;
    role_parent_id?: string;
    general?: string;
}

// Role API response interface
export interface RoleListResponse {
    success: boolean;
    message: string;
    data: {
        data: Role[];
        pagination: RolePagination;
    };
    timestamp: string;
}

// Single role response interface
export interface RoleSingleResponse {
    success: boolean;
    message: string;
    data: Role;
    timestamp: string;
}

// Role state management interface
export interface RoleState {
    roles: Role[];
    loading: boolean;
    pagination: RolePagination | null;
    filters: RoleFilters;
    selectedRole: Role | null;
    isModalOpen: boolean;
    editingRole: Role | null;
    formData: RoleFormData;
    validationErrors: RoleValidationErrors;
}

// ====================================
// POSITION MANAGEMENT TYPES
// ====================================

// Position interface based on API response
export interface Position {
    title_id: string;
    title_name: string;
    department_id: string;
    created_at: string;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    department_name: string;
}

// Position form data for create/update
export interface PositionFormData {
    title_name: string;
    department_id: string;
}

// Position validation errors
export interface PositionValidationErrors {
    title_name?: string;
    department_id?: string;
    general?: string;
}

// Position list request parameters
export interface PositionListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    department_id?: string;
    department_name?: string;
    title_name?: string;
}

// Position list response
export interface PositionListResponse {
    success: boolean;
    message: string;
    data: {
        data: Position[];
        pagination: PositionPagination;
    };
    timestamp: string;
}

// Position pagination
export interface PositionPagination {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
}

// Position filters
export interface PositionFilters {
    search: string;
    department_id: string;
    department_name: string;
    title_name: string;
    sort_by: string;
    sort_order: 'asc' | 'desc' | '';
}

// Position detail response
export interface PositionDetailResponse {
    success: boolean;
    message: string;
    data: Position;
    timestamp: string;
}

// Position state management interface
export interface PositionState {
    positions: Position[];
    loading: boolean;
    pagination: PositionPagination | null;
    filters: PositionFilters;
    selectedPosition: Position | null;
    isModalOpen: boolean;
    editingPosition: Position | null;
    formData: PositionFormData;
    validationErrors: PositionValidationErrors;
}
// ====================================
// POSITION
// ====================================
