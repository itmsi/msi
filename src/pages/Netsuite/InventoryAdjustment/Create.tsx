import { useEffect, useState } from 'react';
import PageMeta from '@/components/common/PageMeta';
import PageHeader from '@/components/common/PageHeader';
import FormActions from '@/components/form/FormActions';
import { LoadingOverlay } from '@/components/common/Loading';
import { useInventoryAdjustmentCreate } from './hooks/useInventoryAdjustmentCreate';
import InventoryAdjustmentFormFields from './components/InventoryAdjustmentFormFields';
import InventoryAdjustmentFormItemFields from './components/InventoryAdjustmentFormItemFields';
import { useSubsidiarySelect } from '@/hooks/useSubsidiarySelect';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePODepartmentSelect } from '@/hooks/usePODepartmentSelect';
import { usePOClassSelect } from '@/hooks/usePOClassSelect';
import { useSOCustomerSelect } from '@/hooks/useSOCustomerSelect';
import { usePOItemsSelect } from '@/hooks/usePOItemsSelect';
import { getProfile } from '@/helpers/generalHelper';

const listRoute = '/netsuite/inventory-adjustments';

export default function Create() {
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const {
        isSubmitting,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleAddLine,
        handleRemoveLine,
        handleUpdateLine,
        handleSubmit,
    } = useInventoryAdjustmentCreate();

    const subsidiaryId = formData.subsidiary ? Number(formData.subsidiary) : undefined;

    // Subsidiary select
    const { subsidiaryOptions, loading: subsidiaryLoading, loadSubsidiaries, initializeOptions: initSubsidiaryOptions } = useSubsidiarySelect();
    const [selectedSubsidiary, setSelectedSubsidiary] = useState<any>(null);
    const [subsidiaryInputValue, setSubsidiaryInputValue] = useState('');

    useEffect(() => {
        initSubsidiaryOptions();
    }, [initSubsidiaryOptions]);

    // Adjustment Location select (header)
    const {
        POLocationOptions: locationOptions,
        pagination: locationPagination,
        inputValue: locationInputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom: handleLocationMenuScrollToBottom,
        initializeOptions: initLocationOptions,
        resetLocationOptions,
    } = usePOLocationSelect(30, false, subsidiaryId);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    // Location select untuk item lines (instance terpisah)
    const {
        POLocationOptions: itemLocationOptions,
        pagination: itemLocationPagination,
        inputValue: itemLocationInputValue,
        handleInputChange: handleItemLocationInputChange,
        handleMenuScrollToBottom: handleItemLocationMenuScrollToBottom,
        initializeOptions: initItemLocationOptions,
        resetLocationOptions: resetItemLocationOptions,
    } = usePOLocationSelect(30, false, subsidiaryId);

    // Department select
    const {
        PODepartmentOptions: departmentOptions,
        pagination: departmentPagination,
        inputValue: departmentInputValue,
        handleInputChange: handleDepartmentInputChange,
        handleMenuScrollToBottom: handleDepartmentMenuScrollToBottom,
        initializeOptions: initDepartmentOptions,
        resetDepartmentOptions,
    } = usePODepartmentSelect(30, subsidiaryId);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

    // Class select
    const {
        POClassOptions: classOptions,
        pagination: classPagination,
        inputValue: classInputValue,
        handleInputChange: handleClassInputChange,
        handleMenuScrollToBottom: handleClassMenuScrollToBottom,
        initializeOptions: initClassOptions,
        resetClassOptions,
    } = usePOClassSelect(30, subsidiaryId, profileSSOId);
    const [selectedClass, setSelectedClass] = useState<any>(null);

    // Customer select
    const {
        SOCustomerOptions: customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initCustomerOptions,
    } = useSOCustomerSelect(30);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Item select (untuk item lines)
    const {
        POItemsOptions: itemOptions,
        pagination: itemPagination,
        inputValue: itemInputValue,
        handleInputChange: handleItemInputChange,
        handleMenuScrollToBottom: handleItemMenuScrollToBottom,
        initializeOptions: initItemOptions,
    } = usePOItemsSelect(20);

    useEffect(() => {
        initLocationOptions();
        initItemLocationOptions();
        initDepartmentOptions();
        initClassOptions();
        initCustomerOptions();
        initItemOptions();
    }, [initLocationOptions, initItemLocationOptions, initDepartmentOptions, initClassOptions, initCustomerOptions, initItemOptions]);

    // Reset pilihan lokasi/dept/class saat subsidiary berubah
    const [prevSubsidiaryId, setPrevSubsidiaryId] = useState<number | undefined>(undefined);
    useEffect(() => {
        if (subsidiaryId !== undefined && prevSubsidiaryId !== undefined && subsidiaryId !== prevSubsidiaryId) {
            resetLocationOptions();
            resetItemLocationOptions();
            resetDepartmentOptions();
            resetClassOptions();
            setSelectedLocation(null);
            setSelectedDepartment(null);
            setSelectedClass(null);
        }
        setPrevSubsidiaryId(subsidiaryId);
    }, [subsidiaryId]);

    return (
        <>
            <PageMeta
                title="Create Inventory Adjustment - Motor Sights International"
                description="Create new NetSuite Inventory Adjustment"
                image="/motor-sights-international.png"
            />

            <div className="mx-auto px-0">
                <PageHeader
                    title="Create Inventory Adjustment"
                    backPath={listRoute}
                />

                {isSubmitting && (
                    <LoadingOverlay message="Menyimpan Inventory Adjustment..." />
                )}

                <div className="space-y-6">
                    <InventoryAdjustmentFormFields
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onSelectChange={handleSelectChange}

                        subsidiary={{
                            options: subsidiaryOptions,
                            pagination: { loading: subsidiaryLoading },
                            inputValue: subsidiaryInputValue,
                            onInputChange: async (search: string) => {
                                setSubsidiaryInputValue(search);
                                const options = await loadSubsidiaries(search);
                                return options || [];
                            },
                            onMenuScrollToBottom: () => {},
                            selected: selectedSubsidiary,
                            onChange: (option: any) => {
                                setSelectedSubsidiary(option);
                                handleSelectChange('subsidiary', option ? Number(option.value) : null);
                                handleSelectChange('subsidiary_name', option?.label || '');
                            },
                        }}

                        adjLocation={{
                            options: locationOptions,
                            pagination: locationPagination,
                            inputValue: locationInputValue,
                            onInputChange: handleLocationInputChange,
                            onMenuScrollToBottom: handleLocationMenuScrollToBottom,
                            selected: selectedLocation,
                            onChange: (option: any) => {
                                setSelectedLocation(option);
                                handleSelectChange('adjlocation', option ? Number(option.value) : null);
                                handleSelectChange('adjlocation_name', option?.label || '');
                            },
                        }}

                        department={{
                            options: departmentOptions,
                            pagination: departmentPagination,
                            inputValue: departmentInputValue,
                            onInputChange: handleDepartmentInputChange,
                            onMenuScrollToBottom: handleDepartmentMenuScrollToBottom,
                            selected: selectedDepartment,
                            onChange: (option: any) => {
                                setSelectedDepartment(option);
                                handleSelectChange('department', option ? Number(option.value) : null);
                                handleSelectChange('department_name', option?.label || '');
                            },
                        }}

                        classField={{
                            options: classOptions,
                            pagination: classPagination,
                            inputValue: classInputValue,
                            onInputChange: handleClassInputChange,
                            onMenuScrollToBottom: handleClassMenuScrollToBottom,
                            selected: selectedClass,
                            onChange: (option: any) => {
                                setSelectedClass(option);
                                handleSelectChange('class', option ? Number(option.value) : null);
                                handleSelectChange('class_name', option?.label || '');
                            },
                        }}

                        customer={{
                            options: customerOptions,
                            pagination: customerPagination,
                            inputValue: customerInputValue,
                            onInputChange: handleCustomerInputChange,
                            onMenuScrollToBottom: handleCustomerMenuScrollToBottom,
                            selected: selectedCustomer,
                            onChange: (option: any) => {
                                setSelectedCustomer(option);
                                handleSelectChange('customer', option ? Number(option.value) : null);
                                handleSelectChange('customer_name', option?.label || '');
                            },
                        }}
                    />

                    <div className="bg-white rounded-2xl shadow-sm">
                        <InventoryAdjustmentFormItemFields
                            formData={formData}
                            errors={errors}
                            onAddLine={handleAddLine}
                            onRemoveLine={handleRemoveLine}
                            onUpdateLine={handleUpdateLine}

                            item={{
                                options: itemOptions,
                                pagination: itemPagination,
                                inputValue: itemInputValue,
                                onInputChange: handleItemInputChange,
                                onMenuScrollToBottom: handleItemMenuScrollToBottom,
                            }}
                            location={{
                                options: itemLocationOptions,
                                pagination: itemLocationPagination,
                                inputValue: itemLocationInputValue,
                                onInputChange: handleItemLocationInputChange,
                                onMenuScrollToBottom: handleItemLocationMenuScrollToBottom,
                            }}
                            department={{
                                options: departmentOptions,
                                pagination: departmentPagination,
                                inputValue: departmentInputValue,
                                onInputChange: handleDepartmentInputChange,
                                onMenuScrollToBottom: handleDepartmentMenuScrollToBottom,
                            }}
                            classField={{
                                options: classOptions,
                                pagination: classPagination,
                                inputValue: classInputValue,
                                onInputChange: handleClassInputChange,
                                onMenuScrollToBottom: handleClassMenuScrollToBottom,
                            }}
                        />
                    </div>

                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute={listRoute}
                        submitText="Create Inventory Adjustment"
                        submittingText="Creating..."
                    />
                </div>
            </div>
        </>
    );
}
