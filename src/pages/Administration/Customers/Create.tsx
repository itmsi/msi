import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { CustomerValidationErrors } from "./types/customer";
import { toast } from "react-hot-toast";
import { useCreateCustomer } from "./hooks/useCustomerCreate";
import { handleKeyPress } from "@/helpers/generalHelper";

interface CreateCustomerFormData {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    customer_state: string;
    customer_zip: string;
    customer_country: string;
    job_title: string;
    contact_person: string;
}

export default function CreateCustomer() {
    const navigate = useNavigate();

    // Hook for creating customer
    const { 
        isCreating, 
        validationErrors, 
        clearFieldError,
        createCustomer 
    } = useCreateCustomer();

    // State for form data
    const [formData, setFormData] = useState<CreateCustomerFormData>({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_city: '',
        customer_state: '',
        customer_zip: '',
        customer_country: '',
        job_title: '',
        contact_person: ''
    });

    // Form input handlers
    const handleInputChange = (field: keyof CreateCustomerFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            clearFieldError(field);
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const errors: CustomerValidationErrors = {};
        
        if (!formData.customer_name.trim()) {
            errors.customer_name = 'Customer name is required';
        }
        
        if (!formData.customer_email.trim()) {
            errors.customer_email = 'Customer email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
            errors.customer_email = 'Please enter a valid email address';
        }
        
        if (!formData.customer_phone.trim()) {
            errors.customer_phone = 'Customer phone is required';
        }
        
        if (!formData.customer_address.trim()) {
            errors.customer_address = 'Customer address is required';
        }

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
            const response = await createCustomer(formData);
            
            if (response.success) {
                toast.success('Customer created successfully');
                navigate('/quotations/administration/customers');
            }
        } catch (error: any) {
            console.error('Error creating customer:', error);
            toast.error(error.message || 'An error occurred while creating customer');
        }
    };

    return (
        <>
            <PageMeta
                title="Create Customer | MSI"
                description="Create a new customer"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/quotations/administration/customers">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdPerson size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Customer</h1>
                        </div>
                    </div>

                    {/* Customer Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-3 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                
                                {/* Customer Name */}
                                <div className="md:col-span-4">
                                    <Label htmlFor="customer_name">Customer Name *</Label>
                                    <Input
                                        id="customer_name"
                                        type="text"
                                        value={formData.customer_name}
                                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                        placeholder="Enter customer name"
                                        error={!!validationErrors.customer_name}
                                    />
                                    {validationErrors.customer_name && (
                                        <span className="text-sm text-red-500">{validationErrors.customer_name}</span>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="contact_person">Contact Person *</Label>
                                    <Input
                                        id="contact_person"
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                        placeholder="Enter contact person"
                                        error={!!validationErrors.contact_person}
                                    />
                                    {validationErrors.contact_person && (
                                        <span className="text-sm text-red-500">{validationErrors.contact_person}</span>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="job_title">Job Title *</Label>
                                    <Input
                                        id="job_title"
                                        type="text"
                                        value={formData.job_title}
                                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                                        placeholder="Enter job title"
                                        error={!!validationErrors.job_title}
                                    />
                                    {validationErrors.job_title && (
                                        <span className="text-sm text-red-500">{validationErrors.job_title}</span>
                                    )}
                                </div>

                                {/* Customer Email */}
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

                                {/* Customer Phone */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="customer_phone">Phone *</Label>
                                    <Input
                                        id="customer_phone"
                                        type="text"
                                        value={formData.customer_phone}
                                        onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                        placeholder="Enter customer phone"
                                        onKeyPress={handleKeyPress}
                                        error={!!validationErrors.customer_phone}
                                    />
                                    {validationErrors.customer_phone && (
                                        <span className="text-sm text-red-500">{validationErrors.customer_phone}</span>
                                    )}
                                </div>

                                {/* Customer Address */}
                                <div className="md:col-span-4">
                                    <Label htmlFor="customer_address">Address *</Label>
                                    <Input
                                        id="customer_address"
                                        type="text"
                                        value={formData.customer_address}
                                        onChange={(e) => handleInputChange('customer_address', e.target.value)}
                                        placeholder="Enter customer address"
                                        error={!!validationErrors.customer_address}
                                    />
                                    {validationErrors.customer_address && (
                                        <span className="text-sm text-red-500">{validationErrors.customer_address}</span>
                                    )}
                                </div>

                                {/* Customer City */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="customer_city">City</Label>
                                    <Input
                                        id="customer_city"
                                        type="text"
                                        value={formData.customer_city}
                                        onChange={(e) => handleInputChange('customer_city', e.target.value)}
                                        placeholder="Enter city"
                                    />
                                </div>

                                {/* Customer State */}
                                <div className="md:col-span-1">
                                    <Label htmlFor="customer_state">State</Label>
                                    <Input
                                        id="customer_state"
                                        type="text"
                                        value={formData.customer_state}
                                        onChange={(e) => handleInputChange('customer_state', e.target.value)}
                                        placeholder="State"
                                    />
                                </div>

                                {/* Customer ZIP */}
                                <div className="md:col-span-1">
                                    <Label htmlFor="customer_zip">ZIP Code</Label>
                                    <Input
                                        id="customer_zip"
                                        type="text"
                                        value={formData.customer_zip}
                                        onChange={(e) => handleInputChange('customer_zip', e.target.value)}
                                        placeholder="ZIP"
                                    />
                                </div>

                                {/* Customer Country */}
                                <div className="md:col-span-4">
                                    <Label htmlFor="customer_country">Country</Label>
                                    <Input
                                        id="customer_country"
                                        type="text"
                                        value={formData.customer_country}
                                        onChange={(e) => handleInputChange('customer_country', e.target.value)}
                                        placeholder="Enter country"
                                    />
                                </div>
                            </div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/administration/customers')}
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
                                {isCreating ? 'Creating...' : 'Create Customer'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}