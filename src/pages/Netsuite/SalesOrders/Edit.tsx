import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdOutlineSync, MdVerified } from 'react-icons/md';
import { FaSave } from 'react-icons/fa';
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
import PageHeader from '@/components/common/PageHeader';
import { useSOBankSelect } from '@/hooks/useSOBankSelect';
import FilesTab from './components/tab/FilesTab';
import ModalApproval from './components/ModalApproval';
import UserNoteTab from '../PurchaseOrder/components/tabs/UserNoteTab';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    const [activeTab, setActiveTab] = useState<'items' | 'files' | 'usernotes' | 'fuelfill'>('items');


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
        handleAddFiles,
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

    useEffect(() => {
        if (initializeLocationOptions) initializeLocationOptions();
    }, [initializeLocationOptions]);

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

    useEffect(() => {
        if (initializeTermOptions) initializeTermOptions();
    }, [initializeTermOptions]);

    // Bank Select
    const {
        SOBankOptions: bankOptions,
        pagination: bankPagination,
        inputValue: bankInputValue,
        handleInputChange: handleBankInputChange,
        handleMenuScrollToBottom: handleBankMenuScrollToBottom,
        initializeOptions: initializeBankOptions,
    } = useSOBankSelect();

    const [selectedBank, setSelectedBank] = useState<any>(null);

    useEffect(() => {
        if (initializeBankOptions) initializeBankOptions();
    }, [initializeBankOptions]);

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

    useEffect(() => {
        if (initializeItemLocationOptions) initializeItemLocationOptions();
    }, [initializeItemLocationOptions]);

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

    // Initialize options
    // useEffect(() => {
    //     initializeClassOptions();
    //     initializeDeptOptions();
    //     initializeCustomerOptions();
    // }, [initializeClassOptions, initializeDeptOptions, initializeCustomerOptions]);

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
        if (!loadingDetail && formData.subsidiary) {
            setSelectedCustomer({
                label: formData.subsidiary_name || '',
                value: String(formData.subsidiary)
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
                label: formData.terms_name || '',
                value: String(formData.terms)
            });
        }
        if (!loadingDetail && formData.custbody_msi_bank_payment_so?.length) {
            const ids = formData.custbody_msi_bank_payment_so;
            const names = formData.custbody_msi_bank_payment_so_name || [];
            setSelectedBank(ids.map((id, i) => ({
                value: String(id),
                label: names[i] || String(id),
            })));
        }
    }, [loadingDetail]);

    const [isOpenApproval, setIsOpenApproval] = useState(false);
    const [selectedSoIdApproval, setSelectedSoIdApproval] = useState<string | null>(null);

    const handleApprovalOpen = (soId: string) => {
        setSelectedSoIdApproval(soId || null);
        setIsOpenApproval(true);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [selectedSoId, setSelectedSoId] = useState<string | null>(null);

    const handleApproval = (soId: string) => {
        setSelectedSoId(soId || null);
        setIsOpen(true);
    };

    const [isOpenRejected, setIsOpenRejected] = useState(false);
    const [selectedSoIdRejected, setSelectedSoIdRejected] = useState<string | null>(null);

    const handleOpenRejected = (soId: string) => {
        setSelectedSoIdRejected(soId || null);
        setIsOpenRejected(true);
    };
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
                        <PageHeader
                            title="Edit Sales Order"
                            backPath="/netsuite/sales-orders"
                            subtitle={tranid || '-'}
                            actions={ <>
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
                                    <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                                        {formData.status_name || '-'}
                                    </span>
                                )}
                            </>}
                        />

                        <div className="space-y-6">
                            {statusName === 'PROCESSING' && (
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

                            {statusName === 'FAILED' && (
                                <Alert variant='error' title='Failed to Sync Sales Order'>
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">
                                            {messageError || 'Unknown error occurred during synchronization.'}
                                        </p>
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

                                // Bank Props
                                bankOptions={bankOptions}
                                bankPagination={bankPagination}
                                bankInput={bankInputValue}
                                onBankInputChange={handleBankInputChange}
                                onBankMenuScrollToBottom={handleBankMenuScrollToBottom}
                                selectedBank={selectedBank}
                                onBankChange={(opts) => {
                                    setSelectedBank(opts);
                                    handleSelectChange('custbody_msi_bank_payment_so', opts.map(o => Number(o.value)));
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
                                            onClick={() => setActiveTab('files')}
                                            className={`py-2 px-1 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors ${
                                                activeTab === 'files'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Files
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('usernotes')}
                                            className={`py-2 px-1 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors ${
                                                activeTab === 'usernotes'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            User Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('fuelfill')}
                                            className={`py-2 px-1 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors ${
                                                activeTab === 'fuelfill'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Items Fuel Fill
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
                                        </>
                                    )}

                                    {activeTab === 'files' && (
                                        <FilesTab
                                            soId={String(soInternalId)}
                                            fileList={formData?.files || []}
                                            pendingFiles={(formData?.files || []).filter(
                                                file => !(formData?.files || []).some(
                                                    pf => (pf.fileUrl || '') === (file.fileUrl || '') &&
                                                          (pf.fileName || '') === (file.fileName || '')
                                                )
                                            )}
                                            deletedFileUrls={(formData?.files || [])
                                                .filter(pf => !(formData.files || []).some(
                                                    file => (file.fileUrl || '') === (pf.fileUrl || '') &&
                                                            (file.fileName || '') === (pf.fileName || '')
                                                ))
                                                .map(pf => pf.fileUrl)
                                            }
                                            isLoading={loadingMasterData}
                                            onAddFiles={handleAddFiles}
                                        />
                                    )}

                                    {activeTab === 'usernotes' && (
                                        <UserNoteTab
                                            noteList={formData?.user_notes || []}
                                            isLoading={loadingMasterData}
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
                                {(statusName !== 'PROCESSING') && (<>
                                    {((formData?.custbody_me_approval_status === 1 && formData.nextapprover === "") && statusName !== 'FAILED' ) && (
                                        <PermissionGate permission={["create", "update"]}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleApprovalOpen(String(soInternalId))}
                                                className="group px-6 rounded-full ring-1 ring-inset ring-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:ring-green-600"
                                                disabled={isSubmitting}
                                            >
                                                Submit Approval
                                            </Button>
                                        </PermissionGate>
                                    )}
                                    
                                    {formData?.custbody_me_approval_status === 2 && (
                                        <PermissionGate permission={["create", "update"]}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleApproval(String(soInternalId))}
                                                className="group rounded-full ring-1 ring-inset ring-[#003061] text-[#003061] hover:bg-[#003061] hover:text-white hover:ring-[#003061]"
                                                disabled={isSubmitting}
                                            >
                                                Re-Approval <MdVerified className="w-4 h-4 text-[#003061]  group-hover:text-white" />
                                            </Button>
                                        </PermissionGate>
                                    )}

                                    {formData?.custbody_me_approval_status === 3 && (
                                        <PermissionGate permission={["create", "update"]}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleOpenRejected(String(soInternalId))}
                                                className="group px-6 rounded-full ring-1 ring-inset ring-[#003061] text-[#003061] hover:bg-[#003061] hover:text-white hover:ring-[#003061]"
                                                disabled={isSubmitting}
                                            >
                                                Re-Open <MdVerified className="w-4 h-4 text-[#003061]  group-hover:text-white" />
                                            </Button>
                                        </PermissionGate>
                                    )}

                                    {/* {(((formData.custbody_me_approval_status === 1 || formData.custbody_me_approval_status === null) && (formData.nextapprover === null || formData.nextapprover === ''))) && ( */}
                                    {(formData.custbody_me_approval_status === 1) && (
                                        <PermissionGate permission={["create", "update"]}>
                                            <Button
                                                onClick={handleSubmit}
                                                className="px-6 flex items-center gap-2 rounded-full"
                                                disabled={isSubmitting || statusName === 'pending' || statusName === 'failed'}
                                            >
                                                {isSubmitting ? (<>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>) : (<>
                                                    <FaSave className={`mr-2 h-4 w-4`} /> Update Sales Order
                                                </>)}
                                            </Button>
                                        </PermissionGate>
                                    )}
                                </>)}
                                {(syncInfo?.sync_status === 'failed' || syncInfo?.sync_status === 'pending') && (
                                    <ElemRefresh />
                                )}
                            </div>
                        </div>
                    </>)}

                    {/* // MODAL REOPEN SAAT STATUS APPROVAL = APPROVED */}
                    <ModalApproval
                        isOpen={isOpenApproval}
                        onClose={() => setIsOpenApproval(false)}
                        soId={selectedSoIdApproval ? parseInt(selectedSoIdApproval) : null}
                        onSuccess={() => navigate('/netsuite/purchase-order')}
                        submit={true}
                        titleModal="Submit Approval"
                        descriptionModal="Masukkan catatan untuk proses approval"
                    />
                    {/* // MODAL REOPEN SAAT STATUS APPROVAL = APPROVED */}
                    <ModalApproval
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        soId={selectedSoId ? parseInt(selectedSoId) : null}
                        onSuccess={() => navigate('/netsuite/purchase-order')}
                        reopen={true}
                        titleModal="Re-Open Approval"
                        descriptionModal="Masukkan catatan untuk proses re-open approval"
                    />
                    {/* // MODAL RESUBMIT SAAT STATUS REJECTED */}
                    <ModalApproval
                        isOpen={isOpenRejected}
                        onClose={() => setIsOpenRejected(false)}
                        soId={selectedSoIdRejected ? parseInt(selectedSoIdRejected) : null}
                        onSuccess={() => navigate('/netsuite/purchase-order')}
                        resubmit={true}
                        titleModal="Re-Submit Approval"
                        descriptionModal="Masukkan catatan untuk proses re-submit approval"
                    />
                </div>
            </div>
        </>
    );
}
