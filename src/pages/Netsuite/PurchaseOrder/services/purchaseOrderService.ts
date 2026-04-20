import { apiPost, apiGet, ApiResponse, apiPut } from '@/helpers/apiHelper';
import { ComponentsDataResponse, ItemReceiptPayload, LocationDataResponse, MasterDataFormFieldItems, POApprovalRequest, POApprovalResponse, PODetailResponse, PODownloadRequest, PODownloadResponse, POItemResponse, POItemsRequest, PostReceiptResponse, PurchaseOrderFormUpdate, PurchaseOrderRequest, PurchaseOrderResponse, ReceiptResponse, ReceiveRequest, TermsDataResponse, VendorResponse } from '../types/purchaseorder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class PurchaseOrderService {
    static async getPurchaseOrders(params: Partial<PurchaseOrderRequest> = {}): Promise<PurchaseOrderResponse> {
        const requestData: PurchaseOrderRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            status: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/get-list`, requestData as Record<string, any>);
        return response.data as PurchaseOrderResponse;
    }
    static async getFieldComponentById(): Promise<ApiResponse<{ success: boolean; message: string; data: MasterDataFormFieldItems }>> {
        return await apiGet<{ success: boolean; message: string; data: MasterDataFormFieldItems }>(
            `${API_BASE_URL}/netsuite/componen/get-list`
        );
    }

    static async getPOItems(params: Partial<POItemsRequest> = {}): Promise<POItemResponse> {
        const requestData: POItemsRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/items/get-list`, requestData as Record<string, any>);
        return response.data as POItemResponse;
    }

    static async getPOLocation(params: Partial<POItemsRequest> = {}): Promise<LocationDataResponse> {
        const requestData: POItemsRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/locations/get-list`, requestData as Record<string, any>);
        return response.data as LocationDataResponse;
    }

    static async getPOClass(params: Partial<POItemsRequest> = {}): Promise<ComponentsDataResponse> {
        const requestData: POItemsRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/classes/get-list`, requestData as Record<string, any>);
        return response.data as ComponentsDataResponse;
    }

    static async getPODepartment(params: Partial<POItemsRequest> = {}): Promise<ComponentsDataResponse> {
        const requestData: POItemsRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/departments/get-list`, requestData as Record<string, any>);
        return response.data as ComponentsDataResponse;
    }

    static async getPOVendor(params: Partial<POItemsRequest> = {}): Promise<VendorResponse> {
        const requestData: POItemsRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/vendor/get-list`, requestData as Record<string, any>);
        return response.data as VendorResponse;
    }

    static async getPOTerms(params: Partial<POItemsRequest> = {}): Promise<TermsDataResponse> {
        const requestData: POItemsRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/terms/get-list`, requestData as Record<string, any>);
        return response.data as TermsDataResponse;
    }

    static async createPurchaseOrder(requestData: any): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/create`, requestData);
        return response.data;
    }

    static async updatePurchaseOrder(data: PurchaseOrderFormUpdate): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/netsuite/purchasing-orders/update`, data as Record<string, any>);
        return response.data;
    }

    static async submitApproval(params: POApprovalRequest): Promise<POApprovalResponse> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/approval`, params as Record<string, any>);
        return response.data as POApprovalResponse;
    }
    
    static async getPOById(id: string): Promise<PODetailResponse> {
        const response = await apiGet<PODetailResponse>(`${API_BASE_URL}/netsuite/purchasing-orders/${id}`);
        return response.data;
    }

    static async syncPOItems(params: Partial<PurchaseOrderRequest> = {}): Promise<PurchaseOrderResponse> {
        const requestData: PurchaseOrderRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            status: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite//purchasing-orders/sync`, requestData as Record<string, any>);
        return response.data as PurchaseOrderResponse;
    }

    static async syncPOById(id: string): Promise<PODetailResponse> {
        const response = await apiGet<PODetailResponse>(`${API_BASE_URL}/netsuite/purchasing-orders/sync/${id}`);
        return response.data;
    }

    static async downloadInvoice(params: PODownloadRequest): Promise<PODownloadResponse> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/print`, params as Record<string, any>);
        return response.data as PODownloadResponse;
    }

    static async getReceiptById(params: Partial<ReceiveRequest> = {}): Promise<ReceiptResponse> {
        const requestData: ReceiveRequest = {
            page: 1,
            page_size: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/receive-list`, requestData as Record<string, any>);
        return response.data as ReceiptResponse;
    }

    static async syncPOByIdReceipt(id: string): Promise<ReceiptResponse> {
        const response = await apiGet<ReceiptResponse>(`${API_BASE_URL}/netsuite/purchasing-orders/receive-list/${id}`);
        return response.data;
    }

    static async submitReceipt(params: ItemReceiptPayload): Promise<PostReceiptResponse> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/receive-item`, params as Record<string, any>);
        return response.data as PostReceiptResponse;
    }
}
