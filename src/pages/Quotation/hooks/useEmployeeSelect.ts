import { useState, useCallback } from 'react';
import { Employee } from '@/types/administration';
import { employeesService } from '@/services/administrationService';

export interface EmployeeSelectOption {
    value: string;
    label: string;
    data: Employee;
}

export interface EmployeePaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

export const useEmployeeSelect = () => {
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeSelectOption[]>([]);
    const [pagination, setPagination] = useState<EmployeePaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadEmployeeOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: EmployeeSelectOption[] = [],
        page: number = 1,
        reset: boolean = false
    ) => {
        try {
            if (pagination.loading && !reset) return loadedOptions;

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await employeesService.getEmployees({
                search: inputValue,
                page: page,
                limit: 5,
                sort_order: 'desc'
            });

            if (response.success) {
                const newOptions = response.data.data.map((employee: Employee) => ({
                    value: employee.employee_id,
                    label: employee.employee_name,
                    data: employee
                }));

                const updatedOptions = reset ? newOptions : [...loadedOptions, ...newOptions];
                setEmployeeOptions(updatedOptions);
                
                const hasMoreData = response.data.pagination.page < response.data.pagination.totalPages;
                
                setPagination({
                    page: response.data.pagination.page,
                    hasMore: hasMoreData,
                    loading: false
                });

                return updatedOptions;
            }
        } catch (error) {
            console.error('Error loading term conditions:', error);
            setPagination(prev => ({ ...prev, loading: false }));
        }

        return loadedOptions;
    }, [pagination.loading]);

        // Handle input change
    const handleInputChange = useCallback(async (inputValue: string) => {
        setInputValue(inputValue);
        setEmployeeOptions([]); // Clear existing options for new search
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadEmployeeOptions(inputValue, [], 1, true);
    }, [loadEmployeeOptions]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !pagination.loading) {
            loadEmployeeOptions(inputValue, employeeOptions, pagination.page + 1, false);
        }
    }, [pagination, employeeOptions, inputValue, loadEmployeeOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (employeeOptions.length === 0) {
            await loadEmployeeOptions('', [], 1, true);
        }
    }, [employeeOptions.length, loadEmployeeOptions]);

    return {
        employeeOptions,
        pagination,
        inputValue,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadEmployeeOptions
    };
};