import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { QuotationFormData, MasterDataFormFieldItems } from '../types/quotation';
import { useEffect, useRef, useState } from 'react';
import { convertDateToTanggal, formatDate, formatTanggal, parseTanggalToDate } from '@/helpers/generalHelper';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import { QuotationInvoiceSummary } from './QuotationItemFields';
import { getPrimaryInfoFields, getAdditionalInfoFields, getClassificationInfoFields } from './FieldForm';

interface QuotationFormFieldsProps {
    formData: QuotationFormData;
    errors: Record<string, string>;
    masterData: MasterDataFormFieldItems | null;
    loadingMasterData: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSelectChange: (field: string, value: any) => void;
    onDateChange: (field: string, value: string) => void;
    onAddItem: (selectedItem: any) => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (index: number, field: string, value: any) => void;

    // Location Props
    locationOptions: any[];
    locationPagination: any;
    locationInputValue: string;
    onLocationInputChange: (val: string) => Promise<any[]>;
    onLocationMenuScrollToBottom: () => void;
    selectedLocation: any;
    onLocationChange: (opt: any) => void;

    // Department Props
    deptOptions: any[];
    deptPagination: any;
    deptInputValue: string;
    onDeptInputChange: (val: string) => Promise<any[]>;
    onDeptMenuScrollToBottom: () => void;
    selectedDepartment: any;
    onDepartmentChange: (opt: any) => void;

    // Class Props
    classOptions: any[];
    classPagination: any;
    classInputValue: string;
    onClassInputChange: (val: string) => Promise<any[]>;
    onClassMenuScrollToBottom: () => void;
    selectedClass: any;
    onClassChange: (opt: any) => void;

    // Customer Props
    customerOptions: any[];
    customerPagination: any;
    customerInput: string;
    onCustomerInputChange: (val: string) => Promise<any[]>;
    onCustomerMenuScrollToBottom: () => void;
    selectedCustomer: any;
    onCustomerChange: (opt: any) => void;

    // Term Props
    termOptions: any[];
    termPagination: any;
    termInput: string;
    onTermInputChange: (val: string) => Promise<any[]>;
    onTermMenuScrollToBottom: () => void;
    selectedTerm: any;
    onTermChange: (opt: any) => void;
    termError?: string;

    // Bank Props
    bankOptions: any[];
    bankPagination: any;
    bankInput: string;
    onBankInputChange: (val: string) => Promise<any[]>;
    onBankMenuScrollToBottom: () => void;
    selectedBank: any;
    onBankChange: (opts: any[]) => void;
}

