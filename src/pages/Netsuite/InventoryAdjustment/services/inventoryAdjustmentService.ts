import { apiPost, apiGet } from '@/helpers/apiHelper';
import {
    InventoryAdjustmentRequest,
    InventoryAdjustmentResponse,
    InventoryAdjustmentDetailResponse,
    CreateInventoryAdjustmentRequest,
    CreateInventoryAdjustmentResponse,
} from '../types/inventoryAdjustment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class InventoryAdjustmentService {
    static async getInventoryAdjustments(params: Partial<InventoryAdjustmentRequest> = {}): Promise<InventoryAdjustmentResponse> {
        const requestData: InventoryAdjustmentRequest = {
            page: 1,
            limit: 20,
            sort_by: 'last_modified',
            sort_order: 'DESC',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/inventory_adjustments/get`, requestData as Record<string, any>);
        return response.data as InventoryAdjustmentResponse;
    }

    static async getInventoryAdjustmentDetail(id: string): Promise<InventoryAdjustmentDetailResponse> {
        const response = await apiGet<InventoryAdjustmentDetailResponse>(`${API_BASE_URL}/netsuite/inventory_adjustments/${id}`);
        return response.data;
    }

    static async syncInventoryAdjustmentById(id: string): Promise<InventoryAdjustmentDetailResponse> {
        const response = await apiGet<InventoryAdjustmentDetailResponse>(`${API_BASE_URL}/netsuite/inventory_adjustments/sync/${id}`);
        return response.data;
    }

    static async createInventoryAdjustment(data: CreateInventoryAdjustmentRequest): Promise<CreateInventoryAdjustmentResponse> {
        const response = await apiPost<CreateInventoryAdjustmentResponse>(`${API_BASE_URL}/netsuite/inventory_adjustments/create`, data as unknown as Record<string, any>);
        return response.data;
    }

    static async syncInventoryAdjustments(): Promise<any> {
        const response = await apiPost<any>(`${API_BASE_URL}/netsuite/sync/modules`, { module: 'inventory_adjustments' });
        return response.data;
    }
}
