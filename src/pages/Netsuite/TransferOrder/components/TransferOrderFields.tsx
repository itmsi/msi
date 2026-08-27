import Label from '@/components/form/Label';
import InputField from '@/components/form/input/InputField';
import Checkbox from '@/components/form/input/Checkbox';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { TransferOrderFormData } from '../types/transferOrder';
import { TOInvoiceSummary } from './TransferOrderItemFields';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';
import { useEffect, useRef, useState } from 'react';
import { convertDateToTanggal, formatTanggal, parseTanggalToDate } from '@/helpers/generalHelper';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface TOFormFieldsProps {
    formData: TransferOrderFormData;
    errors: Record<string, string>;
    masterData: MasterDataFormFieldItems | null;
    loadingMasterData: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onSelectChange: (field: string, value: any) => void;
    onDateChange: (field: string, value: string) => void;

    // Location (from) Props
    locationOptions: any[];
    locationPagination: any;
    locationInputValue: string;
    onLocationInputChange: (val: string) => Promise<any[]>;
    onLocationMenuScrollToBottom: () => void;
    selectedLocation: any;
    onLocationChange: (opt: any) => void;

    // Transfer Location (to) Props
    transferLocationOptions: any[];
    transferLocationPagination: any;
    transferLocationInputValue: string;
    onTransferLocationInputChange: (val: string) => Promise<any[]>;
    onTransferLocationMenuScrollToBottom: () => void;
    selectedTransferLocation: any;
    onTransferLocationChange: (opt: any) => void;

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

    // Employee Props
    employeeOptions: any[];
    employeePagination: any;
    employeeInputValue: string;
    onEmployeeInputChange: (val: string) => Promise<any[]>;
    onEmployeeMenuScrollToBottom: () => void;
    selectedEmployee: any;
    onEmployeeChange: (opt: any) => void;

    // Logistic Vendor Props
    logisticVendorOptions: any[];
    logisticVendorPagination: any;
    logisticVendorInputValue: string;
    onLogisticVendorInputChange: (val: string) => Promise<any[]>;
    onLogisticVendorMenuScrollToBottom: () => void;
    selectedLogisticVendor: any;
    onLogisticVendorChange: (opt: any) => void;

    // Customer Props
    customerOptions: any[];
    customerPagination: any;
    customerInputValue: string;
    onCustomerInputChange: (val: string) => Promise<any[]>;
    onCustomerMenuScrollToBottom: () => void;
    selectedCustomer: any;
    onCustomerChange: (opt: any) => void;
}

