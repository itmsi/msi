import { apiGet, apiPost, apiPut, apiDelete, apiPostMultipart, ApiResponse } from '@/helpers/apiHelper';
import { 
    LegacyMenuFormData, 
    MenuApiResponse, 
    MenuDetailResponse, 
    MenuPermissionResponse,
    MenuListRequest,
    MenuListResponse,
    MenuFormData,
    CompanyListRequest,
    CompanyListResponse,
    CompanyFormData,
    CompanyDetailResponse,
    Company,
    CompanyValidationErrors,
    DepartmentListRequest,
    DepartmentListResponse,
    DepartmentFormData,
    DepartmentDetailResponse,
    EmployeeListRequest,
    EmployeeListResponse,
    EmployeeFormData,
    EmployeeDetailResponse,
    RoleListRequest,
    RoleListResponse,
    RoleFormData,
    RoleSingleResponse,
    Role,
    RoleValidationErrors,
    PositionListRequest,
    PositionListResponse,
    PositionFormData,
    PositionDetailResponse,
    Position,
    PositionValidationErrors
} from '@/types/administration';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class administrationService {
    // Menu Services - Updated to use new API structure
    static async getMenus(params: MenuListRequest): Promise<MenuListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }
        
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.menu_name && params.menu_name.trim() !== '') {
            filteredParams.menu_name = params.menu_name;
        }

        const response = await apiPost(`${API_BASE_URL}/menus/get`, filteredParams);
        return response.data as MenuListResponse;
    }

    static async getMenuById(id: string): Promise<MenuDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/menus/${id}`);
        return response.data as MenuDetailResponse;
    }

    static async createMenu(data: MenuFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/menus/create`, data as unknown as Record<string, unknown>);
    }

    static async updateMenu(id: string, data: MenuFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/menus/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteMenu(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/menus/${id}`);
    }

    static async toggleMenuStatus(id: string, isActive: boolean): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/menus/${id}/status`, { is_active: isActive });
    }

    // Legacy Menu Services (for backward compatibility)
    static async getMenusLegacy(page: number = 1, limit: number = 10): Promise<MenuApiResponse> {
        const response = await apiGet(`${API_BASE_URL}/menus?page=${page}&limit=${limit}&sortBy=id&sortOrder=DESC`);
        return response.data as MenuApiResponse;
    }

    static async createMenuLegacy(data: LegacyMenuFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/menus`, data as unknown as Record<string, unknown>);
    }

    static async updateMenuLegacy(id: number, data: LegacyMenuFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/menus/${id}`, data as unknown as Record<string, unknown>);
    }

    // Menu Permission Services
    static async getMenuPermissionsByMenuId(menuId: number): Promise<MenuPermissionResponse> {
        const response = await apiGet(`${API_BASE_URL}/menu-has-permissions/by-menu/${menuId}`);
        return response.data as MenuPermissionResponse;
    }

    static async createMenuPermission(data: { menu_id: number; permission_id: number; createdBy: number }): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/menu-has-permissions`, data as unknown as Record<string, unknown>);
    }

    static async deleteMenuPermission(mhpId: number): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/menu-has-permissions/${mhpId}`);
    }
    
    static async updateMenuPermissionStatus(requestBody: { menu_id: number; permission_id: number; updatedBy: number }): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/api/menu-has-permissions/${requestBody.menu_id}`, requestBody);
    }
    
}

// =====================================================
// COMPANY SERVICES
// =====================================================

export class companyService {
    // Company Services
    static async getCompanies(params: CompanyListRequest): Promise<CompanyListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }
        
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.company_name && params.company_name.trim() !== '') {
            filteredParams.company_name = params.company_name;
        }

        const response = await apiPost(`${API_BASE_URL}/companies/get`, filteredParams);
        return response.data as CompanyListResponse;
    }

    static async getCompanyById(id: string): Promise<CompanyDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/companies/${id}`);
        return response.data as CompanyDetailResponse;
    }

    // Validation service methods
    static validateCompanyForm(formData: CompanyFormData, existingCompanies: Company[], editingCompanyId?: string): CompanyValidationErrors {
        const errors: CompanyValidationErrors = {};

        // Company name validation
        if (!formData.company_name || formData.company_name.trim() === '') {
            errors.company_name = 'Company name is required';
        } else if (formData.company_name.trim().length < 2) {
            errors.company_name = 'Company name must be at least 2 characters long';
        } else if (formData.company_name.trim().length > 100) {
            errors.company_name = 'Company name must not exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-_.&()]+$/.test(formData.company_name.trim())) {
            errors.company_name = 'Company name contains invalid characters';
        } else {
            // Check for duplicate company name
            const isDuplicate = existingCompanies.some(company => 
                company.company_name.toLowerCase() === formData.company_name.trim().toLowerCase() &&
                (!editingCompanyId || company.company_id !== editingCompanyId)
            );
            if (isDuplicate) {
                errors.company_name = 'A company with this name already exists';
            }
        }

        // Company email validation (optional but validate format if provided)
        if (formData.company_email && formData.company_email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.company_email.trim())) {
                errors.company_email = 'Please enter a valid email address';
            } else if (formData.company_email.trim().length > 100) {
                errors.company_email = 'Email address must not exceed 100 characters';
            } else {
                // Check for duplicate email
                const isDuplicateEmail = existingCompanies.some(company => 
                    company.company_email && 
                    company.company_email.toLowerCase() === formData.company_email!.trim().toLowerCase() &&
                    (!editingCompanyId || company.company_id !== editingCompanyId)
                );
                if (isDuplicateEmail) {
                    errors.company_email = 'A company with this email already exists';
                }
            }
        }

        // Company address validation (optional but validate length if provided)
        if (formData.company_address && formData.company_address.trim() !== '') {
            if (formData.company_address.trim().length > 500) {
                errors.company_address = 'Address must not exceed 500 characters';
            }
        }

        return errors;
    }

    // Business logic for company submission
    static async submitCompanyForm(
        formData: CompanyFormData, 
        existingCompanies: Company[], 
        editingCompany?: Company
    ): Promise<{ success: boolean; errors?: CompanyValidationErrors; message?: string }> {
        try {
            // Validate form data
            const validationErrors = this.validateCompanyForm(formData, existingCompanies, editingCompany?.company_id);
            
            if (Object.keys(validationErrors).length > 0) {
                return {
                    success: false,
                    errors: validationErrors,
                    message: 'Please fix the validation errors before submitting'
                };
            }

            // Prepare clean data for submission
            const cleanFormData: CompanyFormData = {
                company_name: formData.company_name.trim(),
                company_parent_id: formData.company_parent_id || null,
                company_address: formData.company_address?.trim() || null,
                company_email: formData.company_email?.trim() || null
            };

            // Submit to API
            let response: { status: number };
            
            if (editingCompany) {
                response = await this.updateCompany(editingCompany.company_id, cleanFormData);
            } else {
                response = await this.createCompany(cleanFormData);
            }

            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    message: editingCompany ? 'Company updated successfully' : 'Company created successfully'
                };
            } else {
                return {
                    success: false,
                    errors: { general: 'Failed to save company. Please try again.' },
                    message: 'Failed to save company'
                };
            }
        } catch (error) {
            console.error('Error in submitCompanyForm:', error);
            return {
                success: false,
                errors: { general: 'An unexpected error occurred. Please try again.' },
                message: 'An unexpected error occurred'
            };
        }
    }

    static async createCompany(data: CompanyFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/companies/create`, data as unknown as Record<string, unknown>);
    }

    static async updateCompany(id: string, data: CompanyFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/companies/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteCompany(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/companies/${id}`);
    }

    // Toggle company status (if needed for active/inactive functionality)
    static async toggleCompanyStatus(companyId: string): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/companies/${companyId}/toggle-status`, {});
    }
}

export class departmentService {
    // Department Services
    static async getDepartments(params: DepartmentListRequest): Promise<DepartmentListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }
        
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.company_id && params.company_id.trim() !== '') {
            filteredParams.company_id = params.company_id;
        }
        
        if (params.company_name && params.company_name.trim() !== '') {
            filteredParams.company_name = params.company_name;
        }
        
        if (params.department_parent_id && params.department_parent_id.trim() !== '') {
            filteredParams.department_parent_id = params.department_parent_id;
        }
        
        if (params.department_name && params.department_name.trim() !== '') {
            filteredParams.department_name = params.department_name;
        }

        const response = await apiPost(`${API_BASE_URL}/departments/get`, filteredParams);
        return response.data as DepartmentListResponse;
    }

    static async getDepartmentById(id: string): Promise<DepartmentDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/departments/${id}`);
        return response.data as DepartmentDetailResponse;
    }

    static async createDepartment(data: DepartmentFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/departments/create`, data as unknown as Record<string, unknown>);
    }

    static async updateDepartment(id: string, data: DepartmentFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/departments/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteDepartment(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/departments/${id}`);
    }

    // Toggle department status (if needed for active/inactive functionality)
    static async toggleDepartmentStatus(departmentId: string): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/departments/${departmentId}/toggle-status`, {});
    }
}

export class employeesService {
    // Employee Services
    static async getEmployees(params: EmployeeListRequest): Promise<EmployeeListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit,
            employee_status: params.employee_status
        };

        // Only include non-empty optional parameters
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }
        
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.title_id && params.title_id.trim() !== '') {
            filteredParams.title_id = params.title_id;
        }
        
        if (params.company_name && params.company_name.trim() !== '') {
            filteredParams.company_name = params.company_name;
        }
        
        if (params.department_name && params.department_name.trim() !== '') {
            filteredParams.department_name = params.department_name;
        }
        
        if (params.title_name && params.title_name.trim() !== '') {
            filteredParams.title_name = params.title_name;
        }
        
        if (params.is_sales_quotation !== undefined) {
            filteredParams.is_sales_quotation = params.is_sales_quotation;
        }

        const response = await apiPost(`${API_BASE_URL}/employees/get`, filteredParams);
        return response.data as EmployeeListResponse;
    }

    static async getEmployeeById(id: string): Promise<EmployeeDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/employees/${id}`);
        return response.data as EmployeeDetailResponse;
    }

    static async getEmployeeDetail(id: string): Promise<any> {
        const response = await apiGet(`${API_BASE_URL}/employees/${id}`);
        return response.data;
    }

    static async createEmployee(data: EmployeeFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/employees/create`, data as unknown as Record<string, unknown>);
    }

    // Create employee with photo support using multipart
    static async createEmployeeWithPhoto(formData: FormData): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
        try {
            const response = await apiPostMultipart(`${API_BASE_URL}/employees/create`, formData);
            return response.data as { success: boolean; data?: any; message?: string; errors?: any };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to create employee',
                errors: error.errors
            };
        }
    }

    static async updateEmployee(id: string, data: EmployeeFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/employees/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteEmployee(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/employees/${id}`);
    }

    static async resetEmployeePassword(id: string): Promise<ApiResponse> {
        return await apiPut(`${API_BASE_URL}/employees/reset_password`, { employee_id: id });
    }

    // Toggle employee status (if needed for active/inactive functionality)
    static async toggleEmployeeStatus(employeeId: string): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/employees/${employeeId}/toggle-status`, {});
    }
}

// Role Service class
export class roleService {
    static async getRoles(params: RoleListRequest): Promise<RoleListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }
        
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.role_name && params.role_name.trim() !== '') {
            filteredParams.role_name = params.role_name;
        }
        
        if (params.role_parent_id && params.role_parent_id.trim() !== '') {
            filteredParams.role_parent_id = params.role_parent_id;
        }

        const response = await apiPost(`${API_BASE_URL}/roles/get`, filteredParams);
        return response.data as RoleListResponse;
    }

    static async getRoleById(id: string): Promise<RoleSingleResponse> {
        const response = await apiGet(`${API_BASE_URL}/roles/${id}`);
        return response.data as RoleSingleResponse;
    }

    // Validation service methods
    static validateRoleForm(formData: RoleFormData, existingRoles: Role[], editingRoleId?: string): RoleValidationErrors {
        const errors: RoleValidationErrors = {};

        // Role name validation
        if (!formData.role_name || formData.role_name.trim() === '') {
            errors.role_name = 'Role name is required';
        } else if (formData.role_name.trim().length < 2) {
            errors.role_name = 'Role name must be at least 2 characters';
        } else if (formData.role_name.trim().length > 100) {
            errors.role_name = 'Role name must not exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.role_name.trim())) {
            errors.role_name = 'Role name can only contain letters, numbers, spaces, hyphens, and underscores';
        } else {
            // Check for duplicate role names
            const duplicateRole = existingRoles.find(role => 
                role.role_name.toLowerCase().trim() === formData.role_name.toLowerCase().trim() &&
                (!editingRoleId || role.role_id !== editingRoleId)
            );
            if (duplicateRole) {
                errors.role_name = 'Role name already exists';
            }
        }

        // Parent role validation (optional but if selected, must be valid)
        if (formData.role_parent_id) {
            const parentRole = existingRoles.find(role => role.role_id === formData.role_parent_id);
            if (!parentRole) {
                errors.role_parent_id = 'Selected parent role is invalid';
            }
            
            // Prevent circular dependency
            if (editingRoleId && formData.role_parent_id === editingRoleId) {
                errors.role_parent_id = 'A role cannot be its own parent';
            }
        }

        return errors;
    }

    // Business logic for role submission
    static async submitRoleForm(
        formData: RoleFormData, 
        existingRoles: Role[], 
        editingRole?: Role
    ): Promise<{ success: boolean; errors?: RoleValidationErrors; message?: string }> {
        try {
            // Validate form data
            const validationErrors = this.validateRoleForm(formData, existingRoles, editingRole?.role_id);
            
            if (Object.keys(validationErrors).length > 0) {
                return {
                    success: false,
                    errors: validationErrors,
                    message: 'Please fix the validation errors before submitting'
                };
            }

            // Prepare clean data for submission
            const cleanFormData: RoleFormData = {
                role_name: formData.role_name.trim(),
                role_parent_id: formData.role_parent_id || null
            };

            // Submit to API
            let response: { status: number };
            
            if (editingRole) {
                response = await this.updateRole(editingRole.role_id, cleanFormData);
            } else {
                response = await this.createRole(cleanFormData);
            }

            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    message: editingRole ? 'Role updated successfully' : 'Role created successfully'
                };
            } else {
                return {
                    success: false,
                    errors: { general: 'Failed to save role. Please try again.' },
                    message: 'Failed to save role'
                };
            }
        } catch (error) {
            console.error('Error in submitRoleForm:', error);
            return {
                success: false,
                errors: { general: 'An unexpected error occurred. Please try again.' },
                message: 'An unexpected error occurred'
            };
        }
    }

    static async createRole(data: RoleFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/roles/create`, data as unknown as Record<string, unknown>);
    }

    static async updateRole(id: string, data: RoleFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/roles/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteRole(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/roles/${id}`);
    }

    // Toggle role status (if needed for active/inactive functionality)
    static async toggleRoleStatus(roleId: string): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/roles/${roleId}/toggle-status`, {});
    }
}

