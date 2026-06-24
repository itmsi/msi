import { apiDelete, apiPost, apiPut } from '@/helpers/apiHelper';
import { WorkOrderRequest, WorkOrderResponse } from '../types/workorder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class WorkOrderService {
    static async getWorkOrders(params: Partial<WorkOrderRequest> = {}): Promise<WorkOrderResponse> {
        const requestData: WorkOrderRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/work_order/get`, requestData as Record<string, any>);
        return response.data as WorkOrderResponse;
    }
    static async deleteWorkOrder(workOrderId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/work_order/${workOrderId}`);
    }
    static async repairProcessWorkOrder(workOrderId: string, params: { work_order_status: string }): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/crm/work_order/${workOrderId}`, params);
    }
}