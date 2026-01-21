import { apiPost } from '@/helpers/apiHelper';
import { SegmentationOption, SegmentationResponse } from '../types/iupmanagement';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class SegmentationService {
    static async getSegmentations(): Promise<SegmentationOption[]> {
        try {
            const response = await apiPost<SegmentationResponse>(`${API_BASE_URL}/crm/segmentation/get`, {});
            const result = response.data?.data || response.data || [];
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('Error fetching segmentations:', error);
            return [];
        }
    }
}
