import { useCallback, useState } from "react";
import { CustomerValidationErrors, CustomerFormData, CheckDuplicateCustomerPayload, DuplicateCustomerResponse } from "../types/customer";
import { CustomerService } from "../services/customerService";
import toast from "react-hot-toast";

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'An unknown error occurred';
};

export const useCreateCustomer = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<CustomerValidationErrors>({});
    const [validationResult, setValidationResult] = useState<DuplicateCustomerResponse | null>(null);
    const [pendingCustomerData, setPendingCustomerData] = useState<CustomerFormData | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const validateCustomer = useCallback(async (customerData: CustomerFormData): Promise<{ success: boolean; message?: string; errors?: any }> => {
        setIsValidating(true);
        setValidationErrors({});
        const payloadValidasi: CheckDuplicateCustomerPayload = {
            customer_name: [customerData.customer_name],
        };
        try {
            const response = await CustomerService.validateCustomer(payloadValidasi);
            
            if (response.success) {
                setValidationResult(response);
                setPendingCustomerData(customerData);
                setShowConfirmation(true);
                return { success: true };
            } else {
                toast.error(response.message || 'Failed to validate customer');
                return { 
                    success: false, 
                    message: response.message
                };
            }
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            toast.error(`Failed to validate customer: ${errorMessage}`);
            
            return { 
                success: false, 
                message: errorMessage, 
                errors: err.response?.data?.errors 
            };
        } finally {
            setIsValidating(false);
        }
    }, []);

    const proceedWithCreation = useCallback(async (): Promise<{ success: boolean; message?: string; errors?: any }> => {
        if (!pendingCustomerData) {
            return { success: false, message: 'No customer data pending' };
        }

        const result = await sendingCreateCustomer(pendingCustomerData);
        
        if (result.success) {
            // Reset states after successful creation
            setValidationResult(null);
            setPendingCustomerData(null);
            setShowConfirmation(false);
        }
        
        return result;
    }, [pendingCustomerData]);

    const cancelConfirmation = useCallback(() => {
        setValidationResult(null);
        setPendingCustomerData(null);
        setShowConfirmation(false);
    }, []);

    const sendingCreateCustomer = useCallback(async (customerData: CustomerFormData): Promise<{ success: boolean; message?: string; errors?: any }> => {
        setIsCreating(true);
        setValidationErrors({});
        try {
            const response = await CustomerService.createCustomer(customerData);
            
            if (response.success) {
                toast.success('Customer created successfully!');
                return { success: true };
            } else {
                // Server returned error response
                if (response.errors) {
                    setValidationErrors(response.errors);
                }
                toast.error(response.message || 'Failed to create customer');
                return { 
                    success: false, 
                    message: response.message, 
                    errors: response.errors 
                };
            }
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            
            // Handle different error scenarios
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
                toast.error('Please check the form for errors');
            } else if (err.response?.status === 400 && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error(`Failed to create customer: ${errorMessage}`);
            }
            
            return { 
                success: false, 
                message: errorMessage, 
                errors: err.response?.data?.errors 
            };
        } finally {
            setIsCreating(false);
        }
    }, []);

    // Clear specific validation error
    const clearFieldError = useCallback((fieldName: keyof CustomerValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Clear all validation errors
    const clearAllErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        isCreating,
        isValidating,
        validationErrors,
        validationResult,
        showConfirmation,
        validateCustomer,
        proceedWithCreation,
        cancelConfirmation,
        clearFieldError,
        clearAllErrors,
        setValidationErrors
    };
};