// ====================================
// POSITION SERVICE
// ====================================

export class positionService {
    static async getPositions(params: PositionListRequest): Promise<PositionListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search.trim();
        }
        
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }
        
        if (params.department_id && params.department_id.trim() !== '') {
            filteredParams.department_id = params.department_id.trim();
        }
        
        if (params.department_name && params.department_name.trim() !== '') {
            filteredParams.department_name = params.department_name.trim();
        }
        
        if (params.title_name && params.title_name.trim() !== '') {
            filteredParams.title_name = params.title_name.trim();
        }

        const response = await apiPost(`${API_BASE_URL}/titles/get`, filteredParams);
        return response.data as PositionListResponse;
    }

    static async getPositionById(id: string): Promise<PositionDetailResponse> {
        return await apiGet(`${API_BASE_URL}/titles/${id}`) as unknown as PositionDetailResponse;
    }

    static async submitPositionForm(
        formData: PositionFormData, 
        editingPosition: Position | null = null
    ): Promise<{
        success: boolean;
        errors?: PositionValidationErrors;
        message: string;
    }> {
        try {
            // Basic validation
            const errors: PositionValidationErrors = {};
            
            if (!formData.title_name || formData.title_name.trim() === '') {
                errors.title_name = 'Position name is required';
            }
            
            if (!formData.department_id || formData.department_id.trim() === '') {
                errors.department_id = 'Department is required';
            }

            if (Object.keys(errors).length > 0) {
                return {
                    success: false,
                    errors,
                    message: 'Please fix the validation errors'
                };
            }

            // Clean form data
            const cleanFormData = {
                title_name: formData.title_name.trim(),
                department_id: formData.department_id.trim()
            };

            // Submit to API
            let response: { status: number };
            
            if (editingPosition) {
                response = await this.updatePosition(editingPosition.title_id, cleanFormData);
            } else {
                response = await this.createPosition(cleanFormData);
            }

            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    message: editingPosition ? 'Position updated successfully' : 'Position created successfully'
                };
            } else {
                return {
                    success: false,
                    errors: { general: 'Failed to save position. Please try again.' },
                    message: 'Failed to save position'
                };
            }
        } catch (error) {
            console.error('Error in submitPositionForm:', error);
            return {
                success: false,
                errors: { general: 'An unexpected error occurred. Please try again.' },
                message: 'An unexpected error occurred'
            };
        }
    }

    static async createPosition(data: PositionFormData): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/titles/create`, data as unknown as Record<string, unknown>);
    }

    static async updatePosition(id: string, data: PositionFormData): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/titles/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deletePosition(id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/titles/${id}`);
    }

    // Toggle position status (if needed for active/inactive functionality)
    static async togglePositionStatus(positionId: string): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/titles/${positionId}/toggle-status`, {});
    }
}