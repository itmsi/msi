import { useState, useCallback, useRef } from 'react';
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
    const [activeSales, setActiveSales] = useState(false);
    const [inputValue, setInputValue] = useState('');
    
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);

    const loadEmployeeOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: EmployeeSelectOption[] = [],
        page: number = 1,
        reset: boolean = false,
        activeSales: boolean = false
    ) => {
        try {
            if (isLoadingRef.current && !reset) return loadedOptions;
            
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await employeesService.getEmployees({
                search: inputValue,
                page: page,
                limit: 25,
                sort_order: 'desc',
                is_sales_quotation: activeSales
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
        
        return await loadEmployeeOptions(inputValue, [], 1, true, activeSales);
    }, [loadEmployeeOptions, activeSales]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadEmployeeOptions(inputValue, employeeOptions, pagination.page + 1, false, activeSales);
        }
    }, [pagination.hasMore, pagination.page, inputValue, employeeOptions, loadEmployeeOptions, activeSales]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        // Prevent multiple initializations
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadEmployeeOptions('', [], 1, true, activeSales);
    }, [loadEmployeeOptions, activeSales]);

    return {
        employeeOptions,
        pagination,
        inputValue,
        setActiveSales,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadEmployeeOptions
    };
};