import { administrationService, companyService, departmentService, employeesService, roleService, positionService } from "@/services/administrationService";
import { 
    Menu, 
    MenuFormData, 
    MenuPagination, 
    PermissionItem, 
    MenuValidationErrors,
    MenuFilters,
    MenuListRequest,
    Company,
    CompanyFormData,
    CompanyPagination,
    CompanyFilters,
    CompanyListRequest,
    CompanyValidationErrors,
    Department,
    DepartmentFormData,
    DepartmentPagination,
    DepartmentFilters,
    DepartmentListRequest,
    DepartmentValidationErrors,
    Employee,
    EmployeeFormData,
    EmployeePagination,
    EmployeeFilters,
    EmployeeListRequest,
    EmployeeValidationErrors,
    Role,
    RoleFormData,
    RolePagination,
    RoleFilters,
    RoleListRequest,
    RoleValidationErrors,
    Position,
    PositionFormData,
    PositionPagination,
    PositionFilters,
    PositionListRequest,
    PositionValidationErrors,
    EmployeeDetailData
} from "@/types/administration";
import { useCallback, useState, useEffect, useRef } from "react";

import toast from "react-hot-toast";

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'An unknown error occurred';
};

// ini fungsi menu
export const useAdministration = () => {
    // Ref to prevent multiple initial calls
    const isInitialized = useRef(false);
    
    // States - Updated to use new types
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<MenuPagination | null>(null);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [formData, setFormData] = useState<MenuFormData>({
        menu_name: '',
        menu_parent_id: null,
        menu_url: '',
        menu_order: 1
    });
    const [validationErrors, setValidationErrors] = useState<MenuValidationErrors>({});
    const [filters, setFilters] = useState<MenuFilters>({
        search: '',
        menu_name: '',
        sort_by: '',
        sort_order: ''
    });
    
    // Permission modal states (keeping for compatibility)
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedMenuForPermission, setSelectedMenuForPermission] = useState<Menu | null>(null);
    const [menuPermissions, setMenuPermissions] = useState<PermissionItem[]>([]);
    const [permissionLoading, setPermissionLoading] = useState(false);

    // Fetch menus data - Updated to use new API structure
    const fetchMenus = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: MenuListRequest = {
                page,
                limit,
                sort_by: filters.sort_by || 'created_at',
                sort_order: filters.sort_order || undefined,
                search: filters.search || undefined,
                menu_name: filters.menu_name || undefined
            };

            const response = await administrationService.getMenus(requestParams);

            if (response.success) {
                setMenus(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch menus');
            }
        } catch (error) {
            console.error('Error fetching menus:', error);
            toast.error('Failed to fetch menus');
        } finally {
            setLoading(false);
        }
    }, [filters.sort_by, filters.sort_order, filters.search, filters.menu_name]); // Only specific filter dependencies

    // Initialize menus on component mount only
    useEffect(() => {
        // Prevent multiple calls in StrictMode and development re-renders
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchMenus(1, 10);
        }
    }, []); // Empty dependency array - only run once on mount

    // Validation functions - Updated for new types
    const validateForm = (): boolean => {
        const errors: MenuValidationErrors = {};

        // Menu name validation
        if (!formData.menu_name.trim()) {
            errors.menu_name = 'Menu name is required';
        } else if (formData.menu_name.length < 3) {
            errors.menu_name = 'Menu name must be at least 3 characters';
        } else if (formData.menu_name.length > 50) {
            errors.menu_name = 'Menu name must not exceed 50 characters';
        }

        // URL validation
        if (!formData.menu_url.trim()) {
            errors.menu_url = 'URL is required (auto-generated from menu name)';
        } else if (formData.menu_url.length > 255) {
            errors.menu_url = 'URL must not exceed 255 characters';
        }

        // Menu order validation
        if (!formData.menu_order || formData.menu_order < 1) {
            errors.menu_order = 'Menu order must be a positive number';
        } else if (formData.menu_order > 9999) {
            errors.menu_order = 'Menu order must not exceed 9999';
        }


        // Check for duplicate menu names (exclude current editing menu)
        const duplicateMenu = menus.find(menu => 
            menu.menu_name.toLowerCase() === formData.menu_name.toLowerCase() &&
            (!editingMenu || menu.menu_id !== editingMenu.menu_id)
        );
        if (duplicateMenu) {
            errors.menu_name = 'Menu name already exists';
        }

        // Check for duplicate URLs (exclude current editing menu)
        const duplicateUrl = menus.find(menu => 
            menu.menu_url === formData.menu_url &&
            (!editingMenu || menu.menu_id !== editingMenu.menu_id)
        );
        if (duplicateUrl) {
            errors.menu_url = 'URL already exists';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Clear validation error for specific field
    const clearFieldError = (fieldName: keyof MenuValidationErrors) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    // Handle form input changes - Updated for new types
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Clear validation error for this field when user starts typing
        if (validationErrors[name as keyof MenuValidationErrors]) {
            clearFieldError(name as keyof MenuValidationErrors);
        }
        
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
                        : name === 'menu_order' ? parseInt(value) || 0
                        : name === 'menu_parent_id' ? (value ? value : null)
                        : value
            };

            // Auto-generate menu_url from menu_name
            if (name === 'menu_name') {
                const urlSlug = '/' + value
                    .toLowerCase()
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/[^a-z0-9-]/g, ''); // Remove special characters except hyphens
                newData.menu_url = urlSlug;

                // Clear URL validation error if it exists
                if (validationErrors.menu_url) {
                    clearFieldError('menu_url');
                }
            }

            return newData;
        });
    };

    // Handle select change for react-select components
    const handleSelectChange = (name: string) => (selectedOption: { value: string; label: string } | null) => {
        // Clear validation error for this field
        if (validationErrors[name as keyof MenuValidationErrors]) {
            clearFieldError(name as keyof MenuValidationErrors);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            menu_name: '',
            menu_parent_id: null,
            menu_url: '',
            menu_order: 1
        });
        setValidationErrors({});
        setEditingMenu(null);
    };

    // Handle add menu
    const handleAddMenu = () => {
        resetForm();
        setIsModalOpen(true);
    };

    // Handle edit menu
    const handleEditMenu = (menu: Menu) => {
        setEditingMenu(menu);
        setFormData({
            menu_name: menu.menu_name,
            menu_parent_id: menu.menu_parent_id,
            menu_url: menu.menu_url,
            menu_order: menu.menu_order
        });
        setValidationErrors({});
        setIsModalOpen(true);
    };

    // Handle delete menu
    const handleDeleteMenu = async (menu: Menu) => {
        if (window.confirm(`Are you sure you want to delete menu "${menu.menu_name}"?`)) {
            try {
                setLoading(true);
                const response = await administrationService.deleteMenu(menu.menu_id);
                
                if (response.status === 200) {
                    toast.success('Menu deleted successfully');
                    fetchMenus(pagination?.current_page || 1, pagination?.per_page || 10);
                } else {
                    toast.error('Failed to delete menu');
                }
            } catch (error) {
                console.error('Error deleting menu:', error);
                toast.error(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle toggle menu status
    const handleToggleStatus = async (menu: Menu, newStatus: boolean) => {
        try {
            setLoading(true);
            
            // Call API to update menu status
            const response = await administrationService.toggleMenuStatus(menu.menu_id, newStatus);
            
            if (response.status === 200) {
                // Update local state immediately for better UX
                setMenus(prevMenus => 
                    prevMenus.map(m => 
                        m.menu_id === menu.menu_id 
                            ? { ...m, is_delete: !newStatus } // is_delete is opposite of active status
                            : m
                    )
                );
                
                toast.success(`Menu ${newStatus ? 'activated' : 'deactivated'} successfully`);
            } else {
                toast.error('Failed to update menu status');
            }
        } catch (error) {
            console.error('Error updating menu status:', error);
            toast.error(getErrorMessage(error));
            
            // Revert optimistic update on error
            setMenus(prevMenus => 
                prevMenus.map(m => 
                    m.menu_id === menu.menu_id 
                        ? { ...m, is_delete: newStatus } // Revert to original state
                        : m
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle permission menu
    const handlePermissionMenu = async (menu: Menu) => {
        setSelectedMenuForPermission(menu);
        setIsPermissionModalOpen(true);
        
        try {
            setPermissionLoading(true);
            setMenuPermissions([]);
        } catch (error) {
            console.error('Error fetching menu permissions:', error);
            toast.error('Failed to fetch menu permissions');
        } finally {
            setPermissionLoading(false);
        }
    };

    // Handle submit form
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!validateForm()) {
            toast.error('Please fix validation errors before submitting');
            return;
        }

        try {
            setLoading(true);
            let response;

            if (editingMenu) {
                response = await administrationService.updateMenu(editingMenu.menu_id, formData);
            } else {
                response = await administrationService.createMenu(formData);
            }

            if (response.status === 200 || response.status === 201) {
                toast.success(`Menu ${editingMenu ? 'updated' : 'created'} successfully`);
                handleCloseModal();
                fetchMenus(pagination?.current_page || 1, pagination?.per_page || 10);
            } else {
                toast.error(`Failed to ${editingMenu ? 'update' : 'create'} menu`);
            }
        } catch (error) {
            console.error(`Error ${editingMenu ? 'updating' : 'creating'} menu:`, error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // Handle close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        fetchMenus(page, pagination?.per_page || 10);
    };

    // Handle permission status change
    const handlePermissionStatusChange = async (permissionId: number, hasStatus: boolean, mhpId: number) => {
        if (!selectedMenuForPermission) return;

        try {
            setPermissionLoading(true);
            
            if (hasStatus) {
                // Create permission
                await administrationService.createMenuPermission({
                    menu_id: parseInt(selectedMenuForPermission.menu_id),
                    permission_id: permissionId,
                    createdBy: 1 // This should come from auth context
                });
            } else {
                // Delete permission
                await administrationService.deleteMenuPermission(mhpId);
            }

            toast.success('Permission updated successfully');
            // Refresh permissions
            handlePermissionMenu(selectedMenuForPermission);
        } catch (error) {
            console.error('Error updating permission:', error);
            toast.error('Failed to update permission');
        } finally {
            setPermissionLoading(false);
        }
    };

    // Handle close permission modal
    const handleClosePermissionModal = () => {
        setIsPermissionModalOpen(false);
        setSelectedMenuForPermission(null);
        setMenuPermissions([]);
    };

    // Filter functions with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((filterKey: keyof MenuFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        // Debounce API calls for filter changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            // Create params with the new value instead of using stale state
            const requestParams: MenuListRequest = {
                page: 1, // Reset to first page when filtering
                limit: pagination?.per_page || 10,
                sort_by: filterKey === 'sort_by' ? value : filters.sort_by || 'created_at',
                sort_order: filterKey === 'sort_order' ? value : filters.sort_order || undefined,
                search: filterKey === 'search' ? value : filters.search || undefined,
                menu_name: filterKey === 'menu_name' ? value : filters.menu_name || undefined
            };

            // Make API call directly with current values
            administrationService.getMenus(requestParams).then(response => {
                if (response.success) {
                    setMenus(response.data.data || []);
                    setPagination(response.data.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch menus');
                }
            }).catch(error => {
                console.error('Error fetching menus:', error);
                toast.error('Failed to fetch menus');
            });
        }, 500);
    }, [pagination?.per_page, filters]);

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
            menu_name: '',
            sort_by: '',
            sort_order: ''
        });
        
        // Immediately fetch with cleared filters
        const clearedParams: MenuListRequest = {
            page: 1,
            limit: pagination?.per_page || 10,
            sort_by: 'created_at',
            sort_order: undefined,
            search: undefined,
            menu_name: undefined
        };
        
        administrationService.getMenus(clearedParams).then(response => {
            if (response.success) {
                setMenus(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch menus');
            }
        }).catch(error => {
            console.error('Error fetching menus:', error);
            toast.error('Failed to fetch menus');
        });
    }, [pagination?.per_page]);

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
        menus,
        pagination,
        isModalOpen,
        editingMenu,
        formData,
        validationErrors,
        filters,
        
        // Permission states
        isPermissionModalOpen,
        selectedMenuForPermission,
        menuPermissions,
        permissionLoading,

        // Actions
        handleInputChange,
        handleSelectChange,
        handleAddMenu,
        handleEditMenu,
        handleDeleteMenu,
        handleToggleStatus,
        handlePermissionMenu,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchMenus,
        
        // Permission actions
        handlePermissionStatusChange,
        handleClosePermissionModal,

        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,

        // Validation
        validateForm,
        clearFieldError,
        resetForm
    };
};

