import { useState, useEffect, useCallback } from "react";
import { UsermanagementServices } from '../services/usermanagementServices';
import { Employee, EmployeeTerritoryRequest, Pagination } from '../types/usermanagement';

export const useUsermanagement = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Fetch employees data
    const fetchEmployees = useCallback(async (params?: Partial<EmployeeTerritoryRequest>) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await UsermanagementServices.getUserManagement({
                page: pagination.page,
                limit: pagination.limit,
                sort_order: 'desc',
                search: '',
                ...params
            });
            
            setEmployees(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch employees data');
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchEmployees({ page });
    }, [fetchEmployees]);

    // Handle rows per page change
    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        setPagination(prev => ({ ...prev, limit, page }));
        fetchEmployees({ limit, page });
    }, [fetchEmployees]);

    // Handle search
    const handleSearch = useCallback((searchQuery: string) => {
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
        fetchEmployees({ search: searchQuery, page: 1 });
    }, [fetchEmployees]);

    // Initial load
    useEffect(() => {
        fetchEmployees();
    }, []);

    return {
        employees,
        loading,
        error,
        pagination,
        fetchEmployees,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        refetch: () => fetchEmployees()
    };
};