export default function TransferOrderFields({
    formData,
    masterData,
    loadingMasterData,
    onInputChange,
    onSelectChange,

    locationOptions,
    locationPagination,
    locationInputValue,
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    selectedLocation,
    onLocationChange,

    transferLocationOptions,
    transferLocationPagination,
    transferLocationInputValue,
    onTransferLocationInputChange,
    onTransferLocationMenuScrollToBottom,
    selectedTransferLocation,
    onTransferLocationChange,

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

    employeeOptions,
    employeePagination,
    employeeInputValue,
    onEmployeeInputChange,
    onEmployeeMenuScrollToBottom,
    selectedEmployee,
    onEmployeeChange,

    logisticVendorOptions,
    logisticVendorPagination,
    logisticVendorInputValue,
    onLogisticVendorInputChange,
    onLogisticVendorMenuScrollToBottom,
    selectedLogisticVendor,
    onLogisticVendorChange,

    customerOptions,
    customerPagination,
    customerInputValue,
    onCustomerInputChange,
    onCustomerMenuScrollToBottom,
    selectedCustomer,
    onCustomerChange,
    errors,
    onDateChange,
}: TOFormFieldsProps) {

    const FieldError = ({ field }: { field: string }) =>
        errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

    const renderSimpleDate = (fieldName: string, label: string, required?: boolean) => {
        const [showDatePicker, setShowDatePicker] = useState(false);
        const datePickerRef = useRef<HTMLDivElement>(null);

        const fieldValue = formData[fieldName as keyof TransferOrderFormData];
        const currentDate = fieldValue ? parseTanggalToDate(String(fieldValue)) : null;

        const handleChange = (date: Date | any) => {
            setShowDatePicker(false);
            const selectedDate = date instanceof Date ? date : new Date(date);
            const tanggalFormatted = convertDateToTanggal(selectedDate);
            onDateChange(fieldName, tanggalFormatted);
        };

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
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative" ref={datePickerRef}>
                    <div
                        className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500 ${
                            errors[fieldName] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <span className={currentDate ? "text-gray-700" : "text-gray-400"}>
                            {currentDate ? formatTanggal(String(fieldValue)) : `Pilih ${label.toLowerCase()}`}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    {showDatePicker && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            <Calendar
                                date={currentDate || new Date()}
                                onChange={handleChange}
                                color="#3b82f6"
                            />
                        </div>
                    )}
                </div>
                <FieldError field={fieldName} />
            </div>
        );
    };

    return (
        <div className="space-y-6 mb-6">

            {/* Primary Information (kiri) + Summary (kanan) — sejajar persis seperti record Transfer Order di NetSuite */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900">Primary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

                        {/* Kolom kiri: Custom Form, Date, Subsidiary, From Location, To Location, Employee */}
                        <div className="space-y-4">
                            {/* Custom Form — tidak ada di form NetSuite, dipakai internal aplikasi */}
                            <div>
                                <Label htmlFor="to-customform">Custom Form</Label>
                                <CustomSelect
                                    id="to-customform"
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
                                    disabled
                                />
                            </div>

                            {/* Transaction Date */}
                            {renderSimpleDate('trandate', 'Transaction Date', true)}

                            {/* Subsidiary */}
                            <div>
                                <Label htmlFor="to-subsidiary">Subsidiary <span className="text-red-500">*</span></Label>
                                <CustomSelect
                                    id="to-subsidiary"
                                    name="subsidiary"
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
                                        onSelectChange('transferlocation', null);
                                        onSelectChange('transferlocation_name', '');
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
                                    placeholder="Pilih Subsidiary"
                                    isClearable={false}
                                    isSearchable={true}
                                    isLoading={loadingMasterData}
                                />
                                <FieldError field="subsidiary" />
                            </div>

                            {/* Location (From) */}
                            <div>
                                <Label htmlFor="to-location">Location <span className="text-red-500">*</span></Label>
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
                                    error={errors.location}
                                />
                                <FieldError field="location" />
                            </div>

                            {/* Transfer Location (To) */}
                            <div>
                                <Label htmlFor="to-transferlocation">Transfer To Location <span className="text-red-500">*</span></Label>
                                <CustomAsyncSelect
                                    name="transferlocation"
                                    disabled={!formData.subsidiary}
                                    value={selectedTransferLocation}
                                    onChange={onTransferLocationChange}
                                    defaultOptions={transferLocationOptions}
                                    loadOptions={onTransferLocationInputChange}
                                    onMenuScrollToBottom={onTransferLocationMenuScrollToBottom}
                                    isLoading={transferLocationPagination.loading}
                                    noOptionsMessage={() => "No locations found"}
                                    loadingMessage={() => "Loading locations..."}
                                    isSearchable={true}
                                    inputValue={transferLocationInputValue}
                                    onInputChange={onTransferLocationInputChange}
                                    placeholder={!formData.subsidiary ? "Pilih Subsidiary dahulu" : "Pilih Transfer To Location"}
                                    error={errors.transferlocation}
                                />
                                <FieldError field="transferlocation" />
                            </div>

                            {/* Employee */}
                            <div>
                                <Label htmlFor="to-employee">Employee</Label>
                                <CustomAsyncSelect
                                    name="employee"
                                    value={selectedEmployee}
                                    onChange={onEmployeeChange}
                                    defaultOptions={employeeOptions}
                                    loadOptions={onEmployeeInputChange}
                                    onMenuScrollToBottom={onEmployeeMenuScrollToBottom}
                                    isLoading={employeePagination.loading}
                                    noOptionsMessage={() => "No employees found"}
                                    loadingMessage={() => "Loading employees..."}
                                    isSearchable={true}
                                    inputValue={employeeInputValue}
                                    onInputChange={onEmployeeInputChange}
                                    placeholder="Select Employee..."
                                />
                            </div>
                        </div>

                        {/* Kolom kanan: Firmed, Memo, Use Item Cost As Transfer Cost, Incoterm, Logistic Vendor */}
                        <div className="space-y-4">

                            {/* Memo */}
                            <div>
                                <Label htmlFor="to-memo">Memo / Notes</Label>
                                <InputField
                                    id="to-memo"
                                    name="memo"
                                    value={formData.memo}
                                    onChange={onInputChange}
                                    placeholder="Catatan untuk Transfer Order ini"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <Checkbox
                                id="to-firmed"
                                label="Firmed"
                                checked={formData.firmed}
                                onChange={(checked) => onSelectChange('firmed', checked)}
                            />

                            <Checkbox
                                id="to-use-item-cost"
                                label="Use Item Cost As Transfer Cost"
                                checked={formData.use_item_cost_as_transfer_cost}
                                onChange={(checked) => onSelectChange('use_item_cost_as_transfer_cost', checked)}
                            />

                            {/* Incoterm */}
                            <div>
                                <Label htmlFor="to-incoterm">Incoterm</Label>
                                <InputField
                                    id="to-incoterm"
                                    name="incoterm"
                                    type="number"
                                    value={formData.incoterm ?? ''}
                                    onChange={(e) => onSelectChange('incoterm', e.target.value ? Number(e.target.value) : null)}
                                    placeholder="Incoterm ID"
                                />
                            </div>

                            {/* Logistic Vendor */}
                            <div>
                                <Label htmlFor="to-logistic-vendor">Logistic Vendor</Label>
                                <CustomAsyncSelect
                                    name="logistic_vendor"
                                    value={selectedLogisticVendor}
                                    onChange={onLogisticVendorChange}
                                    defaultOptions={logisticVendorOptions}
                                    loadOptions={onLogisticVendorInputChange}
                                    onMenuScrollToBottom={onLogisticVendorMenuScrollToBottom}
                                    isLoading={logisticVendorPagination.loading}
                                    noOptionsMessage={() => "No vendors found"}
                                    loadingMessage={() => "Loading vendors..."}
                                    isSearchable={true}
                                    inputValue={logisticVendorInputValue}
                                    onInputChange={onLogisticVendorInputChange}
                                    placeholder="Select Logistic Vendor..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary (kotak terpisah di kanan, seperti di NetSuite; isinya pakai pola InvoiceSummary PO/SO/Quotation) */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900 mb-4">Summary</h3>
                    <TOInvoiceSummary items={formData.items} serverTotal={formData.total} />
                </div>
            </div>

            {/* Classification */}
            <div className="bg-white rounded-2xl shadow-sm space-y-6 p-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900">Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Kolom kiri: Department */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="to-department">Department <span className="text-red-500">*</span></Label>
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
                        </div>
                    </div>

                    {/* Kolom kanan: Class, Customer */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="to-class">Class</Label>
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
                        </div>

                        <div>
                            <Label htmlFor="to-customer">Customer</Label>
                            <CustomAsyncSelect
                                name="customer"
                                value={selectedCustomer}
                                onChange={onCustomerChange}
                                defaultOptions={customerOptions}
                                loadOptions={onCustomerInputChange}
                                onMenuScrollToBottom={onCustomerMenuScrollToBottom}
                                isLoading={customerPagination.loading}
                                noOptionsMessage={() => "No customers found"}
                                loadingMessage={() => "Loading customers..."}
                                isSearchable={true}
                                inputValue={customerInputValue}
                                onInputChange={onCustomerInputChange}
                                placeholder="Select Customer..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
