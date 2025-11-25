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
        const response = await apiPut<{ data: Customer }>(`${API_BASE_URL}/customers/${customerId}`, customerData);
        return response.data.data;
    }

    static async deleteCustomer(customerId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/customers/${customerId}`);
    }
    
}