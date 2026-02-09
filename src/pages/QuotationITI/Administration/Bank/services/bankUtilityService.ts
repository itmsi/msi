import { BankAccount } from "../types/bank";


export class BankUtilityService {

    static validateBankAccount(bankAccountData: Partial<BankAccount>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Required fields validation
        if (!bankAccountData.bank_account_name || bankAccountData.bank_account_name.trim().length === 0) {
            errors.push('Account name is required');
        }

        if (!bankAccountData.bank_account_number || bankAccountData.bank_account_number.trim().length === 0) {
            errors.push('Account number is required');
        }

        if (!bankAccountData.bank_account_type || bankAccountData.bank_account_type.trim().length === 0) {
            errors.push('Bank account type is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static sortBankAccounts(bankAccounts: BankAccount[], field: keyof BankAccount, order: 'asc' | 'desc' = 'asc'): BankAccount[] {
        return [...bankAccounts].sort((a, b) => {
            const aValue = (a[field] || '').toString().toLowerCase();
            const bValue = (b[field] || '').toString().toLowerCase();

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

}