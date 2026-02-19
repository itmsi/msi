import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTermCondition } from './useTermCondition';
import { AuthService } from '@/services/authService';

export const useTermConditionManagement = () => {
    const navigate = useNavigate();
    
    // Get company_name from localStorage auth_user
    const companyName = useMemo(() => {
        const user = AuthService.getCurrentUser();
        return user.company_name || undefined;
    }, []);
    
    // Local state untuk form inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { termConditions, pagination, loading, error, fetchTermConditions, deleteTermCondition } = useTermCondition();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; termConditionId?: string; }>({ show: false });
    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Load data saat component mount atau filter berubah
    useEffect(() => {
        fetchTermConditions({
            page: currentPage,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: debouncedSearch,
            company_name: companyName
        });
    }, [debouncedSearch, sortOrder, currentPage, itemsPerPage, companyName, fetchTermConditions]);

    // Handler untuk pagination
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        setCurrentPage(1);
        setItemsPerPage(newPerPage);
    }, []);

    // Handler untuk search
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const handleManualSearch = useCallback(() => {
        setCurrentPage(1);
        fetchTermConditions({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: searchTerm,
            company_name: companyName
        });
    }, [searchTerm, sortOrder, itemsPerPage, companyName, fetchTermConditions]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchTermConditions({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: '',
            company_name: companyName
        });
    }, [sortOrder, itemsPerPage, companyName, fetchTermConditions]);

    // Handler untuk sort change
    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            setCurrentPage(1);
        }
    }, []);

    const handleEdit = useCallback((termCondition: any) => {
        navigate(`/quotations-iti/term-condition/edit/${termCondition.term_content_id}`);
    }, [navigate]);

    const handleDelete = useCallback((termCondition: any) => {
        // Support both termCondition object and termCondition ID
        const termConditionId = typeof termCondition === 'string' ? termCondition : termCondition.term_content_id;
        setConfirmDelete({ show: true, termConditionId });
    }, []);

    const confirmDeleteTermConditions = useCallback(async () => {
        if (!confirmDelete.termConditionId) return;

        try {
            await deleteTermCondition(confirmDelete.termConditionId);
            setConfirmDelete({ show: false });
            // Refresh data setelah delete
            fetchTermConditions({
                page: currentPage,
                limit: itemsPerPage,
                sort_order: sortOrder,
                search: debouncedSearch,
                company_name: companyName
            });
        } catch (error) {
            console.error('Failed to delete term condition:', error);
        }
    }, [confirmDelete.termConditionId, deleteTermCondition, fetchTermConditions, currentPage, itemsPerPage, sortOrder, debouncedSearch]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);



    return {
        // State
        searchTerm,
        sortOrder,
        termConditions,
        pagination,
        loading,
        error,
        
        confirmDelete,
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        confirmDeleteTermConditions,
        cancelDelete,
    };
};