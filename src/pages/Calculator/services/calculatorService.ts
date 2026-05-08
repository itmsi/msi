import { apiPost, apiPut, apiDelete, apiGet } from '@/helpers/apiHelper';
import { HaulingPriceDetailResponse, HaulingPriceResponse, KalkulasiRequest } from '../types/calculator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class CalculatorService {
    static async getHaulingPrices(params: Partial<KalkulasiRequest> = {}): Promise<HaulingPriceResponse> {
        const requestData: KalkulasiRequest = {
            page: 1,
            limit: 10,
            sort_by: 'updated_at',
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/calculations/hauling_prices/get`, requestData as Record<string, any>);
        return response.data as HaulingPriceResponse;
    }

    static async getHaulingPriceDetailById(id: string): Promise<HaulingPriceDetailResponse> {
        const response = await apiGet<HaulingPriceDetailResponse>(`${API_BASE_URL}/calculations/hauling_prices/${id}`);
        return response.data;
    }

    static async createHaulingPrice(body: Record<string, any>): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/calculations/hauling_prices/create`, body);
        return response.data;
    }

    static async updateHaulingPrice(haulingPriceId: string, body: Record<string, any>): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/calculations/hauling_prices/${haulingPriceId}`, body);
        return response.data;
    }

    static async deleteHaulingPrice(haulingPriceId: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/calculations/hauling_prices/${haulingPriceId}`);
        return response.data;
    }
}