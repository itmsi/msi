import PageMeta from '@/components/common/PageMeta'
import Button from '@/components/ui/button/Button'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowLeft, MdVerified } from 'react-icons/md'
import { useNavigate, useParams } from 'react-router-dom';
import { usePurchaseOrderEdit } from './hooks/usePurchaseOrderEdit';
import PurchaseOrderFields from './components/purchaseOrderFields';
import PurchaseOrderItemFields from './components/purchaseOrderItemsFields';
import FormActions from '@/components/form/FormActions';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOVendorSelect } from '@/hooks/usePOVendorSelect';
import { LoadingOverlay } from '@/components/common/Loading';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { FaSave } from 'react-icons/fa';
import { PurchaseOrderItem } from './types/purchaseorder';
import ModalApproval from './components/ModalApproval';

export default function Edit() {
    const navigate = useNavigate();
    
    const { id } = useParams<{ id: string }>();
    
    const {
        isSubmitting,
        isLoading,
        formData,
        errors,
        masterData,
        loadingMasterData,
        poDetail,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleSubmit,
        handleAddProductItem,
        handleProductDelete,
        handleUpdateProductItem,
    } = usePurchaseOrderEdit();

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

    // Set default selected vendor & location dari data PO
    useEffect(() => {
        if (poDetail) {
            setSelectedVendor({
                value: String(poDetail.vendor_id),
                label: poDetail.vendor_name,
                data: { companyName: poDetail.vendor_name }
            });

            if (poDetail.location) {
                setSelectedLocation({
                    value: String(poDetail.location),
                    label: poDetail.location_display,
                });
            }
        }
    }, [poDetail]);

    const handleCancel = () => {
        navigate('/netsuite/purchase-order');
    }
console.log({
    formData
});

    const [isOpen, setIsOpen] = useState(false);
    const [selectedPoId, setSelectedPoId] = useState<string | null>(null);

    const handleApproval = (poId: string) => {
        setSelectedPoId(poId || null);
        setIsOpen(true);
    };

    const [isOpenRejected, setIsOpenRejected] = useState(false);
    const [selectedPoIdRejected, setSelectedPoIdRejected] = useState<string | null>(null);

    const handleOpenRejected = (poId: string) => {
        setSelectedPoIdRejected(poId || null);
        setIsOpenRejected(true);
    };
    
    return (
        <>
            <PageMeta
                title="Edit Purchase Order | Netsuite"
                description="Edit Netsuite purchase order"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    {(isLoading || loadingMasterData) ? (
                        <LoadingOverlay
                            message="Loading data..."
                        />
                    ) : ( <>
                        {/* Header */}
                        <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                            <div className="flex items-center gap-1 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/netsuite/purchase-order')}
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                                <div className="border-l border-gray-300 h-6 mx-3"></div>
                                <div className='flex justify-between items-center w-full'>
                                    <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Purchase Order {poDetail?.po_number ? `- ${poDetail.po_number}` : ''}</h1>
                                    {poDetail?.approvalstatus === 2 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleApproval(poDetail.po_id)}
                                            className="group px-6 rounded-5 ring-1 ring-inset ring-[#003061] text-[#003061] hover:bg-green-600 hover:text-white hover:ring-green-600"
                                            disabled={isSubmitting}
                                        >
                                            Re-Approval <MdVerified className="w-4 h-4 text-green-600  group-hover:text-white" />
                                        </Button>
                                    )}
                                    {poDetail?.approvalstatus === 3 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleOpenRejected(poDetail.po_id)}
                                            className="group px-6 rounded-5 ring-1 ring-inset ring-[#003061] text-[#003061] hover:bg-[#003061] hover:text-white hover:ring-[#003061]"
                                            disabled={isSubmitting}
                                        >
                                            Re-Open <MdVerified className="w-4 h-4 text-[#003061]  group-hover:text-white" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Purchase Order Fields */}
                            <PurchaseOrderFields
                                formData={formData}
                                modeEdit={true}
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
                            <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="px-6 rounded-full"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                {
                                    (poDetail?.approvalstatus !== 2 && 
                                    poDetail?.approvalstatus !== 3) && (
                                <PermissionGate permission={["create", "update"]}>
                                    <Button
                                        onClick={handleSubmit}
                                        className="px-6 flex items-center gap-2 rounded-full"
                                        disabled={isSubmitting}
                                    >
                                        <FaSave className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                                        {isSubmitting ? 'Updating...' : 'Update Purchase Order'}
                                    </Button>
                                </PermissionGate>
                                    )
                                }
                            </div>
                        </div> 
                    </>)}

                    {/* // MODAL REOPEN SAAT STATUS APPROVAL = APPROVED */}
                    <ModalApproval
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        poId={selectedPoId ? parseInt(selectedPoId) : null}
                        onSuccess={() => navigate('/netsuite/purchase-order')}
                        reopen={true}
                        titleModal="Re-Open Approval"
                        descriptionModal="Masukkan catatan untuk proses re-open approval"
                    />
                    {/* // MODAL RESUBMIT SAAT STATUS REJECTED */}
                    <ModalApproval
                        isOpen={isOpenRejected}
                        onClose={() => setIsOpenRejected(false)}
                        poId={selectedPoIdRejected ? parseInt(selectedPoIdRejected) : null}
                        onSuccess={() => navigate('/netsuite/purchase-order')}
                        resubmit={true}
                        titleModal="Re-Submit Approval"
                        descriptionModal="Masukkan catatan untuk proses re-submit approval"
                    />
                </div>
            </div>
        </>
    )
}
