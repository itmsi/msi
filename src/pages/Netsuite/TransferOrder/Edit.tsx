import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MdOutlineSync, MdInventory2, MdReceiptLong, MdOutlineAttachFile } from 'react-icons/md';
import { TableColumn } from 'react-data-table-component';
import { PermissionGate } from '@/components/common/PermissionComponents';
import PageMeta from '@/components/common/PageMeta';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';
import { LoadingOverlay } from '@/components/common/Loading';
import { useTransferOrderEdit } from './hooks/useTransferOrderEdit';
import TransferOrderFields from './components/TransferOrderFields';
import TransferOrderItemFields, { TOInvoiceSummary } from './components/TransferOrderItemFields';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import { usePOVendorSelect } from '@/hooks/usePOVendorSelect';
import { useSOCustomerSelect } from '@/hooks/useSOCustomerSelect';
import { getProfile, formatTanggal, formatCurrencyDynamic } from '@/helpers/generalHelper';
import PageHeader from '@/components/common/PageHeader';
import FilesTab from './components/tab/FilesTab';
import FulfillmentReceiptTab from './components/tab/FulfillmentReceiptTab';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';
import FormActions from '@/components/form/FormActions';
import CustomDataTable from '@/components/ui/table';
import { TransferOrderFormItem } from './types/transferOrder';