export const useCompany = () => {
    // Ref to prevent multiple initial calls
    const isInitialized = useRef(false);
    
    // States - Company management
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<CompanyPagination | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState<CompanyFormData>({
        company_name: '',
        company_parent_id: null,
        company_address: null,
        company_email: null
    });
    const [validationErrors, setValidationErrors] = useState<CompanyValidationErrors>({});
    const [filters, setFilters] = useState<CompanyFilters>({
        search: '',
        company_name: '',
        sort_by: '',
        sort_order: ''
    });

    // Fetch companies function
    const fetchCompanies = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: CompanyListRequest = {
                page,
                limit,
                sort_by: filters.sort_by || 'created_at',
                sort_order: filters.sort_order || undefined,
                search: filters.search || undefined,
                company_name: filters.company_name || undefined
            };

            const response = await companyService.getCompanies(requestParams);

            if (response.success) {
                setCompanies(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch companies');
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    }, [filters.sort_by, filters.sort_order, filters.search, filters.company_name]);

    // Initialize companies on component mount only
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchCompanies(1, 10);
        }
    }, [fetchCompanies]);

    // Form handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name as keyof CompanyValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [validationErrors]);

    // Modal handlers
    const handleAddCompany = useCallback(() => {
        setEditingCompany(null);
        setFormData({
            company_name: '',
            company_parent_id: null,
            company_address: null,
            company_email: null
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleEditCompany = useCallback((company: Company) => {
        setEditingCompany(company);
        setFormData({
            company_name: company.company_name,
            company_parent_id: company.company_parent_id,
            company_address: company.company_address,
            company_email: company.company_email
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingCompany(null);
        setFormData({
            company_name: '',
            company_parent_id: null,
            company_address: null,
            company_email: null
        });
        setValidationErrors({});
    }, []);

    // Validation functions
    const validateCompanyForm = useCallback((data: CompanyFormData): CompanyValidationErrors => {
        const errors: CompanyValidationErrors = {};

        // Company name validation
        if (!data.company_name || data.company_name.trim() === '') {
            errors.company_name = 'Company name is required';
        } else if (data.company_name.trim().length < 2) {
            errors.company_name = 'Company name must be at least 2 characters long';
        } else if (data.company_name.trim().length > 100) {
            errors.company_name = 'Company name must not exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-_.&()]+$/.test(data.company_name.trim())) {
            errors.company_name = 'Company name contains invalid characters';
        } else {
            // Check for duplicate company name (excluding current company if editing)
            const isDuplicate = companies.some(company => 
                company.company_name.toLowerCase() === data.company_name.trim().toLowerCase() &&
                (!editingCompany || company.company_id !== editingCompany.company_id)
            );
            if (isDuplicate) {
                errors.company_name = 'A company with this name already exists';
            }
        }

        // Company email validation (optional but validate format if provided)
        if (data.company_email && data.company_email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.company_email.trim())) {
                errors.company_email = 'Please enter a valid email address';
            } else if (data.company_email.trim().length > 100) {
                errors.company_email = 'Email address must not exceed 100 characters';
            } else {
                // Check for duplicate email (excluding current company if editing)
                const isDuplicateEmail = companies.some(company => 
                    company.company_email && 
                    company.company_email.toLowerCase() === data.company_email!.trim().toLowerCase() &&
                    (!editingCompany || company.company_id !== editingCompany.company_id)
                );
                if (isDuplicateEmail) {
                    errors.company_email = 'A company with this email already exists';
                }
            }
        }

        // Company address validation (optional but validate length if provided)
        if (data.company_address && data.company_address.trim() !== '') {
            if (data.company_address.trim().length > 500) {
                errors.company_address = 'Address must not exceed 500 characters';
            }
        }

        return errors;
    }, [companies, editingCompany]);

    const clearValidationError = useCallback((fieldName: keyof CompanyValidationErrors) => {
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // CRUD operations
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous errors
        setValidationErrors({});
        
        // Run comprehensive validation
        const errors = validateCompanyForm(formData);
        
        // If there are validation errors, show them and stop submission
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix the validation errors before submitting');
            return;
        }

        try {
            setLoading(true);
            
            if (editingCompany) {
                const response = await companyService.updateCompany(editingCompany.company_id, formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Company updated successfully');
                    handleCloseModal();
                    fetchCompanies(pagination?.current_page || 1, pagination?.per_page || 10);
                } else {
                    setValidationErrors({ general: 'Failed to update company. Please try again.' });
                    toast.error('Failed to update company');
                }
            } else {
                const response = await companyService.createCompany(formData);
                if (response.status === 200 || response.status === 201) {
                    toast.success('Company created successfully');
                    handleCloseModal();
                    fetchCompanies(pagination?.current_page || 1, pagination?.per_page || 10);
                } else {
                    setValidationErrors({ general: 'Failed to create company. Please try again.' });
                    toast.error('Failed to create company');
                }
            }
        } catch (error) {
            console.error('Error saving company:', error);
            const errorMessage = getErrorMessage(error);
            setValidationErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, editingCompany, pagination, fetchCompanies, handleCloseModal, validateCompanyForm]);

    const handleDeleteCompany = useCallback(async (company: Company) => {
        try {
            setLoading(true);
            const response = await companyService.deleteCompany(company.company_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Company deleted successfully');
                fetchCompanies(pagination?.current_page || 1, pagination?.per_page || 10);
            } else {
                toast.error('Failed to delete company');
            }
        } catch (error) {
            console.error('Error deleting company:', error);
            toast.error('Failed to delete company. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [pagination, fetchCompanies]);

    // Pagination handler
    const handlePageChange = useCallback((page: number) => {
        fetchCompanies(page, pagination?.per_page || 10);
    }, [fetchCompanies, pagination?.per_page]);

    // Filter functions with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((filterKey: keyof CompanyFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        // Debounce API calls for filter changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            // Create params with the new value instead of using stale state
            const requestParams: CompanyListRequest = {
                page: 1, // Reset to first page when filtering
                limit: pagination?.per_page || 10,
                sort_by: filterKey === 'sort_by' ? value : filters.sort_by || 'created_at',
                sort_order: filterKey === 'sort_order' ? value : filters.sort_order || undefined,
                search: filterKey === 'search' ? value : filters.search || undefined,
                company_name: filterKey === 'company_name' ? value : filters.company_name || undefined
            };

            // Make API call directly with current values
            companyService.getCompanies(requestParams).then(response => {
                if (response.success) {
                    setCompanies(response.data.data || []);
                    setPagination(response.data.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch companies');
                }
            }).catch(error => {
                console.error('Error fetching companies:', error);
                toast.error('Failed to fetch companies');
            });
        }, 500);
    }, [pagination?.per_page, filters]);

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
            company_name: '',
            sort_by: '',
            sort_order: ''
        });
        
        // Immediately fetch with cleared filters
        const clearedParams: CompanyListRequest = {
            page: 1,
            limit: pagination?.per_page || 10,
            sort_by: 'created_at',
            sort_order: undefined,
            search: undefined,
            company_name: undefined
        };
        
        companyService.getCompanies(clearedParams).then(response => {
            if (response.success) {
                setCompanies(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch companies');
            }
        }).catch(error => {
            console.error('Error fetching companies:', error);
            toast.error('Failed to fetch companies');
        });
    }, [pagination?.per_page]);

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
        companies,
        pagination,
        filters,
        isModalOpen,
        editingCompany,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddCompany,
        handleEditCompany,
        handleDeleteCompany,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchCompanies,
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,

        // Validation actions
        validateCompanyForm,
        clearValidationError,
    };
};

