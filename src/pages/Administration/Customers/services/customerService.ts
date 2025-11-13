import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { CustomerResponse, CustomerRequest, Customer, CustomerFormData } from '../types/customer';

/**
 * Customer Service
 * Handles all API operations related to customers
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class CustomerService {
    static async getCustomers(params: Partial<CustomerRequest> = {}): Promise<CustomerResponse> {
        const requestData: CustomerRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/customers/get`, requestData as Record<string, any>);
        return response.data as CustomerResponse;
    }

    // Get existing customer by ID
    static async getCustomerById(customerId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Customer }>> {
        return await apiGet<{ success: boolean; message: string; data: Customer }>(`${API_BASE_URL}/customers/${customerId}`, { customer_id: customerId });
    }

    static async createCustomer(customerData: CustomerFormData): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
        try {
            const response = await apiPost(`${API_BASE_URL}/customers/create`, customerData as Record<string, any>);
            return response.data as { success: boolean; data?: any; message?: string; errors?: any };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to create customer',
                errors: error.errors
            };
        }
    }

    static async updateCustomer(customerId: string, customerData: Partial<Omit<Customer, 'customer_id'>>): Promise<Customer> {
        const response = await apiPut<{ data: Customer }>(`${API_BASE_URL}/${customerId}`, customerData);
        return response.data.data;
    }

    static async deleteCustomer(customerId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/customers/${customerId}`);
        // const response = await apiDelete<{ message: string }>(`${API_BASE_URL}/${customerId}`);
        // return response.data.message || 'Customer deleted successfully';
    }

    static async exportCustomers(params: Partial<CustomerRequest> = {}): Promise<Blob> {
        const requestData = {
            page: 1,
            limit: 1000, // Large limit for export
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiGet<Blob>(`${API_BASE_URL}/export`, requestData as Record<string, any>);
        return response.data;
    }

    static async importCustomers(file: File): Promise<{ message: string; imported_count: number; errors: any[] }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiPost<{ message: string; imported_count: number; errors: any[] }>(
            `${API_BASE_URL}/import`, 
            formData
        );
        
        return {
            message: response.data.message || 'Import completed',
            imported_count: response.data.imported_count || 0,
            errors: response.data.errors || []
        };
    }

    static async searchCustomers(searchQuery: string, filters?: {
        email_domain?: string;
        phone_prefix?: string;
        address_city?: string;
    }): Promise<CustomerResponse> {
        const params = {
            search: searchQuery,
            ...filters
        };

        const response = await apiGet<CustomerResponse>(`${API_BASE_URL}/search`, params);
        return response.data;
    }

    static async getCustomerStats(): Promise<{
        total_customers: number;
        new_this_month: number;
        active_customers: number;
        top_cities: Array<{ city: string; count: number }>;
    }> {
        const response = await apiGet<{
            total_customers: number;
            new_this_month: number;
            active_customers: number;
            top_cities: Array<{ city: string; count: number }>;
        }>(`${API_BASE_URL}/stats`);
        
        return {
            total_customers: response.data.total_customers || 0,
            new_this_month: response.data.new_this_month || 0,
            active_customers: response.data.active_customers || 0,
            top_cities: response.data.top_cities || []
        };
    }
}