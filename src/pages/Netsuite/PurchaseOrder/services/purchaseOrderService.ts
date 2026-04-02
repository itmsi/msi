import { apiPost, apiGet, ApiResponse } from '@/helpers/apiHelper';
import { LocationDataResponse, MasterDataFormFieldItems, POApprovalRequest, POApprovalResponse, PODetailResponse, POItemResponse, POItemsRequest, PurchaseOrderRequest, PurchaseOrderResponse, VendorResponse } from '../types/purchaseorder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class PurchaseOrderService {
    static async getPurchaseOrders(params: Partial<PurchaseOrderRequest> = {}): Promise<PurchaseOrderResponse> {
        const requestData: PurchaseOrderRequest = {
            page: 1,
            limit: 10,
            sort_by: 'updated_at',
            sort_order: 'desc',
            search: '',
            status: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/get-list`, requestData as Record<string, any>);
        // const response = await apiPost(`https://api-bridge-sb.motorsights.com/api/v1/bridge/purchase-orders/get-list`, requestData as Record<string, any>);
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
            sort_by: 'updated_at',
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

    static async createPurchaseOrder(requestData: any): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/create`, requestData);
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

}