const formatQty = (value: number | string) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;
    const [activeTab, setActiveTab] = useState<'items' | 'files' | 'fulfillmentreceipt'>('items');

    const {
        isSubmitting,
        setIsSubmitting,
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

    // TO cuma boleh diedit selagi masih "Pending Approval" di NetSuite. Begitu status berubah
    // (Pending Fulfillment, Partially Fulfilled, dst) prosesnya sudah berjalan di NetSuite —
    // record dikunci jadi view-only (gaya sama seperti Fulfillment/Receipts View) supaya data
    // yang sudah dikirim ke NetSuite nggak berubah-ubah lagi dari sisi sini.
    const isReadOnly = Boolean(formData.status_name) && formData.status_name !== 'Pending Approval';

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

    const readOnlyItemColumns: TableColumn<TransferOrderFormItem>[] = [
        {
            name: 'Item',
            selector: row => row.item_displayname || row.item_name || '-',
            cell: row => <span className="text-sm font-medium text-gray-900">{row.item_displayname || row.item_name || '-'}</span>,
            wrap: true,
            minWidth: '180px',
        },
        {
            name: 'Committed',
            selector: row => row.committed ?? 0,
            cell: row => <span className="text-sm text-center w-full block">{row.committed ?? '-'}</span>,
            center: true,
            minWidth: '100px',
        },
        {
            name: 'Picked',
            selector: row => row.picked ?? 0,
            cell: row => <span className="text-sm text-center w-full block">{row.picked ?? '-'}</span>,
            center: true,
            minWidth: '90px',
        },
        {
            name: 'Packed',
            selector: row => row.packed ?? 0,
            cell: row => <span className="text-sm text-center w-full block">{row.packed ?? '-'}</span>,
            center: true,
            minWidth: '90px',
        },
        {
            name: 'Fulfilled',
            selector: row => row.fulfilled ?? row.shipped ?? 0,
            cell: row => <span className="text-sm text-center w-full block">{row.fulfilled ?? row.shipped ?? '-'}</span>,
            center: true,
            minWidth: '100px',
        },
        {
            name: 'Received',
            selector: row => row.received ?? 0,
            cell: row => <span className="text-sm text-center w-full block">{row.received ?? '-'}</span>,
            center: true,
            minWidth: '100px',
        },
        {
            name: 'Back Ordered',
            selector: row => row.backorder ?? 0,
            cell: row => <span className="text-sm text-center w-full block">{row.backorder ?? '-'}</span>,
            center: true,
            minWidth: '110px',
        },
        {
            name: 'Quantity',
            selector: row => row.quantity || 0,
            cell: row => <span className="text-sm text-right w-full block">{formatQty(row.quantity)}</span>,
            right: true,
            minWidth: '110px',
        },
        {
            name: 'Transfer Price',
            selector: row => row.rate || 0,
            cell: row => <span className="text-sm text-right w-full block">{formatCurrencyDynamic(row.rate || 0, '')}</span>,
            right: true,
            minWidth: '130px',
        },
        {
            name: 'Units',
            selector: row => row.units || '-',
            cell: row => <span className="text-sm text-center w-full block">{row.units || '-'}</span>,
            center: true,
            minWidth: '90px',
        },
        {
            name: 'Amount',
            selector: row => row.amount || 0,
            cell: row => <span className="text-sm font-medium text-right w-full block">{formatCurrencyDynamic(row.amount || 0, '')}</span>,
            right: true,
            minWidth: '140px',
        },
        {
            name: 'Description',
            selector: row => row.description || '-',
            cell: row => <span className="text-sm text-gray-600">{row.description || '-'}</span>,
            wrap: true,
            minWidth: '200px',
        },
        {
            name: 'Expected Receipt Date',
            selector: row => row.expectedreceiptdate || '-',
            cell: row => <span className="text-sm">{row.expectedreceiptdate ? formatTanggal(row.expectedreceiptdate) : '-'}</span>,
            center: true,
            minWidth: '170px',
        },
        {
            name: 'Commitment Confirmed',
            selector: row => (row.commitment_confirmed ? 'Yes' : 'No'),
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.commitment_confirmed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {row.commitment_confirmed ? 'Yes' : 'No'}
                </span>
            ),
            center: true,
            minWidth: '170px',
        },
        {
            name: 'Order Priority',
            selector: row => row.order_priority || '-',
            cell: row => <span className="text-sm text-center w-full block">{row.order_priority || '-'}</span>,
            center: true,
            minWidth: '130px',
        },
        {
            name: 'Closed',
            selector: row => (row.closed ? 'Yes' : 'No'),
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.closed ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
                    {row.closed ? 'Closed' : 'Open'}
                </span>
            ),
            center: true,
            minWidth: '110px',
        },
    ];

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
                title={`${isReadOnly ? 'View' : 'Edit'} Transfer Order | Netsuite`}
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
                        title={isReadOnly ? 'View Transfer Order' : 'Edit Transfer Order'}
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

                        {isReadOnly ? (<>
                        {/* Read-only view (TO sudah masuk fulfillment di NetSuite) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h4 className="text-base font-semibold text-gray-900">Primary Information</h4>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Order #</dt>
                                                <dd className="mt-1 text-sm text-gray-900 font-medium">{tranid || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Date</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.trandate ? formatTanggal(formData.trandate) : '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Subsidiary</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.subsidiary_name || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">From Location</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.location_name || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">To Location</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.transferlocation_name || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Employee</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.employee_name || '-'}</dd>
                                            </div>
                                        </dl>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Firmed</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.firmed ? 'Yes' : 'No'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Memo</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.memo || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Use Item Cost As Transfer Cost</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.use_item_cost_as_transfer_cost ? 'Yes' : 'No'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Incoterm</dt>
                                                <dd className="mt-1 text-sm text-gray-900">DAP</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Logistic Vendor</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.logistic_vendor_name || '-'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h4 className="text-base font-semibold text-gray-900">Classification</h4>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Department</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.department_name || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Class</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.class_name || '-'}</dd>
                                            </div>
                                        </dl>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Customer</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.customer_name || '-'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">MSI - Created By API</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{formData.custbody_msi_createdby_api || '-'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 sticky top-0 self-start">
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h4 className="text-base font-semibold text-gray-900">Summary</h4>
                                    </div>
                                    <div className="p-6">
                                        <TOInvoiceSummary items={formData.items} serverTotal={formData.total} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        </>) : (
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
                        )}

                        <div>
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 overflow-auto">
                                <nav className="flex space-x-2 overflow-auto">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('items')}
                                        className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors flex items-center justify-center gap-2 ${
                                            activeTab === 'items'
                                                ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <MdInventory2 /> Items
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('fulfillmentreceipt')}
                                        className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors flex items-center justify-center gap-2 ${
                                            activeTab === 'fulfillmentreceipt'
                                                ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <MdReceiptLong /> Fulfillment &amp; Receipt
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('files')}
                                        className={`py-2 px-4 border-b-2 lg:min-w-auto min-w-[100px] font-medium text-md transition-colors flex items-center justify-center gap-2 ${
                                            activeTab === 'files'
                                                ? 'border-blue-500 text-blue-600 bg-white rounded-t-lg shadow-sm'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <MdOutlineAttachFile /> Files
                                    </button>
                                </nav>
                            </div>

                            <div className='bg-white rounded-b-2xl shadow-sm'>
                                {/* Items Tab */}
                                {activeTab === 'items' && (
                                    isReadOnly ? (
                                        <div className="mb-6 space-y-6 p-6">
                                            <h3 className="text-lg font-primary-bold font-medium text-gray-900">Transfer Order Items</h3>
                                            <div className="font-secondary">
                                                <CustomDataTable
                                                    columns={readOnlyItemColumns}
                                                    data={formData.items || []}
                                                    pagination={false}
                                                    responsive
                                                    highlightOnHover
                                                    striped={false}
                                                    noDataComponent={
                                                        <div className="text-center py-8 text-gray-500">No item lines found</div>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ) : (
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
                                    )
                                )}

                                {activeTab === 'fulfillmentreceipt' && (
                                    <FulfillmentReceiptTab tranid={tranid} toNetsuiteId={toInternalId ? String(toInternalId) : null} />
                                )}

                                {activeTab === 'files' && (
                                    <FilesTab
                                        toId={String(toInternalId)}
                                        fileList={formData?.files || []}
                                        pendingFiles={[]}
                                        deletedFileUrls={[]}
                                        isLoading={loadingMasterData}
                                        isSubmitting={isSubmitting}
                                        setIsSubmitting={setIsSubmitting}
                                        onAddFiles={handleAddFiles}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        {!isReadOnly && (
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
                        )}
                    </div>
                </>)}
            </div>
        </>
    );
}
