import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useIupSelect } from '@/hooks/useIupSelect';
import { useBrandSelect } from '@/hooks/useBrandSelect';
import { ContractorFormData, ContractorUnit, RkabEntry } from './types/contractor';
import { ContractorServices } from './services/contractorServices';
import { toast } from 'react-hot-toast';

// Separated components
import {
    CustomerInfoSection,
    IupInfoSection,
    UnitsSection,
    RkabSection
} from './components';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';
import FormActions from '@/components/form/FormActions';
import ActivitySelections from './components/ActivitySelections';

interface ValidationErrors {
    [key: string]: string;
}

const CreateContractor: React.FC = () => {
    const navigate = useNavigate();
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
            contact_persons:[]
        },
        iup_customers: {
            iup_id: '',
            segmentation_id: '',
            // rkab: '',
            properties: [],
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
            activity_status:[],
            contact_persons:[],
            units: [],
            type: '',
            
        }
    });

    useEffect(() => {
        initializeIupOptions();
    }, [initializeIupOptions]);

    useEffect(() => {
        initializeBrandOptions();
    }, [initializeBrandOptions]);

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
        const shiftedInputValues: Record<number, string> = {};
        Object.keys(brandInputValues).forEach(key => {
            const oldIndex = parseInt(key);
            const newIndex = oldIndex + 1;
            shiftedInputValues[newIndex] = brandInputValues[oldIndex];
        });
        
        shiftedInputValues[0] = '';
        
        setBrandInputValues(shiftedInputValues);
        
        const newUnit: ContractorUnit = {
            id: 0,
            volume: '',
            unit: '',
            price: '',
            amount: '',
            description: '',
            brand_id: '',
            brand: '',
            type: '',
            specification: '',
            engine: '',
            quantity: 0
        };
        
        setFormData(prev => {
            const updatedData = {
                ...prev,
                iup_customers: {
                    ...prev.iup_customers,
                    units: [newUnit, ...prev.iup_customers.units]
                }
            };
            return updatedData;
        });
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

    // Handle RKAB operations
    const handleAddRkab = () => {
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                properties: [
                    ...prev.iup_customers.properties,
                    { year: new Date().getFullYear(), current_production: 0, target_production: 0 }
                ]
            }
        }));
    };

    const handleRemoveRkab = (index: number) => {
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                properties: prev.iup_customers.properties.filter((_: any, i: number) => i !== index)
            }
        }));
    };

    const handleRkabChange = (index: number, field: keyof RkabEntry, value: number) => {
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                properties: prev.iup_customers.properties.map((entry: RkabEntry, i: number) => 
                    i === index ? { ...entry, [field]: value } : entry
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

    const handleUnitBrandInputChange = (index: number, value: string) => {
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

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.customer_data.customer_name.trim()) {
            errors.customer_name = 'Customer name is required';
        }
        // if (!formData.customer_data.customer_email.trim()) {
        //     errors.customer_email = 'Customer email is required';
        // }
        if (!formData.customer_data.customer_phone.trim()) {
            errors.customer_phone = 'Customer phone is required';
        }

        // Validate IUP data
        if (!formData.iup_customers.iup_id) {
            errors.iup_id = 'IUP selection is required';
        }
        // RKAB validation
        // if (!formData.iup_customers.rkab.trim()) {
        //     errors.rkab = 'RKAB is required';
        // }
        if (!formData.iup_customers.segmentation_id) {
            errors.segmentation_id = 'Segmentation selection is required';
        }

        // Validate RKAB entries
        formData.iup_customers.properties.forEach((entry: RkabEntry, index: number) => {
            if (!entry.year) {
                errors[`rkab_${index}_year`] = 'Year is required';
            }
            if (entry.current_production < 0) {
                errors[`rkab_${index}_current_production`] = 'Must be positive';
            }
            if (entry.target_production < 0) {
                errors[`rkab_${index}_target_production`] = 'Must be positive';
            }
        });
        
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

        setIsSubmitting(true);
        try {


            // Transform RKAB entries to properties JSON
            const submissionData = { 
                ...formData,
                iup_customers: {
                    ...formData.iup_customers
                }
            }; 
            if (formData.iup_customers.properties.length > 0) {
                submissionData.iup_customers.properties = {
                    basicinformationmandatory: {
                        RKAB: formData.iup_customers.properties
                    }
                };
            }

            const response = await ContractorServices.createContractor(submissionData);
            if (response.success === true) {
                toast.success('Contractor created successfully');
                navigate('/crm/contractors');
            } else {
                if (response.message && Array.isArray(response.message)) {
                    response.message.forEach((msg:any) => toast.error(msg));
                } else if (response.message) {
                    toast.error(response.message);
                } else {
                    toast.error('Failed to create contractor');
                }
            }
        } catch (error) {
            console.error('Error creating contractor:', error);
            toast.error('Failed to create contractor');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta 
                title="Create Contractor - CRM" 
                description="Create new contractor with customer data and IUP information"
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
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Contractor</h1>
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

                    {/* RKAB Management */}
                    <RkabSection
                        rkabEntries={formData.iup_customers.properties}
                        errors={validationErrors}
                        onAddRkab={handleAddRkab}
                        onRemoveRkab={handleRemoveRkab}
                        onRkabChange={handleRkabChange}
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
                        submitText={isSubmitting ? 'Creating...' : 'Create Contractor'}
                        cancelRoute={'/crm/contractors'}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </>
    );
};

export default CreateContractor;