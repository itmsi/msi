import { apiGet, apiPost } from '@/helpers/apiHelper';
import { RorSettingsListResponse, RorSettingsRecord, RorSettingsRequest } from '../types/settings';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class SettingsService {

    static async getSettings(params: Partial<RorSettingsRecord> = {}): Promise<RorSettingsListResponse> {
        const requestData: RorSettingsRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            sort_by: 'created_at',
            ...params
        };
        const response = await apiGet(`${API_BASE_URL}/calculations/quote-defaults/self`, requestData as Record<string, any>);
        return response.data as RorSettingsListResponse;
    }
    
    static async updateSettings(rorData: Partial<Omit<RorSettingsRecord, 'id'>> | FormData): Promise<RorSettingsRecord> {
        if (rorData instanceof FormData) {
            const response = await apiPost<{ data: RorSettingsRecord }>(`${API_BASE_URL}/calculations/quote-defaults/create`, rorData);
            return response.data.data;
        }
        
        const response = await apiPost<{ data: RorSettingsRecord }>(`${API_BASE_URL}/calculations/quote-defaults/create`, rorData);
        return response.data.data;
    }
}

'https://services.motorsights.com/api/calculations/quote-defaults/self'
'https://services.motorsights.com/api/calculations/quote-defaults/self'