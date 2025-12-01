import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { Island, IslandListResponse, IslandPayload, IslandRequest } from '../types/island';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class IslandService {
    static async getIslands(params: Partial<IslandRequest> = {}): Promise<IslandListResponse> {
        const requestData: IslandRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/island/get`, requestData as Record<string, any>);
        return response.data as IslandListResponse;
    }

    // Get existing island by ID
    static async getIslandById(islandId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Island }>> {
        return await apiGet<{ success: boolean; message: string; data: Island }>(`${API_BASE_URL}/island/${islandId}`, { island_id: islandId });
    }

    static async createIsland(data: IslandPayload): Promise<{ status: number }> {
        return await apiPost(`${API_BASE_URL}/island/create`, data as unknown as Record<string, unknown>);
    }


    static async updateIsland(id: string, data: IslandPayload): Promise<{ status: number }> {
        return await apiPut(`${API_BASE_URL}/island/${id}`, data as unknown as Record<string, unknown>);
    }

    static async deleteIsland(islandId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/island/${islandId}`);
    }
    
}