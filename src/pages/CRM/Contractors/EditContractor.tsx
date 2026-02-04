import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useIupSelect } from '@/hooks/useIupSelect';
import { useBrandSelect } from '@/hooks/useBrandSelect';
import { useSegementationSelect } from '@/hooks/useSegmentSelect';
import Loading from '@/components/common/Loading';
import { useContractorEdit } from './hooks';

// Separated components
import {
    CustomerInfoSection,
    IupInfoSection,
    UnitsSection,
    RkabSection
} from './components';
import FormActions from '@/components/form/FormActions';
import ActivitySelections from './components/ActivitySelections';
import { AiOutlineHistory, AiOutlineIdcard } from 'react-icons/ai';
import ContractorActivityInformation from './components/ContractorActivityInformation';

const EditContractor: React.FC = () => {
    const navigate = useNavigate();

    // Main hook for contractor editing
    const {
        formData,
        validationErrors,
        isLoading,
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
    } = useContractorEdit();

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
        // Init async select options saat component mount
        initializeIupOptions();
        initializeBrandOptions();
    }, [initializeIupOptions, initializeBrandOptions]);

    useEffect(() => {
        initializeSegementationOptions();
    }, [initializeSegementationOptions]);

    const [activeTab, setActiveTab] = useState<'info_contractor' | 'activity'>('info_contractor');

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

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('info_contractor')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'info_contractor'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <AiOutlineIdcard size={'1.5rem'} /> Detail Contractor
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`py-2 px-1 border-b-2 font-normal text-lg transition-colors w-60 inline-flex items-center gap-2 justify-center ${
                                    activeTab === 'activity'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <AiOutlineHistory size={'1.5rem'} /> Activity
                                {/* {accessories.length > 0 && (
                                    <span className="ml-1 bg-blue-100 text-blue-600 py-1 px-2 rounded-full text-xs">
                                        {accessories.length}
                                    </span>
                                )} */}
                            </button>
                        </nav>
                    </div>
                    {activeTab === 'info_contractor' && (
                        <div>
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
                                cancelRoute="/crm/contractors"
                                onSubmit={handleSubmit}
                                submitText={isSubmitting ? 'Updating...' : 'Update Contractor'}
                            />
                        </div>
                    )}
                {/* Accessories Tab */}
                {activeTab === 'activity' && (
                    <div className='product-accessories-information'>
                        <ContractorActivityInformation 
                            activityData={formData.iup_customers.activity_data || []}
                        />
                    </div>
                )}
                </div>
            </div>
        </>
    );
};

export default EditContractor;