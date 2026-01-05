import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";
import { CustomerService } from "./services/customerService";
import { useCustomerEdit } from "./hooks/useCustomerEdit";
import { CustomerFormData, ContactPerson, CustomerValidationErrors } from "./types/customer";
import { PermissionGate } from "@/components/common/PermissionComponents";
import CustomerPersonsSection from "./components/CustomerPersonsSection";
import { CustomerUtilityService } from "./services/customerUtilityService";

export default function EditCustomer() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [isLoading, setIsLoading] = useState(true);
    const [contactErrors, setContactErrors] = useState<Record<string,string>>({});
    
    // Hook for updating customer
    const { 
        isUpdating, 
        validationErrors, 
        clearFieldError,
        updateCustomer 
    } = useCustomerEdit();
    
    // State for form data
    const [formData, setFormData] = useState<CustomerFormData>({
        customer_code: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_city: '',
        customer_state: '',
        customer_zip: '',
        customer_country: '',
        job_title: '',
        contact_person: '',
        contact_persons: []
    });

    // Load customer data when component mounts
    useEffect(() => {
        if (id) {
            loadCustomerData(id);
        }
    }, [id]);

    const loadCustomerData = async (customerId: string) => {
        try {
            setIsLoading(true);
            const response = await CustomerService.getCustomerById(customerId);
            
            if (response.data.success && response.data.data) {
                const customer = response.data.data;
                setFormData({
                    customer_code: customer.customer_code || '',
                    customer_name: customer.customer_name || '',
                    customer_email: customer.customer_email || '',
                    customer_phone: customer.customer_phone || '',
                    customer_address: customer.customer_address || '',
                    customer_city: customer.customer_city || '',
                    customer_state: customer.customer_state || '',
                    customer_zip: customer.customer_zip || '',
                    customer_country: customer.customer_country || '',
                    job_title: customer.job_title || '',
                    contact_person: customer.contact_person || '',
                    contact_persons: customer.contact_persons || []
                });
            } else {
                toast.error('Customer not found');
                navigate('/quotations/administration/customers');
            }
        } catch (error: any) {
            console.error('Error loading customer:', error);
            toast.error('Failed to load customer data');
            navigate('/quotations/administration/customers');
        } finally {
            setIsLoading(false);
        }
    };

    // Form input handlers
    const handleInputChange = (field: keyof CustomerFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[field as keyof CustomerValidationErrors]) {
            clearFieldError(field as keyof CustomerValidationErrors);
        }
    };
    
    // Contact person handlers
    const handleAddContact = () => {
        setFormData(prev => ({
            ...prev,
            contact_persons: [...(prev.contact_persons || []), { contact_person_name: '', contact_person_email: '', contact_person_phone: '', contact_person_position: '' }]
        }));
    };

    const handleRemoveContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contact_persons: (prev.contact_persons || []).filter((_, i) => i !== index)
        }));
    };

    const handleContactChange = (index: number, field: keyof ContactPerson, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            contact_persons: (prev.contact_persons || []).map((contact, i) => 
                i === index ? { ...contact, [field]: value } : contact
            )
        }));
        
        // Clear error for this specific field when user types
        const errorKey = `contact_${index}_${field}`;
        if (contactErrors[errorKey]) {
            setContactErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    // Validate contact persons
    const validateContacts = (): boolean => {
        const errors: Record<string, string> = {};
        
        (formData.contact_persons || []).forEach((contact, index) => {
            // Validate email format if provided
            if (contact.contact_person_email && contact.contact_person_email.trim()) {
                if (!CustomerUtilityService.validateEmail(contact.contact_person_email)) {
                    errors[`contact_${index}_contact_person_email`] = 'Invalid email format';
                }
            }
            
            // Validate phone format if provided
            if (contact.contact_person_phone && contact.contact_person_phone.trim()) {
                if (!CustomerUtilityService.validatePhone(contact.contact_person_phone)) {
                    errors[`contact_${index}_contact_person_phone`] = 'Invalid phone number format';
                }
            }
        });
        
        setContactErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form validation (client side)
    const validateForm = (): boolean => {
        let hasErrors = false;
        
        if (!formData.customer_name.trim()) {
            toast.error('Customer name is required');
            hasErrors = true;
        }
        
        if (!formData.customer_email.trim()) {
            toast.error('Customer email is required');
            hasErrors = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
            toast.error('Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!formData.customer_phone.trim()) {
            toast.error('Customer phone is required');
            hasErrors = true;
        }
        
        if (!formData.customer_address.trim()) {
            toast.error('Customer address is required');
            hasErrors = true;
        }

        return !hasErrors;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }
        
        // Validate contact persons
        if (!validateContacts()) {
            toast.error('Please fix contact person errors');
            return;
        }

        if (!id) {
            toast.error('Customer ID is missing');
            return;
        }

        try {
            const response = await updateCustomer(id, formData);
            
            if (response) {
                toast.success('Customer updated successfully');
                navigate('/quotations/administration/customers');
            }
        } catch (error: any) {
            console.error('Error updating customer:', error);
            toast.error(error.message || 'An error occurred while updating customer');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading customer data...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit Customer | MSI"
                description="Edit customer information"
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
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Customer</h1>
                        </div>
                    </div>

                    {/* Customer Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-3 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-4">Basic Information</h2>
                                
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
                                
                                {/* Customer Code */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="customer_code">Customer Code</Label>
                                    <Input
                                        id="customer_code"
                                        type="text"
                                        value={formData.customer_code}
                                        onChange={(e) => handleInputChange('customer_code', e.target.value)}
                                        placeholder="Enter customer code"
                                        error={!!validationErrors.customer_code}
                                    />
                                    {validationErrors.customer_code && (
                                        <span className="text-sm text-red-500">{validationErrors.customer_code}</span>
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
                                        type="tel"
                                        value={formData.customer_phone}
                                        onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                        placeholder="Enter customer phone"
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
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                        </div>
                    </form>

                    {/* Contact Persons Section */}
                    <CustomerPersonsSection
                        contacts={formData.contact_persons || []}
                        errors={contactErrors}
                        onAddContact={handleAddContact}
                        onRemoveContact={handleRemoveContact}
                        onContactChange={handleContactChange}
                    />
                            
                    {/* Form Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/administration/customers')}
                                className="px-6 rounded-full"
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <PermissionGate permission={["update"]}>
                                <Button
                                    onClick={() => {
                                        const tipu = { preventDefault: () => {} } as React.FormEvent;
                                        handleSubmit(tipu);
                                    }}
                                    disabled={isUpdating}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave size={20} />
                                    {isUpdating ? 'Updating...' : 'Update Customer'}
                                </Button>
                            </PermissionGate>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}