export default function QuotationFields({
    formData,
    errors,
    masterData,
    loadingMasterData,
    onInputChange,
    onSelectChange,
    onDateChange,

    locationOptions,
    locationPagination,
    locationInputValue,
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    selectedLocation,
    onLocationChange,

    deptOptions,
    deptPagination,
    deptInputValue,
    onDeptInputChange,
    onDeptMenuScrollToBottom,
    selectedDepartment,
    onDepartmentChange,

    classOptions,
    classPagination,
    classInputValue,
    onClassInputChange,
    onClassMenuScrollToBottom,
    selectedClass,
    onClassChange,

    customerOptions,
    customerPagination,
    customerInput,
    onCustomerInputChange,
    onCustomerMenuScrollToBottom,
    selectedCustomer,
    onCustomerChange,

    termOptions,
    termPagination,
    termInput,
    onTermInputChange,
    onTermMenuScrollToBottom,
    selectedTerm,
    onTermChange,
    termError,

    bankOptions,
    bankPagination,
    bankInput,
    onBankInputChange,
    onBankMenuScrollToBottom,
    selectedBank,
    onBankChange,
}: QuotationFormFieldsProps) {

    // Quotation is locked for editing once approved/rejected, or approved with an
    // approver still pending on it. A handful of fields (see `forceEditable` in
    // FieldForm.tsx) stay editable regardless.
    const isApprovedReadOnly =
        formData.custbody_me_approval_status === 2 ||
        formData.custbody_me_approval_status === 3 ||
        (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null);

    const FieldError = ({ field }: { field: string }) =>
        errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

    const renderSimpleDate = (field: any) => {
        const [showDatePicker, setShowDatePicker] = useState(false);
        const datePickerRef = useRef<HTMLDivElement>(null);

        const fieldValue = formData[field.name as keyof QuotationFormData];
        const currentDate = fieldValue ? parseTanggalToDate(String(fieldValue)) : null;

        const handleDateChange = (date: Date | any) => {
            setShowDatePicker(false);
            const selectedDate = date instanceof Date ? date : new Date(date);
            if (onDateChange) {
                const tanggalFormatted = convertDateToTanggal(selectedDate);
                onDateChange(field.name, tanggalFormatted);
            }
        };

        // Close date picker when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                    setShowDatePicker(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        return (
            <div>
                <Label>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {isApprovedReadOnly ? (
                    <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                        currentDate ? formatDate(currentDate.toISOString()) : (field.placeholder || `-`)
                    }</p>
                ) : (<>
                    <div className="relative" ref={datePickerRef}>
                        <div
                            className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500 ${errors[field.name as keyof QuotationFormData] ? 'border-red-500' : 'border-gray-300'
                                }`}
                            onClick={() => setShowDatePicker(!showDatePicker)}
                        >
                            <span className={currentDate ? "text-gray-700" : "text-gray-400"}>
                                {currentDate ? formatTanggal(String(fieldValue)) : (field.placeholder || `Pilih ${field.label.toLowerCase()}`)}
                            </span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        {showDatePicker && (
                            <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                <Calendar
                                    date={currentDate || new Date()}
                                    onChange={handleDateChange}
                                    color="#3b82f6"
                                />
                            </div>
                        )}
                    </div>
                    {errors[field.name as keyof QuotationFormData] && (
                        <p className="mt-1 text-xs text-red-500">{errors[field.name as keyof QuotationFormData]}</p>
                    )}
                </>
                )}
            </div>
        );
    };

    const renderInput = (field: any) => {
        const readOnly = isApprovedReadOnly && !field.forceEditable;
        const fieldValue = formData[field.name as keyof QuotationFormData];
        return (
            <div>
                <Label htmlFor={`quo-${field.name}`}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {readOnly ? (
                    <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">
                        {(fieldValue as any) || '-'}
                    </p>
                ) : (<>
                    <Input
                        id={`quo-${field.name}`}
                        name={field.name}
                        type={field.type === 'number' ? 'number' : 'text'}
                        min={field.type === 'number' ? field.min : undefined}
                        max={field.type === 'number' ? field.max : undefined}
                        value={(fieldValue as any) ?? ''}
                        onChange={onInputChange}
                        placeholder={field.placeholder}
                    />
                    <FieldError field={field.name} />
                </>)}
            </div>
        );
    };

    const renderSelect = (field: any) => {
        const readOnly = isApprovedReadOnly && !field.forceEditable;
        const options = field.options || [];
        const rawValue = formData[field.name as keyof QuotationFormData];
        const selectedOption = (rawValue !== null && rawValue !== undefined && rawValue !== '')
            ? options.find((o: any) => String(o.value) === String(rawValue))
            : null;

        const disabled = field.disabled || (field.dependsOn && !formData[field.dependsOn as keyof QuotationFormData]);
        const placeholder = disabled
            ? `Pilih ${field.dependsOnLabel} dahulu`
            : (field.placeholder || `Pilih ${field.label}`);

        return (
            <div>
                <Label htmlFor={`quo-${field.name}`}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {readOnly ? (
                    <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">
                        {field.readonlyDisplay || selectedOption?.label || '-'}
                    </p>
                ) : (<>
                    <CustomSelect
                        id={`quo-${field.name}`}
                        name={field.name}
                        disabled={disabled}
                        value={selectedOption || null}
                        onChange={(opt) => {
                            onSelectChange(field.name, opt?.value !== undefined && opt?.value !== null ? Number(opt.value) : null);
                            if (field.cascadeClear) {
                                field.cascadeClear.forEach((clearField: string) => {
                                    onSelectChange(clearField, null);
                                    onSelectChange(`${clearField}_name`, '');
                                });
                            }
                        }}
                        options={options}
                        placeholder={placeholder}
                        isClearable={!field.required}
                        isSearchable={true}
                        isLoading={loadingMasterData}
                    />
                    {field.showFieldError && <FieldError field={field.name} />}
                </>)}
            </div>
        );
    };

    const renderField = (field: any) => {
        switch (field.type) {
            case 'text':
            case 'number':
                return renderInput(field);

            case 'date':
                return renderSimpleDate(field);

            case 'select':
                return renderSelect(field);

            case 'select-customer': {
                const readOnly = isApprovedReadOnly && !field.forceEditable;
                const disabled = field.dependsOn && !formData[field.dependsOn as keyof QuotationFormData];
                const placeholder = disabled ? `Pilih ${field.dependsOnLabel} dahulu` : 'Select Customer...';
                return (
                    <div>
                        <Label htmlFor={`quo-${field.name}`}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {readOnly ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.customer_name || '-'}</p>
                        ) : (<>
                            <CustomAsyncSelect
                                name={field.name}
                                disabled={disabled}
                                value={selectedCustomer}
                                onChange={onCustomerChange}
                                defaultOptions={customerOptions}
                                loadOptions={onCustomerInputChange}
                                onMenuScrollToBottom={onCustomerMenuScrollToBottom}
                                isLoading={customerPagination.loading}
                                noOptionsMessage={() => "No customers found"}
                                loadingMessage={() => "Loading customers..."}
                                isSearchable={true}
                                inputValue={customerInput}
                                onInputChange={onCustomerInputChange}
                                placeholder={placeholder}
                                error={errors.entity}
                            />
                            <FieldError field="entity" />
                        </>)}
                    </div>
                );
            }

            case 'select-terms':
                return (
                    <div>
                        <Label htmlFor={`quo-${field.name}`}>{field.label}</Label>
                        {isApprovedReadOnly ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.terms_name || '-'}</p>
                        ) : (
                            <CustomAsyncSelect
                                name={field.name}
                                placeholder="Select terms..."
                                value={selectedTerm}
                                error={termError}
                                defaultOptions={termOptions}
                                loadOptions={onTermInputChange}
                                onMenuScrollToBottom={onTermMenuScrollToBottom}
                                isLoading={termPagination.loading}
                                noOptionsMessage={() => "No terms found"}
                                loadingMessage={() => "Loading terms..."}
                                isSearchable={true}
                                inputValue={termInput}
                                onInputChange={onTermInputChange}
                                onChange={onTermChange}
                            />
                        )}
                    </div>
                );

            case 'select-location': {
                const disabled = field.dependsOn && !formData[field.dependsOn as keyof QuotationFormData];
                const placeholder = disabled ? `Pilih ${field.dependsOnLabel} dahulu` : 'Pilih Location';
                return (
                    <div>
                        <Label htmlFor={`quo-${field.name}`}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {isApprovedReadOnly ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.location_name || '-'}</p>
                        ) : (<>
                            <CustomAsyncSelect
                                name={field.name}
                                disabled={disabled}
                                value={selectedLocation}
                                onChange={onLocationChange}
                                defaultOptions={locationOptions}
                                loadOptions={onLocationInputChange}
                                onMenuScrollToBottom={onLocationMenuScrollToBottom}
                                isLoading={locationPagination.loading}
                                noOptionsMessage={() => "No locations found"}
                                loadingMessage={() => "Loading locations..."}
                                isSearchable={true}
                                inputValue={locationInputValue}
                                onInputChange={onLocationInputChange}
                                placeholder={placeholder}
                            />
                            <FieldError field="location" />
                        </>)}
                    </div>
                );
            }

            case 'select-department': {
                const disabled = field.dependsOn && !formData[field.dependsOn as keyof QuotationFormData];
                const placeholder = disabled ? `Pilih ${field.dependsOnLabel} dahulu` : 'Pilih Department';
                return (
                    <div>
                        <Label htmlFor={`quo-${field.name}`}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {isApprovedReadOnly ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.department_name || '-'}</p>
                        ) : (<>
                            <CustomAsyncSelect
                                name={field.name}
                                disabled={disabled}
                                value={selectedDepartment}
                                onChange={onDepartmentChange}
                                defaultOptions={deptOptions}
                                loadOptions={onDeptInputChange}
                                onMenuScrollToBottom={onDeptMenuScrollToBottom}
                                isLoading={deptPagination.loading}
                                noOptionsMessage={() => "No departments found"}
                                loadingMessage={() => "Loading departments..."}
                                isSearchable={true}
                                inputValue={deptInputValue}
                                onInputChange={onDeptInputChange}
                                placeholder={placeholder}
                            />
                            <FieldError field="department" />
                        </>)}
                    </div>
                );
            }

            case 'select-class': {
                const disabled = field.dependsOn && !formData[field.dependsOn as keyof QuotationFormData];
                const placeholder = disabled ? `Pilih ${field.dependsOnLabel} dahulu` : 'Pilih Class';
                return (
                    <div>
                        <Label htmlFor={`quo-${field.name}`}>{field.label}</Label>
                        {isApprovedReadOnly ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.class_name || '-'}</p>
                        ) : (<>
                            <CustomAsyncSelect
                                name={field.name}
                                disabled={disabled}
                                value={selectedClass}
                                onChange={onClassChange}
                                defaultOptions={classOptions}
                                loadOptions={onClassInputChange}
                                onMenuScrollToBottom={onClassMenuScrollToBottom}
                                isLoading={classPagination.loading}
                                noOptionsMessage={() => "No classes found"}
                                loadingMessage={() => "Loading classes..."}
                                isSearchable={true}
                                inputValue={classInputValue}
                                onInputChange={onClassInputChange}
                                placeholder={placeholder}
                            />
                            <FieldError field="class" />
                        </>)}
                    </div>
                );
            }

            case 'select-bank':
                return (
                    <div>
                        <Label htmlFor={`quo-${field.name}`}>{field.label}</Label>
                        {isApprovedReadOnly ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center flex-1 flex-wrap gap-2">
                                {formData.custbody_msi_bank_payment_so_name.map((bankName, index) => (
                                    <span className="bg-[#eff6ff] py-1 px-2 text-[#1e40af] rounded-md border border-1 border-[#bbc7f0] text-sm" key={index}>{bankName}</span>
                                ))}
                            </p>
                        ) : (
                            <CustomAsyncSelect
                                name={field.name}
                                value={selectedBank}
                                onChangeMulti={onBankChange}
                                defaultOptions={bankOptions}
                                loadOptions={onBankInputChange}
                                onMenuScrollToBottom={onBankMenuScrollToBottom}
                                isLoading={bankPagination.loading}
                                noOptionsMessage={() => "No Bank Account found"}
                                loadingMessage={() => "Loading banks..."}
                                isSearchable={true}
                                inputValue={bankInput}
                                onInputChange={onBankInputChange}
                                placeholder="Pilih Bank"
                                isMulti={true}
                            />
                        )}
                    </div>
                );

            default:
                return renderInput(field);
        }
    };

    const primaryFields = getPrimaryInfoFields(masterData);
    const additionalFields = getAdditionalInfoFields(masterData);
    const classificationFields = getClassificationInfoFields(
        masterData,
        formData.subsidiary ? Number(formData.subsidiary) : undefined
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 mb-6">
            <div className={`space-y-6 gap-2 ${isApprovedReadOnly ? 'md:col-span-2' : 'md:col-span-3'}`}>

                {/* Primary Information */}
                <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {primaryFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {additionalFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Classification */}
                <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {classificationFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                </div>

                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) && (
                    <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                        <h3 className="text-md font-primary-bold font-medium text-gray-900 md:col-span-2">Approval</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className='mb-1.5 block text-sm text-gray-700'>Approval Status</p>
                                <StatusTypeBadge
                                    type={Number(formData.custbody_me_approval_status) as 1 | 2 | 3}
                                />
                            </div>
                            <div>
                                <p className='mb-1.5 block text-sm text-gray-700'>Next Approver</p>
                                <p>{formData.nextapprover || '-'}</p>
                            </div>
                            <div>
                                <p className='mb-1.5 block text-sm text-gray-700'>Created By</p>
                                <p className='break-words'>{formData.custbody_msi_createdby_api || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) && (
                <div className="sticky top-0 self-start lg:px-4 mb-6">
                    <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <QuotationInvoiceSummary items={formData.items} currency={formData.currency_name || ''} />
                    </div>
                </div>
            )}
        </div>
    );
}
