import { useState, useEffect, useCallback, useRef } from 'react';
import { Island, IslandFilters, IslandPagination, IslandPayload, IslandRequest, IslandValidationErrors } from '../types/island';
import toast from 'react-hot-toast';
import { IslandService } from '../services/islandService';

export const useIslandManagement = () => {
    const isInitialized = useRef(false);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<IslandPagination | null>(null);
    const [islands, setIslands] = useState<Island[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIsland, setEditingIsland] = useState<Island | null>(null);
    const [formData, setFormData] = useState<IslandPayload>({
        island_name: ''
    });
    const [validationErrors, setValidationErrors] = useState<Partial<IslandValidationErrors>>({});
    const [filters, setFilters] = useState<IslandFilters>({
        search: '',
        sort_order: ''
    });

    const fetchIslands = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: IslandRequest = {
                page,
                limit,
                sort_order: filters.sort_order || 'desc',
                search: filters.search || ''
            };

            const response = await IslandService.getIslands(requestParams);

            if (response.success) {
                setIslands(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch islands');
            }
        } catch (error) {
            console.error('Error fetching islands:', error);
            toast.error('Failed to fetch islands');
        } finally {
            setLoading(false);
        }
    }, [filters.sort_order, filters.search]);

    // Initialize island on component mount only
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchIslands(1, 10);
        }
    }, [fetchIslands]);

    // Form handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name as keyof IslandValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [validationErrors]);

    // Modal handlers
    const handleAddIsland = useCallback(() => {
        setEditingIsland(null);
        setFormData({
            island_name: ''
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleEditIsland = useCallback((island: Island) => {
        setEditingIsland(island);
        setFormData({
            island_name: island.island_name
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingIsland(null);
        setFormData({
            island_name: ''
        });
        setValidationErrors({});
    }, []);

    // Validation functions
    const validateIslandForm = useCallback((data: IslandPayload): IslandValidationErrors => {
        const errors: IslandValidationErrors = {};

        // Company name validation
        if (!data.island_name || data.island_name.trim() === '') {
            errors.island_name = 'Island name is required';
        } else {
            const isDuplicate = islands.some(island => 
                island.island_name.toLowerCase() === data.island_name.trim().toLowerCase() &&
                (!editingIsland || island.island_name !== editingIsland.island_name)
            );
            if (isDuplicate) {
                errors.island_name = 'An island with this name already exists';
            }
        }

        return errors;
    }, [islands, editingIsland]);

    const clearValidationError = useCallback((fieldName: keyof IslandValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // CRUD operations
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        const errors = validateIslandForm(formData);
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        try {
            setLoading(true);
            
            if (editingIsland) {
                const response = await IslandService.updateIsland(editingIsland.island_id, formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Island updated successfully');
                    handleCloseModal();
                    fetchIslands(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to update island');
                }
            } else {
                const response = await IslandService.createIsland(formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Island created successfully');
                    handleCloseModal();
                    fetchIslands(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to create island');
                }
            }
        } catch (error) {
            console.error('Error saving island:', error);
            toast.error('Failed to saving island');
        } finally {
            setLoading(false);
        }
    }, [formData, editingIsland, pagination, fetchIslands, handleCloseModal, validateIslandForm]);

    const handleDeleteIsland = useCallback(async (island: Island) => {
        try {
            setLoading(true);
            const response = await IslandService.deleteIsland(island.island_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Island deleted successfully');
                fetchIslands(pagination?.page || 1, pagination?.limit || 10);
            } else {
                toast.error('Failed to delete island');
            }
        } catch (error) {
            console.error('Error deleting island:', error);
            toast.error('Failed to delete island. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [pagination, fetchIslands]);

    // Pagination handler
    const handlePageChange = useCallback((page: number) => {
        fetchIslands(page, pagination?.limit || 10);
    }, [fetchIslands, pagination?.limit]);

    // Filter functions with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((filterKey: keyof IslandFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            const sortOrderValue = filterKey === 'sort_order' ? value : filters.sort_order || 'desc';
            const requestParams: IslandRequest = {
                page: 1,
                limit: pagination?.limit || 10,
                sort_order: (sortOrderValue === 'asc' || sortOrderValue === 'desc') ? sortOrderValue : 'desc',
                search: filterKey === 'search' ? value : filters.search || 'undefined'
            };

            IslandService.getIslands(requestParams).then(response => {
                if (response.success) {
                    setIslands(response.data.data || []);
                    setPagination(response.data.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch islands');
                }
            }).catch(error => {
                console.error('Error fetching islands:', error);
                toast.error('Failed to fetch islands');
            });
        }, 500);
    }, [pagination?.limit, filters]);

    const handleSearchChange = useCallback((value: string) => {
        handleFilterChange('search', value);
    }, [handleFilterChange]);

    const resetFilters = useCallback(() => {
        // Clear all debounce timers first
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Reset filters state
        setFilters({
            search: '',
            sort_order: ''
        });
        
        const clearedParams: IslandRequest = {
            page: 1,
            limit: pagination?.limit || 10,
            sort_order: 'desc',
            search: ''
        };
        
        IslandService.getIslands(clearedParams).then(response => {
            if (response.success) {
                setIslands(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch islands');
            }
        }).catch(error => {
            console.error('Error fetching islands:', error);
            toast.error('Failed to fetch islands');
        });
    }, [pagination?.limit]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        // State
        loading,
        islands,
        pagination,
        filters,
        isModalOpen,
        editingIsland,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddIsland,
        handleEditIsland,
        handleDeleteIsland,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchIslands,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,

        // Validation actions
        validateIslandForm,
        clearValidationError,
    };
};