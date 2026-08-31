import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import FormActions from '@/components/form/FormActions';
import { LoadingOverlay } from '@/components/common/Loading';
import { useTransferOrderCreate } from './hooks/useTransferOrderCreate';
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
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';

export default function Create() {
    const navigate = useNavigate();
    const location = useLocation();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const initialData = location.state?.formData;

    const {
        isSubmitting,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleSubmit,
        masterData,
        loadingMasterData,
    } = useTransferOrderCreate();

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

    const [selectedLocation, setSelectedLocation] = useState<any>(
        initialData?.location ? { value: String(initialData.location), label: initialData.location_name } : null
    );

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

    const [selectedTransferLocation, setSelectedTransferLocation] = useState<any>(
        initialData?.transferlocation ? { value: String(initialData.transferlocation), label: initialData.transferlocation_name } : null
    );

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

    const [selectedClass, setSelectedClass] = useState<any>(
        initialData?.class ? { value: String(initialData.class), label: initialData.class_name } : null
    );

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

    const [selectedDepartment, setSelectedDepartment] = useState<any>(
        initialData?.department ? { value: String(initialData.department), label: initialData.department_name } : null
    );

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

    // Initialize options
    useEffect(() => {
        initializeLocationOptions();
        initializeTransferLocationOptions();
        initializeClassOptions();
        initializeDeptOptions();
        initializeItemOptions();
        setUserNetsuite(true);
        if (initializeEmployeeOptions) initializeEmployeeOptions();
        initializeLogisticVendorOptions();
        initializeCustomerOptions();
    }, [initializeLocationOptions, initializeTransferLocationOptions, initializeClassOptions, initializeDeptOptions, initializeItemOptions, initializeEmployeeOptions, initializeLogisticVendorOptions, initializeCustomerOptions]);

    const [prevSubsidiaryId, setPrevSubsidiaryId] = useState<number | null | undefined>(undefined);

    // Handle subsidiary change
    useEffect(() => {
        if (subsidiaryId !== undefined && prevSubsidiaryId !== undefined && subsidiaryId !== prevSubsidiaryId) {
            resetLocationOptions();
            resetTransferLocationOptions();
            resetClassOptions();
            resetDepartmentOptions();
            setSelectedLocation(null);
            setSelectedTransferLocation(null);
            setSelectedClass(null);
            setSelectedDepartment(null);
        }
        setPrevSubsidiaryId(subsidiaryId);
    }, [subsidiaryId]);

    // Populate selected options if they are in formData (for Make Copy)
    useEffect(() => {
        if (formData.location && !selectedLocation) {
            setSelectedLocation({ value: String(formData.location), label: formData.location_name });
        }
        if (formData.transferlocation && !selectedTransferLocation) {
            setSelectedTransferLocation({ value: String(formData.transferlocation), label: formData.transferlocation_name });
        }
        if (formData.class && !selectedClass) {
            setSelectedClass({ value: String(formData.class), label: formData.class_name });
        }
        if (formData.department && !selectedDepartment) {
            setSelectedDepartment({ value: String(formData.department), label: formData.department_name });
        }
        if (formData.employee && !selectedEmployee) {
            setSelectedEmployee({ value: String(formData.employee), label: formData.employee_name });
        }
        if (formData.logistic_vendor && !selectedLogisticVendor) {
            setSelectedLogisticVendor({ value: String(formData.logistic_vendor), label: formData.logistic_vendor_name });
        }
        if (formData.customer && !selectedCustomer) {
            setSelectedCustomer({ value: String(formData.customer), label: formData.customer_name });
        }
    }, [formData]);

    return (
        <>
            <PageMeta
                title="Create Transfer Order - Motor Sights International"
                description="Create new NetSuite Transfer Order"
                image="/motor-sights-international.png"
            />

            <div className="mx-auto px-0">
                {/* Header */}
                <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/netsuite/transfer-orders')}
                            className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                        >
                            <MdKeyboardArrowLeft size={20} />
                        </Button>
                        <div className="border-l border-gray-300 h-6 mx-3"></div>
                        <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Transfer Order</h1>
                    </div>
                </div>

                {isSubmitting && (
                    <LoadingOverlay message="Menyimpan Transfer Order..." />
                )}

                <div className="space-y-6">
                    {/* Transfer Order Fields */}
                    <TransferOrderFields
                        formData={formData}
                        errors={errors}
                        masterData={masterData}
                        loadingMasterData={loadingMasterData}
                        onInputChange={handleInputChange}
                        onSelectChange={handleSelectChange}
                        onDateChange={handleDateChange}

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

                        // Transfer Location Props
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

                        // Employee Props
                        employeeOptions={employeeOptions}
                        employeePagination={employeePagination}
                        employeeInputValue={employeeInputValue}
                        onEmployeeInputChange={handleEmployeeInputChange}
                        onEmployeeMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                        selectedEmployee={selectedEmployee}
                        onEmployeeChange={(opt) => {
                            setSelectedEmployee(opt);
                            handleSelectChange('employee', opt ? Number(opt.value) : null);
                            handleSelectChange('employee_name', opt?.label || '');
                        }}

                        // Logistic Vendor Props
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

                        // Customer Props
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

                    <div className='bg-white rounded-2xl shadow-sm'>
                        {/* Transfer Order Items */}
                        <div className="px-6 pt-4">
                            <h3 className="text-lg font-primary-bold font-medium text-gray-900 mb-4">Transfer Order Items</h3>
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

                            // Item Select Props
                            itemOptions={itemOptions}
                            itemPagination={itemPagination}
                            itemInput={itemInputValue}
                            onItemInputChange={handleItemInputChange}
                            onItemMenuScrollToBottom={handleItemMenuScrollToBottom}
                        />
                    </div>

                    {/* Form Actions */}
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute="/netsuite/transfer-orders"
                        submitText="Create Transfer Order"
                        submittingText="Creating..."
                    />
                </div>
            </div>
        </>
    );
}
