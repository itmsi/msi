import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { SalesOrderFormData } from '../types/salesOrder';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';
import { useEffect, useRef, useState } from 'react';
import { convertDateToTanggal, formatDate, formatTanggal, parseTanggalToDate } from '@/helpers/generalHelper';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';
import { SOInvoiceSummary } from './SalesOrderItemFields';

interface SOFormFieldsProps {
    formData: SalesOrderFormData;
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

export default function SalesOrderFields({
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
}: SOFormFieldsProps) {

    const FieldError = ({ field }: { field: string }) =>
        errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

    const fieldTransDate = {
        name: "trandate",
        label: "Transaction Date",
        required: true,
    };
    const fieldStartDate = {
        name: "startdate",
        label: "Start Date",
    };
    const fieldEndDate = {
        name: "enddate",
        label: "End Date",
    };
    const renderSimpleDate = (field: any) => {
        const [showDatePicker, setShowDatePicker] = useState(false);
        const datePickerRef = useRef<HTMLDivElement>(null);
            
        const fieldValue = formData[field.name as keyof SalesOrderFormData];
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
                {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                        currentDate ? formatDate(currentDate.toISOString()) : (field.placeholder || `-`)
                    }</p>
                    ) : (<>
                        <div className="relative" ref={datePickerRef}>
                            <div 
                                className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500 ${
                                    errors[field.name as keyof SalesOrderFormData] ? 'border-red-500' : 'border-gray-300'
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
                                        // date={currentDate ? (parseTanggalToDate(currentDate) ?? new Date()) : new Date()}
                                        date={currentDate || new Date()}
                                        onChange={handleDateChange}
                                        color="#3b82f6"
                                        // minDate={field.minDate || new Date()}
                                    />
                                </div>
                            )}
                        </div>
                        {errors[field.name as keyof SalesOrderFormData] && (
                            <p className="mt-1 text-xs text-red-500">{errors[field.name as keyof SalesOrderFormData]}</p>
                        )}
                        </>
                    )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 mb-6">
            <div className={`space-y-6 gap-2 ${(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? 'md:col-span-2' : 'md:col-span-3'}`}>

