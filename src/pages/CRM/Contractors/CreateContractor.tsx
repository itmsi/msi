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
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const CreateContractor: React.FC = () => {
    const navigate = useNavigate();

    // Main hook for contractor creation
    const {
        formData,
        validationErrors,
        isSubmitting,
        brandInputValues,
        handleNewCustomerToggle,
        handleExistingCustomerSelect,
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
        handleSubmit,

        isValidating,
        showConfirmation,
        validationResult,
        cancelConfirmation,
        handleValidateAndSubmit
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

    
    // Helper function to create validation modal content
    const getValidationModalContent = () => {
        if (!validationResult) return null;

        const { data } = validationResult;
        const hasDuplicates = data.hasDuplicates;

        if (!hasDuplicates) {
            return (
                <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                        {data.message}
                    </p>
                    <p className="text-sm text-green-600">
                       The contractor can be created successfully.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                        {data.message}
                    </p>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to proceed with creating this contractor?
                    </p>
                </div>

                <div className="bg-[#F3F4F6] p-3 rounded">
                    <h4 className="text-sm font-medium text-gray-900 font-primary-bold mb-2">
                        Duplicate Details:
                    </h4>
                    <div className="space-y-3">
                        <div className="text-sm space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-medium">Entered Name:</span>
                                <span className="text-gray-900 font-primary-bold">{data?.duplicates?.[0]?.requestName || '-'}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2">
                                <span className="font-medium">Matched Name:</span>
                                <ul className="list-outside list-disc rounded-xl pl-5">
                                    {data.duplicates.map((duplicate, index) => (
                                        <li key={index}><span className="text-gray-900 font-primary-bold">{duplicate.matchedName}</span></li>
                                    ))}
                                </ul>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        onNewCustomerToggle={handleNewCustomerToggle}
                        onExistingCustomerSelect={handleExistingCustomerSelect}
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
                        isSubmitting={isValidating}
                        submitText={isValidating ? 'Creating...' : 'Create Contractor'}
                        cancelRoute={'/crm/contractors'}
                        onSubmit={handleValidateAndSubmit}
                    />
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {showConfirmation && validationResult && (
                <ConfirmationModal
                    isOpen={showConfirmation}
                    onClose={cancelConfirmation}
                    onConfirm={handleSubmit}
                    title="Confirm Contractor Creation"
                    message={getValidationModalContent()}
                    confirmText="Create Contractor"
                    cancelText="Cancel"
                    type={validationResult.data.hasDuplicates ? 'info' : 'success'}
                    loading={isSubmitting}
                    size="md"
                    showIcon={false}
                />
            )}
        </>
    );
};

export default CreateContractor;