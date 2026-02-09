import { apiGet, apiPost, apiPut, apiDelete } from '@/helpers/apiHelper';
import { TermCondition, TermConditionFormData, TermConditionRequest, TermConditionResponse } from '../types/termcondition';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class TermConditionService {
    static async getTermConditions(params: Partial<TermConditionRequest> = {}): Promise<TermConditionResponse> {
        const defaultParams: TermConditionRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/quotation/term_content/get`, defaultParams as any);
        return response.data as TermConditionResponse;
    }

    static async getTermConditionById(termConditionId: string): Promise<any> {
        const response =  await apiGet<any>(`${API_BASE_URL}/quotation/term_content/${termConditionId}`);
        return response.data
    }

    static async createTermCondition(termConditionData: TermConditionFormData): Promise<{ status: boolean; data?: any; message?: string; errors?: any }> {
        try {
            const response = await apiPost(`${API_BASE_URL}/quotation/term_content`, termConditionData as any);
            return response.data as { status: boolean; data?: any; message?: string; errors?: any };
        } catch (error: any) {
            return {
                status: false,
                message: error.message || 'Failed to create a term condition',
                errors: error.errors
            };
        }
    }

    static async updateTermCondition(termConditionId: string, termConditionData: Partial<Omit<TermCondition, 'term_condition_id'>>): Promise<TermCondition> {
        const response = await apiPut<{ data: TermCondition }>(`${API_BASE_URL}/quotation/term_content/${termConditionId}`, termConditionData);
        return response.data.data;
    }

    static async deleteTermCondition(termConditionId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/quotation/term_content/${termConditionId}`);
    }

    static async searchTermConditions(searchQuery: string, filters?: Record<string, any>): Promise<TermConditionResponse> {
        const searchParams = {
            search: searchQuery,
            page: 1,
            limit: 10,
            sort_order: 'desc' as const,
            ...filters
        };

        return await this.getTermConditions(searchParams);
    }

    static async getTermConditionsByBrand(brand: string): Promise<TermConditionResponse> {
        return await this.getTermConditions({
            search: brand,
            page: 1,
            limit: 50
        });
    }
}