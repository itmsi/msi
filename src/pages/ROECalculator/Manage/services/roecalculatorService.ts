import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { RorEntity, RorListRequest, RorListResponse } from '../types/roecalculator';
import { ManageROEDataPDF } from '../../types/roeCalculator';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class RoecalculatorService {

    static async getRor(params: Partial<RorListRequest> = {}): Promise<RorListResponse> {
        const requestData: RorListRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/calculations/quotes/get`, requestData as Record<string, any>);
        return response.data as RorListResponse;
    }
    

    static async deleteRor(rorId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/calculations/quotes/${rorId}`);
    }

    static async getRorById(rorId: string): Promise<ApiResponse<{ status: boolean; message: string; data: RorEntity }>> {
        return await apiGet<{ status: boolean; message: string; data: RorEntity }>(`${API_BASE_URL}/calculations/quotes/${rorId}`);
    }
    
    static async updateRor(rorId: string, rorData: Partial<Omit<RorEntity, 'rorId'>> | FormData): Promise<RorEntity> {
        if (rorData instanceof FormData) {
            const response = await apiPut<{ data: RorEntity }>(`${API_BASE_URL}/calculations/quotes/${rorId}`, rorData);
            return response.data.data;
        }
        
        const response = await apiPut<{ data: RorEntity }>(`${API_BASE_URL}/calculations/quotes/${rorId}`, rorData);
        return response.data.data;
    }
        
    static async downloadRoe(quoteId : string): Promise<ApiResponse<{ success: number; message: string; data: ManageROEDataPDF }>> {
        return await apiGet(`${API_BASE_URL}/calculations/quotes/pdf/${quoteId}`);
    }
}