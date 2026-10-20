import { apiGet, apiPost } from '@/helpers/apiHelper';
import { VendorPrepaymentRequest, VendorPrepaymentResponse, VendorPrepaymentDetailResponse, VendorPrepaymentApprovalRequest, VendorPrepaymentApprovalResponse } from '../types/vendorPrepayment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class VendorPrepaymentService {
    static async getVendorPrepayments(params: Partial<VendorPrepaymentRequest> = {}): Promise<VendorPrepaymentResponse> {
        const requestData: VendorPrepaymentRequest = {
            page: 1,
            page_size: 10,
            sort_by: 'last_modified_netsuite',
            sort_order: 'DESC',
            ...params
        };

        const response = await apiPost<{ data: VendorPrepaymentResponse }>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/get`,
            requestData as Record<string, any>
        );

        return response.data as unknown as VendorPrepaymentResponse;
    }

    // id = UUID atau netsuite_id
    static async getVendorPrepaymentById(id: string): Promise<VendorPrepaymentDetailResponse> {
        const response = await apiGet<{ data: VendorPrepaymentDetailResponse }>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/${id}`
        );

        return response.data as unknown as VendorPrepaymentDetailResponse;
    }

    static async submitApproval(params: VendorPrepaymentApprovalRequest): Promise<VendorPrepaymentApprovalResponse> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/approval-all`, params as Record<string, any>);
        return response.data as VendorPrepaymentApprovalResponse;
    }

    static async syncVendorPrepaymentById(netsuiteId: string): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiGet<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/sync/${netsuiteId}`
        );

        return response.data;
    }

    static async syncVendorPrepayments(): Promise<any> {
        const response = await apiPost<any>(
            `${API_BASE_URL}/netsuite/sync/modules`,
            { module: 'vendor_prepayments' }
        );

        return response.data;
    }
}
