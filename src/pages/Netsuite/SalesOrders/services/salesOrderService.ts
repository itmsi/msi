import { apiPost, apiGet, apiPut } from '@/helpers/apiHelper';
import {
    SalesOrderRequest,
    SalesOrderResponse,
    SalesOrderCreateRequest,
    SalesOrderUpdateRequest,
    CustomerResponse,
} from '../types/salesOrder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class SalesOrderService {
    static async getSalesOrders(params: Partial<SalesOrderRequest> = {}): Promise<SalesOrderResponse> {
        const requestData: SalesOrderRequest = {
            page: 1,
            limit: 20,
            sort_by: 'id',
            sort_order: 'desc',
            ...params,
        };

        const response = await apiPost<{ data: SalesOrderResponse }>(
            `${API_BASE_URL}/netsuite/sales-orders/get`,
            requestData as Record<string, any>
        );

        return response.data as unknown as SalesOrderResponse;
    }

    // GET /netsuite/sales-orders/{id} returns same list format as getSalesOrders
    static async getSalesOrderById(id: string): Promise<SalesOrderResponse> {
        const response = await apiGet<SalesOrderResponse>(
            `${API_BASE_URL}/netsuite/sales-orders/${id}`
        );
        return response.data;
    }

    static async createSalesOrder(payload: SalesOrderCreateRequest): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPost<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/sales-orders/create`,
            payload as Record<string, any>
        );
        return response.data;
    }

    static async updateSalesOrder(payload: SalesOrderUpdateRequest): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPut<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/sales-orders/update`,
            payload as Record<string, any>
        );
        return response.data;
    }
    static async syncSalesOrders(params: Partial<SalesOrderRequest> = {}): Promise<SalesOrderResponse> {
        const requestData: SalesOrderRequest = {
            page: 1,
            limit: 20,
            sort_by: 'id',
            sort_order: 'desc',
            ...params,
        };

        const response = await apiPost<{ data: SalesOrderResponse }>(
            `${API_BASE_URL}/netsuite/sales-orders/sync`,
            requestData as Record<string, any>
        );

        return response.data as unknown as SalesOrderResponse;
    }

    static async syncSalesOrderById(id: string): Promise<SalesOrderResponse> {
        const response = await apiGet<SalesOrderResponse>(
            `${API_BASE_URL}/netsuite/sales-orders/sync/${id}`
        );
        return response.data;
    }

    static async getCustomers(params: Partial<SalesOrderRequest> = {}): Promise<CustomerResponse> {
        const requestData: SalesOrderRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost<{ data: CustomerResponse }>(
            `${API_BASE_URL}/netsuite/customers/get-list`,
            requestData as Record<string, any>
        );

        return response.data as unknown as CustomerResponse;
    }
}
