import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdKeyboardArrowLeft, MdOutlineSync } from 'react-icons/md';
import { FaSave, FaCopy } from 'react-icons/fa';
import { PermissionGate } from '@/components/common/PermissionComponents';
import PageMeta from '@/components/common/PageMeta';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';
import { LoadingOverlay } from '@/components/common/Loading';
import { useSalesOrderEdit } from './hooks/useSalesOrderEdit';
import SalesOrderFields from './components/SalesOrderFields';
import SalesOrderItemFields from './components/SalesOrderItemFields';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { useSOCustomerSelect } from '@/hooks/useSOCustomerSelect';
import { usePOTermSelect } from '@/hooks/usePOTermSelect';
import { getProfile } from '@/helpers/generalHelper';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    const [activeTab, setActiveTab] = useState<'items'>('items');

    const {
        isSubmitting,
        loadingDetail,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleSubmit,
        handleSyncById,
        isSyncing,
        soInternalId,
        loadData,
        syncInfo,
        tranid,
        statusName,
        messageError,
        masterData,
        loadingMasterData,
        handleMakeCopy,
    } = useSalesOrderEdit(id);

    const subsidiaryId = formData.subsidiary ? Number(formData.subsidiary) : undefined;

    // Location Select
    const {
        POLocationOptions: locationOptions,
        pagination: locationPagination,
        inputValue: locationInputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom: handleLocationMenuScrollToBottom,
        initializeOptions: initializeLocationOptions,
        resetLocationOptions
    } = usePOLocationSelect(30, false, subsidiaryId);

    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    // Class Select
    const {
        POClassOptions: classOptions,
        pagination: classPagination,
        inputValue: classInputValue,
        handleInputChange: handleClassInputChange,
        handleMenuScrollToBottom: handleClassMenuScrollToBottom,
        initializeOptions: initializeClassOptions,
        resetClassOptions
    } = usePOClassSelect(30, subsidiaryId, profileSSOId);

    const [selectedClass, setSelectedClass] = useState<any>(null);

    // Department Select
    const {
        PODepartmentOptions: deptOptions,
        pagination: deptPagination,
        inputValue: deptInputValue,
        handleInputChange: handleDeptInputChange,
        handleMenuScrollToBottom: handleDeptMenuScrollToBottom,
        initializeOptions: initializeDeptOptions,
        resetDepartmentOptions
    } = usePODepartmentSelect(30, subsidiaryId);

    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

    // Customer Select
    const {
        SOCustomerOptions: customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions,
    } = useSOCustomerSelect(30);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Term Select
    const {
        POTermOptions: termOptions,
        pagination: termPagination,
        inputValue: termInputValue,
        handleInputChange: handleTermInputChange,
        handleMenuScrollToBottom: handleTermMenuScrollToBottom,
        initializeOptions: initializeTermOptions,
    } = usePOTermSelect();

    const [selectedTerm, setSelectedTerm] = useState<any>(null);

    // Location select untuk items (is_parent = false)
    const {
        POLocationOptions: itemLocationOptions,
        pagination: itemLocationPagination,
        inputValue: itemLocationInputValue,
        handleInputChange: handleItemLocationInputChange,
        handleMenuScrollToBottom: handleItemLocationScrollToBottom,
        initializeOptions: initializeItemLocationOptions,
        resetLocationOptions: resetItemLocationOptions
    } = usePOLocationSelect(30, false, subsidiaryId);

    const {
        POItemsOptions: itemOptions,
        pagination: itemPagination,
        inputValue: itemInputValue,
        handleInputChange: handleItemInputChange,
        handleMenuScrollToBottom: handleItemMenuScrollToBottom,
        initializeOptions: initializeItemOptions,
    } = usePOItemsSelect(20);

    // Initialize options
    useEffect(() => {
        initializeLocationOptions();
        initializeItemLocationOptions();
        initializeClassOptions();
        initializeDeptOptions();
        initializeCustomerOptions();
        initializeItemOptions();
        if (initializeTermOptions) initializeTermOptions();
    }, [initializeLocationOptions, initializeItemLocationOptions, initializeClassOptions, initializeDeptOptions, initializeCustomerOptions, initializeItemOptions, initializeTermOptions]);

    // Handle subsidiary change
    useEffect(() => {
        if (subsidiaryId) {
            resetLocationOptions();
            resetItemLocationOptions();
            resetClassOptions();
            resetDepartmentOptions();
        }
    }, [subsidiaryId]);

    // Sync selected state with formData once loaded
    useEffect(() => {
        if (!loadingDetail && formData.entity) {
            setSelectedCustomer({
                label: formData.entity_name || '',
                value: String(formData.entity)
            });
        }
        if (!loadingDetail && formData.location) {
            setSelectedLocation({
                label: formData.location_name || '',
                value: String(formData.location)
            });
        }
        if (!loadingDetail && formData.department) {
            setSelectedDepartment({
                label: formData.department_name || '',
                value: String(formData.department)
            });
        }
        if (!loadingDetail && formData.class) {
            setSelectedClass({
                label: formData.class_name || '',
                value: String(formData.class)
            });
        }
        if (!loadingDetail && formData.terms) {
            setSelectedTerm({
                label: formData.terms || '',
                value: String(formData.terms)
            });
        }
    }, [loadingDetail]);

    const ElemRefresh = () => (
        <PermissionGate permission="read">
            <Button
                onClick={() => loadData()}
                className="flex rounded-full items-center py-1 gap-2 text-green-600 bg-transparent hover:text-green-700 hover:bg-green-50 ring-green-600"
                variant='outline'
            >
                <MdOutlineSync size={20} />
                <div>
                    <span>{'Refresh'}</span>
                </div>
            </Button>
        </PermissionGate>
    );

    return (
        <>
            <PageMeta
                title={`Edit Sales Order | Netsuite`}
                description="Edit Netsuite Sales Order"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50">
                <div className="mx-auto px-0">
                    {loadingDetail || loadingMasterData ? (
                        <LoadingOverlay
                            message={loadingMasterData ? "Loading master data..." : "Loading data..."}
                        />
                    ) : (<>
                        {/* Header */}
                        <div className="flex items-center justify-between lg:h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                            <div className="flex items-center gap-1 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/netsuite/sales-orders')}
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                                <div className="border-l border-gray-300 h-6 mx-3"></div>
                                <div className='flex items-center gap-4 justify-between w-full lg:flex-row flex-col'>
                                    <div>
                                        <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                            Edit Sales Order
                                        </h1>
                                        <p className="ms-2 text-sm text-gray-600">{tranid || '-'}</p>
                                    </div>
                                    <div className="capitalize ms-2 flex gap-2">
                                        {(Boolean(soInternalId) && syncInfo?.sync_status !== 'pending' && syncInfo?.sync_status !== 'failed') && (
                                            <PermissionGate permission="read">
                                                <Button
                                                    onClick={() => handleSyncById(String(soInternalId))}
                                                    disabled={isSyncing}
                                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 ring-green-600 py-2"
                                                    variant='outline'
                                                >
                                                    <MdOutlineSync size={20} className={isSyncing ? 'animate-spin' : ''} />
                                                    <div>
                                                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                                                    </div>
                                                </Button>
                                            </PermissionGate>
                                        )}
                                        {tranid !== null && (
                                            <span
                                                className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]`}
                                            >
                                                {statusName || (formData.orderstatus ? (
                                                    [
                                                        { value: 'A', label: 'Pending Approval' },
                                                        { value: 'B', label: 'Pending Fulfillment' },
                                                        { value: 'C', label: 'Cancelled' },
                                                        { value: 'D', label: 'Partially Fulfilled' },
                                                        { value: 'E', label: 'Pending Billing/Partially Fulfilled' },
                                                        { value: 'F', label: 'Pending Billing' },
                                                        { value: 'G', label: 'Billed' },
                                                        { value: 'H', label: 'Closed' }
                                                    ].find(o => o.value === formData.orderstatus)?.label || formData.orderstatus
                                                ) : 'Draft')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {statusName === 'pending' && (
                                <Alert variant='warning' title='Sales Order Is Being Processed'>
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">
                                            Your sales order sync is currently being processed. Please allow some time for the process to complete. <br />
                                            Click the refresh button below to check whether the data is already available.
                                        </p>
                                        <ElemRefresh />
                                    </div>
                                </Alert>
                            )}

                            {statusName === 'failed' && (
                                <Alert variant='warning' title='Failed to Sync Sales Order'>
                                    <div className="space-y-4">
                                        <p className="text-sm text-red-600 font-medium break-words">
                                            {messageError || 'Unknown error occurred during synchronization.'}
                                        </p>
                                        <ElemRefresh />
                                    </div>
                                </Alert>
                            )}

                            {/* Sales Order Fields */}
                            <SalesOrderFields
                                formData={formData}
                                errors={errors}
                                masterData={masterData}
                                loadingMasterData={loadingMasterData}
                                onInputChange={handleInputChange}
                                onSelectChange={handleSelectChange}
                                onDateChange={handleDateChange}
                                onAddItem={handleAddItem}
                                onRemoveItem={handleRemoveItem}
                                onUpdateItem={handleUpdateItem}

                                // Location Props
                                locationOptions={locationOptions}
                                locationPagination={locationPagination}
                                locationInputValue={locationInputValue}
                                onLocationInputChange={handleLocationInputChange}
                                onLocationMenuScrollToBottom={handleLocationMenuScrollToBottom}
                                selectedLocation={selectedLocation}
                                onLocationChange={(opt) => {
                                    setSelectedLocation(opt);
                                    handleSelectChange('location', opt ? Number(opt.value) : null);
                                    handleSelectChange('location_name', opt?.label || '');
                                }}

                                // Dept Props
                                deptOptions={deptOptions}
                                deptPagination={deptPagination}
                                deptInputValue={deptInputValue}
                                onDeptInputChange={handleDeptInputChange}
                                onDeptMenuScrollToBottom={handleDeptMenuScrollToBottom}
                                selectedDepartment={selectedDepartment}
                                onDepartmentChange={(opt) => {
                                    setSelectedDepartment(opt);
                                    handleSelectChange('department', opt ? Number(opt.value) : null);
                                    handleSelectChange('department_name', opt?.label || '');
                                }}

                                // Class Props
                                classOptions={classOptions}
                                classPagination={classPagination}
                                classInputValue={classInputValue}
                                onClassInputChange={handleClassInputChange}
                                onClassMenuScrollToBottom={handleClassMenuScrollToBottom}
                                selectedClass={selectedClass}
                                onClassChange={(opt) => {
                                    setSelectedClass(opt);
                                    handleSelectChange('class', opt ? Number(opt.value) : null);
                                    handleSelectChange('class_name', opt?.label || '');
                                }}

                                // Customer Props
                                customerOptions={customerOptions}
                                customerPagination={customerPagination}
                                customerInput={customerInputValue}
                                onCustomerInputChange={handleCustomerInputChange}
                                onCustomerMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                                selectedCustomer={selectedCustomer}
                                onCustomerChange={(opt) => {
                                    setSelectedCustomer(opt);
                                    if (opt) {
                                        handleSelectChange('entity', Number(opt.value));
                                        handleSelectChange('entity_name', opt.label);
                                    } else {
                                        handleSelectChange('entity', null);
                                        handleSelectChange('entity_name', '');
                                    }
                                }}

                                // Term Props
                                termOptions={termOptions}
                                termPagination={termPagination}
                                termInput={termInputValue}
                                onTermInputChange={handleTermInputChange}
                                onTermMenuScrollToBottom={handleTermMenuScrollToBottom}
                                selectedTerm={selectedTerm}
                                onTermChange={(opt) => {
                                    setSelectedTerm(opt);
                                    handleSelectChange('terms', opt ? Number(opt.value) : null);
                                }}
                            />

                            <div>
                                {/* Tab Navigation */}
                                <div className="border-b border-gray-200 px-6 overflow-auto">
                                    <nav className="flex space-x-8 overflow-auto">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('items')}
                                            className={`py-2 px-1 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors ${
                                                activeTab === 'items'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Items
                                        </button>
                                    </nav>
                                </div>

                                <div className='bg-white rounded-b-2xl shadow-sm'>
                                    {/* Items Tab */}
                                    {activeTab === 'items' && (
                                        <SalesOrderItemFields
                                            formData={formData}
                                            errors={errors}
                                            masterData={masterData}
                                            loadingMasterData={loadingMasterData}
                                            onInputChange={handleInputChange}
                                            onSelectChange={handleSelectChange}
                                            onDateChange={handleDateChange}
                                            onAddItem={handleAddItem}
                                            onRemoveItem={handleRemoveItem}
                                            onUpdateItem={handleUpdateItem}

                                            // Item Select Props
                                            itemOptions={itemOptions}
                                            itemPagination={itemPagination}
                                            itemInput={itemInputValue}
                                            onItemInputChange={handleItemInputChange}
                                            onItemMenuScrollToBottom={handleItemMenuScrollToBottom}

                                            // Location Props (for items)
                                            locationOptions={itemLocationOptions}
                                            locationPagination={itemLocationPagination}
                                            locationInput={itemLocationInputValue}
                                            onLocationInputChange={handleItemLocationInputChange}
                                            onLocationMenuScrollToBottom={handleItemLocationScrollToBottom}

                                            // Class Props
                                            classOptions={classOptions}
                                            classPagination={classPagination}
                                            classInput={classInputValue}
                                            onClassInputChange={handleClassInputChange}
                                            onClassMenuScrollToBottom={handleClassMenuScrollToBottom}

                                            // Dept Props
                                            deptOptions={deptOptions}
                                            deptPagination={deptPagination}
                                            deptInput={deptInputValue}
                                            onDeptInputChange={handleDeptInputChange}
                                            onDeptMenuScrollToBottom={handleDeptMenuScrollToBottom}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/netsuite/sales-orders')}
                                    className="px-6 rounded-full"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>

                                <PermissionGate permission={["create", "update"]}>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleMakeCopy}
                                            className="px-6 flex items-center gap-2 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50"
                                            disabled={isSubmitting || statusName === 'pending' || statusName === 'failed'}
                                        >
                                            <FaCopy className="h-4 w-4" /> Make Copy
                                        </Button>

                                        <Button
                                            onClick={handleSubmit}
                                            className="px-6 flex items-center gap-2 rounded-full"
                                            disabled={isSubmitting || statusName === 'pending' || statusName === 'failed'}
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
                                                    <FaSave className={`mr-2 h-4 w-4`} /> Update Sales Order
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </PermissionGate>

                                {(syncInfo?.sync_status === 'failed' || syncInfo?.sync_status === 'pending') && (
                                    <ElemRefresh />
                                )}
                            </div>
                        </div>
                    </>)}
                </div>
            </div>
        </>
    );
}
