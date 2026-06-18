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
    const [inputValue, setInputValue] = useState('');
        
    const isInitialized = useRef(false);
    const isLoadingRef = useRef(false);
    const activeSalesRef = useRef<boolean | undefined>(undefined);
    const userNetsuiteRef = useRef<boolean | undefined>(undefined);

    const setActiveSales = useCallback((value: boolean | undefined) => {
        activeSalesRef.current = value;
    }, []);

    const setUserNetsuite = useCallback((value: boolean | undefined) => {
        userNetsuiteRef.current = value;
    }, []);

    const loadEmployeeOptions = useCallback(async (
        inputValue: string = '', 
        loadedOptions: EmployeeSelectOption[] = [],
        page: number = 1,
        reset: boolean = false,
        activeSales?: boolean | undefined,
        is_user_netsuite?: boolean | undefined
    ) => {
        const filterActiveSales = activeSales ?? activeSalesRef.current;
        const filterUserNetsuite = is_user_netsuite ?? userNetsuiteRef.current;
        
        try {
            if (isLoadingRef.current && !reset) return loadedOptions;
            
            isLoadingRef.current = true;
            setPagination(prev => ({ ...prev, loading: true }));

            const response = await employeesService.getEmployees({
                search: inputValue,
                page: page,
                limit: 25,
                sort_order: 'desc',
                ...(filterActiveSales !== undefined && {
                    is_sales_quotation: filterActiveSales,
                }),
                ...(filterUserNetsuite !== undefined && {
                    is_user_netsuite: filterUserNetsuite,
                }),
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
        
        return await loadEmployeeOptions(inputValue, [], 1, true);
    }, [loadEmployeeOptions]);

    // Handle scroll to bottom - load next page
    const handleMenuScrollToBottom = useCallback(() => {
        if (pagination.hasMore && !isLoadingRef.current) {
            loadEmployeeOptions(inputValue, employeeOptions, pagination.page + 1, false);
        }
    }, [pagination.hasMore, pagination.page, inputValue, employeeOptions, loadEmployeeOptions]);

    // Initialize options
    const initializeOptions = useCallback(async () => {
        if (isInitialized.current || isLoadingRef.current) return;
        
        isInitialized.current = true;
        await loadEmployeeOptions('', [], 1, true);
    }, [loadEmployeeOptions]);
    
    return {
        employeeOptions,
        pagination,
        inputValue,
        setActiveSales,
        setUserNetsuite,
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        loadEmployeeOptions
    };
};