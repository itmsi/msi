import { apiPost, apiGet } from '@/helpers/apiHelper';
import { FulfillmentRequest, FulfillmentResponse, FulfillmentDetailResponse } from '../types/fulfillment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class FulfillmentService {
    static async getFulfillments(params: Partial<FulfillmentRequest> = {}): Promise<FulfillmentResponse> {
        const requestData: FulfillmentRequest = {
            page: 1,
            limit: 10,
            sort_by: 'last_modified',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/items/get-fulfillment`, requestData as Record<string, any>);
        return response.data as FulfillmentResponse;
    }

    static async getFulfillmentDetail(id: string): Promise<FulfillmentDetailResponse> {
        const response = await apiGet<FulfillmentDetailResponse>(`${API_BASE_URL}/netsuite/items/get-fulfillment/${id}`);
        return response.data;
    }
}
