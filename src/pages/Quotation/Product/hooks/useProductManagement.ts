import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from './useProduct';
import { AuthService } from '@/services/authService';

export const useProductManagement = () => {
    const navigate = useNavigate();
    
    // Get company_name from localStorage auth_user (more efficient than fetching profile)
    const companyName = useMemo(() => {
        const user = AuthService.getCurrentUser();
        return user.company_name || undefined;
    }, []);
    
    // Local state untuk form inputs
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); 
    const [productTypeFilter, setProductTypeFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { products, pagination, loading, error, fetchProduct, deleteProduct } = useProduct();

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; productId?: string; }>({ show: false });
    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Load data saat component mount atau filter berubah
    useEffect(() => {
        fetchProduct({
            page: currentPage,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: debouncedSearch,
            company_name: companyName,
            product_type: productTypeFilter
        });
    }, [debouncedSearch, sortOrder, productTypeFilter, currentPage, itemsPerPage, companyName, fetchProduct]);

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
        setCurrentPage(1); // Reset ke halaman pertama saat search
    }, []);

    const handleManualSearch = useCallback(() => {
        setCurrentPage(1);
        fetchProduct({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: searchTerm,
            company_name: companyName,
            product_type: productTypeFilter
        });
    }, [searchTerm, sortOrder, productTypeFilter, itemsPerPage, companyName, fetchProduct]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setProductTypeFilter('');
        setCurrentPage(1);
        fetchProduct({
            page: 1,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: '',
            company_name: companyName,
            product_type: ''
        });
    }, [sortOrder, itemsPerPage, companyName, fetchProduct]);

    // Handler untuk sort change
    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            setCurrentPage(1);
        } else if (key === 'product_type') {
            setProductTypeFilter(value);
            setCurrentPage(1);
        }
    }, []);

    const handleEdit = useCallback((product: any) => {
        navigate(`/quotations/products/edit/${product.componen_product_id}`);
    }, [navigate]);

    const handleDelete = useCallback((product: any) => {
        // Support both product object and product ID
        const productId = typeof product === 'string' ? product : product.componen_product_id;
        setConfirmDelete({ show: true, productId: productId });
    }, []);

    const confirmDeleteProduct = useCallback(async () => {
        if (!confirmDelete.productId) return;

        try {
            await deleteProduct(confirmDelete.productId);
            setConfirmDelete({ show: false });
            // Refresh data setelah delete
            fetchProduct({
                page: currentPage,
                limit: itemsPerPage,
                sort_order: sortOrder,
                search: debouncedSearch,
                company_name: companyName,
                product_type: productTypeFilter
            });
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    }, [confirmDelete.productId, deleteProduct, fetchProduct, currentPage, itemsPerPage, sortOrder, debouncedSearch, companyName]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);

    // Options untuk sort order
    const sortOptions = [
        { value: 'desc', label: 'Newest First' },
        { value: 'asc', label: 'Oldest First' }
    ];

    return {
        // State
        searchTerm,
        sortOrder,
        productTypeFilter,
        currentPage,
        itemsPerPage,
        products,
        pagination,
        loading,
        error,
        sortOptions,
        
        confirmDelete,
        setConfirmDelete,
        deleteProduct,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        confirmDeleteProduct,
        cancelDelete,
    };
};