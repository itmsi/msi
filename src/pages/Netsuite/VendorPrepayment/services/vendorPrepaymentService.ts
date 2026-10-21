import { apiGet, apiPost } from '@/helpers/apiHelper';
import { VendorPrepaymentRequest, VendorPrepaymentResponse, VendorPrepaymentDetailResponse, VendorPrepaymentApprovalRequest, VendorPrepaymentApprovalResponse, AttachmentFile, AttachmentFilesResponse, AttachmentSyncResponse, AttachmentDownloadResponse } from '../types/vendorPrepayment';

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

    // List attachment file milik satu vendor prepayment (by netsuite id)
    static async getAttachmentFiles(vendorPrepaymentNetsuiteId: string, search = '', page = 1, limit = 10, fileNetsuiteId = ''): Promise<AttachmentFilesResponse> {
        const response = await apiPost<AttachmentFilesResponse>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/attachments-files/get`,
            {
                page,
                limit,
                sort_by: 'created_at',
                sort_order: 'desc',
                search,
                vendor_prepayment_netsuite_id: vendorPrepaymentNetsuiteId,
                file_netsuite_id: fileNetsuiteId,
                status: '',
                is_deleted: false,
            }
        );
        return response.data;
    }

    // Ambil link download file attachment (hanya untuk file berstatus SUCCESS)
    static async getAttachmentDownloadLink(fileNetsuiteId: string): Promise<AttachmentDownloadResponse> {
        const response = await apiGet<AttachmentDownloadResponse>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/attachments-files/download/${fileNetsuiteId}`
        );
        return response.data;
    }

    // Sync semua attachment satu vendor prepayment dari bridge API
    static async syncAttachmentFiles(vendorPrepaymentNetsuiteId: number): Promise<AttachmentSyncResponse> {
        const response = await apiPost<AttachmentSyncResponse>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/attachments-files/sync`,
            { id: vendorPrepaymentNetsuiteId }
        );
        return response.data;
    }

    // Convert satu file attachment (by file netsuite id)
    static async syncAttachmentFile(vendorPrepaymentNetsuiteId: number, fileNetsuiteId: string): Promise<{ success: boolean; message?: string; data?: AttachmentFile }> {
        const response = await apiPost<{ success: boolean; message?: string; data?: AttachmentFile }>(
            `${API_BASE_URL}/netsuite/vendor-prepayment/attachments-files/sync/${vendorPrepaymentNetsuiteId}`,
            { file_netsuite_id: fileNetsuiteId }
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
