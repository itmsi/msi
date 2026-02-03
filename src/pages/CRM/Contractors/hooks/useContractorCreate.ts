import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ContractorFormData, ContractorUnit, RkabEntry, contactPerson } from '../types/contractor';
import { ContractorServices } from '../services/contractorServices';

interface ValidationErrors {
    [key: string]: string;
}

export const useContractorCreate = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
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
            contact_persons: []
        },
        iup_customers: {
            iup_id: '',
            segmentation_id: '',
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
            activity_status: [],
            contact_persons: [],
            units: [],
            type: '',
            parent_contractor_id: ''
        }
    });

    // Customer data handlers
    const handleCustomerChange = (field: keyof ContractorFormData['customer_data'], value: string) => {
        setFormData(prev => ({
            ...prev,
            customer_data: {
                ...prev.customer_data,
                [field]: value
            }
        }));
    };

    // Contact person handlers
    const handleAddContact = () => {
        setFormData(prev => ({
            ...prev,
            customer_data: {
                ...prev.customer_data,
                contact_persons: [...prev.customer_data.contact_persons, { 
                    name: '', 
                    email: '', 
                    phone: '', 
                    position: '' 
                }]
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

    const handleContactChange = (index: number, field: keyof contactPerson, value: string | number) => {
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

    // IUP data handlers
    const handleIupChange = (field: keyof Omit<ContractorFormData['iup_customers'], 'units'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                [field]: value
            }
        }));
    };

    const handleIupSelect = (selectedOption: any) => {
        if (selectedOption) {
            handleIupChange('iup_id', selectedOption.value);
        }
    };

    const handleSegementationSelect = (selectedOption: any) => {
        if (selectedOption) {
            handleIupChange('segmentation_id', selectedOption.value);
        }
    };

    // Units handlers
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
        
        setFormData(prev => ({
            ...prev,
            iup_customers: {
                ...prev.iup_customers,
                units: [newUnit, ...prev.iup_customers.units]
            }
        }));
    };

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

    const handleBrandSelect = (index: number, selectedOption: any) => {
        if (selectedOption) {
            handleUnitChange(index, 'brand_id', selectedOption.value);
            setBrandInputValues(prev => ({ ...prev, [index]: '' }));
        }
    };

    const handleUnitBrandInputChange = (index: number, value: string) => {
        setBrandInputValues(prev => ({ ...prev, [index]: value }));
    };

    // RKAB handlers
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

    // Activity handlers
    const handleActivitySelectionChange = (activityName: string, checked: boolean) => {
        setFormData(prev => {
            const currentActivities = prev.iup_customers.activity_status || [];
            let newActivities;
            
            if (checked) {
                newActivities = currentActivities.includes(activityName) 
                    ? currentActivities 
                    : [...currentActivities, activityName];
            } else {
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

    // Validation
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        // Validate customer data
        if (!formData.customer_data.customer_name.trim()) {
            errors.customer_name = 'Customer name is required';
        }
        if (!formData.customer_data.customer_phone.trim()) {
            errors.customer_phone = 'Customer phone is required';
        }

        // Validate IUP data
        if (!formData.iup_customers.iup_id) {
            errors.iup_id = 'IUP selection is required';
        }
        if (!formData.iup_customers.segmentation_id) {
            errors.segmentation_id = 'Segmentation selection is required';
        }

        // Validate RKAB entries
        formData.iup_customers.properties.forEach((entry: any, index: number) => {
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

    // Submit handler
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
                    response.message.forEach((msg: any) => toast.error(msg));
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

    return {
        // State
        formData,
        validationErrors,
        isSubmitting,
        brandInputValues,
        
        // Customer handlers
        handleCustomerChange,
        handleAddContact,
        handleRemoveContact,
        handleContactChange,
        
        // IUP handlers
        handleIupChange,
        handleIupSelect,
        handleSegementationSelect,
        
        // Unit handlers
        handleAddUnit,
        handleRemoveUnit,
        handleUnitChange,
        handleBrandSelect,
        handleUnitBrandInputChange,
        
        // RKAB handlers
        handleAddRkab,
        handleRemoveRkab,
        handleRkabChange,
        
        // Activity handlers
        handleActivitySelectionChange,
        
        // Form handlers
        validateForm,
        handleSubmit
    };
};