import { apiGet, apiPost, apiPut, ApiResponse, apiPostMultipart } from '@/helpers/apiHelper';
import {
    QuotationRequest,
    QuotationListResponse,
    QuotationDetailResponse,
    QuotationCreateRequest,
    QuotationUpdateRequest,
    MasterDataFormFieldItems,
    SOAttachment,
    SOAttachmentDelete,
    SOAttachmentResponse,
    SOAttachmentUpdate,
    ResponseAttachUpdateItem,
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


    static async attachFileQUO(payload: SOAttachment): Promise<SOAttachmentResponse> {
        const fd = new FormData();
        fd.append('file', payload.file);
        fd.append('file_name', payload.file_name);
        fd.append('so_id', payload.so_id);
        const response = await apiPostMultipart<SOAttachmentResponse>(`${API_BASE_URL}/netsuite/sales-orders/upload`, fd);
        return response.data;
    }

    static async attachFileQOUpdate(payload: SOAttachmentUpdate): Promise<ResponseAttachUpdateItem> {
        const fd = new FormData();
        if (payload.file) fd.append('file', payload.file);
        fd.append('so_id', payload.soId ?? '');
        fd.append('file_name', payload.file_name);
        fd.append('fileUrl', payload.fileUrl);
        const response = await apiPostMultipart<ResponseAttachUpdateItem>(`${API_BASE_URL}/netsuite/sales-orders/upload-update`, fd);

        return response.data;
    }

    static async attachFileQUODelete(payload: SOAttachmentDelete): Promise<SOAttachmentResponse> {
        const requestData = {
            fileUrl: payload.fileUrl
        };
        const response = await apiPost<SOAttachmentResponse>(`${API_BASE_URL}/netsuite/sales-orders/upload-delete`, requestData as Record<string, any>);
        return response.data;
    }

}
