import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useIupSelect } from '@/hooks/useIupSelect';
import { useBrandSelect } from '@/hooks/useBrandSelect';
import { ContractorFormData, ContractorUnit } from './types/contractor';
import { ContractorServices } from './services/contractorServices';
import { toast } from 'react-hot-toast';
import Loading from '@/components/common/Loading';

// Separated components
import {
    CustomerInfoSection,
    IupInfoSection,
    UnitsSection
} from './components';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';
import FormActions from '@/components/form/FormActions';
import ActivitySelections from './components/ActivitySelections';
// import Checkbox from '@/components/form/input/Checkbox';

interface ValidationErrors {
    [key: string]: string;
}

const EditContractor: React.FC = () => {
    const navigate = useNavigate();
    const { iup_customer_id } = useParams<{ iup_customer_id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    // Hook untuk IUP selection
    const {
        iupOptions,
        inputValue: iupInputValue,
        handleInputChange: handleIupInputChange,
        handleMenuScrollToBottom: handleIupMenuScrollToBottom,
        initializeOptions: initializeIupOptions
    } = useIupSelect();

    // Hook untuk brand selection
    const {
        brandOptions,
        pagination: brandPagination,
        handleMenuScrollToBottom: handleBrandMenuScrollToBottom,
        initializeOptions: initializeBrandOptions
    } = useBrandSelect();

    // Hook untuk segementation selection
    const {
        segementationOptions,
        inputValue: segementationInputValue,
        handleInputChange: handleSegementationInputChange,
        pagination: segementationPagination,
        handleMenuScrollToBottom: handleSegementationMenuScrollToBottom,
        initializeOptions: initializeSegementationOptions
    } = useSegementationSelect();
    // Track brand input value per unit
    const [brandInputValues, setBrandInputValues] = useState<Record<number, string>>({});

    // Initial form data
    const [formData, setFormData] = useState<ContractorFormData>({
        customer_data: {
            customer_id: '',
            customer_code: '',
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            job_title: '',
            contact_person: '',
            customer_address: '',
            customer_city: '',
            customer_state: '',
            customer_zip: '',
            customer_country: '',
            contact_persons: []
        },
        iup_customers: {
            iup_id: '',
            iup_name: '',
            segmentation_id: '',
            rkab: '',
            achievement_production_bim: '',
            business_project_bim: '',
            unit_brand_bim: '',
            unit_quantity_bim: '',
            unit_type_bim: '',
            unit_specification_bim: '',
            physical_availability_bim: '',
            ritase: '',
            hauling_distance: '',
            barging_distance: '',
            tonase: '',
            working_days: '',
            price_per_ton: '',
            fuel_consumption: '',
            tire_cost: '',
            sparepart_cost: '',
            manpower_cost: '',
            status: 'active',
            activity_status: [],
            contact_persons: [],
            units: []
        }
    });

    // Load contractor data
    useEffect(() => {
        const loadContractorData = async () => {            
            if (!iup_customer_id) {
                toast.error('Contractor ID is required');
                // navigate('/contractors');
                return;
            }

            try {
                setIsLoading(true);
                const response = await ContractorServices.getContractorById(iup_customer_id);
                
                if (response.success && response.data) {
                    // Transform API response to match form structure
                    const transformedData: ContractorFormData = {
                        customer_data: {
                            customer_id: response.data.customer_data.customer_id || '',
                            customer_code: response.data.customer_data.customer_code || '',
                            customer_name: response.data.customer_data.customer_name || '',
                            customer_email: response.data.customer_data.customer_email || '',
                            customer_phone: response.data.customer_data.customer_phone || '',
                            job_title: response.data.customer_data.job_title || '',
                            contact_person: response.data.customer_data.contact_person || '',
                            customer_address: response.data.customer_data.customer_address || '',
                            customer_city: response.data.customer_data.customer_city || '',
                            customer_state: response.data.customer_data.customer_state || '',
                            customer_zip: response.data.customer_data.customer_zip || '',
                            customer_country: response.data.customer_data.customer_country || '',
                            contact_persons: response.data.customer_data.contact_persons || []
                        },
                        iup_customers: {
                            iup_id: response.data.iup_customers.iup_id || '',
                            iup_name: response.data.iup_customers.iup_name || '',
                            segmentation_id: response.data.iup_customers.segmentation_id || '',
                            rkab: response.data.iup_customers.rkab || '',
                            achievement_production_bim: response.data.iup_customers.achievement_production_bim || '',
                            business_project_bim: response.data.iup_customers.business_project_bim || '',
                            unit_brand_bim: response.data.iup_customers.unit_brand_bim || '',
                            unit_quantity_bim: response.data.iup_customers.unit_quantity_bim || '',
                            unit_type_bim: response.data.iup_customers.unit_type_bim || '',
                            unit_specification_bim: response.data.iup_customers.unit_specification_bim || '',
                            physical_availability_bim: response.data.iup_customers.physical_availability_bim || '',
                            ritase: response.data.iup_customers.ritase || '',
                            hauling_distance: response.data.iup_customers.hauling_distance || '',
                            barging_distance: response.data.iup_customers.barging_distance || '',
                            tonase: response.data.iup_customers.tonase || '',
                            working_days: response.data.iup_customers.working_days || '',
                            price_per_ton: response.data.iup_customers.price_per_ton || '',
                            fuel_consumption: response.data.iup_customers.fuel_consumption || '',
                            tire_cost: response.data.iup_customers.tire_cost || '',
                            sparepart_cost: response.data.iup_customers.sparepart_cost || '',
                            manpower_cost: response.data.iup_customers.manpower_cost || '',
                            status: response.data.iup_customers.status as 'active' | 'inactive' || 'active',
                            activity_status: response.data.iup_customers.activity_status || [],
                            contact_persons: [],
                            units: response.data.iup_customers.units.map((unit: any, index: number) => ({
                                id: index,
                                volume: '',
                                unit: '',
                                price: '',
                                amount: '',
                                description: '',
                                brand_id: unit.brand_id || '',
                                brand_name: unit.brand_name || '',
                                brand: null,
                                type: unit.type || '',
                                specification: unit.specification || '',
                                engine: unit.engine || '',
                                quantity: unit.quantity || 0,
                                physical_availability: unit.physical_availability || ''
                            }))
                        }
                    };
                    setFormData(transformedData);
                    
                    // Initialize brand input values untuk units yang ada
                    const initialBrandInputValues: Record<number, string> = {};
                    transformedData.iup_customers.units.forEach((_, index) => {
                        initialBrandInputValues[index] = '';
                    });
                    setBrandInputValues(initialBrandInputValues);
                }
            } catch (error) {
                console.error('Error loading contractor:', error);
                toast.error('Failed to load contractor data');
                navigate('/crm/contractors');
            } finally {
                setIsLoading(false);
            }
        };

        loadContractorData();
    }, [iup_customer_id, navigate]);

    useEffect(() => {
        // Init async select options saat component mount
        initializeIupOptions();
        
        // Auto-load brand options jika ada unit dengan brand_id
        // const hasUnitsWithBrandId = formData.iup_customers.units.some(unit => unit.brand_id);
        // if (hasUnitsWithBrandId && brandOptions.length === 0) {
            initializeBrandOptions();
        // }
    }, [initializeIupOptions, formData.iup_customers.units, brandOptions.length, initializeBrandOptions]);

    useEffect(() => {
        initializeSegementationOptions();
    }, [initializeSegementationOptions]);

    
    // Handle customer data changes
    const handleCustomerChange = (field: keyof ContractorFormData['customer_data'], value: string) => {
        setFormData(prev => ({
            ...prev,
            customer_data: {
                ...prev.customer_data,
                [field]: value
            }
        }));
    };

    // Handle contact person changes
    const handleAddContact = () => {
        setFormData(prev => ({
            ...prev,
            customer_data: {
                ...prev.customer_data,
                contact_persons: [...prev.customer_data.contact_persons, { name: '', email: '', phone: '', position: '' }]
            }
        }));
    };

    const handleRemoveContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            customer_data: {
                ...prev.customer_data,
                contact_persons: prev.customer_data.contact_persons.filter((_, i) => i !== index)
            }
        }));
    };

    const handleContactChange = (index: number, field: keyof import('./types/contractor').contactPerson, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            customer_data: {
                ...prev.customer_data,
                contact_persons: prev.customer_data.contact_persons.map((contact, i) => 
                    i === index ? { ...contact, [field]: value } : contact
                )
            }
        }));
    };

    // Handle IUP data changes
    const handleIupChange = (field: keyof Omit<ContractorFormData['iup_customers'], 'units'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                [field]: value
            }
        }));
    };

    // Handle IUP selection dari dropdown
    const handleIupSelect = (selectedOption: any) => {
        if (selectedOption) {
            handleIupChange('iup_id', selectedOption.value);
        }
    };
    // Handle IUP selection dari dropdown
    const handleSegementationSelect = (selectedOption: any) => {
        if (selectedOption) {
            handleIupChange('segmentation_id', selectedOption.value);
        }
    };

    // Add unit baru ke atas list
    const handleAddUnit = () => {
        // Shift existing brandInputValues indices up by 1
        const shiftedInputValues: Record<number, string> = {};
        Object.keys(brandInputValues).forEach(key => {
            const oldIndex = parseInt(key);
            const newIndex = oldIndex + 1;
            shiftedInputValues[newIndex] = brandInputValues[oldIndex];
        });
        // New unit at index 0 gets empty string
        shiftedInputValues[0] = '';
        setBrandInputValues(shiftedInputValues);
        
        const newUnit: ContractorUnit = {
            id: 0,
            volume: '',
            unit: '',
            price: '',
            amount: '',
            description: '',
            brand_id: null,
            brand_name: null,
            brand: null,
            type: '',
            specification: '',
            engine: '',
            quantity: 0
        };
        
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                units: [newUnit, ...prev.iup_customers.units]
            }
        }));
    };

    // Remove unit berdasarkan index
    const handleRemoveUnit = (index: number) => {
        const newInputValues: Record<number, string> = {};
        Object.keys(brandInputValues).forEach(key => {
            const oldIndex = parseInt(key);
            if (oldIndex < index) {
                newInputValues[oldIndex] = brandInputValues[oldIndex];
            } else if (oldIndex > index) {
                newInputValues[oldIndex - 1] = brandInputValues[oldIndex];
            }
        });
        setBrandInputValues(newInputValues);
        
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                units: prev.iup_customers.units.filter((_, i) => i !== index)
            }
        }));
    };

    // Handle perubahan field unit
    const handleUnitChange = (index: number, field: keyof ContractorUnit, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                units: prev.iup_customers.units.map((unit, i) => 
                    i === index ? { ...unit, [field]: value } : unit
                )
            }
        }));
    };

    // Handle brand selection untuk unit tertentu
    const handleBrandSelect = (index: number, selectedOption: any) => {
        if (selectedOption) {
            handleUnitChange(index, 'brand_id', selectedOption.value);
            setBrandInputValues(prev => ({ ...prev, [index]: '' }));
        }
    };

    // Handle brand input change untuk unit tertentu dengan lazy loading
    const handleUnitBrandInputChange = (index: number, value: string) => {
        if (brandOptions.length === 0 && value.trim().length > 0) {
            initializeBrandOptions();
        }
        setBrandInputValues(prev => ({ ...prev, [index]: value }));
    };

    // Handle activity status changes
    const handleActivitySelectionChange = (activityName: string, checked: boolean) => {
        setFormData(prev => {
            const currentActivities = prev.iup_customers.activity_status || [];
            let newActivities;
            
            if (checked) {
                // Add activity if not already present
                newActivities = currentActivities.includes(activityName) 
                    ? currentActivities 
                    : [...currentActivities, activityName];
            } else {
                // Remove activity
                newActivities = currentActivities.filter(activity => activity !== activityName);
            }
            
            return {
                ...prev,
                iup_customers: {
                    ...prev.iup_customers,
                    activity_status: newActivities
                }
            };
        });
    };

    // Form validation - check required fields
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        // Validate customer data
        if (!formData.customer_data.customer_name.trim()) {
            errors.customer_name = 'Customer name is required';
        }
        if (!formData.customer_data.customer_email.trim()) {
            errors.customer_email = 'Customer email is required';
        }
        if (!formData.customer_data.customer_phone.trim()) {
            errors.customer_phone = 'Customer phone is required';
        }

        // Validate IUP data
        if (!formData.iup_customers.iup_id) {
            errors.iup_id = 'IUP selection is required';
        }
        if (!formData.iup_customers.rkab.trim()) {
            errors.rkab = 'RKAB is required';
        }
        if (!formData.iup_customers.segmentation_id) {
            errors.segmentation_id = 'Segmentation selection is required';
        }
        
        // Validate activity status
        // if (!formData.iup_customers.activity_status.includes('find')) {
        //     errors.activity_find = 'Find activity is required';
        // }

        // Validate units
        formData.iup_customers.units.forEach((unit, index) => {
            if (!unit.brand_id) {
                errors[`unit_${index}_brand`] = `Brand is required for unit ${index + 1}`;
            }
            if (!unit.type?.trim()) {
                errors[`unit_${index}_type`] = `Type is required for unit ${index + 1}`;
            }
            if (!unit.specification?.trim()) {
                errors[`unit_${index}_specification`] = `Specification is required for unit ${index + 1}`;
            }
            if (!unit.engine?.trim()) {
                errors[`unit_${index}_engine`] = `Engine is required for unit ${index + 1}`;
            }
            if (!unit.quantity || unit.quantity <= 0) {
                errors[`unit_${index}_quantity`] = `Quantity must be greater than 0 for unit ${index + 1}`;
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form data
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!iup_customer_id) {
            toast.error('Contractor ID is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await ContractorServices.updateContractor(iup_customer_id, formData);
            if (response.success === true) {
                toast.success('Contractor updated successfully');
                navigate('/crm/contractors');
            } else {
                if (response.message && Array.isArray(response.message)) {
                    response.message.forEach((msg:any) => toast.error(msg));
                } else if (response.message) {
                    toast.error(response.message);
                } else {
                    toast.error('Failed to update contractor');
                }
            }
        } catch (error) {
            console.error('Error updating contractor:', error);
            toast.error('Failed to update contractor');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loading />
            </div>
        );
    }

    return (
        <>
            <PageMeta 
                title="Edit Contractor - CRM" 
                description="Edit contractor with customer data and IUP information"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    {/* Header dengan back button */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/crm/contractors')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Contractor</h1>
                        </div>
                    </div>

                    {/* Customer Info Form */}
                    <CustomerInfoSection
                        formData={formData}
                        errors={validationErrors}
                        onChange={handleCustomerChange}
                        onAddContact={handleAddContact}
                        onRemoveContact={handleRemoveContact}
                        onContactChange={handleContactChange}
                    />

                    {/* IUP Customer Info Form */}
                    <IupInfoSection
                        formData={formData}
                        errors={validationErrors}
                        onChange={handleIupChange}
                        iupOptions={iupOptions}
                        iupInputValue={iupInputValue}
                        onIupInputChange={handleIupInputChange}
                        onIupMenuScroll={handleIupMenuScrollToBottom}
                        onIupSelect={handleIupSelect}

                        segementationOptions={segementationOptions}
                        segementationPagination={segementationPagination}
                        segementationInputValue={segementationInputValue}
                        onSegementationInputChange={handleSegementationInputChange}
                        onSegementationMenuScroll={handleSegementationMenuScrollToBottom}
                        onSegementationSelect={handleSegementationSelect}
                    />

                    {/* Units Management */}
                    <UnitsSection
                        units={formData.iup_customers.units}
                        errors={validationErrors}
                        onAddUnit={handleAddUnit}
                        onRemoveUnit={handleRemoveUnit}
                        onUnitChange={handleUnitChange}
                        brandOptions={brandOptions}
                        brandPagination={brandPagination}
                        brandInputValues={brandInputValues}
                        onBrandInputChange={handleUnitBrandInputChange}
                        onBrandMenuScroll={handleBrandMenuScrollToBottom}
                        onBrandSelect={handleBrandSelect}
                    />
            
                    <ActivitySelections
                        formData={formData.iup_customers.activity_status}
                        onInputChange={handleActivitySelectionChange}
                    />

                    {/* Form Actions */}
                    <FormActions
                        isSubmitting={isSubmitting}
                        cancelRoute="/crm/contractors"
                        onSubmit={handleSubmit}
                        submitText="Update Contractor"
                    />

                    
                </div>
            </div>
        </>
    );
};

export default EditContractor;