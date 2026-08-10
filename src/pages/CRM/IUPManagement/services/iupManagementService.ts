import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { IupItemDetails, IupRequest, IupListResponse, IupManagementFormData, IupZonaSiteResponse, ZonaSitePayload, payloadRequest, GetIupRkabResponse, CreateIupRkabPayload, IupRkabUnitResponse, IupRkabUnitForm, VisitHistoryResponse, VisitPayload, GetIupBrandUnitResponse, IupBrandUnitPayload, GetIupSurveyResponse, IupSurveyPayload, IupSummaryAiListResponse, IupSummaryAiCreatePayload, IupSummaryAiRequest } from '../types/iupmanagement';
import { MasterZoneSiteRequest, MasterZoneSiteListResponse } from '../types/iupSurvey';

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
            is_selection_iup: 'true',
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
            limit: 100,
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
    
    static async updateGuideIupZonaSite(id: string, guide: string): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_zona_site/guide/${id}`, { guide });
        return response.data;
    }
    
    static async deleteIupZonaSite(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_zona_site/${id}`);
    }

    // search: '' untuk get all, atau sectionKey (mis. "warehouse") untuk filter spesifik.
    // is_default sengaja tidak di-default ke sini — hanya dikirim kalau caller
    // eksplisit minta (lihat fetchDefaultZoneTemplate di useIupZoneSIte).
    static async getMasterZoneSite(params: Partial<MasterZoneSiteRequest> = {}): Promise<MasterZoneSiteListResponse> {
        const requestData: MasterZoneSiteRequest = {
            page: 1,
            limit: 10,
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            ...params,
        };

        const response = await apiPost(`${API_BASE_URL}/crm/master_iup_zone_site/get`, requestData as Record<string, any>);
        return response.data as MasterZoneSiteListResponse;
    }

    // IUP RKAB
    static async getIupRkab(params: Partial<payloadRequest> = {}): Promise<GetIupRkabResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 100,
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
            limit: 100,
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
            limit: 100,
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
    
    // Unit
    static async getIupUnit(params: Partial<payloadRequest> = {}): Promise<GetIupBrandUnitResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 100,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_brand_unit/get`, requestData as Record<string, any>);
        return response.data as GetIupBrandUnitResponse;
    }

    static async createIupUnit(data: IupBrandUnitPayload): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_brand_unit/create`, data as Record<string, any>);
        return response.data;
    }

    static async updateIupUnit(id: string, data: IupBrandUnitPayload): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_brand_unit/${id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteIupUnit(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_brand_unit/${id}`);
    }
    
    // SURVEY
    static async getIupSurvey(params: Partial<payloadRequest> = {}): Promise<GetIupSurveyResponse> {
        const requestData: payloadRequest = {
            page: 1,
            limit: 100,
            sort_by: "updated_at",
            sort_order: 'desc',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/crm/iup_survey/get`, requestData as Record<string, any>);
        return response.data as GetIupSurveyResponse;
    }

    static async createIupSurvey(data: IupSurveyPayload): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_survey/create`, data as Record<string, any>);
        return response.data;
    }

    static async updateIupSurvey(id: string, data: IupSurveyPayload): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_survey/${id}`, data as Record<string, any>);
        return response.data;
    }
    
    static async deleteIupSurvey(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_survey/${id}`);
    }

    // ─── Iup Summary AI ────────────────────────────────────────

    static async getIupSummaryAi(params: IupSummaryAiRequest): Promise<IupSummaryAiListResponse> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_summary_ai/get`, params as Record<string, any>);
        return response.data as IupSummaryAiListResponse;
    }

    static async createIupSummaryAi(data: IupSummaryAiCreatePayload): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/iup_summary_ai/create`, data as Record<string, any>);
        return response.data;
    }

    static async getIupSummaryAiById(id: string): Promise<any> {
        return await apiGet(`${API_BASE_URL}/crm/iup_summary_ai/${id}`);
    }

    static async updateIupSummaryAi(id: string, data: IupSummaryAiCreatePayload): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/iup_summary_ai/${id}`, data as Record<string, any>);
        return response.data;
    }

    static async deleteIupSummaryAi(id: string): Promise<any> {
        return await apiDelete(`${API_BASE_URL}/crm/iup_summary_ai/${id}`);
    }

}