                {/* Primary Information */}
                <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Custom Form */}
                        <div>
                            <Label htmlFor="so-customform">Custom Form</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">Sales Order</p>
                            ) : (<>
                                <CustomSelect
                                    id="so-customform"
                                    name="customform"
                                    value={
                                        masterData?.customforms && formData.customform
                                            ? { 
                                                value: formData.customform, 
                                                label: masterData.customforms.find(o => Number(o.id) === Number(formData.customform))?.name || '' 
                                            }
                                            : null
                                    }
                                    onChange={(opt) => onSelectChange('customform', opt?.value ? Number(opt.value) : null)}
                                    options={
                                        masterData?.customforms
                                            ? masterData.customforms.map(o => ({ value: o.id, label: o.name }))
                                            : []
                                    }
                                    placeholder="Pilih Form"
                                    isClearable={false}
                                    isSearchable={true}
                                    isLoading={loadingMasterData}
                                    disabled={true}
                                />
                            </>)}
                        </div>

                        {/* Start Date */}
                        {renderSimpleDate(fieldStartDate)}

                        {/* Customer (entity) */}
                        <div>
                            <Label htmlFor="so-entity">Customer <span className="text-red-500">*</span></Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{selectedCustomer?.label || '-'}</p>
                            ) : (<>
                                <CustomAsyncSelect
                                    name="entity"
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
                                    placeholder="Select Customer..."
                                    error={errors.entity}
                                />
                                <FieldError field="entity" />
                            </>)}
                        </div>
                        
                        {/* End Date */}
                        {renderSimpleDate(fieldEndDate)}

                        {/* Transaction Date */}
                        {renderSimpleDate(fieldTransDate)}

                        {/* Terms */}
                        <div>
                            <Label htmlFor="so-terms">Terms</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{selectedTerm?.label || '-'}</p>
                            ) : (<>
                            <CustomAsyncSelect
                                name="terms"
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
                            </>)}
                        </div>

                        {/* Other Ref Num */}
                        <div>
                            <Label htmlFor="so-otherrefnum">Purchase Order Number</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.otherrefnum}</p>
                            ) : (<>
                            <InputField
                                id="so-otherrefnum"
                                name="otherrefnum"
                                type="text"
                                value={formData.otherrefnum}
                                onChange={onInputChange}
                                placeholder="Enter reference number"
                            />
                            </>)}
                        </div>
                        {/* Currency */}
                        <div className="hidden">
                            <Label htmlFor="so-currency">Currency <span className="text-red-500">*</span></Label>
                            <CustomSelect
                                id="so-currency"
                                name="currency"
                                value={
                                    masterData?.currencys && formData.currency
                                        ? { 
                                            value: formData.currency, 
                                            label: masterData.currencys.find(o => Number(o.id) === Number(formData.currency))?.name || '' 
                                        }
                                        : null
                                }
                                onChange={(opt) => onSelectChange('currency', opt?.value ? Number(opt.value) : null)}
                                options={
                                    masterData?.currencys
                                        ? masterData.currencys.map(o => ({ value: o.id, label: o.name }))
                                        : []
                                }
                                placeholder="Pilih Currency"
                                isClearable={false}
                                isSearchable={true}
                                isLoading={loadingMasterData}
                            />
                            <FieldError field="currency" />
                        </div>

                        {/* Memo */}
                        <div>
                            <Label htmlFor="so-memo">Memo / Notes</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.memo}</p>
                            ) : (<>
                            <InputField
                                id="so-memo"
                                name="memo"
                                value={formData.memo}
                                onChange={onInputChange}
                                placeholder="Catatan untuk Sales Order ini"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            </>)}
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        
                        {/* Bank */}
                        <div>
                            <Label htmlFor="so-terms">Bank Payment</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p  className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center flex-1 flex-wrap gap-2">
                                {formData.custbody_msi_bank_payment_so_name.map((bankName, index) => (
                                    
                                        <span className="bg-[#eff6ff] py-1 px-2 text-[#1e40af] rounded-md border border-1 border-[#bbc7f0] text-sm" key={index}>{bankName}</span>
                                ))}
                                </p>
                            ) : (<>
                            <CustomAsyncSelect
                                name="bank"
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
                            </>)}
                        </div>

                        {/* Quotation No */}
                        <div>
                            <Label htmlFor="so-quotation">Quotation No (IEC)</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.memo}</p>
                            ) : (<>
                            <InputField
                                id="so-quotation"
                                name="custbody_msi_quotation_no_iec"
                                type="text"
                                value={formData.custbody_msi_quotation_no_iec}
                                onChange={onInputChange}
                                placeholder="Nomor Quotation"
                            />
                            </>)}
                        </div>
                    </div>
                </div>

                {/* Classification */}
                <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {/* Subsidiary */}
                        <div>
                            <Label htmlFor="so-subsidiary">Subsidiary <span className="text-red-500">*</span></Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.subsidiary_name}</p>
                            ) : (<>
                            <CustomSelect
                                id="so-subsidiary"
                                name="subsidiary"
                                disabled={!formData.entity}
                                value={
                                    masterData?.subsidiarys && formData.subsidiary
                                        ? { 
                                            value: formData.subsidiary, 
                                            label: masterData.subsidiarys.find(o => Number(o.id) === Number(formData.subsidiary))?.name || '' 
                                        }
                                        : null
                                }
                                onChange={(opt) => {
                                    onSelectChange('subsidiary', opt?.value ? Number(opt.value) : null);
                                    onSelectChange('location', null);
                                    onSelectChange('location_name', '');
                                    onSelectChange('department', null);
                                    onSelectChange('department_name', '');
                                    onSelectChange('class', null);
                                    onSelectChange('class_name', '');
                                }}
                                options={
                                    masterData?.subsidiarys
                                        ? masterData.subsidiarys.map(o => ({ value: o.id, label: o.name }))
                                        : []
                                }
                                placeholder={!formData.entity ? "Pilih Customer dahulu" : "Pilih Subsidiary"}
                                isClearable={false}
                                isSearchable={true}
                                isLoading={loadingMasterData}
                            />
                            <FieldError field="subsidiary" />
                            </>)}
                        </div>

                        {/* Location */}
                        <div>
                            <Label htmlFor="so-location">Location <span className="text-red-500">*</span></Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.location_name}</p>
                            ) : (<>
                            <CustomAsyncSelect
                                name="location"
                                disabled={!formData.subsidiary}
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
                                placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Location"}
                            />
                            <FieldError field="location" />
                            </>)}
                        </div>

                        {/* Department */}
                        <div>
                            <Label htmlFor="so-department">Department <span className="text-red-500">*</span></Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.department_name}</p>
                            ) : (<>
                            <CustomAsyncSelect
                                name="department"
                                disabled={!formData.subsidiary}
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
                                placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Department"}
                            />
                            <FieldError field="department" />
                            </>)}
                        </div>

                        {/* Class */}
                        <div>
                            <Label htmlFor="so-class">Class</Label>
                            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) ? (
                                <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{formData.class_name}</p>
                            ) : (<>
                            <CustomAsyncSelect
                                name="class"
                                disabled={!formData.subsidiary}
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
                                placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Class"}
                            />
                            <FieldError field="class" />
                            </>)}
                        </div>
                    </div>
                </div>
                {/* {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) && ( */}
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
            {/* {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) || (formData.custbody_me_approval_status === 1 && formData.nextapprover !== null) && ( */}
            {(formData.custbody_me_approval_status === 2 || formData.custbody_me_approval_status === 3) && (
                <div className="sticky top-0 self-start lg:px-4 mb-6">
                    <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <SOInvoiceSummary items={formData.items} currency={formData.currency_name || ''} />
                    </div>
                </div>
            )}
        </div>
    );
}
