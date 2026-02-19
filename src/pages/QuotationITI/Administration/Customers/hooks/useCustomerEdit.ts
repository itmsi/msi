import { useState } from 'react';
import { CustomerService } from '../services/customerService';
import { CustomerValidationErrors, Customer } from '../types/customer';

export interface UseCustomerEditReturn {
    isUpdating: boolean;
    validationErrors: CustomerValidationErrors;
    clearFieldError: (field: keyof CustomerValidationErrors) => void;
    updateCustomer: (customerId: string, customerData: Partial<Omit<Customer, 'customer_id'>>) => Promise<Customer>;
}

export function useCustomerEdit(): UseCustomerEditReturn {
    const [isUpdating, setIsUpdating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<CustomerValidationErrors>({});

    const clearFieldError = (field: keyof CustomerValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const updateCustomer = async (customerId: string, customerData: Partial<Omit<Customer, 'customer_id'>>) => {
        setIsUpdating(true);
        setValidationErrors({});

        try {
            const response = await CustomerService.updateCustomer(customerId, customerData);
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
        updateCustomer
    };
}