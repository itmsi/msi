import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { dashboardService, CreatePowerBIRequest, UpdatePowerBIRequest, categoryService, CreateCategoryRequest, UpdateCategoryRequest } from '@/services/powerbiService';
import { 
    PowerBIDashboard, 
    PowerBIPagination, 
    PowerBIFilters, 
    PowerBIListRequest,
    PowerBICategory,
    CategoryOption,
    CategoryListRequest,
    CategoryFilters,
    DashboardViewRequest as DashboardViewRequestType
} from '@/types/powerbi';

export const useDashboard = (autoInit: boolean = true) => {
    // Ref to prevent multiple initial calls
    const isInitialized = useRef(false);
    
    // States
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dashboards, setDashboards] = useState<PowerBIDashboard[]>([]);
    const [pagination, setPagination] = useState<PowerBIPagination | null>(null);
    
    // Category states
    const [categories, setCategories] = useState<PowerBICategory[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>({
        search: ''
    });
    const [categoryPagination, setCategoryPagination] = useState<PowerBIPagination | null>(null);
    const [filters, setFilters] = useState<PowerBIFilters>({
        search: '',
        category_id: '',
        sort_by: '',
        sort_order: ''
    });

    // Fetch categories function
    const fetchCategories = useCallback(async (page: number = 1, limit: number = 100) => {
        try {
            const requestParams: CategoryListRequest = {
                page,
                limit,
                search: '' // Empty search to get all categories
            };

            const response = await categoryService.getCategories(requestParams);

            if (response.success) {
                setCategories(response.data || []);
                
                // Convert categories to options for select component
                const options: CategoryOption[] = [
                    { value: '', label: 'All Categories' },
                    ...response.data.map((category: PowerBICategory) => ({
                        value: category.category_id,
                        label: category.name
                    }))
                ];
                setCategoryOptions(options);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    // Fetch dashboards function - updated to work with current filters
    const fetchDashboards = useCallback(async (page: number = 1, limit: number = 10, customFilters?: PowerBIFilters) => {
        try {
            setLoading(true);
            
            // Use custom filters if provided, otherwise use current filters state
            const activeFilters = customFilters || filters;
            
            const requestParams: PowerBIListRequest = {
                page,
                limit,
                search: activeFilters.search || undefined,
                category_id: activeFilters.category_id || undefined,
                sort_by: activeFilters.sort_by || undefined,
                sort_order: activeFilters.sort_order || undefined
            };

            const response = await dashboardService.getDashboards(requestParams);

            if (response.success) {
                setDashboards(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch dashboards');
            }
        } catch (error) {
            console.error('Error fetching dashboards:', error);
            toast.error('Failed to fetch dashboards');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Load more dashboards for infinite scroll
    const loadMoreDashboards = useCallback(async () => {
        if (!pagination || !pagination.totalPages || pagination.page >= pagination.totalPages || loadingMore) {
            return;
        }

        try {
            setLoadingMore(true);
            
            const nextPage = pagination.page + 1;
            const requestParams: PowerBIListRequest = {
                page: nextPage,
                limit: pagination.limit,
                search: filters.search || undefined,
                category_id: filters.category_id || undefined,
                sort_by: filters.sort_by || undefined,
                sort_order: filters.sort_order || undefined
            };

            const response = await dashboardService.getDashboards(requestParams);

            if (response.success) {
                // Append new data to existing dashboards
                setDashboards(prev => [...prev, ...(response.data || [])]);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to load more dashboards');
            }
        } catch (error) {
            console.error('Error loading more dashboards:', error);
            toast.error('Failed to load more dashboards');
        } finally {
            setLoadingMore(false);
        }
    }, [filters, pagination, loadingMore]);

    // Initialize with default fetch
    useEffect(() => {
        if (!isInitialized.current && autoInit) {
            isInitialized.current = true;
            fetchCategories(); // Fetch categories first
            fetchDashboards();
        }
    }, [fetchDashboards, fetchCategories, autoInit]);

    // Open dashboard in new tab
    const handleOpenDashboard = useCallback((url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    // Page change handler
    const handlePageChange = useCallback((page: number) => {
        fetchDashboards(page, pagination?.limit || 10);
    }, [fetchDashboards, pagination?.limit]);

    // Limit change handler
    const handleLimitChange = useCallback((newLimit: number) => {
        fetchDashboards(1, newLimit);
    }, [fetchDashboards]);

    // Filter change handler with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((field: keyof PowerBIFilters, value: string) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [field]: value
            };
            
            // Clear existing debounce
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            
            // Create new debounced API call with latest filters
            debounceTimer.current = setTimeout(() => {
                fetchDashboards(1, 10, newFilters); // Pass newFilters directly
            }, 300);
            
            return newFilters;
        });
    }, [fetchDashboards]);

    // Search change handler - reset category when searching
    const handleSearchChange = useCallback((searchValue: string) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                search: searchValue,
                category_id: '' // Reset category when searching to search all categories
            };
            
            // Clear existing debounce
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            
            // Create new debounced API call with latest filters
            debounceTimer.current = setTimeout(() => {
                fetchDashboards(1, 10, newFilters); // Pass newFilters directly
            }, 300);
            
            return newFilters;
        });
    }, [fetchDashboards]);

    // Category filter change handler
    const handleCategoryChange = useCallback((category_id: string) => {
        handleFilterChange('category_id', category_id);
    }, [handleFilterChange]);

    // Sort change handler
    const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        setFilters(prev => ({
            ...prev,
            sort_by: sortBy,
            sort_order: sortOrder
        }));

        // Debounce API calls for sort changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            fetchDashboards(1);
        }, 300);
    }, [fetchDashboards]);

    // Clear filters
    const clearFilters = useCallback(() => {
        // Clear debounce timer first
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        const emptyFilters: PowerBIFilters = {
            search: '',
            category_id: '',
            sort_by: '',
            sort_order: ''
        };
        
        setFilters(emptyFilters);
        // Immediately fetch with empty filters to avoid async state issues
        fetchDashboards(1, 10, emptyFilters);
    }, [fetchDashboards]);

    // Refresh dashboards
    const refreshDashboards = useCallback(() => {
        fetchCategories(); // Refresh categories too
        fetchDashboards(pagination?.page || 1, pagination?.limit || 10);
    }, [fetchDashboards, fetchCategories, pagination?.page, pagination?.limit]);

    // Create Dashboard
    const createDashboard = useCallback(async (data: CreatePowerBIRequest) => {
        try {
            setLoading(true);
            const response = await dashboardService.createDashboard(data);
            
            if (response.success) {
                toast.success(response.message || 'Dashboard created successfully');
                await fetchDashboards(1); // Refresh data
                return { success: true, data: response.data };
            } else {
                toast.error(response.message || 'Failed to create dashboard');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error creating dashboard:', error);
            toast.error('Failed to create dashboard');
            return { success: false, message: 'Failed to create dashboard' };
        } finally {
            setLoading(false);
        }
    }, [fetchDashboards]);

    // Update Dashboard
    const updateDashboard = useCallback(async (id: string, data: UpdatePowerBIRequest) => {
        try {
            setLoading(true);
            const response = await dashboardService.updateDashboard(id, data);
            
            if (response.success) {
                toast.success(response.message || 'Dashboard updated successfully');
                await fetchDashboards(pagination?.page || 1); // Refresh current page
                return { success: true, data: response.data };
            } else {
                toast.error(response.message || 'Failed to update dashboard');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
            toast.error('Failed to update dashboard');
            return { success: false, message: 'Failed to update dashboard' };
        } finally {
            setLoading(false);
        }
    }, [fetchDashboards, pagination?.page]);

    // Delete Dashboard
    const deleteDashboard = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await dashboardService.deleteDashboard(id);
            
            if (response.success) {
                toast.success(response.message || 'Dashboard deleted successfully');
                await fetchDashboards(pagination?.page || 1); // Refresh current page
                return { success: true, data: response.data };
            } else {
                toast.error(response.message || 'Failed to delete dashboard');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error deleting dashboard:', error);
            toast.error('Failed to delete dashboard');
            return { success: false, message: 'Failed to delete dashboard' };
        } finally {
            setLoading(false);
        }
    }, [fetchDashboards, pagination?.page]);

    // Category CRUD Operations
    
    // Create Category
    const createCategory = useCallback(async (data: CreateCategoryRequest) => {
        try {
            setLoading(true);
            const response = await categoryService.createCategory(data);
            
            if (response.success) {
                toast.success(response.message || 'Category created successfully');
                await fetchCategories(1, 100); // Refresh categories for options
                return { success: true, data: response.data };
            } else {
                toast.error(response.message || 'Failed to create category');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
            return { success: false, message: 'Failed to create category' };
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    // Update Category
    const updateCategory = useCallback(async (id: string, data: UpdateCategoryRequest) => {
        try {
            setLoading(true);
            const response = await categoryService.updateCategory(id, data);
            
            if (response.success) {
                toast.success(response.message || 'Category updated successfully');
                await fetchCategories(1, 100); // Refresh categories for options
                return { success: true, data: response.data };
            } else {
                toast.error(response.message || 'Failed to update category');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
            return { success: false, message: 'Failed to update category' };
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    // Delete Category
    const deleteCategory = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await categoryService.deleteCategory(id);
            
            if (response.success) {
                toast.success(response.message || 'Category deleted successfully');
                await fetchCategories(1, 100); // Refresh categories for options
                return { success: true, data: response.data };
            } else {
                toast.error(response.message || 'Failed to delete category');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
            return { success: false, message: 'Failed to delete category' };
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    // Category filter handlers
    const handleCategorySearchChange = useCallback((search: string) => {
        setCategoryFilters(prev => ({ ...prev, search }));
    }, []);

    const handleCategoryPageChange = useCallback((page: number) => {
        setCategoryPagination(prev => prev ? { ...prev, page } : null);
    }, []);

    return {
        // State
        loading,
        loadingMore,
        dashboards,
        pagination,
        categories,
        categoryOptions,
        categoryFilters,
        categoryPagination,
        filters,

        // Actions
        fetchDashboards,
        loadMoreDashboards,
        fetchCategories,
        handleOpenDashboard,
        handlePageChange,
        handleLimitChange,
        handleSearchChange,
        handleCategoryChange,
        handleSortChange,
        handleFilterChange,
        clearFilters,
        refreshDashboards,
        
        // CRUD Operations
        createDashboard,
        updateDashboard,
        deleteDashboard,
        
        // Category CRUD Operations
        createCategory,
        updateCategory,
        deleteCategory,
        
        // Category Handlers
        handleCategorySearchChange,
        handleCategoryPageChange,
    };
};

// Hook khusus untuk Dashboard View (hanya active dashboards)
export const useDashboardView = () => {
    // Ref to prevent multiple initial calls
    const isInitialized = useRef(false);
    
    // States
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dashboards, setDashboards] = useState<PowerBIDashboard[]>([]);
    const [pagination, setPagination] = useState<PowerBIPagination | null>(null);
    
    // Category states
    const [categories, setCategories] = useState<PowerBICategory[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    
    // Simplified filters for dashboard view
    const [filters, setFilters] = useState<{
        search: string;
        category_id: string;
    }>({
        search: '',
        category_id: ''
    });

    // Fetch categories function (reuse from main hook)
    const fetchCategories = useCallback(async (page: number = 1, limit: number = 100) => {
        try {
            const requestParams: CategoryListRequest = {
                page,
                limit,
                search: ''
            };

            const response = await categoryService.getCategories(requestParams);

            if (response.success) {
                setCategories(response.data || []);
                
                const options: CategoryOption[] = [
                    { value: '', label: 'All Categories' },
                    ...response.data.map((category: PowerBICategory) => ({
                        value: category.category_id,
                        label: category.name
                    }))
                ];
                setCategoryOptions(options);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    // Fetch dashboards for dashboard view (active only)
    const fetchDashboards = useCallback(async (page: number = 1, limit: number = 10, customFilters?: { search: string; category_id: string }) => {
        try {
            setLoading(true);
            
            const activeFilters = customFilters || filters;
            
            const requestParams: DashboardViewRequestType = {
                page,
                limit,
                status: 'active',
                search: activeFilters.search || undefined,
                category_id: activeFilters.category_id || undefined
            };

            const response = await dashboardService.getDashboardsForView(requestParams);

            if (response.success) {
                setDashboards(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch dashboards');
            }
        } catch (error) {
            console.error('Error fetching dashboards:', error);
            toast.error('Failed to fetch dashboards');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Load more dashboards for infinite scroll
    const loadMoreDashboards = useCallback(async () => {
        if (!pagination || !pagination.totalPages || pagination.page >= pagination.totalPages || loadingMore) {
            return;
        }

        try {
            setLoadingMore(true);
            
            const nextPage = pagination.page + 1;
            const requestParams: DashboardViewRequestType = {
                page: nextPage,
                limit: pagination.limit,
                status: 'active',
                search: filters.search || undefined,
                category_id: filters.category_id || undefined
            };

            const response = await dashboardService.getDashboardsForView(requestParams);

            if (response.success) {
                setDashboards(prev => [...prev, ...(response.data || [])]);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to load more dashboards');
            }
        } catch (error) {
            console.error('Error loading more dashboards:', error);
            toast.error('Failed to load more dashboards');
        } finally {
            setLoadingMore(false);
        }
    }, [filters, pagination, loadingMore]);

    // Initialize with default fetch
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchCategories();
            fetchDashboards();
        }
    }, [fetchDashboards, fetchCategories]);

    // Open dashboard in new tab
    const handleOpenDashboard = useCallback((url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    // Page change handler
    const handlePageChange = useCallback((page: number) => {
        fetchDashboards(page, pagination?.limit || 10);
    }, [fetchDashboards, pagination?.limit]);

    // Limit change handler
    const handleLimitChange = useCallback((newLimit: number) => {
        fetchDashboards(1, newLimit);
    }, [fetchDashboards]);

    // Filter change handler with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((field: 'search' | 'category_id', value: string) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [field]: value
            };
            
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            
            debounceTimer.current = setTimeout(() => {
                fetchDashboards(1, 10, newFilters);
            }, 300);
            
            return newFilters;
        });
    }, [fetchDashboards]);

    // Search change handler - reset category when searching
    const handleSearchChange = useCallback((searchValue: string) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                search: searchValue,
                category_id: '' // Reset category when searching to search all categories
            };
            
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            
            debounceTimer.current = setTimeout(() => {
                fetchDashboards(1, 10, newFilters);
            }, 300);
            
            return newFilters;
        });
    }, [fetchDashboards]);

    // Category filter change handler
    const handleCategoryChange = useCallback((category_id: string) => {
        setFilters(prev => {
            const newFilters = {
                ...prev,
                search: '',
                category_id: category_id // Only update category_id, keep search unchanged
            };
            
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            
            // No debouncing for category change - immediate fetch
            fetchDashboards(1, 10, newFilters);
            
            return newFilters;
        });
    }, [fetchDashboards]);

    // Clear filters
    const clearFilters = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        const emptyFilters = {
            search: '',
            category_id: ''
        };
        
        setFilters(emptyFilters);
        fetchDashboards(1, 10, emptyFilters);
    }, [fetchDashboards]);

    // Refresh dashboards
    const refreshDashboards = useCallback(() => {
        fetchCategories();
        fetchDashboards(pagination?.page || 1, pagination?.limit || 10);
    }, [fetchDashboards, fetchCategories, pagination?.page, pagination?.limit]);

    return {
        // State
        loading,
        loadingMore,
        dashboards,
        pagination,
        categories,
        categoryOptions,
        filters,

        // Actions
        fetchDashboards,
        loadMoreDashboards,
        fetchCategories,
        handleOpenDashboard,
        handlePageChange,
        handleLimitChange,
        handleSearchChange,
        handleCategoryChange,
        handleFilterChange,
        clearFilters,
        refreshDashboards,
    };
};

export const useManageDashboards = () => {
    // Placeholder for future dashboard management logic
}