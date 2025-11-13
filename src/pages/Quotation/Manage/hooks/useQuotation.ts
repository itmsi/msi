import { useState, useCallback, useRef } from 'react';
import { ManageQuotationItem, QuotationPagination, QuotationRequest } from '../types/quotation';
import { QuotationService } from '../services/quotationService';

export const useQuotation = () => {
    const [quotations, setQuotations] = useState<ManageQuotationItem[]>([]);
    const [pagination, setPagination] = useState<QuotationPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: ''
    });

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchQuotations = useCallback(async (page?: number, limit?: number) => {
        setLoading(true);
        setError(null);
        
        try {
            const requestParams: Partial<QuotationRequest> = {
                page: page !== undefined ? page : pagination.page,
                limit: limit !== undefined ? limit : pagination.limit,
                search: filters.search
            };
            
            const response = await QuotationService.getQuotation(requestParams);
            
            if (response.status) {
                setQuotations(response.data.items);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to fetch quotations');
            }
        } catch (err) {
            setError('Something went wrong while fetching quotations');
            console.error('Fetch quotations error:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters.search]);

    // Debounced search handler
    const handleSearchChange = useCallback((value: string) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        setFilters(prev => ({ ...prev, search: value }));
        
        debounceTimer.current = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            
            const requestParams: Partial<QuotationRequest> = {
                page: 1,
                limit: pagination.limit,
                search: value
            };
            
            setLoading(true);
            setError(null);
            
            QuotationService.getQuotation(requestParams)
                .then(response => {
                    if (response.status) {
                        setQuotations(response.data.items);
                        setPagination(response.data.pagination);
                    } else {
                        setError(response.message || 'Failed to fetch quotations');
                    }
                })
                .catch(err => {
                    setError('Something went wrong while fetching quotations');
                    console.error('Search quotations error:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 500);
    }, [pagination.limit]);

    return {
        quotations,
        pagination,
        loading,
        error,
        filters,
        fetchQuotations,
        handleSearchChange,
    };
};