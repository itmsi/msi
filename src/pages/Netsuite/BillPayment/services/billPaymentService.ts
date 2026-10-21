import { apiGet, apiPost } from '@/helpers/apiHelper';
import { BillPaymentRequest, BillPaymentResponse, BillPaymentDetailResponse, BillPaymentApprovalRequest, BillPaymentApprovalResponse, AttachmentFile, AttachmentFilesResponse, AttachmentSyncResponse, AttachmentDownloadResponse } from '../types/billPayment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class BillPaymentService {
    static async getBillPayments(params: Partial<BillPaymentRequest> = {}): Promise<BillPaymentResponse> {
        const requestData: BillPaymentRequest = {
            page: 1,
            limit: 10,
            sort_by: 'trandate',
            sort_order: 'desc',
            ...params
        };

        const response = await apiPost<{ data: BillPaymentResponse }>(
            `${API_BASE_URL}/netsuite/bill-payment/get`,
            requestData as Record<string, any>
        );

        return response.data as unknown as BillPaymentResponse;
    }

    static async getBillPaymentById(id: string): Promise<BillPaymentDetailResponse> {
        const response = await apiGet<{ data: BillPaymentDetailResponse }>(
            `${API_BASE_URL}/netsuite/bill-payment/${id}`
        );

        return response.data as unknown as BillPaymentDetailResponse;
    }

    static async submitApproval(params: BillPaymentApprovalRequest): Promise<BillPaymentApprovalResponse> {
        const response = await apiPost(`${API_BASE_URL}/netsuite/approval-all`, params as Record<string, any>);
        return response.data as BillPaymentApprovalResponse;
    }

    static async syncBillPaymentById(netsuiteId: string): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiGet<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/bill-payment/sync/${netsuiteId}`
        );

        return response.data;
    }

    // List attachment file milik satu bill payment (by netsuite id)
    static async getAttachmentFiles(billPaymentNetsuiteId: string, search = '', page = 1, limit = 10, fileNetsuiteId = ''): Promise<AttachmentFilesResponse> {
        const response = await apiPost<AttachmentFilesResponse>(
            `${API_BASE_URL}/netsuite/bill-payment/attachments-files/get`,
            {
                page,
                limit,
                sort_by: 'updated_at',
                sort_order: 'desc',
                search,
                bill_payment_netsuite_id: billPaymentNetsuiteId,
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
            `${API_BASE_URL}/netsuite/bill-payment/attachments-files/download/${fileNetsuiteId}`
        );
        return response.data;
    }

    // Sync semua attachment satu bill payment dari bridge API
    static async syncAttachmentFiles(billPaymentNetsuiteId: number): Promise<AttachmentSyncResponse> {
        const response = await apiPost<AttachmentSyncResponse>(
            `${API_BASE_URL}/netsuite/bill-payment/attachments-files/sync`,
            { id: billPaymentNetsuiteId }
        );
        return response.data;
    }

    // Convert satu file attachment (by file netsuite id)
    static async syncAttachmentFile(billPaymentNetsuiteId: number, fileNetsuiteId: string): Promise<{ success: boolean; message?: string; data?: AttachmentFile }> {
        const response = await apiPost<{ success: boolean; message?: string; data?: AttachmentFile }>(
            `${API_BASE_URL}/netsuite/bill-payment/attachments-files/sync/${billPaymentNetsuiteId}`,
            { file_netsuite_id: fileNetsuiteId }
        );
        return response.data;
    }

    static async syncBillPayments(): Promise<any> {
        const response = await apiPost<any>(
            `${API_BASE_URL}/netsuite/sync/modules`,
            { module: 'bill_payments' }
        );

        return response.data;
    }
}
