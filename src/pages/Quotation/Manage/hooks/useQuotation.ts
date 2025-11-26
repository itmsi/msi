import { useState, useCallback, useRef } from 'react';
import { ManageQuotationItem, QuotationPagination, QuotationRequest } from '../types/quotation';
import { QuotationService } from '../services/quotationService';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { toast } from 'react-hot-toast';

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
        search: '',
        sort_order: 'desc' as 'asc' | 'desc',
        status: '' as 'submit' | 'draft' | 'rejected' | ''
    });

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchQuotations = useCallback(async (page?: number, limit?: number) => {
        setLoading(true);
        setError(null);
        
        try {
            const requestParams: Partial<QuotationRequest> = {
                page: page !== undefined ? page : pagination.page,
                limit: limit !== undefined ? limit : pagination.limit,
                search: filters.search,
                sort_order: filters.sort_order,
                status: filters.status
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
    }, [pagination.page, pagination.limit, filters.search, filters.sort_order, filters.status]);

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
                search: value,
                sort_order: filters.sort_order,
                status: filters.status
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
    }, [pagination.limit, filters.sort_order, filters.status]);

    const updateFilters = useCallback((key: 'search' | 'sort_order' | 'status', value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const deleteQuotation = useCallback(async (quotation_id: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await QuotationService.deleteQuotation(quotation_id);
            setQuotations(prev => prev.filter(quotation => quotation.manage_quotation_id !== quotation_id));
            return true;
        } catch (err) {
            setError('Failed to delete quotations');
            console.error('Delete quotations error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadQuotation = useCallback(async (quotation_id: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await QuotationService.downloadQuotation(quotation_id); 
            if (response.data?.status) {
                await generateQuotationPDF(response.data.data);
                toast.success('PDF downloaded successfully');
                return true;
            } else {
                toast.error(response.message || 'Failed to fetch quotation data');
                return false;
            }
        } catch (err) {
            setError('Failed to download quotation');
            console.error('Download quotation error:', err);
            toast.error('Failed to download quotation');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);


    return {
        quotations,
        pagination,
        loading,
        error,
        filters,
        updateFilters,
        deleteQuotation,
        downloadQuotation,
        fetchQuotations,
        handleSearchChange,
    };
};