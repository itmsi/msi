import PageMeta from '@/components/common/PageMeta'
import Button from '@/components/ui/button/Button'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowLeft } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom';
import ReceiptFields  from './components/Receive/receiptField';
import ReceiptItemFields  from './components/Receive/ReceipItemsFields';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOVendorSelect } from '@/hooks/usePOVendorSelect';
import { LoadingOverlay } from '@/components/common/Loading';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { getProfile } from '@/helpers/generalHelper';
import { usePOTermSelect } from '@/hooks/usePOTermSelect';
import { useReceive } from './hooks/useReceive';

export default function Receive() {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    
    const {
        isSubmitting,
        isLoading,
        formData,
        errors,
        masterData,
        poDetail,
        loading,
        receiptDetail,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleSubmitReceive,
        handleUpdateProductItem,
        isViewMode,
    } = useReceive();

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
        if (isInitialLoadComplete && subsidiaryId && formData?.subsidiary && receiptDetail) {
            const currentSubsidiary = Number(formData.subsidiary);
            const initialSubsidiary = Number(receiptDetail.subsidiary);
            
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
    }, [subsidiaryId, isInitialLoadComplete, formData?.subsidiary, receiptDetail]);
    
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
        if (receiptDetail && !isInitialLoadComplete) {
            if (locationInitialized && classInitialized && departmentInitialized) {
                try {
                    // Set vendor with defensive checks
                    if (receiptDetail.vendor_id && receiptDetail.vendor_name) {
                        const vendorValue = {
                            value: String(receiptDetail.vendor_id),
                            label: receiptDetail.vendor_name,
                        };
                        setSelectedVendor(vendorValue);
                    }

                    // Set term with defensive checks
                    if (receiptDetail.terms && receiptDetail.terms_display) {
                        const termValue = {
                            value: String(receiptDetail.terms),
                            label: receiptDetail.terms_display,
                        };
                        setSelectedTerm(termValue);
                    }

                    // Set location with defensive checks
                    if (receiptDetail.location && receiptDetail.location_display) {
                        const locationValue = {
                            value: String(receiptDetail.location),
                            label: receiptDetail.location_display,
                        };
                        setSelectedLocation(locationValue);
                    }
                    
                    // Set class with defensive checks
                    if (receiptDetail.class && receiptDetail.class_display) {
                        const classValue = {
                            value: String(receiptDetail.class),
                            label: receiptDetail.class_display,
                        };
                        setSelectedClass(classValue);
                    }
                    
                    // Set department with defensive checks
                    if (receiptDetail.department && receiptDetail.department_display) {
                        const departmentValue = {
                            value: String(receiptDetail.department),
                            label: receiptDetail.department_display,
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
    }, [receiptDetail, locationInitialized, classInitialized, departmentInitialized, isInitialLoadComplete]);

    const handleCancel = () => {
        navigate('/netsuite/purchase-order');
    }

    const [editReceive] = useState<boolean>(false);


    return (
        <>
            <PageMeta
                title="Edit Purchase Order | Netsuite"
                description="Edit Netsuite purchase order"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50">
                <div className="mx-auto px-0">
                    {(isLoading || loading) ? (
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
                                            {isViewMode ? 'View Receipt' : 'Receipt Purchase Order'}
                                        </h1>
                                        <p className="ms-2 text-sm text-gray-600">
                                            <Link 
                                                className='flex text-blue-400 hover:underline items-center gap-1'
                                                to={`/netsuite/purchase-order/edit/${receiptDetail?.po_id}`} target="_blank">
                                                <FaExternalLinkAlt className='me-1'/> {receiptDetail?.po_number || '-'}
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Purchase Order Fields */}
                            <ReceiptFields
                                formData={formData}
                                modeEdit={true}
                                errors={errors}
                                masterData={masterData}
                                subsidiaryId={formData.subsidiary}
                                onInputChange={handleInputChange}
                                onSelectChange={handleSelectChange}
                                onDateChange={handleDateChange}

                                // EDIT RECIVE STATUS
                                editReceive={isViewMode ? true : editReceive}
                                poDetail={poDetail}

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

                            <div className='bg-white rounded-b-2xl shadow-sm'>
                                <ReceiptItemFields
                                    formData={formData}
                                    errors={errors}
                                    masterData={masterData}
                                    onAddProductItem={() => {}}
                                    onProductDelete={undefined}
                                    onUpdateProductItem={handleUpdateProductItem}
                                    
                                    // EDIT RECIVE STATUS
                                    editReceive={isViewMode ? true : editReceive}

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
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="px-6 rounded-full"
                                    disabled={isSubmitting}
                                >
                                    {isViewMode ? 'Back' : 'Cancel'}
                                </Button>
                                
                                {/* {!isViewMode && (
                                    <> */}
                                        {/* <PermissionGate permission={["create", "update"]}>
                                            <Button
                                                type="button"
                                                onClick={() => setEditReceive(true)}
                                                className="group px-6 rounded-full ring-1 bg-[#14B8A6] ring-inset ring-[#14B8A6] text-white hover:bg-[#0D9488] hover:ring-[#0D9488]"
                                                disabled={isSubmitting}
                                            >
                                                Submit Receive
                                            </Button>
                                        </PermissionGate> */}
                                        
                                        {/* {(receiptDetail?.po_status_label === 'Pending Receipt' && editReceive) && ( */}
                                            <PermissionGate permission={["create", "update"]}>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleSubmitReceive()}
                                                    className="group px-6 rounded-full ring-1 bg-[#14B8A6] ring-inset ring-[#14B8A6] text-white hover:bg-[#0D9488] hover:ring-[#0D9488]"
                                                    disabled={isSubmitting}
                                                >
                                                    Submit Receive
                                                </Button>
                                            </PermissionGate>
                                        {/* )} */}
                                    {/* </>
                                )} */}
                            </div>
                        </div> 
                    </>)}

                   
                </div>
            </div>
        </>
    )
}
