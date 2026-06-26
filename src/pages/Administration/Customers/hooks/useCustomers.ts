import { useState, useCallback, useEffect } from 'react';
import { CustomerService } from '../services/customerService';
import { Customer, CustomerRequest, CustomerPagination } from '../types/customer';
import { useLocation, useSearchParams } from 'react-router-dom';

type FilterState = {
    search: string;
    sort_order: 'asc' | 'desc' | '';
};

export const useCustomers = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation(); 

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1);
    const urlLimit = Math.max(Number(searchParams.get('limit')) || 10, 1);

    const urlFilters: FilterState = {
        search: searchParams.get('search') || '',
        sort_order: (searchParams.get('sort_order') as FilterState['sort_order']) || '',
    };

    // Input search dipisah agar tidak memicu fetch saat user masih mengetik
    const [searchValue, setSearchValue] = useState(urlFilters.search);
    
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<CustomerPagination>({
        page: urlPage,
        limit: urlLimit,
        total: 0,
        totalPages: 0
    });

    const updateUrlParams = useCallback((currentFilters: FilterState, page: number, limit: number) => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', String(page));
        if (limit !== 10) params.set('limit', String(limit));
        
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'desc') { // Jangan masukkan nilai kosong atau default sort
                params.set(key, value);
            }
        });
        
        setSearchParams(params);
    }, [setSearchParams]);
    
    const fetchCustomers = useCallback(async (params?: Partial<CustomerRequest>) => {
        try {
            setLoading(true);
            setError(null);
                        
            const requestParams: CustomerRequest = {
                page: urlPage,
                limit: urlLimit,
                ...urlFilters,
                ...params // Nilai baru akan menimpa nilai state lama disini
            };
            
            const response = await CustomerService.getCustomers(requestParams);
            
            if (response.success) {
                setCustomers(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || 'Failed to fetch customers');
            }
        } catch (err) {
            setError('Something went wrong while fetching customers');
            console.error('Fetch customers error:', err);
        } finally {
            setLoading(false);
        }
    }, [urlFilters, urlLimit, urlPage]);

    const updateCustomer = useCallback(async (customerId: string, customerData: Partial<Omit<Customer, 'customer_id'>>) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedCustomer = await CustomerService.updateCustomer(customerId, customerData);
            // Update local state
            setCustomers(prev => prev.map(customer => 
                customer.customer_id === customerId ? updatedCustomer : customer
            ));
            return updatedCustomer;
        } catch (err) {
            setError('Failed to update customer');
            console.error('Update customer error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCustomer = useCallback(async (customerId: string) => {
        setLoading(true);
        setError(null);
        
        try {
            await CustomerService.deleteCustomer(customerId);
            // Remove from local state
            setCustomers(prev => prev.filter(customer => customer.customer_id !== customerId));
            return true;
        } catch (err) {
            setError('Failed to delete customer');
            console.error('Delete customer error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
        const updatedFilters = { ...urlFilters, ...newFilters };
        updateUrlParams(updatedFilters, 1, urlLimit); // Reset ke page 1 tiap filter berubah
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handlePageChange = useCallback((page: number) => {
        updateUrlParams(urlFilters, page, urlLimit);
    }, [urlFilters, urlLimit, updateUrlParams]);

    const handleRowsPerPageChange = useCallback((limit: number, page: number) => {
        updateUrlParams(urlFilters, page, limit);
    }, [urlFilters, updateUrlParams]);

    // Search functions
    const executeSearch = useCallback(() => {
        handleFilterChange({ search: searchValue });
    }, [handleFilterChange, searchValue]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') executeSearch();
    }, [executeSearch]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        handleFilterChange({ search: '' });
    }, [handleFilterChange]);

    useEffect(() => {
        fetchCustomers();
        
        // Memastikan input text search ter-reset jika user memencet tombol Back
        setSearchValue(urlFilters.search);
        
    }, [location.search]);
    return {
        customers,
        pagination,
        loading,
        error,

        filters: urlFilters,
        searchValue,
        setSearchValue,

        fetchCustomers,
        updateCustomer,
        deleteCustomer,

        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        executeSearch,
        handleKeyPress,
        handleClearSearch,
        
        refetch: fetchCustomers
    };
};