import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { 
    ManageQuotationData,
    ManageQuotationDataPDF,
    ManageQuotationListResponse,
    QuotationFormData, 
    QuotationRequest
} from '../types/quotation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class QuotationService {
    // Create new quotation
    static async createQuotation(quotationData: QuotationFormData) {
        try {
            // Prepare payload with proper structure
            const payload = {
                customer_id: quotationData.customer_id,
                employee_id: quotationData.employee_id,
                manage_quotation_date: quotationData.manage_quotation_date,
                manage_quotation_valid_date: quotationData.manage_quotation_valid_date,
                manage_quotation_grand_total: quotationData.manage_quotation_grand_total || "0",
                manage_quotation_ppn: quotationData.manage_quotation_ppn || "0",
                manage_quotation_delivery_fee: quotationData.manage_quotation_delivery_fee || "0",
                manage_quotation_other: quotationData.manage_quotation_other || "0",
                manage_quotation_payment_presentase: quotationData.manage_quotation_payment_presentase || "0",
                manage_quotation_payment_nominal: quotationData.manage_quotation_payment_nominal || "0",
                manage_quotation_description: quotationData.manage_quotation_description || "",
                manage_quotation_shipping_term: quotationData.manage_quotation_shipping_term || "",
                manage_quotation_franco: quotationData.manage_quotation_franco || "",
                manage_quotation_lead_time: quotationData.manage_quotation_lead_time || "",
                bank_account_name: quotationData.bank_account_name || "",
                bank_account_number: quotationData.bank_account_number || "",
                bank_account_bank_name: quotationData.bank_account_bank_name || "",
                term_content_id: quotationData.term_content_id || "",
                term_content_directory: quotationData.term_content_directory || "",
                status: quotationData.status,
                include_aftersales_page: quotationData.include_aftersales_page || false,
                include_msf_page: quotationData.include_msf_page || false,
                manage_quotation_items: quotationData.manage_quotation_items || []
            };

            const response = await apiPost(`${API_BASE_URL}/quotation/manage-quotation`, payload);
            
            return {
                success: true,
                data: response.data,
                message: 'Quotation created successfully'
            };
        } catch (error: any) {
            console.error('Create quotation error:', error);
            return {
                success: false,
                message: error.message || 'Failed to create quotation',
                errors: error.errors || null
            };
        }
    }

    static async getQuotation(params: Partial<QuotationRequest> = {}): Promise<ManageQuotationListResponse> {
        const requestData: QuotationRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/quotation/manage-quotation/get`, requestData as Record<string, any>);
        return response.data as ManageQuotationListResponse;
    }

    static async deleteQuotation(quotationId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/quotation/manage-quotation/${quotationId}`);
    }

    static async getQuotationById(quotationId: string): Promise<ApiResponse<{ status: boolean; message: string; data: ManageQuotationData }>> {
        return await apiGet<{ status: boolean; message: string; data: ManageQuotationData }>(`${API_BASE_URL}/quotation/manage-quotation/${quotationId}`);
    }

    static async updateQuotation(quotationId: string, quotationData: QuotationFormData) {
        try {
            const payload = {
                customer_id: quotationData.customer_id,
                employee_id: quotationData.employee_id,
                manage_quotation_date: quotationData.manage_quotation_date,
                manage_quotation_valid_date: quotationData.manage_quotation_valid_date,
                manage_quotation_grand_total: quotationData.manage_quotation_grand_total || "0",
                manage_quotation_ppn: quotationData.manage_quotation_ppn || "0",
                manage_quotation_delivery_fee: quotationData.manage_quotation_delivery_fee || "0",
                manage_quotation_other: quotationData.manage_quotation_other || "0",
                manage_quotation_payment_presentase: quotationData.manage_quotation_payment_presentase || "0",
                manage_quotation_payment_nominal: quotationData.manage_quotation_payment_nominal || "0",
                manage_quotation_description: quotationData.manage_quotation_description || "",
                manage_quotation_shipping_term: quotationData.manage_quotation_shipping_term || "",
                manage_quotation_franco: quotationData.manage_quotation_franco || "",
                manage_quotation_lead_time: quotationData.manage_quotation_lead_time || "",
                bank_account_name: quotationData.bank_account_name || "",
                bank_account_number: quotationData.bank_account_number || "",
                bank_account_bank_name: quotationData.bank_account_bank_name || "",
                term_content_id: quotationData.term_content_id || "",
                term_content_directory: quotationData.term_content_directory || "",
                status: quotationData.status,
                include_aftersales_page: quotationData.include_aftersales_page || false,
                include_msf_page: quotationData.include_msf_page || false,
                manage_quotation_items: quotationData.manage_quotation_items || []
            };

            const response = await apiPut(`${API_BASE_URL}/quotation/manage-quotation/${quotationId}`, payload);
            
            return {
                success: true,
                data: response.data,
                message: 'Quotation updated successfully'
            };
        } catch (error: any) {
            console.error('Update quotation error:', error);
            return {
                success: false,
                message: error.message || 'Failed to update quotation',
                errors: error.errors || null
            };
        }
    }

    static async getQuotationDetail(quotationId: string): Promise<ApiResponse<{ status: boolean; message: string; data: ManageQuotationData }>> {
        return await apiGet(`${API_BASE_URL}/quotation/manage-quotation/${quotationId}`);
    }

    static async downloadQuotation(quotationId: string): Promise<ApiResponse<{ status: boolean; message: string; data: ManageQuotationDataPDF }>> {
        return await apiGet(`${API_BASE_URL}/quotation/manage-quotation/pdf/${quotationId}`);
    }
}