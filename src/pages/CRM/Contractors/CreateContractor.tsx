import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useIupSelect } from '@/hooks/useIupSelect';
import { useBrandSelect } from '@/hooks/useBrandSelect';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';
import { useContractorCreate } from './hooks';

// Separated components
import {
    CustomerInfoSection,
    IupInfoSection,
    UnitsSection,
    RkabSection
} from './components';
import FormActions from '@/components/form/FormActions';
import ActivitySelections from './components/ActivitySelections';

const CreateContractor: React.FC = () => {
    const navigate = useNavigate();

    // Main hook for contractor creation
    const {
        formData,
        validationErrors,
        isSubmitting,
        brandInputValues,
        handleCustomerChange,
        handleAddContact,
        handleRemoveContact,
        handleContactChange,
        handleIupChange,
        handleIupSelect,
        handleSegementationSelect,
        handleAddUnit,
        handleRemoveUnit,
        handleUnitChange,
        handleBrandSelect,
        handleUnitBrandInputChange,
        handleAddRkab,
        handleRemoveRkab,
        handleRkabChange,
        handleActivitySelectionChange,
        handleSubmit
    } = useContractorCreate();

    // External selection hooks
    const {
        iupOptions,
        inputValue: iupInputValue,
        handleInputChange: handleIupInputChange,
        handleMenuScrollToBottom: handleIupMenuScrollToBottom,
        initializeOptions: initializeIupOptions
    } = useIupSelect();

    const {
        brandOptions,
        pagination: brandPagination,
        handleMenuScrollToBottom: handleBrandMenuScrollToBottom,
        initializeOptions: initializeBrandOptions
    } = useBrandSelect();
    
    const {
        segementationOptions,
        inputValue: segementationInputValue,
        handleInputChange: handleSegementationInputChange,
        pagination: segementationPagination,
        handleMenuScrollToBottom: handleSegementationMenuScrollToBottom,
        initializeOptions: initializeSegementationOptions
    } = useSegementationSelect();

    useEffect(() => {
        initializeIupOptions();
    }, [initializeIupOptions]);

    useEffect(() => {
        initializeBrandOptions();
    }, [initializeBrandOptions]);

    useEffect(() => {
        initializeSegementationOptions();
    }, [initializeSegementationOptions]);

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