// INTERFACES BANK ACCOUNT
export interface BankAccount {
    bank_account_id: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_account_type: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string | null;
    updated_by?: string | null;
    updated_by_name?: string;
    deleted_at?: string | null;
    deleted_by?: string | null;
    is_delete?: boolean;
}

export interface BankAccountPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BankAccountResponse {
    success: boolean;
    message: string;
    data: {
        data: BankAccount[];
        pagination: BankAccountPagination;
    };
}

export interface BankAccountRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc';
    search: string;
}

// Bank Account form data for create/update
export interface BankAccountFormData {
    bank_account_name: string;
    bank_account_number: string;
    bank_account_type: string;
}

// Bank Account validation errors
export interface BankAccountValidationErrors {
    bank_account_name?: string;
    bank_account_number?: string;
    bank_account_type?: string;
}