import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { IupItemDetails, IupRequest, IupListResponse, IupManagementFormData, IupZonaSiteResponse, ZonaSitePayload, payloadRequest, GetIupRkabResponse, CreateIupRkabPayload, IupRkabUnitResponse, IupRkabUnitForm, VisitHistoryResponse, VisitPayload } from '../types/iupmanagement';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_IS_ADMIN = import.meta.env.VITE_PARAM_IS_ADMIN;
export class IupService {
    static async getIUPManagement(params: Partial<IupRequest> = {}): Promise<IupListResponse> {
        const requestData: IupRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            search: '',
            status: '',
            is_admin: API_IS_ADMIN,
            is_contractor_count: null,
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_management/get`, requestData as Record<string, any>);
        return response.data as IupListResponse;
    }

    // Get existing Iup by ID
    static async getIupById(id: string): Promise<ApiResponse<{ success: boolean; message: string; data: IupItemDetails }>> {
        return await apiGet<{ success: boolean; message: string; data: IupItemDetails }>(`${API_BASE_URL}/crm/iup_management/${id}`, { iup_id: id });
    }

    static async updateIup(id: string, data: IupManagementFormData): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_management/${id}`, data as Record<string, any>);
        return response.data;
    }

    static async createIup(data: IupManagementFormData): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_management/create`, data as Record<string, any>);
        return response.data;
    }

    // ZONE SITE
    static async getIupZonaSite(params: Partial<payloadRequest> = {}): Promise<IupZonaSiteResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_zona_site/get`, requestData as Record<string, any>);
        return response.data as IupZonaSiteResponse;
    }

    static async createIupZonaSite(data: ZonaSitePayload): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_zona_site/create`, data as Record<string, any>);
        return response.data;
    }

    static async updateIupZonaSite(id: string, data: ZonaSitePayload): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_zona_site/${id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteIupZonaSite(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_zona_site/${id}`);
    }

    // IUP RKAB
    static async getIupRkab(params: Partial<payloadRequest> = {}): Promise<GetIupRkabResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_rkab/get`, requestData as Record<string, any>);
        return response.data as GetIupRkabResponse;
    }

    static async createIupRkab(data: CreateIupRkabPayload): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_rkab/create`, data as Record<string, any>);
        return response.data;
    }

    static async updateIupRkab(id: string, data: CreateIupRkabPayload): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_rkab/${id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteIupRkab(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_rkab/${id}`);
    }

    // IUP UNIT
    static async getIupRkabUnit(params: Partial<payloadRequest> = {}): Promise<IupRkabUnitResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_brand_unit/unit-rkab/get`, requestData as Record<string, any>);
        return response.data as IupRkabUnitResponse;
    }

    static async createUpdateIupRkab(data: IupRkabUnitForm): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_brand_unit/unit-rkab`, data as Record<string, any>);
        return response.data;
    }

    
    // HISTORY VISIT
    static async getIupVisit(params: Partial<payloadRequest> = {}): Promise<VisitHistoryResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 10,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_visit_history/get`, requestData as Record<string, any>);
        return response.data as VisitHistoryResponse;
    }

    static async createIupVisit(data: VisitPayload): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_visit_history/create`, data as Record<string, any>);
        return response.data;
    }

    static async updateIupVisit(id: string, data: VisitPayload): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_visit_history/${id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteIupVisit(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_visit_history/${id}`);
    }

}