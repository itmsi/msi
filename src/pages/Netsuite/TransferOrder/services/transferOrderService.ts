import { apiPost, apiGet, apiPut, apiPostMultipart, apiPutMultipart, apiDelete } from '@/helpers/apiHelper';
import {
    TransferOrderRequest,
    TransferOrderResponse,
    TransferOrderDetailResponse,
    TransferOrderCreateRequest,
    TransferOrderUpdateRequest,
    AttachFileItem,
} from '../types/transferOrder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface TOAttachmentUpdate {
    file?: File;
    id?: string;
    file_name: string;
    fileUrl: string;
    created_by_api?: string;
    netsuite_id?: string;
}

export interface TOAttachmentResponse {
    success: boolean;
    id: string;
    poId?: string;
    toId?: string;
    fileUrl: string;
    storagePath?: string;
    fileName: string;
    message?: string;
}

export interface ResponseAttachUpdateItem {
    success: boolean;
    data: AttachFileItem;
    message: string;
}

export class TransferOrderService {
    static async getTransferOrders(params: Partial<TransferOrderRequest> = {}): Promise<TransferOrderResponse> {
        const requestData: TransferOrderRequest = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            ...params,
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/transfer-orders/get-list`, requestData as Record<string, any>);
        return response.data as TransferOrderResponse;
    }

    static async getTransferOrderById(id: string): Promise<TransferOrderDetailResponse> {
        const response = await apiGet<TransferOrderDetailResponse>(`${API_BASE_URL}/netsuite/transfer-orders/${id}`);
        return response.data;
    }

    static async createTransferOrder(payload: TransferOrderCreateRequest): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPost<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/transfer-orders/create`,
            payload as unknown as Record<string, any>
        );
        return response.data;
    }

    static async updateTransferOrder(payload: TransferOrderUpdateRequest): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPut<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/transfer-orders/update`,
            payload as unknown as Record<string, any>
        );
        return response.data;
    }

    static async syncTransferOrderById(id: string): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPost<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/transfer-orders/sync/${id}`
        );
        return response.data;
    }

    // Staging upload (mirrors PurchaseOrder's attachFilePO) — used before the TO has a real netsuite_id (Create mode)
    static async attachFileTO(payload: { file: File; file_name: string; netsuite_id: string }): Promise<TOAttachmentResponse> {
        const fd = new FormData();
        fd.append('file', payload.file);
        fd.append('file_name', payload.file_name);
        fd.append('netsuite_id', payload.netsuite_id);
        const response = await apiPostMultipart<TOAttachmentResponse>(`${API_BASE_URL}/netsuite/transfer-orders/upload`, fd);
        return response.data;
    }

    // Generic attachment endpoint (mirrors PurchaseOrder detail attachments), type = 'transfer_order'
    static async attachFileDetailTO(payload: { file: File; file_name: string; created_by_api?: string; to_id: string }): Promise<TOAttachmentResponse> {
        const fd = new FormData();
        fd.append('file', payload.file);
        fd.append('type', 'transfer_order');
        fd.append('file_name', payload.file_name);
        fd.append('created_by_api', payload.created_by_api ?? '');
        fd.append('netsuite_id', payload.to_id);
        const response = await apiPostMultipart<TOAttachmentResponse>(`${API_BASE_URL}/netsuite/attach_file`, fd);
        return response.data;
    }

    static async attachFileUpdateDetailTO(payload: TOAttachmentUpdate, id: string): Promise<ResponseAttachUpdateItem> {
        const fd = new FormData();
        if (payload.file) fd.append('file', payload.file);
        fd.append('type', 'transfer_order');
        fd.append('fileUrl', payload.fileUrl);
        fd.append('file_name', payload.file_name);
        fd.append('netsuite_id', payload.netsuite_id ?? '');
        fd.append('created_by_api', payload.created_by_api ?? '');
        const response = await apiPutMultipart<ResponseAttachUpdateItem>(`${API_BASE_URL}/netsuite/attach_file/${id}`, fd);
        return response.data;
    }

    static async attachFileDeleteDetailTO(id: string, toId: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/netsuite/attach_file/${id}/${toId}`);
        return response.data;
    }
}
