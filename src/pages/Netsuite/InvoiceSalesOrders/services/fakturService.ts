import { apiGet, apiPut, apiPost } from '@/helpers/apiHelper';
import { Faktur, FakturResponse, ReferenceRequest, ReferenceResponse } from '../types/faktur';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class FakturService {
    static async getFakturById(id: string): Promise<FakturResponse> {
        const response = await apiGet<{ data: FakturResponse }>(
            `${API_BASE_URL}/netsuite/faktur/${id}`,
            {}
        );
        return response.data as unknown as FakturResponse;
    }

    static async getReferences(params: {
        type: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ReferenceResponse> {
        const payload: ReferenceRequest = {
            page: params.page || 1,
            limit: params.limit || 30,
            search: params.search || "",
            sort_by: "created_at",
            sort_order: "desc",
            type: params.type
        };

        const response = await apiPost<ReferenceResponse>(`${API_BASE_URL}/netsuite/reference/get`, payload as Record<string, any>);
        
        return response.data;
    }

    static async updateFakturById(id: string, data: Faktur): Promise<FakturResponse> {
        const response = await apiPut<{ data: FakturResponse }>(
            `${API_BASE_URL}/netsuite/faktur/${id}`,
            data as unknown as Record<string, unknown>
        );
        return response.data as unknown as FakturResponse;
    }
}
