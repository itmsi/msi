import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/select/CustomSelect";
import { MdAdd, MdKeyboardArrowLeft, MdSave, MdUpload, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { useCreateEmployee, useDropdownData } from "@/hooks/useAdministration";
import { EmployeeValidationErrors } from "@/types/administration";
import { usersService } from "@/services/administrationService";
import TextArea from "@/components/form/input/TextArea";
import { toast } from "react-hot-toast";
import Switch from "@/components/form/switch/Switch";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import CustomAsyncSelect from "@/components/form/select/CustomAsyncSelect";
import { usePOClassSelect } from "@/hooks/usePOClassSelect";

interface CreateEmployeeFormData {
    user_type: string;
    // Employee fields
    employee_name: string;
    employee_email: string;
    employee_password: string;
    company_id: string;
    department_id: string;
    title_id: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    employee_status: string;
    is_sales_quotation: boolean;
    employee_foto?: File | null;
    // Customer fields
    customer_name: string;
    customer_email: string;
    customer_password: string;
    customer_id: string;
    is_customer: boolean;
    is_active: boolean;
    customer_foto?: File | null;
    classes_id_netsuite?: number | null;
    classes_name_netsuite?: string | null;
}

export default function CreateEmployee() {
    const navigate = useNavigate();
    
    // Hooks for dropdown options
    const { 
        companies, 
        fetchCompanies,
        departments, 
        fetchDepartmentsByCompany,
        positions, 
        fetchPositionsByDepartment 
    } = useDropdownData();

    // Hook for creating employee
    const { 
        isCreating, 
        validationErrors, 
        setValidationErrors, 
        createEmployee 
    } = useCreateEmployee();

    const {
        POClassOptions,
        pagination: itemClassPagination,
        inputValue: itemClassInputValue,
        handleInputChange: handleItemClassInputChange,
        handleMenuScrollToBottom: handleItemClassScrollToBottom,
        initializeOptions: initializeItemClassOptions
    } = usePOClassSelect(30);
    
    const [selectedClass, setSelectedClass] = useState<any>(null);

    useEffect(() => {
        initializeItemClassOptions();
    }, [initializeItemClassOptions]);

    // Hook for creating employee
    // const { 
    //     isCreating : isCreatingUser, 
    //     validationErrors : userValidationErrors, 
    //     setValidationErrors : setUserValidationErrors, 
    //     createUser 
    // } = useCreateUser();

    // State for form data
    const [formData, setFormData] = useState<CreateEmployeeFormData>({
        user_type: 'employee',
        // Employee fields
        employee_name: '',
        employee_email: '',
        employee_password: '',
        company_id: '',
        department_id: '',
        title_id: '',
        employee_mobile: '',
        employee_office_number: '',
        employee_address: '',
        employee_status: 'inactive',
        is_sales_quotation: false,
        employee_foto: null,
        // Customer fields
        customer_name: '',
        customer_email: '',
        customer_password: '',
        customer_id: '',
        is_customer: true,
        is_active: true,
        customer_foto: null,
        classes_id_netsuite: null,
        classes_name_netsuite: null
    });

    // State for validation errors
    // const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    
    // State for submission
    // const [isSubmitting, setIsSubmitting] = useState(false);

    // Use useCustomers hook
    const {
        customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions
    } = useCustomerSelect();

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    
    useEffect(() => {
        initializeCustomerOptions();
    }, [initializeCustomerOptions]);

    // Auto-fill customer_email saat customer dipilih
    useEffect(() => {
        if (selectedCustomer?.data?.customer_email) {
            setFormData(prev => ({
                ...prev,
                customer_email: selectedCustomer.data.customer_email
            }));
        }
    }, [selectedCustomer]);

    // State for dropdown options
    const [departmentOptions, setDepartmentOptions] = useState<Array<{value: string, label: string}>>([]);
    const [positionOptions, setPositionOptions] = useState<Array<{value: string, label: string}>>([]);
    const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);
    
    // User type options
    const userTypeOptions = [
        { value: 'employee', label: 'Employee' },
        { value: 'customer', label: 'Customer' }
    ];
    
    // State for photo preview
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Load companies when component mounts
    useEffect(() => {
        fetchCompanies(1, 1000);
    }, [fetchCompanies]);

    // Fetch departments when company is selected
    useEffect(() => {
        if (formData.company_id) {
            fetchDepartmentsByCompany(formData.company_id);
        } else {
            setDepartmentOptions([]);
        }
    }, [formData.company_id, fetchDepartmentsByCompany]);

    // Fetch positions when department is selected
    useEffect(() => {
        if (formData.department_id) {
            fetchPositionsByDepartment(formData.department_id);
        } else {
            setPositionOptions([]);
        }
    }, [formData.department_id, fetchPositionsByDepartment]);

    // Update company options when companies data changes
    useEffect(() => {
        const options = companies.map(company => ({
            value: company.company_id.toString(),
            label: company.company_name
        }));
        setCompanyOptions(options);
    }, [companies]);

    // Update department options when departments data changes
    useEffect(() => {
        const options = departments.map(dept => ({
            value: dept.department_id.toString(),
            label: dept.department_name
        }));
        setDepartmentOptions(options);
    }, [departments]);

    // Update position options when positions data changes
    useEffect(() => {
        const options = positions.map(position => ({
            value: position.title_id.toString(),
            label: position.title_name
        }));
        setPositionOptions(options);
    }, [positions]);

    // Form input handlers
    const handleInputChange = (field: keyof CreateEmployeeFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }

        // Clear related fields when user type changes
        if (field === 'user_type') {
            // Clear photo preview when switching user types
            setPhotoPreview(null);
            // Reset selected options
            setSelectedClass(null);
            setSelectedCustomer(null);
            setFormData((prev) => ({
                ...prev,
                [field]: value,
                // Clear employee fields
                employee_name: '',
                employee_email: '',
                employee_password: '',
                company_id: '',
                department_id: '',
                title_id: '',
                employee_mobile: '',
                employee_office_number: '',
                employee_address: '',
                employee_status: 'inactive',
                is_sales_quotation: false,
                employee_foto: null,
                // Clear customer fields
                customer_name: '',
                customer_email: '',
                customer_password: '',
                customer_id: '',
                customer_foto: null,
                classes_id_netsuite: null,
                classes_name_netsuite: null
            }));
        }

        // Clear department and position when company changes
        if (field === 'company_id') {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
                department_id: '',
                title_id: ''
            }));
        }

        // Clear position when department changes
        if (field === 'department_id') {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
                title_id: ''
            }));
        }
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            // Update the appropriate photo field based on user type
            setFormData(prev => ({
                ...prev,
                [formData.user_type === 'customer' ? 'customer_foto' : 'employee_foto']: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Clear validation error
            const photoField = formData.user_type === 'customer' ? 'customer_foto' : 'employee_foto';
            if (validationErrors[photoField]) {
                setValidationErrors(prev => ({
                    ...prev,
                    [photoField]: undefined
                }));
            }
        }
    };

    // Remove photo
    const removePhoto = () => {
        setFormData(prev => ({
            ...prev,
            [formData.user_type === 'customer' ? 'customer_foto' : 'employee_foto']: null
        }));
        setPhotoPreview(null);
    };

    // Form validation
    const validateForm = (): boolean => {
        const errors: EmployeeValidationErrors = {};
        
        if (formData.user_type === 'employee') {
            // Employee validation
            if (!formData.employee_name.trim()) {
                errors.employee_name = 'Employee name is required';
            }
            
            if (!formData.employee_email.trim()) {
                errors.employee_email = 'Employee email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employee_email)) {
                errors.employee_email = 'Please enter a valid email address';
            }
            
            if (!formData.employee_password.trim()) {
                errors.employee_password = 'Password is required';
            } else if (formData.employee_password.length < 6) {
                errors.employee_password = 'Password must be at least 6 characters long';
            }
            
            if (!formData.company_id) {
                errors.company_id = 'Company is required';
            }
            
            if (!formData.department_id) {
                errors.department_id = 'Department is required';
            }
            
            if (!formData.title_id) {
                errors.title_id = 'Position is required';
            }
        } else if (formData.user_type === 'customer') {
            // Customer validation
            // if (!formData.customer_name.trim()) {
            //     errors.customer_name = 'Customer name is required';
            // }
            
            if (!formData.customer_email.trim()) {
                errors.customer_email = 'Customer email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
                errors.customer_email = 'Please enter a valid email address';
            }
            
            if (!formData.customer_password.trim()) {
                errors.customer_password = 'Password is required';
            } else if (formData.customer_password.length < 6) {
                errors.customer_password = 'Password must be at least 6 characters long';
            }
            
            if (!formData.customer_id.trim()) {
                errors.customer_id = 'Customer ID is required';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            let response;
            
            if (formData.user_type === 'customer') {
                // Create FormData for customer
                const submitData = new FormData();
                
                // submitData.append('name', formData.customer_name);
                submitData.append('email', formData.customer_email);
                submitData.append('password', formData.customer_password);
                submitData.append('customer_id', formData.customer_id);
                submitData.append('is_customer', formData.is_customer.toString());
                submitData.append('is_active', formData.is_active.toString());
                
                // Append photo if selected
                if (formData.customer_foto) {
                    submitData.append('photo', formData.customer_foto);
                }
                
                // Append NetSuite Class if selected
                if (formData.classes_id_netsuite) {
                    submitData.append('classes_id_netsuite', formData.classes_id_netsuite.toString());
                }
                if (formData.classes_name_netsuite) {
                    submitData.append('classes_name_netsuite', formData.classes_name_netsuite);
                }
                
                response = await usersService.createUsersWithPhoto(submitData);
                // response = await usersService.createUser(submitData);
            } else {
                // Create FormData for employee
                const submitData = new FormData();
                
                submitData.append('employee_name', formData.employee_name);
                submitData.append('employee_email', formData.employee_email);
                submitData.append('employee_password', formData.employee_password);
                submitData.append('employee_status', formData.employee_status);
                submitData.append('company_id', formData.company_id);
                submitData.append('department_id', formData.department_id);
                submitData.append('title_id', formData.title_id);
                submitData.append('is_sales_quotation', formData.is_sales_quotation.toString());
                
                if (formData.employee_mobile) {
                    submitData.append('employee_mobile', formData.employee_mobile);
                }
                if (formData.employee_office_number) {
                    submitData.append('employee_office_number', formData.employee_office_number);
                }
                if (formData.employee_address) {
                    submitData.append('employee_address', formData.employee_address);
                }
                
                // Append photo if selected
                if (formData.employee_foto) {
                    submitData.append('employee_foto', formData.employee_foto);
                }
                
                // Append NetSuite Class if selected
                if (formData.classes_id_netsuite) {
                    submitData.append('classes_id_netsuite', formData.classes_id_netsuite.toString());
                }
                if (formData.classes_name_netsuite) {
                    submitData.append('classes_name_netsuite', formData.classes_name_netsuite);
                }
                
                response = await createEmployee(submitData);
            }
            
            if (response.success) {
                toast.success(`${formData.user_type === 'customer' ? 'Customer' : 'Employee'} created successfully`);
                navigate('/employees');
            }
        } catch (error: any) {
            console.error('Error creating employee:', error);
            toast.error(error.message || 'An error occurred while creating employee');
        }
    };

    return (
        <>
            <PageMeta
                title="Create User | MSI"
                description="Create a new employee or customer"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/employees">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                Create {formData.user_type === 'customer' ? 'Customer' : 'Employee'}
                            </h1>
                        </div>
                    </div>

                    {/* Employee Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-2 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                
                                {/* Employee Photo */}
                                <div className="md:col-span-4">
                                    <Label htmlFor="employee_foto">Employee Photo</Label>
                                    <div className="mt-2">
                                        {photoPreview ? (
                                            <div className="relative inline-flex">
                                                <img 
                                                    src={photoPreview} 
                                                    alt="Employee Preview" 
                                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removePhoto}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                <div className="text-center">
                                                    <MdPerson className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No photo</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <label htmlFor="photo-upload" className="cursor-pointer">
                                                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                                                    <MdUpload className="w-4 h-4" />
                                                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                                </div>
                                                <input
                                                    id="photo-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max file size: 5MB. Supported formats: JPG, PNG, GIF
                                        </p>
                                        {validationErrors.employee_foto && (
                                            <span className="text-sm text-red-500">{validationErrors.employee_foto}</span>
                                        )}
                                        {validationErrors.customer_foto && (
                                            <span className="text-sm text-red-500">{validationErrors.customer_foto}</span>
                                        )}
                                    </div>
                                </div>

                                {/* User Type Selection */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="user_type">Type *</Label>
                                    <CustomSelect
                                        options={userTypeOptions}
                                        value={userTypeOptions.find(option => option.value === formData.user_type) || null}
                                        onChange={(option) => handleInputChange('user_type', option?.value || 'employee')}
                                        placeholder="Select Type"
                                        isClearable={false}
                                        isSearchable={false}
                                    />
                                </div>

                                {/* Employee Name */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-4">
                                        <Label htmlFor="employee_name">Name *</Label>
                                        <Input
                                            id="employee_name"
                                            type="text"
                                            value={formData.employee_name}
                                            onChange={(e) => handleInputChange('employee_name', e.target.value)}
                                            placeholder="Enter employee name"
                                            error={!!validationErrors.employee_name}
                                        />
                                        {validationErrors.employee_name && (
                                            <span className="text-sm text-red-500">{validationErrors.employee_name}</span>
                                        )}
                                    </div>
                                )}

                                {/* Customer ID - Only show for Customer */}
                                {formData.user_type === 'customer' && (
                                    <div className="md:col-span-4">
                                        <Label>Select Customer</Label>
                                        <CustomAsyncSelect
                                            name="customer_id"
                                            placeholder="Select customer..."
                                            value={selectedCustomer}
                                            error={validationErrors.customer_id}
                                            defaultOptions={customerOptions}
                                            loadOptions={handleCustomerInputChange}
                                            onMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                                            isLoading={customerPagination.loading}
                                            noOptionsMessage={() => "No customers found"}
                                            loadingMessage={() => "Loading customers..."}
                                            isSearchable={true}
                                            inputValue={customerInputValue}
                                            onInputChange={(inputValue) => {
                                                handleCustomerInputChange(inputValue);
                                            }}
                                            onChange={(option: any) => {
                                                setSelectedCustomer(option);
                                                handleInputChange('customer_id', option?.value || '');
                                            }}
                                        />
                                        {validationErrors.customer_id && (
                                            <span className="text-sm text-red-500">{validationErrors.customer_id}</span>
                                        )}
                                    </div>
                                )}

                                {/* Employee Email */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_email">Email *</Label>
                                        <Input
                                            id="employee_email"
                                            type="email"
                                            value={formData.employee_email}
                                            onChange={(e) => handleInputChange('employee_email', e.target.value)}
                                            placeholder="Enter employee email"
                                            error={!!validationErrors.employee_email}
                                        />
                                        {validationErrors.employee_email && (
                                            <span className="text-sm text-red-500">{validationErrors.employee_email}</span>
                                        )}
                                    </div>
                                )}

                                {/* Customer Email */}
                                {formData.user_type === 'customer' && (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="customer_email">Email *</Label>
                                        <Input
                                            id="customer_email"
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                            placeholder="Enter customer email"
                                            error={!!validationErrors.customer_email}
                                        />
                                        {validationErrors.customer_email && (
                                            <span className="text-sm text-red-500">{validationErrors.customer_email}</span>
                                        )}
                                    </div>
                                )}

                                {/* Employee Password */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_password">Password *</Label>
                                        <Input
                                            id="employee_password"
                                            type="password"
                                            value={formData.employee_password}
                                            onChange={(e) => handleInputChange('employee_password', e.target.value)}
                                            placeholder="Enter employee password"
                                            error={!!validationErrors.employee_password}
                                        />
                                        {validationErrors.employee_password && (
                                            <span className="text-sm text-red-500">{validationErrors.employee_password}</span>
                                        )}
                                    </div>
                                )}

                                {/* Customer Password */}
                                {formData.user_type === 'customer' && (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="customer_password">Password *</Label>
                                        <Input
                                            id="customer_password"
                                            type="password"
                                            value={formData.customer_password}
                                            onChange={(e) => handleInputChange('customer_password', e.target.value)}
                                            placeholder="Enter customer password"
                                            error={!!validationErrors.customer_password}
                                        />
                                        {validationErrors.customer_password && (
                                            <span className="text-sm text-red-500">{validationErrors.customer_password}</span>
                                        )}
                                    </div>
                                )}

                                    
                                {/* Company, Department, Position - Only show for Employee */}
                                {formData.user_type === 'employee' && (
                                    <div className="grid grid-cols-3 gap-3 md:col-span-4">
                                        {/* Company */}
                                        <div>
                                            <Label htmlFor="company_id">Company *</Label>
                                            <CustomSelect
                                                options={companyOptions}
                                                value={companyOptions.find(option => option.value === formData.company_id) || null}
                                                onChange={(option) => handleInputChange('company_id', option?.value || '')}
                                                placeholder="Select Company"
                                                isClearable={false}
                                                isSearchable={true}
                                            />
                                            {validationErrors.company_id && (
                                                <span className="text-sm text-red-500">{validationErrors.company_id}</span>
                                            )}
                                        </div>

                                        {/* Department */}
                                        <div>
                                            <Label htmlFor="department_id">Department *</Label>
                                            <CustomSelect
                                                options={departmentOptions}
                                                value={departmentOptions.find(option => option.value === formData.department_id) || null}
                                                onChange={(option) => handleInputChange('department_id', option?.value || '')}
                                                placeholder="Select Company first"
                                                isClearable={false}
                                                isSearchable={true}
                                                disabled={!formData.company_id}
                                            />
                                            {validationErrors.department_id && (
                                                <span className="text-sm text-red-500">{validationErrors.department_id}</span>
                                            )}
                                        </div>

                                        {/* Position */}
                                        <div>
                                            <Label htmlFor="title_id">Position *</Label>
                                            <CustomSelect
                                                options={positionOptions}
                                                value={positionOptions.find(option => option.value === formData.title_id) || null}
                                                onChange={(option) => handleInputChange('title_id', option?.value || '')}
                                                placeholder="Select Department first"
                                                isClearable={false}
                                                isSearchable={true}
                                                disabled={!formData.department_id}
                                            />
                                            {validationErrors.title_id && (
                                                <span className="text-sm text-red-500">{validationErrors.title_id}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Employee Mobile - Only show for Employee */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_mobile">Mobile Phone</Label>
                                        <Input
                                            id="employee_mobile"
                                            type="tel"
                                            value={formData.employee_mobile}
                                            onChange={(e) => handleInputChange('employee_mobile', e.target.value)}
                                            placeholder="Enter mobile phone"
                                        />
                                    </div>
                                )}

                                {/* Employee Office Number - Only show for Employee */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-2">
                                        <Label htmlFor="employee_office_number">Office Phone</Label>
                                        <Input
                                            id="employee_office_number"
                                            type="tel"
                                            value={formData.employee_office_number}
                                            onChange={(e) => handleInputChange('employee_office_number', e.target.value)}
                                            placeholder="Enter office phone"
                                        />
                                    </div>
                                )}

                                {/* Employee Address - Only show for Employee */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-4">
                                        <Label htmlFor="employee_address">Address</Label>
                                        <TextArea
                                            value={formData.employee_address}
                                            onChange={(e) => handleInputChange('employee_address', e.target.value)}
                                            placeholder="Enter employee address"
                                        />
                                    </div>
                                )}
                                
                                <div className="md:col-span-2">
                                    <Label>
                                        NetSuite Class
                                    </Label>
                                    <CustomAsyncSelect
                                        name="classes_id_netsuite"
                                        placeholder="Select NetSuite class..."
                                        value={selectedClass}
                                        error={validationErrors.classes_id_netsuite ? String(validationErrors.classes_id_netsuite) : undefined}
                                        defaultOptions={POClassOptions}
                                        loadOptions={handleItemClassInputChange}
                                        onMenuScrollToBottom={handleItemClassScrollToBottom}
                                        isLoading={itemClassPagination.loading}
                                        noOptionsMessage={() => "No classes found"}
                                        loadingMessage={() => "Loading classes..."}
                                        isSearchable={true}
                                        inputValue={itemClassInputValue}
                                        onInputChange={handleItemClassInputChange}
                                        onChange={(option) => {
                                            setSelectedClass(option);
                                            // Update both netsuite class fields
                                            setFormData(prev => ({
                                                ...prev,
                                                classes_id_netsuite: option?.value ? Number(option.value) : null,
                                                classes_name_netsuite: option?.label || null
                                            }));
                                            
                                            // Clear validation error if exists
                                            if (validationErrors.classes_id_netsuite) {
                                                setValidationErrors(prev => ({
                                                    ...prev,
                                                    classes_id_netsuite: undefined
                                                }));
                                            }
                                        }}
                                    />
                                </div>

                                {/* Employee Status - Only show for Employee */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-4">
                                        <Switch 
                                            label="Status Employee" 
                                            showStatusText={true} 
                                            position="left"
                                            checked={formData.employee_status === 'active'}
                                            onChange={(checked) => handleInputChange('employee_status', checked ? 'active' : 'inactive')}
                                        />
                                    </div>
                                )}

                                {/* Customer Status - Only show for Customer */}
                                {formData.user_type === 'customer' && (
                                    <div className="md:col-span-4">
                                        <Switch 
                                            label="Status Customer" 
                                            showStatusText={true} 
                                            position="left"
                                            checked={formData.is_active}
                                            onChange={(checked) => handleInputChange('is_active', checked.toString())}
                                        />
                                    </div>
                                )}

                                {/* Employee Sales - Only show for Employee */}
                                {formData.user_type === 'employee' && (
                                    <div className="md:col-span-4">
                                        <Switch 
                                            label="Status Sales" 
                                            showStatusText={true} 
                                            position="left"
                                            checked={formData.is_sales_quotation}
                                            onChange={(checked) => handleInputChange('is_sales_quotation', checked.toString())}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                        </div>

                        {/* Information Section */}
                        <div className="md:col-span-1 p-8 lg:ps-0">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">Additional Information</h2>
                            <div className="space-y-6">
                                {formData.user_type === 'employee' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-medium text-blue-900 mb-2">Permission Setup</h3>
                                        <p className="text-sm text-blue-700">
                                            Employee permissions will be set to default values upon creation. 
                                            You can modify permissions after the employee is created by editing their profile.
                                        </p>
                                    </div>
                                )}
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-medium text-yellow-900 mb-2">Login Credentials</h3>
                                    <p className="text-sm text-yellow-700">
                                        The {formData.user_type === 'customer' ? 'customer' : 'employee'} will receive login instructions via email after account creation. 
                                        Make sure the email address is correct and accessible.
                                    </p>
                                </div>

                            </div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/employees')}
                                className="px-6 rounded-full"
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                <MdSave size={20} />
                                {isCreating ? 'Creating...' : `Create ${formData.user_type === 'customer' ? 'Customer' : 'Employee'}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}