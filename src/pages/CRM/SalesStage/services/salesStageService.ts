import { apiPost, apiPut, apiDelete } from '@/helpers/apiHelper';
import type {
    SalesStageListRequest,
    SalesStageListResponse,
    SalesStageDetailRequest,
    SalesStageDetailResponse,
    SalesStageCreateRequest,
    SalesStageCreateResponse,
    SalesStageDeleteResponse,
    OpportunitySubTaskCreateRequest,
    AssignmentSolutionCreateRequest,
    ReviewHypercareCreateRequest,
} from '../types/salesStage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class SalesStageServices {
    // POST /sales-stage/get — list opportunities grouped by stage
    static async getList(params: SalesStageListRequest): Promise<SalesStageListResponse> {
        const requestData: SalesStageListRequest = {
            page: params.page || 1,
            limit: params.limit || 50,
            sort_order: params.sort_order || 'desc',
            sort_by: params.sort_by || 'created_at',
            search: params.search || '',
            iup_id: params.iup_id || '',
            contractor: params.contractor || '',
            employee_id: params.employee_id || '',
            solution: params.solution || '',
            stage: params.stage || '',
        };
        const response = await apiPost(`${API_BASE_URL}/crm/sales-stage/get`, requestData as Record<string, any>);
        return response.data as SalesStageListResponse;
    }

    // POST /sales-stage/get-detail — detail + sub-tasks + assignments + reviews
    static async getDetail(params: SalesStageDetailRequest): Promise<SalesStageDetailResponse> {
        const response = await apiPost(`${API_BASE_URL}/crm/sales-stage/get-detail`, params as Record<string, any>);
        return response.data as SalesStageDetailResponse;
    }

    // POST /sales-stage/create — create new opportunity
    static async create(data: SalesStageCreateRequest): Promise<SalesStageCreateResponse> {
        const response = await apiPost(`${API_BASE_URL}/crm/sales-stage/create`, data as Record<string, any>);
        return response.data as SalesStageCreateResponse;
    }

    // PUT /sales-stage/{id} — update opportunity
    static async update(id: string, data: Partial<SalesStageCreateRequest>): Promise<SalesStageCreateResponse> {
        const response = await apiPut(`${API_BASE_URL}/crm/sales-stage/${id}`, data as Record<string, any>);
        return response.data as SalesStageCreateResponse;
    }

    // DELETE /sales-stage/{id} — soft delete
    static async delete(id: string): Promise<SalesStageDeleteResponse> {
        const response = await apiDelete(`${API_BASE_URL}/crm/sales-stage/${id}`);
        return response.data as SalesStageDeleteResponse;
    }

    // ─── SUB-TASKS ───
    static async getSubTasks(params: Record<string, any>): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/opportunity_sub_task/get`, params);
        return response.data;
    }

    static async createSubTask(data: OpportunitySubTaskCreateRequest): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/opportunity_sub_task/create`, data as Record<string, any>);
        return response.data;
    }

    static async updateSubTask(id: string, data: Partial<OpportunitySubTaskCreateRequest>): Promise<any> {
        const response = await apiPut(`${API_BASE_URL}/crm/opportunity_sub_task/${id}`, data as Record<string, any>);
        return response.data;
    }

    static async deleteSubTask(id: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/opportunity_sub_task/${id}`);
        return response.data;
    }

    // ─── ASSIGNMENT SOLUTIONS ───
    static async createAssignment(data: AssignmentSolutionCreateRequest): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/opportunity_assignment_solution/create`, data as Record<string, any>);
        return response.data;
    }

    static async deleteAssignment(id: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/opportunity_assignment_solution/${id}`);
        return response.data;
    }

    // ─── REVIEW HYPERCARE ───
    static async createReview(data: ReviewHypercareCreateRequest): Promise<any> {
        const response = await apiPost(`${API_BASE_URL}/crm/opportunity_review_hypercare/create`, data as Record<string, any>);
        return response.data;
    }

    static async deleteReview(id: string): Promise<any> {
        const response = await apiDelete(`${API_BASE_URL}/crm/opportunity_review_hypercare/${id}`);
        return response.data;
    }
}
