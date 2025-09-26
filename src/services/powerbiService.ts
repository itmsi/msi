import { apiDelete, apiGet, apiPost, apiPostMultipart, apiPut, apiPutMultipart } from '@/helpers/apiHelper';
import { 
    PowerBIListRequest, 
    PowerBIListResponse,
    PowerBICategoryResponse,
    CategoryListRequest, 
    CategoryListResponse,
    PowerBICategory,
    EmployeeHasPowerBi
} from '@/types/powerbi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreatePowerBIRequest {
    category_id: string;
    title: string;
    link: string;
    description: string;
    status: 'active' | 'inactive';
    employeeHasPowerBi?: EmployeeHasPowerBi[];
}

export interface UpdatePowerBIRequest {
    category_id?: string;
    title?: string;
    link?: string;
    description?: string;
    status?: 'active' | 'inactive';
    employeeHasPowerBi?: EmployeeHasPowerBi[];
}

export interface DashboardViewRequest {
    page: number;
    limit: number;
    search?: string;
    category_id?: string;
    status: 'active';
}

export class dashboardService {
    // Helper function to convert object to FormData
    private static toFormData(data: Record<string, unknown>): FormData {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'employeeHasPowerBi' && Array.isArray(value)) {
                    // Handle array of employee access objects
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        return formData;
    }

    // Get PowerBI Dashboards
    static async getDashboards(params: PowerBIListRequest): Promise<PowerBIListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.category_id && params.category_id.trim() !== '') {
            filteredParams.category_id = params.category_id;
        }
        
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }

        const response = await apiPost(`${API_BASE_URL}/powerbi/get`, filteredParams);
        return response.data as PowerBIListResponse;
    }

    // Get PowerBI Dashboards for Dashboard View (active only)
    static async getDashboardsForView(params: DashboardViewRequest): Promise<PowerBIListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit,
            status: params.status // Always include status: active for dashboard view
        };

        // Only include non-empty optional parameters
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.category_id && params.category_id.trim() !== '') {
            filteredParams.category_id = params.category_id;
        }

        const response = await apiPost(`${API_BASE_URL}/powerbi/dashboard`, filteredParams);
        return response.data as PowerBIListResponse;
    }

    // Get PowerBI Dashboard by ID (if needed for detail view)
    static async getDashboardById(id: string): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const response = await apiGet(`${API_BASE_URL}/powerbi/${id}`);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to fetch dashboard details'
            };
        }
    }

    // Get Dashboard Categories
    static async getCategories(): Promise<PowerBICategoryResponse> {
        const response = await apiPost(`${API_BASE_URL}/categories/get`, {});
        return response.data as PowerBICategoryResponse;
    }

    // Create PowerBI Dashboard
    static async createDashboard(data: CreatePowerBIRequest): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const formData = this.toFormData(data as unknown as Record<string, unknown>);
            const response = await apiPostMultipart(`${API_BASE_URL}/powerbi/create`, formData);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to create dashboard'
            };
        }
    }

    // Update PowerBI Dashboard
    static async updateDashboard(id: string, data: UpdatePowerBIRequest): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const formData = this.toFormData(data as unknown as Record<string, unknown>);
            const response = await apiPutMultipart(`${API_BASE_URL}/powerbi/${id}`, formData);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to update dashboard'
            };
        }
    }

    // Delete PowerBI Dashboard
    static async deleteDashboard(id: string): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const response = await apiDelete(`${API_BASE_URL}/powerbi/${id}`);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to delete dashboard'
            };
        }
    }
}

export interface CreateCategoryRequest {
    name: string;
    description: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
}

export class categoryService {
    // Get Categories with pagination and search
    static async getCategories(params: CategoryListRequest): Promise<CategoryListResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }

        const response = await apiPost(`${API_BASE_URL}/categories/get`, filteredParams);
        return response.data as CategoryListResponse;
    }

    // Get Category by ID
    static async getCategoryById(id: string): Promise<{ success: boolean; data: PowerBICategory; message?: string }> {
        try {
            const response = await apiPost(`${API_BASE_URL}/categories/detail`, { id });
            return response.data as { success: boolean; data: PowerBICategory; message?: string };
        } catch (error) {
            return {
                success: false,
                data: {} as PowerBICategory,
                message: 'Failed to fetch category details'
            };
        }
    }

    // Create Category
    static async createCategory(data: CreateCategoryRequest): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const response = await apiPost(`${API_BASE_URL}/categories/create`, data as unknown as Record<string, unknown>);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to create category'
            };
        }
    }

    // Update Category
    static async updateCategory(id: string, data: UpdateCategoryRequest): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const response = await apiPut(`${API_BASE_URL}/categories/${id}`, data as unknown as Record<string, unknown>);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to update category'
            };
        }
    }

    // Delete Category
    static async deleteCategory(id: string): Promise<{ success: boolean; data: any; message?: string }> {
        try {
            const response = await apiDelete(`${API_BASE_URL}/categories/${id}`);
            return response.data as { success: boolean; data: any; message?: string };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Failed to delete category'
            };
        }
    }
}