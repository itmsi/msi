import { useState, useEffect, useCallback, useRef } from 'react';
import { Brand, BrandFilters, BrandPagination, BrandPayload, BrandRequest, BrandValidationErrors } from '../types/brand';
import toast from 'react-hot-toast';
import { BrandService } from '../services/brandService';

export const useBrandManagement = () => {
    const isInitialized = useRef(false);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<BrandPagination | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState<BrandPayload>({
        brand_name_en: ''
    });
    const [validationErrors, setValidationErrors] = useState<Partial<BrandValidationErrors>>({});
    const [filters, setFilters] = useState<BrandFilters>({
        search: '',
        sort_order: ''
    });

    const fetchBrands = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: BrandRequest = {
                page,
                limit,
                sort_order: filters.sort_order || 'desc',
                search: filters.search || ''
            };

            const response = await BrandService.getBrands(requestParams);

            if (response.success) {
                setBrands(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch brands');
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to fetch brands');
        } finally {
            setLoading(false);
        }
    }, [filters.sort_order, filters.search]);

    // Initialize brand on component mount only
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchBrands(1, 10);
        }
    }, [fetchBrands]);

    // Form handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name as keyof BrandValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [validationErrors]);

    // Modal handlers
    const handleAddBrand = useCallback(() => {
        setEditingBrand(null);
        setFormData({
            brand_name_en: ''
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleEditBrand = useCallback((brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            brand_name_en: brand.brand_name_en
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingBrand(null);
        setFormData({
            brand_name_en: ''
        });
        setValidationErrors({});
    }, []);

    // Validation functions
    const validateBrandForm = useCallback((data: BrandPayload): BrandValidationErrors => {
        const errors: BrandValidationErrors = {};

        // Company name validation
        if (!data.brand_name_en || data.brand_name_en.trim() === '') {
            errors.brand_name_en = 'Brand name is required';
        } else {
            const isDuplicate = brands.some(brand => 
                brand.brand_name_en.toLowerCase() === data.brand_name_en.trim().toLowerCase() &&
                (!editingBrand || brand.brand_name_en !== editingBrand.brand_name_en)
            );
            if (isDuplicate) {
                errors.brand_name_en = 'A brand with this name already exists';
            }
        }

        return errors;
    }, [brands, editingBrand]);

    const clearValidationError = useCallback((fieldName: keyof BrandValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // CRUD operations
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        const errors = validateBrandForm(formData);
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        try {
            setLoading(true);
            
            if (editingBrand) {
                const response = await BrandService.updateBrand(editingBrand.brand_id, formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Brand updated successfully');
                    handleCloseModal();
                    fetchBrands(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to update brand');
                }
            } else {
                const response = await BrandService.createBrand(formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Brand created successfully');
                    handleCloseModal();
                    fetchBrands(pagination?.page || 1, pagination?.limit || 10);
                } else {
                    toast.error('Failed to create brand');
                }
            }
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error('Failed to saving brand');
        } finally {
            setLoading(false);
        }
    }, [formData, editingBrand, pagination, fetchBrands, handleCloseModal, validateBrandForm]);
    const handleDeleteBrand = useCallback(async (brand: Brand) => {
        try {
            setLoading(true);
            const response = await BrandService.deleteBrand(brand.brand_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Brand deleted successfully');
                fetchBrands(pagination?.page || 1, pagination?.limit || 10);
            } else {
                toast.error('Failed to delete brand');
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Failed to delete brand. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [pagination, fetchBrands]);

    // Pagination handler
    const handlePageChange = useCallback((page: number) => {
        fetchBrands(page, pagination?.limit || 10);
    }, [fetchBrands, pagination?.limit]);

    // Filter functions with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((filterKey: keyof BrandFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            const sortOrderValue = filterKey === 'sort_order' ? value : filters.sort_order || 'desc';
            const requestParams: BrandRequest = {
                page: 1,
                limit: pagination?.limit || 10,
                sort_order: (sortOrderValue === 'asc' || sortOrderValue === 'desc') ? sortOrderValue : 'desc',
                search: filterKey === 'search' ? value : filters.search || 'undefined'
            };

            BrandService.getBrands(requestParams).then(response => {
                if (response.success) {
                    setBrands(response.data || []);
                    setPagination(response.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch brands');
                }
            }).catch(error => {
                console.error('Error fetching brands:', error);
                toast.error('Failed to fetch brands');
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
        
        const clearedParams: BrandRequest = {
            page: 1,
            limit: pagination?.limit || 10,
            sort_order: 'desc',
            search: ''
        };
        
        BrandService.getBrands(clearedParams).then(response => {
            if (response.success) {
                setBrands(response.data || []);
                setPagination(response.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch brands');
            }
        }).catch(error => {
            console.error('Error fetching brands:', error);
            toast.error('Failed to fetch brands');
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
        brands,
        pagination,
        filters,
        isModalOpen,
        editingBrand,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddBrand,
        handleEditBrand,
        handleDeleteBrand,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchBrands,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,

        // Validation actions
        validateBrandForm,
        clearValidationError,
    };
};