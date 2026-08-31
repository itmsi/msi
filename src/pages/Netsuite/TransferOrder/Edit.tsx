import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MdOutlineSync } from 'react-icons/md';
import { PermissionGate } from '@/components/common/PermissionComponents';
import PageMeta from '@/components/common/PageMeta';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';
import { LoadingOverlay } from '@/components/common/Loading';
import { useTransferOrderEdit } from './hooks/useTransferOrderEdit';
import TransferOrderFields from './components/TransferOrderFields';
import TransferOrderItemFields from './components/TransferOrderItemFields';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import { usePOVendorSelect } from '@/hooks/usePOVendorSelect';
import { useSOCustomerSelect } from '@/hooks/useSOCustomerSelect';
import { getProfile } from '@/helpers/generalHelper';
import PageHeader from '@/components/common/PageHeader';
import FilesTab from './components/tab/FilesTab';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';
import FormActions from '@/components/form/FormActions';

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    const [activeTab, setActiveTab] = useState<'items' | 'files'>('items');

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
        toInternalId,
        loadData,
        tranid,
        statusName,
        messageError,
        masterData,
        loadingMasterData,
        handleAddFiles,
    } = useTransferOrderEdit(id);

    const subsidiaryId = formData.subsidiary ? Number(formData.subsidiary) : undefined;

    // Location (From) Select
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

    useEffect(() => {
        if (initializeLocationOptions) initializeLocationOptions();
    }, [initializeLocationOptions]);

    // Transfer Location (To) Select
    const {
        POLocationOptions: transferLocationOptions,
        pagination: transferLocationPagination,
        inputValue: transferLocationInputValue,
        handleInputChange: handleTransferLocationInputChange,
        handleMenuScrollToBottom: handleTransferLocationMenuScrollToBottom,
        initializeOptions: initializeTransferLocationOptions,
        resetLocationOptions: resetTransferLocationOptions
    } = usePOLocationSelect(30, false, subsidiaryId);

    const [selectedTransferLocation, setSelectedTransferLocation] = useState<any>(null);

    useEffect(() => {
        if (initializeTransferLocationOptions) initializeTransferLocationOptions();
    }, [initializeTransferLocationOptions]);

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

    useEffect(() => {
        if (initializeClassOptions) initializeClassOptions();
    }, [initializeClassOptions]);

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

    useEffect(() => {
        if (initializeDeptOptions) initializeDeptOptions();
    }, [initializeDeptOptions]);

    // Employee Select
    const {
        employeeOptions,
        pagination: employeePagination,
        inputValue: employeeInputValue,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions,
        setUserNetsuite,
    } = useEmployeeSelect();

    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    useEffect(() => {
        setUserNetsuite(true);
        if (initializeEmployeeOptions) initializeEmployeeOptions();
    }, [initializeEmployeeOptions]);

    // Logistic Vendor Select
    const {
        POVendorOptions: logisticVendorOptions,
        pagination: logisticVendorPagination,
        inputValue: logisticVendorInputValue,
        handleInputChange: handleLogisticVendorInputChange,
        handleMenuScrollToBottom: handleLogisticVendorMenuScrollToBottom,
        initializeOptions: initializeLogisticVendorOptions,
    } = usePOVendorSelect(30);

    const [selectedLogisticVendor, setSelectedLogisticVendor] = useState<any>(null);

    useEffect(() => {
        if (initializeLogisticVendorOptions) initializeLogisticVendorOptions();
    }, [initializeLogisticVendorOptions]);

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

    useEffect(() => {
        if (initializeCustomerOptions) initializeCustomerOptions();
    }, [initializeCustomerOptions]);

    const {
        POItemsOptions: itemOptions,
        pagination: itemPagination,
        inputValue: itemInputValue,
        handleInputChange: handleItemInputChange,
        handleMenuScrollToBottom: handleItemMenuScrollToBottom,
        initializeOptions: initializeItemOptions,
        itemTypeFilter,
        itemTypeOptions,
        handleItemTypeChange
    } = usePOItemsSelect(20);

    useEffect(() => {
        if (initializeItemOptions) initializeItemOptions();
    }, [initializeItemOptions]);

    // Handle subsidiary change
    useEffect(() => {
        if (subsidiaryId) {
            resetLocationOptions();
            resetTransferLocationOptions();
            resetClassOptions();
            resetDepartmentOptions();
        }
    }, [subsidiaryId]);

    // Sync selected state with formData once loaded
    useEffect(() => {
        if (!loadingDetail && formData.location) {
            setSelectedLocation({
                label: formData.location_name || '',
                value: String(formData.location)
            });
        }
        if (!loadingDetail && formData.transferlocation) {
            setSelectedTransferLocation({
                label: formData.transferlocation_name || '',
                value: String(formData.transferlocation)
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
        if (!loadingDetail && formData.employee) {
            setSelectedEmployee({
                label: formData.employee_name || '',
                value: String(formData.employee)
            });
        }
        if (!loadingDetail && formData.logistic_vendor) {
            setSelectedLogisticVendor({
                label: formData.logistic_vendor_name || '',
                value: String(formData.logistic_vendor)
            });
        }
        if (!loadingDetail && formData.customer) {
            setSelectedCustomer({
                label: formData.customer_name || '',
                value: String(formData.customer)
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
                title={`Edit Transfer Order | Netsuite`}
                description="Edit Netsuite Transfer Order"
                image="/motor-sights-international.png"
            />

            <div className="mx-auto px-0">
                {loadingDetail || loadingMasterData ? (
                    <LoadingOverlay
                        message={loadingMasterData ? "Loading master data..." : "Loading data..."}
                    />
                ) : (<>
                    {/* Header */}
                    <PageHeader
                        title="Edit Transfer Order"
                        backPath="/netsuite/transfer-orders"
                        subtitle={tranid || '-'}
                        actions={ <>
                            {(Boolean(toInternalId) && statusName !== 'PROCESSING') && (
                                <PermissionGate permission="read">
                                    <Button
                                        onClick={() => handleSyncById(String(toInternalId))}
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
                                <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                                    {formData.status_name || '-'}
                                </span>
                            )}
                        </>}
                    />

                    <div className="space-y-6">
                        {statusName === 'PROCESSING' && (
                            <Alert variant='warning' title='Transfer Order Is Being Processed'>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">
                                        Your transfer order sync is currently being processed. Please allow some time for the process to complete. <br />
                                        Click the refresh button below to check whether the data is already available.
                                    </p>
                                    <ElemRefresh />
                                </div>
                            </Alert>
                        )}

                        {statusName === 'FAILED' && (
                            <Alert variant='error' title='Failed to Sync Transfer Order'>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">
                                        {messageError || 'Unknown error occurred during synchronization.'}
                                    </p>
                                </div>
                            </Alert>
                        )}

                        {/* Transfer Order Fields */}
                        <TransferOrderFields
                            formData={formData}
                            errors={errors}
                            masterData={masterData}
                            loadingMasterData={loadingMasterData}
                            onInputChange={handleInputChange}
                            onSelectChange={handleSelectChange}
                            onDateChange={handleDateChange}

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

                            transferLocationOptions={transferLocationOptions}
                            transferLocationPagination={transferLocationPagination}
                            transferLocationInputValue={transferLocationInputValue}
                            onTransferLocationInputChange={handleTransferLocationInputChange}
                            onTransferLocationMenuScrollToBottom={handleTransferLocationMenuScrollToBottom}
                            selectedTransferLocation={selectedTransferLocation}
                            onTransferLocationChange={(opt) => {
                                setSelectedTransferLocation(opt);
                                handleSelectChange('transferlocation', opt ? Number(opt.value) : null);
                                handleSelectChange('transferlocation_name', opt?.label || '');
                            }}

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

                            employeeOptions={employeeOptions}
                            employeePagination={employeePagination}
                            employeeInputValue={employeeInputValue}
                            onEmployeeInputChange={handleEmployeeInputChange}
                            onEmployeeMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                            selectedEmployee={selectedEmployee}
                            onEmployeeChange={(opt) => {
                                setSelectedEmployee(opt);
                                handleSelectChange('employee', opt?.data?.employee_id_netsuite ?? null);
                                handleSelectChange('employee_name', opt?.label || '');
                            }}

                            logisticVendorOptions={logisticVendorOptions}
                            logisticVendorPagination={logisticVendorPagination}
                            logisticVendorInputValue={logisticVendorInputValue}
                            onLogisticVendorInputChange={handleLogisticVendorInputChange}
                            onLogisticVendorMenuScrollToBottom={handleLogisticVendorMenuScrollToBottom}
                            selectedLogisticVendor={selectedLogisticVendor}
                            onLogisticVendorChange={(opt) => {
                                setSelectedLogisticVendor(opt);
                                handleSelectChange('logistic_vendor', opt ? Number(opt.value) : null);
                                handleSelectChange('logistic_vendor_name', opt?.label || '');
                            }}

                            customerOptions={customerOptions}
                            customerPagination={customerPagination}
                            customerInputValue={customerInputValue}
                            onCustomerInputChange={handleCustomerInputChange}
                            onCustomerMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                            selectedCustomer={selectedCustomer}
                            onCustomerChange={(opt) => {
                                setSelectedCustomer(opt);
                                handleSelectChange('customer', opt ? Number(opt.value) : null);
                                handleSelectChange('customer_name', opt?.label || '');
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
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('files')}
                                        className={`py-2 px-1 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors ${
                                            activeTab === 'files'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Files
                                    </button>
                                </nav>
                            </div>

                            <div className='bg-white rounded-b-2xl shadow-sm'>
                                {/* Items Tab */}
                                {activeTab === 'items' && (
                                    <>
                                    <div className="px-6 pt-4">
                                        <div className="mb-4">
                                            <Label>Filter Item Type</Label>
                                            <CustomSelect
                                                name="item_type_filter"
                                                placeholder="All Item Types"
                                                value={itemTypeFilter.length > 0 ? itemTypeOptions.find((o: any) => o.value === itemTypeFilter[0]) : null}
                                                options={itemTypeOptions}
                                                isClearable={true}
                                                onChange={(option: any) => {
                                                    handleItemTypeChange(option);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <TransferOrderItemFields
                                        formData={formData}
                                        errors={errors}
                                        onAddItem={handleAddItem}
                                        onRemoveItem={handleRemoveItem}
                                        onUpdateItem={handleUpdateItem}
                                        isEditing

                                        itemOptions={itemOptions}
                                        itemPagination={itemPagination}
                                        itemInput={itemInputValue}
                                        onItemInputChange={handleItemInputChange}
                                        onItemMenuScrollToBottom={handleItemMenuScrollToBottom}
                                    />
                                    </>
                                )}

                                {activeTab === 'files' && (
                                    <FilesTab
                                        toId={String(toInternalId)}
                                        fileList={formData?.files || []}
                                        pendingFiles={[]}
                                        deletedFileUrls={[]}
                                        isLoading={loadingMasterData}
                                        onAddFiles={handleAddFiles}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <FormActions
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            cancelRoute="/netsuite/transfer-orders"
                            submitText="Update Transfer Order"
                            submittingText="Updating..."
                        >
                            {(statusName === 'FAILED' || statusName === 'PROCESSING') && (
                                <ElemRefresh />
                            )}
                        </FormActions>
                    </div>
                </>)}
            </div>
        </>
    );
}
