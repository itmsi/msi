import { useState } from 'react';
import { BankAccount, BankAccountValidationErrors } from '../types/bank';
import { BankService } from '../services/bankService';

export interface UseBankEditReturn {
    isUpdating: boolean;
    validationErrors: BankAccountValidationErrors;
    clearFieldError: (field: keyof BankAccountValidationErrors) => void;
    updateBankAccount: (bankAccountId: string, bankAccountData: Partial<Omit<BankAccount, 'bank_account_id'>>) => Promise<BankAccount>;
}

export function useBankEdit(): UseBankEditReturn {
    const [isUpdating, setIsUpdating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<BankAccountValidationErrors>({});

    const clearFieldError = (field: keyof BankAccountValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const updateBankAccount = async (bankAccountId: string, bankAccountData: Partial<Omit<BankAccount, 'bank_account_id'>>) => {
        setIsUpdating(true);
        setValidationErrors({});

        try {
            const response = await BankService.updateBankAccount(bankAccountId, bankAccountData);
            return response;
        } catch (error: any) {
            // Handle validation errors from API
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            throw error;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        isUpdating,
        validationErrors,
        clearFieldError,
        updateBankAccount
    };
}