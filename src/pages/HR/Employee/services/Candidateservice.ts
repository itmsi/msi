import { apiPost, apiGet, ApiResponse } from '@/helpers/apiHelper';
import { CandidateDetail, CandidateListResponse, CandidateListResult, CandidateRequest } from '../types/Candidate';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class CandidateService {
    static async getCandidates(params: Partial<CandidateRequest> = {}): Promise<CandidateListResult> {
        const requestData: CandidateRequest = {
            page: 1,
            limit: 10,
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            group_id: '',
            company_id: '',
            department_id: '',
            title_id: '',
            candidate_status: '',
            candidate_status_offering_letter: '',
            assign_role: '',
            ...params,
        };

        const response = await apiPost(`${API_BASE_URL}/hrm/candidates/get`, requestData as Record<string, any>);
        const envelope = response.data as CandidateListResponse;
        return envelope.data;
    }
    
    static async getProjectById(id: string): Promise<ApiResponse<{ success: boolean; message: string; data: CandidateDetail }>> {
        return await apiGet<{ success: boolean; message: string; data: CandidateDetail }>(
            `${API_BASE_URL}/hrm/candidates/${id}`
        );
    }
}