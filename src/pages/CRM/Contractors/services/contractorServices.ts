import { apiDelete, apiGet, apiPost, apiPut } from '@/helpers/apiHelper';
import { ContractorListRequest, ContractorListResponse, ContractorFormData, ContractorDetailResponse } from '../types/contractor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;
export class ContractorServices {
    static async getContractors(params: Partial<ContractorListRequest> = {}): Promise<ContractorListResponse> {
        const requestData: Partial<ContractorListRequest> = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            mine_type: '',
            status: '',
            is_admin: API_IS_ADMIN,
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_customers/get`, requestData as Record<string, any>);
        return response.data as ContractorListResponse;
    }

    static async createContractor(data: ContractorFormData): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_customers/create`, data as Record<string, any>);
        return response.data;
    }
    
    static async getContractorById(iup_customer_id: string): Promise<ContractorDetailResponse> {
        const response = await apiGet<ContractorDetailResponse>(`${API_BASE_URL}/crm/iup_customers/${iup_customer_id}`);
        return response.data;
    }

    static async updateContractor(iup_customer_id: string, data: ContractorFormData): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_customers/${iup_customer_id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteContractor(iup_customer_id: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_customers/${iup_customer_id}`);
    }
}