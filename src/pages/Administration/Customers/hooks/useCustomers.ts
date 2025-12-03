import { useState, useCallback, useRef } from 'react';
import { CustomerService } from '../services/customerService';
import { Customer, CustomerRequest, CustomerPagination } from '../types/customer';

export const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [pagination, setPagination] = useState<CustomerPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ 
        search: '',
        sort_order: 'desc' as 'asc' | 'desc'
    });

    // Debounce timer ref
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchCustomers = useCallback(async (page?: number, limit?: number, appendData: boolean = false) => {
        setLoading(true);
        setError(null);
        
        try {
            const requestParams: Partial<CustomerRequest> = {
                page: page || pagination.page,
                limit: limit || pagination.limit,
                search: filters.search,
                sort_order: filters.sort_order
            };
            
            const response = await CustomerService.getCustomers(requestParams);
            
            if (response.success) {
                if (appendData && page && page > 1) {
                    setCustomers(prev => [...prev, ...response.data.data]);
                } else {
                    setCustomers(response.data.data);
                }
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
    }, [pagination.page, pagination.limit, filters.search]);

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

    const handleFilterChangeDebounced = useCallback((filterKey: string, value: string) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setFilters(prev => ({ ...prev, [filterKey]: value }));
            setPagination(prev => ({ ...prev, page: 1 }));
            const requestParams: Partial<CustomerRequest> = {
                page: 1,
                limit: pagination.limit,
                search: filterKey === 'search' ? value : filters.search,
                sort_order: filterKey === 'sort_order' ? value as 'asc' | 'desc' : filters.sort_order
            };
            
            setLoading(true);
            setError(null);
            
            CustomerService.getCustomers(requestParams)
                .then(response => {
                    if (response.success) {
                        setCustomers(response.data.data);
                        setPagination(response.data.pagination);
                    } else {
                        setError(response.message || 'Failed to fetch customers');
                    }
                })
                .catch(err => {
                    setError('Something went wrong while fetching customers');
                    console.error('Fetch customers error:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 500);
    }, [pagination.limit, filters.search]);

    const handleSearchChange = useCallback((search: string) => {
        setFilters(prev => ({ ...prev, search }));
        
        setPagination(prev => ({ ...prev, page: 1 }));
        
        const requestParams: Partial<CustomerRequest> = {
            page: 1,
            limit: pagination.limit,
            search: search,
            sort_order: filters.sort_order
        };
        
        setLoading(true);
        setError(null);
        
        CustomerService.getCustomers(requestParams)
            .then(response => {
                if (response.success) {
                    setCustomers(response.data.data);
                    setPagination(response.data.pagination);
                } else {
                    setError(response.message || 'Failed to fetch customers');
                }
            })
            .catch(err => {
                setError('Something went wrong while fetching customers');
                console.error('Fetch customers error:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [pagination.limit, filters.sort_order]);

    // Handle sort change
    const handleSortChange = useCallback((sort_order: 'asc' | 'desc') => {
        handleFilterChangeDebounced('sort_order', sort_order);
    }, [handleFilterChangeDebounced]);

    return {
        customers,
        pagination,
        loading,
        error,
        fetchCustomers,
        updateCustomer,
        deleteCustomer,
        handleSearchChange,
        handleSortChange,
    };
};