import { apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import {
    QuotationRequest,
    QuotationListResponse,
    QuotationDetailResponse,
    QuotationCreateRequest,
    QuotationUpdateRequest,
    MasterDataFormFieldItems
} from '../types/quotation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class QuotationService {
    static async getQuotations(params: Partial<QuotationRequest> = {}): Promise<QuotationListResponse> {
        const requestData: QuotationRequest = {
            page: 1,
            limit: 10,
            sort_by: 'tran_date',
            sort_order: 'desc',
            ...params
        };

        const response = await apiPost<{ data: QuotationListResponse }>(
            `${API_BASE_URL}/netsuite/quotation/get`,
            requestData as Record<string, any>
        );

        return response.data as unknown as QuotationListResponse;
    }

    static async getFieldComponentById(): Promise<ApiResponse<{ success: boolean; message: string; data: MasterDataFormFieldItems }>> {
        return await apiGet<{ success: boolean; message: string; data: MasterDataFormFieldItems }>(
            `${API_BASE_URL}/netsuite/componen/get-list`
        );
    }

    static async getQuotationById(id: string): Promise<QuotationDetailResponse & { sync_info?: any }> {
        const response = await apiGet<QuotationDetailResponse & { sync_info?: any }>(
            `${API_BASE_URL}/netsuite/quotation/${id}`
        );

        // API get by ID usually returns response.data
        return response.data;
    }

    static async createQuotation(payload: QuotationCreateRequest): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPost<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/quotation/create`,
            payload as Record<string, any>
        );
        return response.data;
    }

    static async updateQuotation(payload: QuotationUpdateRequest): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPut<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/quotation/update`,
            payload as Record<string, any>
        );
        return response.data;
    }

    static async syncQuotationById(id: string): Promise<QuotationDetailResponse> {
        const response = await apiGet<QuotationDetailResponse>(
            `${API_BASE_URL}/netsuite/quotation/sync/${id}`
        );
        return response.data;
    }
}
