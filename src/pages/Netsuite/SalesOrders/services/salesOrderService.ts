import { apiPost, apiGet, apiPut, apiPostMultipart } from '@/helpers/apiHelper';
import {
    SalesOrderRequest,
    SalesOrderResponse,
    SalesOrderCreateRequest,
    SalesOrderUpdateRequest,
    CustomerResponse,
    BankDataResponse,
    SOAttachmentResponse,
    SOAttachmentUpdate,
    ResponseAttachUpdateItem,
    SOAttachmentDelete,
    SOAttachment,
    SOApprovalResponse,
    SOApprovalRequest
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

    static async submitApproval(params: SOApprovalRequest): Promise<SOApprovalResponse> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/sales-orders/approval`, params as Record<string, any>);
        return response.data as SOApprovalResponse;
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
    static async getSOBanks(params: Partial<SalesOrderRequest> = {}): Promise<BankDataResponse> {
        const requestData: SalesOrderRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/bank/get`, requestData as Record<string, any>);
        return response.data as BankDataResponse;
    }


    static async attachFileSO(payload: SOAttachment): Promise<SOAttachmentResponse> {
        const fd = new FormData();
        fd.append('file', payload.file);
        fd.append('file_name', payload.file_name);
        fd.append('so_id', payload.so_id);
        const response = await apiPostMultipart<SOAttachmentResponse>(`${API_BASE_URL}/netsuite/sales-orders/upload`, fd);
        return response.data;
    }

    static async attachFileSOUpdate(payload: SOAttachmentUpdate): Promise<ResponseAttachUpdateItem> {
        const fd = new FormData();
        if (payload.file) fd.append('file', payload.file);
        fd.append('so_id', payload.soId ?? '');
        fd.append('file_name', payload.file_name);
        fd.append('fileUrl', payload.fileUrl);
        const response = await apiPostMultipart<ResponseAttachUpdateItem>(`${API_BASE_URL}/netsuite/sales-orders/upload-update`, fd);
        
        return response.data;
    }

    static async attachFileSODelete(payload: SOAttachmentDelete): Promise<SOAttachmentResponse> {
        const requestData = {
            fileUrl: payload.fileUrl
        };
        const response = await apiPost<SOAttachmentResponse>(`${API_BASE_URL}/netsuite/sales-orders/upload-delete`, requestData as Record<string, any>);
        return response.data;
    }
}
