import { useState, useEffect, useCallback, useRef } from 'react';
import { Division, DivisionFilters, DivisionPagination, DivisionPayload, DivisionRequest, DivisionValidationErrors } from '../types/division';
import toast from 'react-hot-toast';
import { DivisionService } from '../services/divisionService';

export const useDivisionManagement = () => {
    const isInitialized = useRef(false);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<DivisionPagination | null>(null);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDivision, setEditingDivision] = useState<Division | null>(null);
    const [formData, setFormData] = useState<DivisionPayload>({
        devision_project_name: ''
    });
    const [validationErrors, setValidationErrors] = useState<Partial<DivisionValidationErrors>>({});
    const [filters, setFilters] = useState<DivisionFilters>({
        search: '',
        sort_order: ''
    });

    const fetchDivisions = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: DivisionRequest = {
                page,
                limit,
                sort_order: filters.sort_order || 'desc',
                search: filters.search || ''
            };

            const response = await DivisionService.getDivisions(requestParams);

            if (response.success) {                
                setDivisions(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch divisions');
            }
        } catch (error) {
            console.error('Error fetching divisions:', error);
            toast.error('Failed to fetch divisions');
        } finally {
            setLoading(false);
        }
    }, [filters.sort_order, filters.search]);

    // Initialize division on component mount only
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchDivisions(1, 10);
        }
    }, [fetchDivisions]);

    // Form handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name as keyof DivisionValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [validationErrors]);

    // Modal handlers
    const handleAddDivision = useCallback(() => {
        setEditingDivision(null);
        setFormData({
            devision_project_name: ''
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleEditDivision = useCallback((division: Division) => {
        setEditingDivision(division);
        setFormData({
            devision_project_name: division.devision_project_name
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingDivision(null);
        setFormData({
            devision_project_name: ''
        });
        setValidationErrors({});
    }, []);

    // Validation functions
    const validateDivisionForm = useCallback((data: DivisionPayload): DivisionValidationErrors => {
        const errors: DivisionValidationErrors = {};

        // Division name validation
        if (!data.devision_project_name || data.devision_project_name?.trim() === '') {
            errors.devision_project_name = 'Division name is required';
        } else {
            const isDuplicate = divisions.some(division => 
                division.devision_project_name?.toLowerCase() === data.devision_project_name?.trim().toLowerCase() &&
                (!editingDivision || division.devision_project_name !== editingDivision.devision_project_name)
            );
            if (isDuplicate) {
                errors.devision_project_name = 'A division with this name already exists';
            }
        }

        return errors;
    }, [divisions, editingDivision]);

    const clearValidationError = useCallback((fieldName: keyof DivisionValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // CRUD operations
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        const errors = validateDivisionForm(formData);
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        try {
            setLoading(true);
            
            if (editingDivision) {
                const response = await DivisionService.updateDivision(editingDivision.devision_project_id, formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Division updated successfully');
                    handleCloseModal();
                    fetchDivisions(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to update division');
                }
            } else {
                const response = await DivisionService.createDivision(formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Division created successfully');
                    handleCloseModal();
                    fetchDivisions(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to create division');
                }
            }
        } catch (error) {
            console.error('Error saving division:', error);
            toast.error('Failed to save division');
        } finally {
            setLoading(false);
        }
    }, [formData, editingDivision, pagination, fetchDivisions, handleCloseModal, validateDivisionForm]);

    const handleDeleteDivision = useCallback(async (division: Division) => {
        try {
            setLoading(true);
            const response = await DivisionService.deleteDivision(division.devision_project_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Division deleted successfully');
                fetchDivisions(pagination?.page || 1, pagination?.limit || 10);
            } else {
                toast.error('Failed to delete division');
            }
        } catch (error) {
            console.error('Error deleting division:', error);
            toast.error('Failed to delete division. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [pagination, fetchDivisions]);

    // Pagination handler
    const handlePageChange = useCallback((page: number) => {
        fetchDivisions(page, pagination?.limit || 10);
    }, [fetchDivisions, pagination?.limit]);

    // Filter functions with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const handleClearFilters = useCallback(async () => {
        // Clear debounce timer first
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Reset filters state
        setFilters({
            search: '',
            sort_order: ''
        });
        
        // Fetch data langsung dengan parameter yang sudah direset
        try {
            setLoading(true);
            const requestParams: DivisionRequest = {
                page: 1,
                limit: pagination?.limit || 10,
                sort_order: 'desc',
                search: ''
            };

            const response = await DivisionService.getDivisions(requestParams);

            if (response.success) {                
                setDivisions(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch divisions');
            }
        } catch (error) {
            console.error('Error fetching divisions:', error);
            toast.error('Failed to fetch divisions');
        } finally {
            setLoading(false);
        }
    }, [pagination?.limit]);
    
    const handleFilterChange = useCallback((filterKey: keyof DivisionFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            const sortOrderValue = filterKey === 'sort_order' ? value : filters.sort_order || 'desc';
            const requestParams: DivisionRequest = {
                page: 1,
                limit: pagination?.limit || 10,
                sort_order: (sortOrderValue === 'asc' || sortOrderValue === 'desc') ? sortOrderValue : 'desc',
                search: filterKey === 'search' ? value : filters.search || ''
            };

            DivisionService.getDivisions(requestParams).then(response => {
                if (response.success) {
                    setDivisions(response.data || []);
                    setPagination(response.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch divisions');
                }
            }).catch(error => {
                console.error('Error fetching divisions:', error);
                toast.error('Failed to fetch divisions');
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
        
        const clearedParams: DivisionRequest = {
            page: 1,
            limit: pagination?.limit || 10,
            sort_order: 'desc',
            search: ''
        };
        
        DivisionService.getDivisions(clearedParams).then(response => {
            if (response.success) {
                setDivisions(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch divisions');
            }
        }).catch(error => {
            console.error('Error fetching divisions:', error);
            toast.error('Failed to fetch divisions');
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
        divisions,
        pagination,
        filters,
        isModalOpen,
        editingDivision,
        formData,
        validationErrors,

        // Actions
        handleClearFilters,
        handleInputChange,
        handleAddDivision,
        handleEditDivision,
        handleDeleteDivision,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchDivisions,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,

        // Validation actions
        validateDivisionForm,
        clearValidationError,
    };
};