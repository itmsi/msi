import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import FormActions from '@/components/form/FormActions';
import { LoadingOverlay } from '@/components/common/Loading';
import { useSalesOrderCreate } from './hooks/useSalesOrderCreate';
import SalesOrderFields from './components/SalesOrderFields';
import SalesOrderItemFields from './components/SalesOrderItemFields';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { useSOCustomerSelect } from '@/hooks/useSOCustomerSelect';
import { usePOTermSelect } from '@/hooks/usePOTermSelect';
import { getProfile } from '@/helpers/generalHelper';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';
import { useSOBankSelect } from '@/hooks/useSOBankSelect';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';

export default function Create() {
    const navigate = useNavigate();
    const location = useLocation();
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    // Ambil data awal dari state navigasi (jika ada dari "Make Copy")
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
    } = useSalesOrderCreate();

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

    const [selectedLocation, setSelectedLocation] = useState<any>(
        initialData?.location ? { value: String(initialData.location), label: initialData.location_name } : null
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

    // Customer Select
    const {
        SOCustomerOptions: customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions,
    } = useSOCustomerSelect(30);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(
        initialData?.entity ? { value: String(initialData.entity), label: initialData.entity_name } : null
    );

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
        itemTypeFilter,
        itemTypeOptions,
        handleItemTypeChange
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
        if (initializeBankOptions) initializeBankOptions();
    }, [initializeLocationOptions, initializeItemLocationOptions, initializeClassOptions, initializeDeptOptions, initializeCustomerOptions, initializeItemOptions, initializeTermOptions, initializeBankOptions]);

    const [prevSubsidiaryId, setPrevSubsidiaryId] = useState<number | null | undefined>(undefined);

    // Handle subsidiary change
    useEffect(() => {
        if (subsidiaryId !== undefined && prevSubsidiaryId !== undefined && subsidiaryId !== prevSubsidiaryId) {
            resetLocationOptions();
            resetItemLocationOptions();
            resetClassOptions();
            resetDepartmentOptions();
            // Reset selected values
            setSelectedLocation(null);
            setSelectedClass(null);
            setSelectedDepartment(null);
        }
        setPrevSubsidiaryId(subsidiaryId);
    }, [subsidiaryId]);

    // Populate selected options if they are in formData (for Make Copy)
    useEffect(() => {
        if (formData.entity && !selectedCustomer) {
            setSelectedCustomer({ value: String(formData.entity), label: formData.entity_name });
        }
        if (formData.location && !selectedLocation) {
            setSelectedLocation({ value: String(formData.location), label: formData.location_name });
        }
        if (formData.class && !selectedClass) {
            setSelectedClass({ value: String(formData.class), label: formData.class_name });
        }
        if (formData.department && !selectedDepartment) {
            setSelectedDepartment({ value: String(formData.department), label: formData.department_name });
        }
        if (formData.terms && !selectedTerm && masterData?.terms) {
            const term = masterData.terms.find((t: any) => Number(t.value) === formData.terms);
            if (term) setSelectedTerm(term);
        }
        if (formData.custbody_msi_bank_payment_so && !selectedBank) {
            setSelectedBank({ value: String(formData.custbody_msi_bank_payment_so), label: formData.custbody_msi_bank_payment_so });
        }
    }, [formData, masterData]);

    return (
        <>
            <PageMeta
                title="Create Sales Order - Motor Sights International"
                description="Create new NetSuite Sales Order"
                image="/motor-sights-international.png"
            />

            <div className="mx-auto px-0">
                {/* Header */}
                <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/netsuite/sales-orders')}
                            className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                        >
                            <MdKeyboardArrowLeft size={20} />
                        </Button>
                        <div className="border-l border-gray-300 h-6 mx-3"></div>
                        <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Sales Order</h1>
                    </div>
                </div>

                {isSubmitting && (
                    <LoadingOverlay message="Menyimpan Sales Order..." />
                )}

                <div className="space-y-6">
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
                            handleSelectChange('terms_name', opt?.label || '');
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
                            handleSelectChange('custbody_msi_bank_payment_so_name', opts.map(o => o.label));
                        }}
                    />

                    <div className='bg-white rounded-2xl shadow-sm'>
                        {/* Sales Order Items */}
                        <div className="px-6 pt-4">
                            <h3 className="text-lg font-primary-bold font-medium text-gray-900 mb-4">Sales Order Items</h3>
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
                    </div>

                    {/* Form Actions */}
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute="/netsuite/sales-orders"
                        submitText="Create Sales Order"
                        submittingText="Creating..."
                    />
                </div>
            </div>
        </>
    );
}


