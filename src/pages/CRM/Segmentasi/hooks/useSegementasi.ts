import { useState, useEffect, useCallback, useRef } from 'react';
import {  SegementationPayload, SegementationPagination, Segementation, SegementationValidationErrors, SegementationFilters, SegementationRequest } from '../types/segementasi';
import toast from 'react-hot-toast';
import { SegementationService } from '../services/segementasiService';

export const useBrandManagement = () => {
    const isInitialized = useRef(false);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<SegementationPagination | null>(null);
    const [segementations, setSegementations] = useState<Segementation[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSegementation, setEditingSegementation] = useState<Segementation | null>(null);
    const [formData, setFormData] = useState<SegementationPayload>({
        segmentation_name_en: ''
    });
    const [validationErrors, setValidationErrors] = useState<Partial<SegementationValidationErrors>>({});
    const [filters, setFilters] = useState<SegementationFilters>({
        search: '',
        sort_order: ''
    });

    const fetchSegementations = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: SegementationRequest = {
                page,
                limit,
                sort_order: filters.sort_order || 'desc',
                search: filters.search || ''
            };

            const response = await SegementationService.getSegementations(requestParams);

            if (response.success) {
                setSegementations(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch segementations');
            }
        } catch (error) {
            console.error('Error fetching segementations:', error);
            toast.error('Failed to fetch segementations');
        } finally {
            setLoading(false);
        }
    }, [filters.sort_order, filters.search]);

    // Initialize brand on component mount only
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchSegementations(1, 10);
        }
    }, [fetchSegementations]);

    // Form handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name as keyof SegementationValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [validationErrors]);

    // Modal handlers
    const handleAddSegementation = useCallback(() => {
        setEditingSegementation(null);
        setFormData({
            segmentation_name_en: ''
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleEditSegementation = useCallback((segementation: Segementation) => {
        setEditingSegementation(segementation);
        setFormData({
            segmentation_name_en: segementation.segmentation_name_en
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingSegementation(null);
        setFormData({
            segmentation_name_en: ''
        });
        setValidationErrors({});
    }, []);

    // Validation functions
    const validateSegementationForm = useCallback((data: SegementationPayload): SegementationValidationErrors => {
        const errors: SegementationValidationErrors = {};

        // Company name validation
        if (!data.segmentation_name_en || data.segmentation_name_en.trim() === '') {
            errors.segmentation_name_en = 'Segmentation name is required';
        } else {
            const isDuplicate = segementations.some(segementation => 
                segementation.segmentation_name_en.toLowerCase() === data.segmentation_name_en.trim().toLowerCase() &&
                (!editingSegementation || segementation.segmentation_name_en !== editingSegementation.segmentation_name_en)
            );
            if (isDuplicate) {
                errors.segmentation_name_en = 'A segmentation with this name already exists';
            }
        }

        return errors;
    }, [segementations, editingSegementation]);

    const clearValidationError = useCallback((fieldName: keyof SegementationValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // CRUD operations
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        const errors = validateSegementationForm(formData);
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        try {
            setLoading(true);
            
            if (editingSegementation) {
                const response = await SegementationService.updateSegementation(editingSegementation.segmentation_id, formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Segmentation updated successfully');
                    handleCloseModal();
                    fetchSegementations(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to update segmentation');
                }
            } else {
                const response = await SegementationService.createSegementation(formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Segmentation created successfully');
                    handleCloseModal();
                    fetchSegementations(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to create segmentation');
                }
            }
        } catch (error) {
            console.error('Error saving segmentation:', error);
            toast.error('Failed to saving segmentation');
        } finally {
            setLoading(false);
        }
    }, [formData, editingSegementation, pagination, fetchSegementations, handleCloseModal, validateSegementationForm]);
    const handleDeleteSegementation = useCallback(async (segementation: Segementation) => {
        try {
            setLoading(true);
            const response = await SegementationService.deleteSegementation(segementation.segmentation_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Segmentation deleted successfully');
                fetchSegementations(pagination?.page || 1, pagination?.limit || 10);
            } else {
                toast.error('Failed to delete segmentation');
            }
        } catch (error) {
            console.error('Error deleting segmentation:', error);
            toast.error('Failed to delete segmentation. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [pagination, fetchSegementations]);
    // Pagination handler
    const handlePageChange = useCallback((page: number) => {
        fetchSegementations(page, pagination?.limit || 10);
    }, [fetchSegementations, pagination?.limit]);
    // Filter functions with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((filterKey: keyof SegementationFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            const sortOrderValue = filterKey === 'sort_order' ? value : filters.sort_order || 'desc';
            const requestParams: SegementationRequest = {
                page: 1,
                limit: pagination?.limit || 10,
                sort_order: (sortOrderValue === 'asc' || sortOrderValue === 'desc') ? sortOrderValue : 'desc',
                search: filterKey === 'search' ? value : filters.search || 'undefined'
            };

            SegementationService.getSegementations(requestParams).then(response => {
                if (response.success) {
                    setSegementations(response.data || []);
                    setPagination(response.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch segmentations');
                }
            }).catch(error => {
                console.error('Error fetching segmentations:', error);
                toast.error('Failed to fetch segmentations');
            });
        }, 500);
    }, [pagination?.limit, filters]);

    const handleSearchChange = useCallback((value: string) => {
        handleFilterChange('search', value);
    }, [handleFilterChange]);

    const resetFilters = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Reset filters state
        setFilters({
            search: '',
            sort_order: ''
        });
        
        const clearedParams: SegementationRequest = {
            page: 1,
            limit: pagination?.limit || 10,
            sort_order: 'desc',
            search: ''
        };
        
        SegementationService.getSegementations(clearedParams).then(response => {
            if (response.success) {
                setSegementations(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch segmentations');
            }
        }).catch(error => {
            console.error('Error fetching segmentations:', error);
            toast.error('Failed to fetch segmentations');
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
        segementations,
        pagination,
        filters,
        isModalOpen,
        editingSegementation,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddSegementation,
        handleEditSegementation,
        handleDeleteSegementation,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchSegementations,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,

        // Validation actions
        validateSegementationForm,
        clearValidationError,
    };
};