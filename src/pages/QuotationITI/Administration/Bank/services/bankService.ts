import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from '@/helpers/apiHelper';
import { BankAccount, BankAccountFormData, BankAccountRequest, BankAccountResponse } from '../types/bank';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class BankService {
    static async getBankAccounts(params: Partial<BankAccountRequest> = {}): Promise<BankAccountResponse> {
        const requestData: BankAccountRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/bank_accounts/get`, requestData as Record<string, any>);
        return response.data as BankAccountResponse;
    }

    // Get existing bank account by ID
    static async getBankAccountById(bankAccountId: string): Promise<ApiResponse<{ success: boolean; message: string; data: BankAccount }>> {
        return await apiGet<{ success: boolean; message: string; data: BankAccount }>(`${API_BASE_URL}/bank_accounts/${bankAccountId}`, { bank_account_id: bankAccountId });
    }

    static async createBankAccount(bankAccountData: BankAccountFormData): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> {
        try {
            const response = await apiPost(`${API_BASE_URL}/bank_accounts/create`, bankAccountData as Record<string, any>);
            return response.data as { success: boolean; data?: any; message?: string; errors?: any };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to create bank account',
                errors: error.errors
            };
        }
    }

    static async updateBankAccount(bankAccountId: string, bankAccountData: Partial<Omit<BankAccount, 'bank_account_id'>>): Promise<BankAccount> {
        const response = await apiPut<{ data: BankAccount }>(`${API_BASE_URL}/bank_accounts/${bankAccountId}`, bankAccountData);
        return response.data.data;
    }

    static async deleteBankAccount(bankAccountId: string): Promise<{ status: number }> {
        return await apiDelete(`${API_BASE_URL}/bank_accounts/${bankAccountId}`);
        // const response = await apiDelete<{ message: string }>(`${API_BASE_URL}/${customerId}`);
        // return response.data.message || 'Customer deleted successfully';
    }

}