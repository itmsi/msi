import { apiPost, apiGet } from '@/helpers/apiHelper';
import { ReceiptRequest, ReceiptResponse, ReceiptDetailResponse } from '../types/receipt';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ReceiptService {
    static async getReceipts(params: Partial<ReceiptRequest> = {}): Promise<ReceiptResponse> {
        const requestData: ReceiptRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/items/get-receipts`, requestData as Record<string, any>);
        return response.data as ReceiptResponse;
    }

    static async getReceiptDetail(id: string): Promise<ReceiptDetailResponse> {
        const response = await apiGet<ReceiptDetailResponse>(`${API_BASE_URL}/netsuite/items/get-receipts/${id}`);
        return response.data;
    }
}
