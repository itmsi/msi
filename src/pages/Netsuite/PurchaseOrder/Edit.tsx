import PageMeta from '@/components/common/PageMeta'
import Button from '@/components/ui/button/Button'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowLeft, MdVerified } from 'react-icons/md'
import { useNavigate } from 'react-router-dom';
import { usePurchaseOrderEdit } from './hooks/usePurchaseOrderEdit';
import PurchaseOrderFields from './components/purchaseOrderFields';
import PurchaseOrderItemFields from './components/purchaseOrderItemsFields';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOVendorSelect } from '@/hooks/usePOVendorSelect';
import { LoadingOverlay } from '@/components/common/Loading';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { FaSave } from 'react-icons/fa';
import ModalApproval from './components/ModalApproval';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { getProfile } from '@/helpers/generalHelper';
import { usePOTermSelect } from '@/hooks/usePOTermSelect';

export default function Edit() {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    
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

    // Get subsidiary_id dari form data dengan defensive check
    const subsidiaryId = formData?.subsidiary ? Number(formData.subsidiary) : undefined;

    // Location select untuk header dan items (is_parent = false)
    const {
        POLocationOptions,
        pagination: locationPagination,
        inputValue: locationInputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom: handleLocationMenuScrollToBottom,
        initializeOptions: initializeLocationOptions,
        initialized: locationInitialized,
        isLoading: locationLoading
    } = usePOLocationSelect(30, false, subsidiaryId);
    
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [locationSelectError, setLocationSelectError] = useState<string>('');
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
    const [hasAttemptedInitialization, setHasAttemptedInitialization] = useState(false);

    // Initialize hooks only once when not yet initialized - PRODUCTION SAFE
    useEffect(() => {
        if (!hasAttemptedInitialization && initializeLocationOptions && !locationInitialized && !locationLoading) {
            try {
                initializeLocationOptions();
                setHasAttemptedInitialization(true);
            } catch (error) {
                console.error('Failed to initialize location options:', error);
            }
        }
    }, [locationInitialized, locationLoading, hasAttemptedInitialization]);
    
    // Class select untuk items
    const {
        POClassOptions,
        pagination: itemClassPagination,
        inputValue: itemClassInputValue,
        handleInputChange: handleItemClassInputChange,
        handleMenuScrollToBottom: handleItemClassScrollToBottom,
        initializeOptions: initializeItemClassOptions,
        initialized: classInitialized,
        isLoading: classLoading
    } = usePOClassSelect(30, subsidiaryId, profileSSOId);
    
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [classSelectError, setClassSelectError] = useState<string>('');


    
    // Department select untuk items
    const {
        PODepartmentOptions,
        pagination: itemDepartmentPagination,
        inputValue: itemDepartmentInputValue,
        handleInputChange: handleItemDepartmentInputChange,
        handleMenuScrollToBottom: handleItemDepartmentScrollToBottom,
        initializeOptions: initializeItemDepartmentOptions,
        initialized: departmentInitialized,
        isLoading: departmentLoading
    } = usePODepartmentSelect(30, subsidiaryId);
    
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [departmentSelectError, setDepartmentSelectError] = useState<string>('');



    useEffect(() => {
        if (initializeItemClassOptions && !classInitialized && !classLoading) {
            try {
                initializeItemClassOptions();
            } catch (error) {
                console.error('Failed to initialize class options:', error);
            }
        }
    }, [classInitialized, classLoading, initializeItemClassOptions]);
    
    useEffect(() => {
        if (initializeItemDepartmentOptions && !departmentInitialized && !departmentLoading) {
            try {
                initializeItemDepartmentOptions();
            } catch (error) {
                console.error('Failed to initialize department options:', error);
            }
        }
    }, [departmentInitialized, departmentLoading, initializeItemDepartmentOptions]);

    // Reset selected values ketika subsidiary berubah - PRODUCTION SAFE
    useEffect(() => {
        // Only reset if initial load is complete and this is user changing subsidiary
        // Add additional check to prevent reset during initial load
        if (isInitialLoadComplete && subsidiaryId && formData?.subsidiary && poDetail) {
            // Additional safety: only reset if subsidiary actually changed from initial value
            const currentSubsidiary = Number(formData.subsidiary);
            const initialSubsidiary = Number(poDetail.subsidiary);
            
            if (currentSubsidiary !== initialSubsidiary) {
                try {
                    setSelectedLocation(null);
                    setSelectedClass(null);
                    setSelectedDepartment(null);
                } catch (error) {
                    console.error('Failed to reset selected values:', error);
                }
            }
        }
    }, [subsidiaryId, isInitialLoadComplete, formData?.subsidiary, poDetail]);
    
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
        if (initializeVendorOptions) {
            initializeVendorOptions();
        }
    }, [initializeVendorOptions]); // Add function dependency back
    
    // Term select
    const {
        POTermOptions,
        pagination : termPagination,
        inputValue : termInputValue,
        handleInputChange: handleTermInputChange,
        handleMenuScrollToBottom: handleTermMenuScrollToBottom,
        initializeOptions: initializeTermOptions,
    } = usePOTermSelect();
    
    const [selectedTerm, setSelectedTerm] = useState<any>(null);
    const [TermSelectError, setTermSelectError] = useState<string>('');
    
    useEffect(() => {
        if (initializeTermOptions) {
            initializeTermOptions();
        }
    }, [initializeTermOptions]); // Add function dependency back

    // Set default selected vendor & location dari data PO - SEQUENCED PROPERLY
    useEffect(() => {
        if (poDetail && !isInitialLoadComplete) {
            if (locationInitialized && classInitialized && departmentInitialized) {
                try {
                    // Set vendor with defensive checks
                    if (poDetail.vendor_id && poDetail.vendor_name) {
                        const vendorValue = {
                            value: String(poDetail.vendor_id),
                            label: poDetail.vendor_name,
                        };
                        setSelectedVendor(vendorValue);
                    }

                    // Set term with defensive checks
                    if (poDetail.terms && poDetail.terms_display) {
                        const termValue = {
                            value: String(poDetail.terms),
                            label: poDetail.terms_display,
                        };
                        setSelectedTerm(termValue);
                    }

                    // Set location with defensive checks
                    if (poDetail.location && poDetail.location_display) {
                        const locationValue = {
                            value: String(poDetail.location),
                            label: poDetail.location_display,
                        };
                        setSelectedLocation(locationValue);
                    }
                    
                    // Set class with defensive checks
                    if (poDetail.class && poDetail.class_display) {
                        const classValue = {
                            value: String(poDetail.class),
                            label: poDetail.class_display,
                        };
                        setSelectedClass(classValue);
                    }
                    
                    // Set department with defensive checks
                    if (poDetail.department && poDetail.department_display) {
                        const departmentValue = {
                            value: String(poDetail.department),
                            label: poDetail.department_display,
                        };
                        setSelectedDepartment(departmentValue);
                    }
                    
                    // Mark initial load as complete
                    setIsInitialLoadComplete(true);
                    
                } catch (error) {
                    console.error('Failed to set initial PO data:', error);
                    setIsInitialLoadComplete(true);
                }
            }
        }
    }, [poDetail, locationInitialized, classInitialized, departmentInitialized, isInitialLoadComplete]);

    const handleCancel = () => {
        navigate('/netsuite/purchase-order');
    }

    const [isOpenApproval, setIsOpenApproval] = useState(false);
    const [selectedPoIdApproval, setSelectedPoIdApproval] = useState<string | null>(null);

    const handleApprovalOpen = (poId: string) => {
        setSelectedPoIdApproval(poId || null);
        setIsOpenApproval(true);
    };

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
            
            <div className="bg-gray-50">
                <div className="mx-auto px-0">
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
                                <div className='flex items-center gap-4 justify-between w-full'>
                                    <div>
                                        <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                            Edit Purchase Order
                                        </h1>
                                        <p className="ms-2 text-sm text-gray-600">{poDetail?.po_number || '-'}</p>
                                    </div>
                                    <div className="capitalize ms-2">
                                        <span 
                                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]`}
                                        >
                                            {formData.po_status_label}
                                        </span>
                                    </div>
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
                                subsidiaryId={formData.subsidiary}
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

                                // Term props
                                termOptions={POTermOptions}
                                termPagination={termPagination}
                                termInputValue={termInputValue}
                                onTermInputChange={handleTermInputChange}
                                onTermMenuScrollToBottom={handleTermMenuScrollToBottom}
                                selectedTerm={selectedTerm}
                                onTermChange={(option) => {
                                    setSelectedTerm(option);
                                    if (option && option.data) {
                                        // Update formData dengan data term yang dipilih
                                        handleSelectChange('terms', option.value);
                                        handleSelectChange('terms_name', option.data.name);
                                    }
                                    if (TermSelectError) {
                                        setTermSelectError('');
                                    }
                                }}
                                termError={errors.termid || TermSelectError}
                                
                                // Location props  
                                locationOptions={POLocationOptions}
                                locationPagination={locationPagination}
                                locationInputValue={locationInputValue}
                                onLocationInputChange={handleLocationInputChange}
                                onLocationMenuScrollToBottom={handleLocationMenuScrollToBottom}
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
                                
                                // Class props  
                                classOptions={POClassOptions}
                                classPagination={itemClassPagination}
                                classInputValue={itemClassInputValue}
                                onClassInputChange={handleItemClassInputChange}
                                onClassMenuScrollToBottom={handleItemClassScrollToBottom}
                                selectedClass={selectedClass}
                                onClassChange={(option) => {
                                    setSelectedClass(option);
                                    if (option && option.data) {
                                        // Update formData dengan data class yang dipilih
                                        handleSelectChange('class', option.value);
                                        handleSelectChange('class_name', option.data.name);
                                    }
                                    if (classSelectError) {
                                        setClassSelectError('');
                                    }
                                }}
                                classError={errors.class || classSelectError}
                                
                                // Department props  
                                departmentOptions={PODepartmentOptions}
                                departmentPagination={itemDepartmentPagination}
                                departmentInputValue={itemDepartmentInputValue}
                                onDepartmentInputChange={handleItemDepartmentInputChange}
                                onDepartmentMenuScrollToBottom={handleItemDepartmentScrollToBottom}
                                selectedDepartment={selectedDepartment}
                                onDepartmentChange={(option) => {
                                    setSelectedDepartment(option);
                                    if (option && option.data) {
                                        // Update formData dengan data department yang dipilih
                                        handleSelectChange('department', option.value);
                                        handleSelectChange('department_name', option.data.name);
                                    }
                                    if (departmentSelectError) {
                                        setDepartmentSelectError('');
                                    }
                                }}
                                departmentError={errors.department || departmentSelectError}
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

                                // Location props (shared dengan header)
                                locationOptions={POLocationOptions}
                                locationPagination={locationPagination}
                                locationInputValue={locationInputValue}
                                onLocationInputChange={handleLocationInputChange}
                                onLocationMenuScrollToBottom={handleLocationMenuScrollToBottom}
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

                                // Class props  
                                classOptions={POClassOptions}
                                classPagination={itemClassPagination}
                                classInputValue={itemClassInputValue}
                                onClassInputChange={handleItemClassInputChange}
                                onClassMenuScrollToBottom={handleItemClassScrollToBottom}
                                selectedClass={selectedClass}
                                onClassChange={(option) => {
                                    setSelectedClass(option);
                                    if (option && option.data) {
                                        // Update formData dengan data class yang dipilih
                                        handleSelectChange('class', option.value);
                                        handleSelectChange('class_name', option.data.name);
                                    }
                                    if (classSelectError) {
                                        setClassSelectError('');
                                    }
                                }}
                                classError={errors.class || classSelectError}
                                
                                // Department props  
                                departmentOptions={PODepartmentOptions}
                                departmentPagination={itemDepartmentPagination}
                                departmentInputValue={itemDepartmentInputValue}
                                onDepartmentInputChange={handleItemDepartmentInputChange}
                                onDepartmentMenuScrollToBottom={handleItemDepartmentScrollToBottom}
                                selectedDepartment={selectedDepartment}
                                onDepartmentChange={(option) => {
                                    setSelectedDepartment(option);
                                    if (option && option.data) {
                                        // Update formData dengan data department yang dipilih
                                        handleSelectChange('department', option.value);
                                        handleSelectChange('department_name', option.data.name);
                                    }
                                    if (departmentSelectError) {
                                        setDepartmentSelectError('');
                                    }
                                }}
                                departmentError={errors.department || departmentSelectError}
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
                                {(poDetail?.approvalstatus === 1 && poDetail.nextapprover === "" )&& (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleApprovalOpen(poDetail.po_id)}
                                        className="group px-6 rounded-full ring-1 ring-inset ring-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:ring-green-600"
                                        disabled={isSubmitting}
                                    >
                                        Submit Approval
                                    </Button>
                                )}
                                {poDetail?.approvalstatus === 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleApproval(poDetail.po_id)}
                                        className="group px-6 rounded-full ring-1 ring-inset ring-[#003061] text-[#003061] hover:bg-[#003061] hover:text-white hover:ring-[#003061]"
                                        disabled={isSubmitting}
                                    >
                                        Re-Approval <MdVerified className="w-4 h-4 text-[#003061]  group-hover:text-white" />
                                    </Button>
                                )}
                                {poDetail?.approvalstatus === 3 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleOpenRejected(poDetail.po_id)}
                                        className="group px-6 rounded-full ring-1 ring-inset ring-[#003061] text-[#003061] hover:bg-[#003061] hover:text-white hover:ring-[#003061]"
                                        disabled={isSubmitting}
                                    >
                                        Re-Open <MdVerified className="w-4 h-4 text-[#003061]  group-hover:text-white" />
                                    </Button>
                                )}
                                {
                                    ((formData.approvalstatus === 1 && formData.nextapprover === null))  && (
                                        <PermissionGate permission={["create", "update"]}>
                                            <Button
                                                onClick={handleSubmit}
                                                className="px-6 flex items-center gap-2 rounded-full"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} /> Update Purchase Order
                                                    </>
                                                )}
                                            </Button>
                                        </PermissionGate>
                                    )
                                }
                            </div>
                        </div> 
                    </>)}

                    {/* // MODAL REOPEN SAAT STATUS APPROVAL = APPROVED */}
                    <ModalApproval
                        isOpen={isOpenApproval}
                        onClose={() => setIsOpenApproval(false)}
                        poId={selectedPoIdApproval ? parseInt(selectedPoIdApproval) : null}
                        onSuccess={() => navigate('/netsuite/purchase-order')}
                        submit={true}
                        titleModal="Submit Approval"
                        descriptionModal="Masukkan catatan untuk proses approval"
                    />
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