// Department hook
export const useDepartment = () => {
    // Ref to prevent multiple initial calls
    const isInitialized = useRef(false);
    
    // States - Department management
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<DepartmentPagination | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [formData, setFormData] = useState<DepartmentFormData>({
        department_name: '',
        department_parent_id: null,
        company_id: '',
        department_segmentasi: ''
    });
    const [validationErrors, setValidationErrors] = useState<DepartmentValidationErrors>({});
    const [filters, setFilters] = useState<DepartmentFilters>({
        search: '',
        company_id: '',
        company_name: '',
        department_parent_id: '',
        department_name: '',
        sort_by: '',
        sort_order: ''
    });

    // Fetch departments function
    const fetchDepartments = useCallback(async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const requestParams: DepartmentListRequest = {
                page,
                limit,
                sort_by: filters.sort_by || 'created_at',
                sort_order: filters.sort_order || undefined,
                search: filters.search || undefined,
                company_id: filters.company_id || undefined,
                company_name: filters.company_name || undefined,
                department_parent_id: filters.department_parent_id || undefined,
                department_name: filters.department_name || undefined
            };

            const response = await departmentService.getDepartments(requestParams);

            if (response.success) {
                setDepartments(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch departments');
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast.error('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initialize with default fetch
    useEffect(() => {
        if (!isInitialized.current) {
            isInitialized.current = true;
            fetchDepartments();
        }
    }, [fetchDepartments]);

    // Form validation - Only validate department_name as required
    const validateForm = (data: DepartmentFormData): DepartmentValidationErrors => {
        const errors: DepartmentValidationErrors = {};
        
        if (!data.department_name?.trim()) {
            errors.department_name = 'Department name is required';
        } else if (data.department_name.trim().length < 2) {
            errors.department_name = 'Department name must be at least 2 characters';
        } else if (data.department_name.trim().length > 100) {
            errors.department_name = 'Department name must not exceed 100 characters';
        }
        
        if (!data.company_id?.trim()) {
            errors.company_id = 'Company is required';
        }
        
        return errors;
    };

    // Input change handler
    const handleInputChange = useCallback((field: keyof DepartmentFormData, value: string | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    }, [validationErrors]);

    // Add department
    const handleAddDepartment = useCallback(() => {
        setEditingDepartment(null);
        setFormData({
            department_name: '',
            department_parent_id: null,
            company_id: '',
            department_segmentasi: ''
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    // Edit department
    const handleEditDepartment = useCallback((department: Department) => {
        setEditingDepartment(department);
        setFormData({
            department_name: department.department_name,
            department_parent_id: department.department_parent_id,
            company_id: department.company_id,
            department_segmentasi: department.department_segmentasi || ''
        });
        setValidationErrors({});
        setIsModalOpen(true);
    }, []);

    // Delete department
    const handleDeleteDepartment = useCallback(async (departmentId: string): Promise<boolean> => {
        try {
            const response = await departmentService.deleteDepartment(departmentId);
            if (response.status === 200) {
                toast.success('Department deleted successfully');
                fetchDepartments(pagination?.current_page || 1);
                return true;
            } else {
                toast.error('Failed to delete department');
                return false;
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            toast.error(getErrorMessage(error));
            return false;
        }
    }, [fetchDepartments, pagination?.current_page]);

    // Submit form
    const handleSubmit = useCallback(async () => {
        const errors = validateForm(formData);
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setLoading(true);
            
            if (editingDepartment) {
                const response = await departmentService.updateDepartment(editingDepartment.department_id, formData);
                if (response.status === 200) {
                    toast.success('Department updated successfully');
                    setIsModalOpen(false);
                    fetchDepartments(pagination?.current_page || 1);
                } else {
                    toast.error('Failed to update department');
                }
            } else {
                const response = await departmentService.createDepartment(formData);
                if (response.status === 201) {
                    toast.success('Department created successfully');
                    setIsModalOpen(false);
                    fetchDepartments(1); // Reset to first page after creating
                } else {
                    toast.error('Failed to create department');
                }
            }
        } catch (error) {
            console.error('Error submitting department:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [formData, editingDepartment, pagination?.current_page, fetchDepartments]);

    // Close modal
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingDepartment(null);
        setFormData({
            department_name: '',
            department_parent_id: null,
            company_id: '',
            department_segmentasi: ''
        });
        setValidationErrors({});
    }, []);

    // Page change handler
    const handlePageChange = useCallback((page: number) => {
        fetchDepartments(page);
    }, [fetchDepartments]);

    // Filter change handler with debouncing
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChange = useCallback((field: keyof DepartmentFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));

        // Debounce API calls for filter changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            // Create params with the new value instead of using stale state
            const requestParams: DepartmentListRequest = {
                page: 1, // Reset to first page when filtering
                limit: pagination?.per_page || 10,
                sort_by: field === 'sort_by' ? value : filters.sort_by || 'created_at',
                sort_order: field === 'sort_order' ? value : filters.sort_order || undefined,
                search: field === 'search' ? value : filters.search || undefined,
                company_id: field === 'company_id' ? value : filters.company_id || undefined,
                company_name: field === 'company_name' ? value : filters.company_name || undefined,
                department_parent_id: field === 'department_parent_id' ? value : filters.department_parent_id || undefined,
                department_name: field === 'department_name' ? value : filters.department_name || undefined
            };

            // Make API call directly with current values
            departmentService.getDepartments(requestParams).then(response => {
                if (response.success) {
                    setDepartments(response.data.data || []);
                    setPagination(response.data.pagination);
                } else {
                    toast.error(response.message || 'Failed to fetch departments');
                }
            }).catch(error => {
                console.error('Error fetching departments:', error);
                toast.error('Failed to fetch departments');
            });
        }, 500);
    }, [pagination?.per_page, filters]);

    // Quick search handler
    const handleSearchChange = useCallback((value: string) => {
        handleFilterChange('search', value);
    }, [handleFilterChange]);

    // Reset filters
    const resetFilters = useCallback(() => {
        // Clear all debounce timers first
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Reset filters state
        setFilters({
            search: '',
            company_id: '',
            company_name: '',
            department_parent_id: '',
            department_name: '',
            sort_by: '',
            sort_order: ''
        });
        
        // Immediately fetch with cleared filters
        const clearedParams: DepartmentListRequest = {
            page: 1,
            limit: pagination?.per_page || 10,
            sort_by: 'created_at',
            sort_order: undefined,
            search: undefined,
            company_id: undefined,
            company_name: undefined,
            department_parent_id: undefined,
            department_name: undefined
        };
        
        departmentService.getDepartments(clearedParams).then(response => {
            if (response.success) {
                setDepartments(response.data.data || []);
                setPagination(response.data.pagination);
            } else {
                toast.error(response.message || 'Failed to fetch departments');
            }
        }).catch(error => {
            console.error('Error fetching departments:', error);
            toast.error('Failed to fetch departments');
        });
    }, [pagination?.per_page]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    // Fetch departments by company (for dropdown filtering)
    const fetchDepartmentsByCompany = useCallback(async (companyId: string) => {
        try {
            if (!companyId) {
                setDepartments([]);
                return;
            }

            const requestParams: DepartmentListRequest = {
                page: 1,
                limit: 100,
                sort_by: 'department_name',
                sort_order: 'asc',
                company_id: companyId
            };

            const response = await departmentService.getDepartments(requestParams);

            if (response.success) {
                setDepartments(response.data.data || []);
            } else {
                console.error('Failed to fetch departments by company');
                setDepartments([]);
            }
        } catch (error) {
            console.error('Error fetching departments by company:', error);
            setDepartments([]);
        }
    }, []);

    return {
        // State
        loading,
        departments,
        pagination,
        filters,
        isModalOpen,
        editingDepartment,
        formData,
        validationErrors,

        // Actions
        handleInputChange,
        handleAddDepartment,
        handleEditDepartment,
        handleDeleteDepartment,
        handleSubmit,
        handleCloseModal,
        handlePageChange,
        fetchDepartments,
        fetchDepartmentsByCompany, // New function for dropdown filtering
        
        // Filter actions
        handleFilterChange,
        handleSearchChange,
        resetFilters,
    };
};

// Employee Hook
export const useEmployees = (autoInit: boolean = true) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [pagination, setPagination] = useState<EmployeePagination>({
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<EmployeeFormData>({
        employee_name: "",
        employee_email: "",
        title_id: "",
        company_id: "",
        department_id: ""
    });
    const [filters, setFilters] = useState<EmployeeFilters>({
        search: "",
        sort_by: "",
        sort_order: "",
        title_name: "",
        company_name: "",
        department_name: "",
        title_id: ""
    });
    const [validationErrors, setValidationErrors] = useState<EmployeeValidationErrors>({});
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; employeeId?: string; }>({ show: false });
    const [confirmResetPassword, setConfirmResetPassword] = useState<{ show: boolean; employeeId?: string; }>({ show: false });
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const pendingRequestRef = useRef<boolean>(false);
    const lastRequestRef = useRef<number>(0);
    const debouncedFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFetch = useCallback((params: EmployeeListRequest) => {
        if (debouncedFetchTimeoutRef.current) {
            clearTimeout(debouncedFetchTimeoutRef.current);
        }

        const requestId = Date.now();
        lastRequestRef.current = requestId;

        debouncedFetchTimeoutRef.current = setTimeout(async () => {
            if (requestId !== lastRequestRef.current) return;
            if (pendingRequestRef.current) return;
            
            try {
                pendingRequestRef.current = true;
                setIsLoading(true);
                const data = await employeesService.getEmployees(params);
                
                if (requestId === lastRequestRef.current) {
                    setEmployees(data.data.data);
                    setPagination(data.data.pagination);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                pendingRequestRef.current = false;
                setIsLoading(false);
            }
        }, 300);
    }, []);

    const fetchEmployees = useCallback((page?: number, limit?: number) => {
        const params: EmployeeListRequest = {
            page: page || pagination.current_page,
            limit: limit || pagination.per_page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
            title_id: filters.title_id,
            company_name: filters.company_name,
            department_name: filters.department_name
        };

        debouncedFetch(params);
    }, [debouncedFetch, pagination.current_page, pagination.per_page, filters]);

    const getEmployeeById = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await employeesService.getEmployeeById(id);
            setEmployee(data.data);
            return data.data;
        } catch (error) {
            console.error('Error fetching employee:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createEmployee = async (data: EmployeeFormData) => {
        setIsLoading(true);
        setValidationErrors({});
        try {
            await employeesService.createEmployee(data);
            setShowForm(false);
            setFormData({
                employee_name: "",
                employee_email: "",
                title_id: "",
                company_id: "",
                department_id: ""
            });
            fetchEmployees();
            return true;
        } catch (error: any) {
            if (error?.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
            }
            console.error('Error creating employee:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateEmployee = async (id: string, data: EmployeeFormData) => {
        setIsLoading(true);
        setValidationErrors({});
        try {
            await employeesService.updateEmployee(id, data);
            setShowForm(false);
            setEditingEmployee(null);
            setFormData({
                employee_name: "",
                employee_email: "",
                title_id: "",
                company_id: "",
                department_id: ""
            });
            fetchEmployees();
            return true;
        } catch (error: any) {
            if (error?.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
            }
            console.error('Error updating employee:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEmployee = async (id: string) => {
        setIsLoading(true);
        try {
            await employeesService.deleteEmployee(id);
            setConfirmDelete({ show: false });
            fetchEmployees();
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const toggleEmployeeStatus = async (id: string) => {
        setIsLoading(true);
        try {
            await employeesService.toggleEmployeeStatus(id);
            fetchEmployees();
            return true;
        } catch (error) {
            console.error('Error toggling employee status:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            employee_name: employee.employee_name,
            title_id: employee.title_id.toString(),
            employee_email: employee.employee_email,
            company_id: employee.company_id.toString(),
            department_id: employee.department_id.toString()
        });
        setShowForm(true);
        setValidationErrors({});
    };

    const resetEmployeePassword = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await employeesService.resetEmployeePassword(id);
            setConfirmResetPassword({ show: false });
            fetchEmployees();
            console.log({res});

            toast.success(res.message || 'Password reset successfully');
            return true;
        } catch (error) {
            console.error('Error resetting employee password:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (employeeId: string) => {
        setConfirmDelete({ show: true, employeeId });
    };

    const handleResetPassword = (employeeId: string) => {
        setConfirmResetPassword({ show: true, employeeId });
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, current_page: page }));
    };

    const handleLimitChange = (limit: number) => {
        setPagination(prev => ({ ...prev, per_page: limit, current_page: 1 }));
    };

    const handleFilterChange = (key: keyof EmployeeFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key !== 'search') {
            setPagination(prev => ({ ...prev, current_page: 1 }));
        }
    };

    // Debounced filter change for search
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChangeDebounced = useCallback((filterKey: keyof EmployeeFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        // Debounce API calls for filter changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            // Create params with the new value instead of using stale state
            const params: EmployeeListRequest = {
                page: 1, // Reset to first page when filtering
                limit: pagination.per_page,
                search: filterKey === 'search' ? value : filters.search,
                sort_by: filterKey === 'sort_by' ? value : filters.sort_by,
                sort_order: filterKey === 'sort_order' ? value : filters.sort_order,
                title_id: filterKey === 'title_id' ? value : filters.title_id,
                company_name: filterKey === 'company_name' ? value : filters.company_name,
                department_name: filterKey === 'department_name' ? value : filters.department_name
            };
            
            // Update pagination to first page if filtering
            setPagination(prev => ({ ...prev, current_page: 1 }));
            
            debouncedFetch(params);
        }, 500);
    }, [pagination.per_page, filters, debouncedFetch]);

    const handleSearchChange = useCallback((value: string) => {
        handleFilterChangeDebounced('search', value);
    }, [handleFilterChangeDebounced]);

    const clearFilters = () => {
        // Clear all debounce timers first
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Reset filters state
        setFilters({
            search: "",
            sort_by: "",
            sort_order: "",
            title_name: "",
            company_name: "",
            department_name: "",
            title_id: ""
        });
        
        // Reset pagination
        setPagination(prev => ({ ...prev, current_page: 1 }));
        
        // Immediately fetch with cleared filters
        const clearedParams: EmployeeListRequest = {
            page: 1,
            limit: pagination.per_page,
            search: "",
            sort_by: "",
            sort_order: "",
            title_id: "",
            company_name: "",
            department_name: ""
        };
        
        debouncedFetch(clearedParams);
    };

    const handleAddEmployee = () => {
        setShowForm(true);
        setEditingEmployee(null);
        setFormData({
            employee_name: "",
            title_id: "",
            department_id: "",
            company_id: "",
            employee_email: ""
        });
        setValidationErrors({});
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingEmployee(null);
        setFormData({
            employee_name: "",
            title_id: "",
            department_id: "",
            company_id: "",
            employee_email: ""
        });
        setValidationErrors({});
    };

    useEffect(() => {
        if (autoInit) {
            fetchEmployees();
        }
    }, [fetchEmployees, autoInit]);

    useEffect(() => {
        return () => {
            if (debouncedFetchTimeoutRef.current) {
                clearTimeout(debouncedFetchTimeoutRef.current);
            }
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        // State
        employees,
        employee,
        pagination,
        isLoading,
        formData,
        filters,
        validationErrors,
        confirmDelete,
        confirmResetPassword,
        showForm,
        editingEmployee,

        // Actions
        setFormData,
        fetchEmployees,
        getEmployeeById,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeStatus,
        handleEdit,
        handleDelete,
        handleResetPassword,
        resetEmployeePassword,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        clearFilters,
        handleAddEmployee,
        closeForm,
        setConfirmDelete,
        setConfirmResetPassword
    };
};

// Role Hook
export const useRole = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [role, setRole] = useState<Role | null>(null);
    const [pagination, setPagination] = useState<RolePagination>({
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<RoleFormData>({
        role_name: "",
        role_parent_id: null
    });
    const [filters, setFilters] = useState<RoleFilters>({
        search: "",
        sort_by: "",
        sort_order: "",
        role_name: "",
        role_parent_id: ""
    });
    const [validationErrors, setValidationErrors] = useState<RoleValidationErrors>({});
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; role?: Role; }>({ show: false });
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const pendingRequestRef = useRef<boolean>(false);
    const lastRequestRef = useRef<number>(0);
    const debouncedFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFetch = useCallback((params: RoleListRequest) => {
        if (debouncedFetchTimeoutRef.current) {
            clearTimeout(debouncedFetchTimeoutRef.current);
        }

        const requestId = Date.now();
        lastRequestRef.current = requestId;

        debouncedFetchTimeoutRef.current = setTimeout(async () => {
            if (requestId !== lastRequestRef.current) return;
            if (pendingRequestRef.current) return;
            
            try {
                pendingRequestRef.current = true;
                setIsLoading(true);
                const data = await roleService.getRoles(params);
                
                if (requestId === lastRequestRef.current) {
                    setRoles(data.data.data);
                    setPagination(data.data.pagination);
                }
            } catch (error) {
                console.error('Error fetching roles:', error);
            } finally {
                pendingRequestRef.current = false;
                setIsLoading(false);
            }
        }, 300);
    }, []);

    const fetchRoles = useCallback(() => {
        const params: RoleListRequest = {
            page: pagination.current_page,
            limit: pagination.per_page,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
            role_name: filters.role_name,
            role_parent_id: filters.role_parent_id
        };

        debouncedFetch(params);
    }, [debouncedFetch, pagination.current_page, pagination.per_page, filters]);

    const getRoleById = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await roleService.getRoleById(id);
            setRole(data.data);
            return data.data;
        } catch (error) {
            console.error('Error fetching role:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createRole = async (data: RoleFormData) => {
        setIsLoading(true);
        setValidationErrors({});
        
        // Client-side validation
        const validationResult = validateRoleForm(data);
        if (!validationResult.isValid) {
            setValidationErrors(validationResult.errors);
            setIsLoading(false);
            toast.error('Please fix the validation errors before submitting');
            return false;
        }
        
        try {
            const response = await roleService.createRole(data);
            if (response.status === 200 || response.status === 201) {
                toast.success('Role created successfully');
                setShowForm(false);
                setFormData({
                    role_name: "",
                    role_parent_id: null
                });
                fetchRoles();
                return true;
            } else {
                toast.error('Failed to create role');
                setValidationErrors({ general: 'Failed to create role. Please try again.' });
                return false;
            }
        } catch (error: any) {
            console.error('Error creating role:', error);
            if (error?.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
                toast.error('Failed to create role. Please check the form errors.');
            } else {
                setValidationErrors({ general: 'Failed to create role. Please try again.' });
                toast.error('Failed to create role. Please try again.');
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateRole = async (id: string, data: RoleFormData) => {
        setIsLoading(true);
        setValidationErrors({});
        
        // Client-side validation
        const validationResult = validateRoleForm(data);
        if (!validationResult.isValid) {
            setValidationErrors(validationResult.errors);
            setIsLoading(false);
            toast.error('Please fix the validation errors before submitting');
            return false;
        }
        
        try {
            const response = await roleService.updateRole(id, data);
            if (response.status === 200 || response.status === 201) {
                toast.success('Role updated successfully');
                setShowForm(false);
                setEditingRole(null);
                setFormData({
                    role_name: "",
                    role_parent_id: null
                });
                fetchRoles();
                return true;
            } else {
                toast.error('Failed to update role');
                setValidationErrors({ general: 'Failed to update role. Please try again.' });
                return false;
            }
        } catch (error: any) {
            console.error('Error updating role:', error);
            if (error?.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
                toast.error('Failed to update role. Please check the form errors.');
            } else {
                setValidationErrors({ general: 'Failed to update role. Please try again.' });
                toast.error('Failed to update role. Please try again.');
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side validation function
    const validateRoleForm = (data: RoleFormData) => {
        const errors: RoleValidationErrors = {};

        // Role name validation
        if (!data.role_name || data.role_name.trim() === '') {
            errors.role_name = 'Role name is required';
        } else if (data.role_name.trim().length < 2) {
            errors.role_name = 'Role name must be at least 2 characters';
        } else if (data.role_name.trim().length > 100) {
            errors.role_name = 'Role name must not exceed 100 characters';
        } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(data.role_name.trim())) {
            errors.role_name = 'Role name can only contain letters, numbers, spaces, hyphens, and underscores';
        }

        // Check for duplicate role names (exclude current editing role)
        const duplicateRole = roles.find(role => 
            role.role_name.toLowerCase().trim() === data.role_name.toLowerCase().trim() &&
            (!editingRole || role.role_id !== editingRole.role_id)
        );
        if (duplicateRole) {
            errors.role_name = 'Role name already exists';
        }

        // Parent role validation (optional but if selected, must be valid)
        if (data.role_parent_id) {
            const parentRole = roles.find(role => role.role_id === data.role_parent_id);
            if (!parentRole) {
                errors.role_parent_id = 'Selected parent role is invalid';
            }
            
            // Prevent circular dependency
            if (editingRole && data.role_parent_id === editingRole.role_id) {
                errors.role_parent_id = 'A role cannot be its own parent';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    // Comprehensive handleSubmit function for forms
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous errors
        setValidationErrors({});
        
        // Run client-side validation first
        const validationResult = validateRoleForm(formData);
        if (!validationResult.isValid) {
            setValidationErrors(validationResult.errors);
            toast.error('Please fix the validation errors before submitting');
            return false;
        }

        try {
            setIsLoading(true);
            
            let success = false;
            if (editingRole) {
                success = await updateRole(editingRole.role_id, formData);
            } else {
                success = await createRole(formData);
            }
            
            return success;
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('An unexpected error occurred');
            return false;
        }
    }, [formData, editingRole]);

    // Clear specific validation error
    const clearValidationError = useCallback((field: keyof RoleValidationErrors) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const deleteRole = async (role: Role) => {
        setIsLoading(true);
        
        try {
            const response = await roleService.deleteRole(role.role_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Role deleted successfully');
                setConfirmDelete({ show: false });
                fetchRoles();
                return true;
            } else {
                toast.error('Failed to delete role');
                return false;
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error('Failed to delete role. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRoleStatus = async (id: string) => {
        setIsLoading(true);
        try {
            await roleService.toggleRoleStatus(id);
            fetchRoles();
            return true;
        } catch (error) {
            console.error('Error toggling role status:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            role_name: role.role_name,
            role_parent_id: role.role_parent_id
        });
        setShowForm(true);
        setValidationErrors({});
    };

    const handleDelete = (role: Role) => {
        setConfirmDelete({ show: true, role });
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, current_page: page }));
    };

    const handleLimitChange = (limit: number) => {
        setPagination(prev => ({ ...prev, per_page: limit, current_page: 1 }));
    };

    const handleFilterChange = (key: keyof RoleFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key !== 'search') {
            setPagination(prev => ({ ...prev, current_page: 1 }));
        }
    };

    // Debounced filter change for search
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    const handleFilterChangeDebounced = useCallback((filterKey: keyof RoleFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        
        // Debounce API calls for filter changes
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            // Create params with the new value instead of using stale state
            const params: RoleListRequest = {
                page: 1, // Reset to first page when filtering
                limit: pagination.per_page,
                search: filterKey === 'search' ? value : filters.search,
                sort_by: filterKey === 'sort_by' ? value : filters.sort_by,
                sort_order: filterKey === 'sort_order' ? value : filters.sort_order,
                role_name: filterKey === 'role_name' ? value : filters.role_name,
                role_parent_id: filterKey === 'role_parent_id' ? value : filters.role_parent_id
            };
            
            // Update pagination to first page if filtering
            setPagination(prev => ({ ...prev, current_page: 1 }));
            
            debouncedFetch(params);
        }, 500);
    }, [pagination.per_page, filters, debouncedFetch]);

    const handleSearchChange = useCallback((value: string) => {
        handleFilterChangeDebounced('search', value);
    }, [handleFilterChangeDebounced]);

    const clearFilters = () => {
        // Clear all debounce timers first
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        // Reset filters state
        setFilters({
            search: "",
            sort_by: "",
            sort_order: "",
            role_name: "",
            role_parent_id: ""
        });
        
        // Reset pagination
        setPagination(prev => ({ ...prev, current_page: 1 }));
        
        // Immediately fetch with cleared filters
        const clearedParams: RoleListRequest = {
            page: 1,
            limit: pagination.per_page,
            search: "", // Explicitly clear search
            sort_by: "",
            sort_order: "",
            role_name: "",
            role_parent_id: ""
        };
        
        debouncedFetch(clearedParams);
    };

    const handleAddRole = () => {
        setShowForm(true);
        setEditingRole(null);
        setFormData({
            role_name: "",
            role_parent_id: null
        });
        setValidationErrors({});
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingRole(null);
        setFormData({
            role_name: "",
            role_parent_id: null
        });
        setValidationErrors({});
    };

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        return () => {
            if (debouncedFetchTimeoutRef.current) {
                clearTimeout(debouncedFetchTimeoutRef.current);
            }
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        // State
        roles,
        role,
        pagination,
        isLoading,
        formData,
        filters,
        validationErrors,
        confirmDelete,
        showForm,
        editingRole,

        // Actions
        setFormData,
        fetchRoles,
        getRoleById,
        createRole,
        updateRole,
        deleteRole,
        toggleRoleStatus,
        handleEdit,
        handleDelete,
        handleSubmit,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        clearFilters,
        handleAddRole,
        closeForm,
        setConfirmDelete,
        clearValidationError
    };
};

// Position Hook
export const usePosition = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [position, setPosition] = useState<Position | null>(null);
    const [pagination, setPagination] = useState<PositionPagination>({
        current_page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<PositionFormData>({
        title_name: "",
        department_id: ""
    });
    const [filters, setFilters] = useState<PositionFilters>({
        search: "",
        sort_by: "",
        sort_order: "",
        title_name: "",
        department_name: "",
        department_id: ""
    });
    const [validationErrors, setValidationErrors] = useState<PositionValidationErrors>({});
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; position?: Position; }>({ show: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);

    const pendingRequestRef = useRef<boolean>(false);
    const lastRequestRef = useRef<number>(0);
    const debouncedFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFetch = useCallback((params: PositionListRequest) => {
        if (debouncedFetchTimeoutRef.current) {
            clearTimeout(debouncedFetchTimeoutRef.current);
        }

        const requestId = Date.now();
        lastRequestRef.current = requestId;

        debouncedFetchTimeoutRef.current = setTimeout(async () => {
            if (requestId !== lastRequestRef.current) return;
            if (pendingRequestRef.current) return;
            
            try {
                pendingRequestRef.current = true;
                setIsLoading(true);
                const data = await positionService.getPositions(params);
                
                if (requestId === lastRequestRef.current) {
                    setPositions(data.data.data);
                    setPagination(data.data.pagination);
                }
            } catch (error) {
                console.error('Error fetching positions:', error);
                toast.error('Failed to fetch positions');
            } finally {
                pendingRequestRef.current = false;
                setIsLoading(false);
            }
        }, 300);
    }, []);

    const fetchPositions = useCallback((page?: number, limit?: number) => {
        const params: PositionListRequest = {
            page: page || pagination?.current_page || 1,
            limit: limit || pagination?.per_page || 10,
            search: filters.search,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
            title_name: filters.title_name,
            department_name: filters.department_name,
            department_id: filters.department_id
        };
        
        debouncedFetch(params);
    }, [debouncedFetch, pagination?.current_page, pagination?.per_page, filters]);

    // New function to fetch positions by department_id for dropdown
    const fetchPositionsByDepartment = useCallback(async (departmentId: string) => {
        if (!departmentId) {
            setPositions([]); // Clear positions if no department selected
            return;
        }

        try {
            setIsLoading(true);
            const params: PositionListRequest = {
                page: 1,
                limit: 100, // Get more positions for dropdown
                department_id: departmentId
            };
            const response = await positionService.getPositions(params);
            if (response.success) {
                setPositions(response.data.data || []);
            } else {
                console.error('Failed to fetch positions by department');
                setPositions([]);
            }
        } catch (error) {
            console.error('Error fetching positions by department:', error);
            setPositions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getPositionById = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await positionService.getPositionById(id);
            setPosition(data.data);
            return data.data;
        } catch (error) {
            console.error('Error fetching position:', error);
            toast.error('Failed to fetch position details');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const result = await positionService.submitPositionForm(formData, editingPosition);
            
            if (result.success) {
                toast.success(result.message);
                setIsModalOpen(false);
                setEditingPosition(null);
                setFormData({ title_name: "", department_id: "" });
                setValidationErrors({});
                fetchPositions();
            } else {
                if (result.errors) {
                    setValidationErrors(result.errors);
                }
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error submitting position:', error);
            toast.error('Failed to save position');
        } finally {
            setIsLoading(false);
        }
    };

    const createPosition = async (data: PositionFormData) => {
        setIsLoading(true);
        try {
            await positionService.createPosition(data);
            toast.success('Position created successfully');
            fetchPositions();
            return true;
        } catch (error) {
            console.error('Error creating position:', error);
            toast.error('Failed to create position');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updatePosition = async (id: string, data: PositionFormData) => {
        setIsLoading(true);
        try {
            await positionService.updatePosition(id, data);
            toast.success('Position updated successfully');
            fetchPositions();
            return true;
        } catch (error) {
            console.error('Error updating position:', error);
            toast.error('Failed to update position');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deletePosition = async (position: Position) => {
        setIsLoading(true);
        try {
            const response = await positionService.deletePosition(position.title_id);
            if (response.status === 200 || response.status === 204) {
                toast.success('Position deleted successfully');
                setConfirmDelete({ show: false });
                fetchPositions();
                return true;
            } else {
                toast.error('Failed to delete position');
                return false;
            }
        } catch (error) {
            console.error('Error deleting position:', error);
            toast.error('Failed to delete position');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const togglePositionStatus = async (id: string) => {
        setIsLoading(true);
        try {
            await positionService.togglePositionStatus(id);
            toast.success('Position status updated successfully');
            fetchPositions();
            return true;
        } catch (error) {
            console.error('Error toggling position status:', error);
            toast.error('Failed to update position status');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (position: Position) => {
        setEditingPosition(position);
        setFormData({
            title_name: position.title_name,
            department_id: position.department_id
        });
        setIsModalOpen(true);
        setValidationErrors({});
    };

    const handleDelete = (position: Position) => {
        setConfirmDelete({ show: true, position });
    };

    const handleAddPosition = () => {
        setEditingPosition(null);
        setFormData({ title_name: "", department_id: "" });
        setIsModalOpen(true);
        setValidationErrors({});
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPosition(null);
        setFormData({ title_name: "", department_id: "" });
        setValidationErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error for this field when user starts typing
        if (validationErrors[name as keyof PositionValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({
            ...prev,
            current_page: page,
            per_page: prev?.per_page || 10,
            total: prev?.total || 0,
            total_pages: prev?.total_pages || 1,
            has_next_page: prev?.has_next_page || false,
            has_prev_page: prev?.has_prev_page || false
        }));
    };

    const handleLimitChange = (limit: number) => {
        setPagination(prev => ({
            ...prev,
            per_page: limit,
            current_page: 1,
            total: prev?.total || 0,
            total_pages: prev?.total_pages || 1,
            has_next_page: prev?.has_next_page || false,
            has_prev_page: prev?.has_prev_page || false
        }));
    };

    const handleFilterChange = (key: keyof PositionFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({
            ...prev,
            current_page: 1,
            per_page: prev?.per_page || 10,
            total: prev?.total || 0,
            total_pages: prev?.total_pages || 1,
            has_next_page: prev?.has_next_page || false,
            has_prev_page: prev?.has_prev_page || false
        }));
    };

    const handleSearchChange = (searchTerm: string) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setPagination(prev => ({
            ...prev,
            current_page: 1,
            per_page: prev?.per_page || 10,
            total: prev?.total || 0,
            total_pages: prev?.total_pages || 1,
            has_next_page: prev?.has_next_page || false,
            has_prev_page: prev?.has_prev_page || false
        }));
    };

    const resetFilters = () => {
        setFilters({
            search: "",
            sort_by: "",
            sort_order: "",
            title_name: "",
            department_name: "",
            department_id: ""
        });
        setPagination(prev => ({
            ...prev,
            current_page: 1,
            per_page: prev?.per_page || 10,
            total: prev?.total || 0,
            total_pages: prev?.total_pages || 1,
            has_next_page: prev?.has_next_page || false,
            has_prev_page: prev?.has_prev_page || false
        }));
    };

    const clearValidationError = (field: keyof PositionValidationErrors) => {
        setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    };

    // Auto-fetch when filters or pagination change
    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (debouncedFetchTimeoutRef.current) {
                clearTimeout(debouncedFetchTimeoutRef.current);
            }
        };
    }, []);

    return {
        // State
        positions,
        position,
        pagination,
        isLoading,
        formData,
        filters,
        validationErrors,
        confirmDelete,
        isModalOpen,
        editingPosition,

        // Actions
        setFormData,
        fetchPositions,
        fetchPositionsByDepartment,
        getPositionById,
        createPosition,
        updatePosition,
        deletePosition,
        togglePositionStatus,
        handleEdit,
        handleDelete,
        handleSubmit,
        handleAddPosition,
        handleCloseModal,
        handleInputChange,
        handlePageChange,
        handleLimitChange,
        handleFilterChange,
        handleSearchChange,
        resetFilters,
        setConfirmDelete,
        clearValidationError
    };
};

export const useEmployeeDetail = () => {
    const [employee, setEmployee] = useState<EmployeeDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<EmployeeValidationErrors>({});
    const [formData, setFormData] = useState<EmployeeFormData>({
        employee_name: '',
        employee_email: '',
        title_id: '',
        company_id: '',
        department_id: '',
        employee_mobile: '',
        employee_office_number: '',
        employee_address: '',
        employee_phone: '',
        gender_id: '',
        island_id: ''
    });

    // Fetch employee by ID
    const fetchEmployee = useCallback(async (id: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await employeesService.getEmployeeDetail(id);
            
            if (response.success && response.data) {
                // Map the response data to our EmployeeDetailData structure
                const employeeData: EmployeeDetailData = {
                    ...response.data,
                    employee_exmail_account: response.data.employee_exmail_account || null,
                    password: response.data.password || null,
                    employee_foto: response.data.employee_foto || null,
                    permission_detail: response.data.permission_detail || []
                };
                setEmployee(employeeData);
                
                // Set form data from employee data
                setFormData({
                    employee_name: response.data.employee_name,
                    employee_email: response.data.employee_email,
                    title_id: response.data.title_id,
                    company_id: response.data.company_id,
                    department_id: response.data.department_id,
                    employee_mobile: response.data.employee_mobile || '',
                    employee_office_number: response.data.employee_office_number || '',
                    employee_address: response.data.employee_address || '',
                    employee_phone: response.data.employee_phone || '',
                    gender_id: response.data.gender_id || '',
                    island_id: response.data.island_id || ''
                });
            } else {
                setError(response.message || 'Failed to fetch employee details');
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            toast.error(`Failed to fetch employee: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update employee
    const updateEmployee = useCallback(async (id: string, data: EmployeeFormData): Promise<boolean> => {
        setIsUpdating(true);
        setValidationErrors({});

        try {
            const response = await employeesService.updateEmployee(id, data);
            
            if (response.status === 200 || response.status === 201) {
                toast.success('Employee updated successfully');
                
                // Refresh employee data
                await fetchEmployee(id);
                return true;
            } else {
                toast.error('Failed to update employee');
                return false;
            }
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            
            // Handle validation errors
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
                toast.error('Please check the form for errors');
            } else if (err.response?.status === 400 && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error(`Failed to update employee: ${errorMessage}`);
            }
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [fetchEmployee]);

    return {
        employee,
        setEmployee,
        isLoading,
        isUpdating,
        error,
        validationErrors,
        formData,
        setFormData,
        fetchEmployee,
        updateEmployee
    };
};

// Custom hook untuk dropdown tanpa auto-fetch
export const useDropdownData = () => {
    // Company state
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);

    // Department state
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);

    // Position state
    const [positions, setPositions] = useState<Position[]>([]);
    const [positionsLoading, setPositionsLoading] = useState(false);

    // Fetch companies
    const fetchCompanies = useCallback(async (page: number = 1, limit: number = 100) => {
        setCompaniesLoading(true);
        try {
            const params = {
                page,
                limit,
                sort_by: 'company_name',
                sort_order: 'asc',
                search: '',
                company_name: ''
            };
            const response = await companyService.getCompanies(params);
            if (response.success) {
                setCompanies(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setCompanies([]);
        } finally {
            setCompaniesLoading(false);
        }
    }, []);

    // Fetch departments by company
    const fetchDepartmentsByCompany = useCallback(async (companyId: string) => {
        if (!companyId) {
            setDepartments([]);
            return;
        }

        setDepartmentsLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                sort_by: 'department_name',
                sort_order: 'asc',
                search: '',
                company_id: companyId,
                company_name: '',
                department_name: '',
                department_parent_id: ''
            };
            const response = await departmentService.getDepartments(params);
            if (response.success) {
                setDepartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments([]);
        } finally {
            setDepartmentsLoading(false);
        }
    }, []);

    // Fetch positions by department
    const fetchPositionsByDepartment = useCallback(async (departmentId: string) => {
        if (!departmentId) {
            setPositions([]);
            return;
        }

        setPositionsLoading(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                sort_by: 'title_name',
                sort_order: 'asc',
                search: '',
                title_name: '',
                department_name: '',
                department_id: departmentId
            };
            const response = await positionService.getPositions(params);
            if (response.success) {
                setPositions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
            setPositions([]);
        } finally {
            setPositionsLoading(false);
        }
    }, []);

    return {
        // Companies
        companies,
        companiesLoading,
        fetchCompanies,

        // Departments
        departments,
        departmentsLoading,
        fetchDepartmentsByCompany,

        // Positions
        positions,
        positionsLoading,
        fetchPositionsByDepartment,
    };
};

// Create Employee Hook
export const useCreateEmployee = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<EmployeeValidationErrors>({});

    // Create employee with photo
    const createEmployee = useCallback(async (formData: FormData): Promise<{ success: boolean; message?: string; errors?: any }> => {
        setIsCreating(true);
        setValidationErrors({});

        try {
            const response = await employeesService.createEmployeeWithPhoto(formData);
            
            if (response.success) {
                toast.success('Employee created successfully!');
                return { success: true };
            } else {
                // Handle validation errors from server
                if (response.errors) {
                    setValidationErrors(response.errors);
                }
                toast.error(response.message || 'Failed to create employee');
                return { 
                    success: false, 
                    message: response.message, 
                    errors: response.errors 
                };
            }
        } catch (err: any) {
            const errorMessage = getErrorMessage(err);
            
            // Handle validation errors
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
                toast.error('Please check the form for errors');
            } else if (err.response?.status === 400 && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error(`Failed to create employee: ${errorMessage}`);
            }
            
            return { 
                success: false, 
                message: errorMessage, 
                errors: err.response?.data?.errors 
            };
        } finally {
            setIsCreating(false);
        }
    }, []);

    return {
        isCreating,
        validationErrors,
        setValidationErrors,
        createEmployee
    };
};