import { apiPost } from '@/helpers/apiHelper';
import { DashboardApiResponse, BrandRequest } from '../types/customerDashboard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class CustomerService {
    static async getDashboards(params: Partial<BrandRequest> = {}): Promise<DashboardApiResponse> {
        const requestData: BrandRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/customer_360/get`, requestData as Record<string, any>);
        return response.data as DashboardApiResponse;
    }

    
}