import { useState, useCallback, useRef } from 'react';
import { UsermanagementServices } from '@/pages/CRM/UserManagement/services/usermanagementServices';
import { getProfile } from '@/helpers/generalHelper';
import { EmployeeCRMItem } from '@/pages/CRM/UserManagement/types/usermanagement';

export interface EmployeeSelectOption {
    value: string;
    label: string;
}

export interface EmployeePaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useEmployeeCRM = () => {
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeSelectOption[]>([]);
    const [pagination, setPagination] = useState<EmployeePaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');
        
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.employee_id || null;

    const loadEmployeeOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: EmployeeSelectOption[] = []
    ) => {
        try {
            if (isLoadingRef.current) return loadedOptions;
            
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await UsermanagementServices.getUserEmployeeCRM({
                search: inputValue,
                employee_id: profileSSOId,
            });

            if (response.success) {
                const newOptions = response.data.map((employee: EmployeeCRMItem) => ({
                    value: employee.employee_id,
                    label: employee.employee_name,
                }));

                const updatedOptions = response.pagination.page === 1 ? newOptions : [...loadedOptions, ...newOptions];
                setEmployeeOptions(updatedOptions);
                
                const hasMoreData = response.pagination.page < response.pagination.totalPages;
                
                setPagination({
                    page: response.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        } finally {
            isLoadingRef.current = false;
        }

        return loadedOptions;
    }, []);

        // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setEmployeeOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadEmployeeOptions(inputValue, []);
    }, [loadEmployeeOptions]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadEmployeeOptions(inputValue, employeeOptions);
        }
    }, [pagination.hasMore, pagination.page, inputValue, employeeOptions, loadEmployeeOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadEmployeeOptions('', []);
    }, [loadEmployeeOptions]);
    
    const getEmployeeById = useCallback(async (employeeId: string): Promise<EmployeeSelectOption | null> => {
        try {
            const response = await UsermanagementServices.getUserEmployeeIdCRM(employeeId);

            if (response.data) {
                const employee = response.data;
                return { value: employee.employee_id, label: employee.employee_name ?? '' };
            }
        } catch (error) {
            console.error('Error fetching IUP by ID:', error);
        }
        return null;
    }, []);
    return {
        employeeOptions,
        pagination,
        inputValue,
        // setActiveSales,
        // setUserNetsuite,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadEmployeeOptions,
        getEmployeeById
    };
};