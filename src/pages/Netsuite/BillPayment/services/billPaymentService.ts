import { apiGet, apiPost } from '@/helpers/apiHelper';
import { BillPaymentRequest, BillPaymentResponse, BillPaymentDetailResponse, BillPaymentApprovalRequest, BillPaymentApprovalResponse } from '../types/billPayment';

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

    static async syncBillPayments(): Promise<any> {
        const response = await apiPost<any>(
            `${API_BASE_URL}/netsuite/sync/modules`,
            { module: 'bill_payments' }
        );

        return response.data;
    }
}
