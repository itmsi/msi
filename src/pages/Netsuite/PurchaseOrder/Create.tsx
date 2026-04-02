import PageMeta from '@/components/common/PageMeta'
import Button from '@/components/ui/button/Button'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowLeft } from 'react-icons/md'
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrderCreate } from './hooks/usePurchaseOrderCreate';
import PurchaseOrderFields from './components/purchaseOrderFields';
import PurchaseOrderItemFields from './components/purchaseOrderItemsFields';
import FormActions from '@/components/form/FormActions';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOVendorSelect } from '@/hooks/usePOVendorSelect';
import { LoadingOverlay } from '@/components/common/Loading';

export default function Create() {
    const navigate = useNavigate();
    
    const {
        isSubmitting,
        formData,
        errors,
        masterData,
        loadingMasterData,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleSubmit,
        handleAddProductItem,
        handleProductDelete,
        handleUpdateProductItem,
    } = usePurchaseOrderCreate();

    // Use POILocationSelect hook for location management
    const {
        POLocationOptions,
        pagination,
        inputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom,
        initializeOptions
    } = usePOLocationSelect();
    
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [locationSelectError, setLocationSelectError] = useState<string>('');

    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);
    
    const {
        POVendorOptions,
        pagination : vendorPagination,
        inputValue : vendorInputValue,
        handleInputChange: handleVendorInputChange,
        handleMenuScrollToBottom: handleVendorMenuScrollToBottom,
        initializeOptions: initializeVendorOptions,
    } = usePOVendorSelect();
    
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [VendorSelectError, setVendorSelectError] = useState<string>('');
    
    useEffect(() => {
        initializeVendorOptions();
    }, [initializeVendorOptions]);

    return (
        <>
            <PageMeta
                title="Create Purchase Order | Netsuite"
                description="Create new Netsuite purchase order"
                image="/motor-sights-international.png"
            />
            
            {loadingMasterData ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <LoadingOverlay
                            message="Loading master data..."
                        />
                    </div>
                </div>
            ) : (
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/netsuite/purchase-order')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Purchase Order</h1>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Purchase Order Fields */}
                        <PurchaseOrderFields
                            formData={formData}
                            errors={errors}
                            masterData={masterData}
                            loadingMasterData={loadingMasterData}
                            onInputChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            onDateChange={handleDateChange}
                            // Vendor props
                            vendorOptions={POVendorOptions}
                            vendorPagination={vendorPagination}
                            vendorInputValue={vendorInputValue}
                            onVendorInputChange={handleVendorInputChange}
                            onVendorMenuScrollToBottom={handleVendorMenuScrollToBottom}
                            selectedVendor={selectedVendor}
                            onVendorChange={(option) => {
                                setSelectedVendor(option);
                                if (option && option.data) {
                                    // Update formData dengan data vendor yang dipilih
                                    handleSelectChange('vendorid', option.value);
                                    handleSelectChange('vendor_name', option.data.companyName);
                                }
                                if (VendorSelectError) {
                                    setVendorSelectError('');
                                }
                            }}
                            vendorError={errors.vendorid || VendorSelectError}
                            // Location props  
                            locationOptions={POLocationOptions}
                            locationPagination={pagination}
                            locationInputValue={inputValue}
                            onLocationInputChange={handleLocationInputChange}
                            onLocationMenuScrollToBottom={handleMenuScrollToBottom}
                            selectedLocation={selectedLocation}
                            onLocationChange={(option) => {
                                setSelectedLocation(option);
                                if (option && option.data) {
                                    // Update formData dengan data location yang dipilih
                                    handleSelectChange('location', option.value);
                                    handleSelectChange('location_name', option.data.name);
                                }
                                if (locationSelectError) {
                                    setLocationSelectError('');
                                }
                            }}
                            locationError={errors.location || locationSelectError}
                        />

                        {/* Purchase Order Items */}
                        <PurchaseOrderItemFields
                            formData={formData}
                            errors={errors}
                            masterData={masterData}
                            loadingMasterData={loadingMasterData}
                            onInputChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            onDateChange={handleDateChange}
                            onAddProductItem={handleAddProductItem}
                            onProductDelete={handleProductDelete}
                            onUpdateProductItem={handleUpdateProductItem}

                            // Location props  
                            locationOptions={POLocationOptions}
                            locationPagination={pagination}
                            locationInputValue={inputValue}
                            onLocationInputChange={handleLocationInputChange}
                            onLocationMenuScrollToBottom={handleMenuScrollToBottom}
                            selectedLocation={selectedLocation}
                            onLocationChange={(option) => {
                                setSelectedLocation(option);
                                if (option && option.data) {
                                    // Update formData dengan data location yang dipilih
                                    handleSelectChange('location', option.value);
                                    handleSelectChange('location_name', option.data.name);
                                }
                                if (locationSelectError) {
                                    setLocationSelectError('');
                                }
                            }}
                            locationError={locationSelectError}
                        />

                        {/* Form Actions */}
                        <FormActions
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            cancelRoute="/netsuite/purchase-order"
                            submitText="Create Purchase Order"
                            submittingText="Creating..."
                        />
                    </div>
                </div>
            </div>
            )}
        </>
    )
}
