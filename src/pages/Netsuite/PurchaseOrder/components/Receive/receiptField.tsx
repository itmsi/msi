import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { formatTanggal, handleKeyPress, parseTanggalToDate, convertDateToTanggal } from '@/helpers/generalHelper';
import React from 'react'
import { ItemReceiptPayload, MasterDataFormFieldItems, PODetailData } from '../../types/purchaseorder';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import TextArea from '@/components/form/input/TextArea';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { 
    getPrimaryInfoFields, 
    getClassificationInfoFields, 
    // getInterCompanyManageFields 
} from './FieldForm';
import { POVendorSelectOption, POVendorPaginationState } from '@/hooks/usePOVendorSelect';
import { POLocationSelectOption, POLocationPaginationState } from '@/hooks/usePOLocationSelect';
import { POClassPaginationState, POClassSelectOption } from '@/hooks/usePOClassSelect';
import { PODepartmentPaginationState } from '@/hooks/usePODepartmentSelect';
import { PODepartmentSelectOption } from '@/hooks/usePODepartmentSelect';
import { POTermSelectOption } from '@/hooks/usePOTermSelect';

interface POFormFieldsProps {
    formData: ItemReceiptPayload;
    poDetail?: PODetailData | null;
    modeEdit?: boolean;
    errors: Record<string, string>;
    masterData?: MasterDataFormFieldItems | null;
    loadingMasterData?: boolean;
    subsidiaryId?: number | null; // Tambahan prop untuk subsidiary_id
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange?: (name: string, value: string) => void; // Add date change handler
    // Receive status edit
    editReceive?: boolean;
    // Vendor Select Props
    vendorOptions?: POVendorSelectOption[];
    vendorPagination?: POVendorPaginationState;
    vendorInputValue?: string;
    onVendorInputChange?: (inputValue: string) => Promise<POVendorSelectOption[]>;
    onVendorMenuScrollToBottom?: () => void;
    selectedVendor?: POVendorSelectOption | null;
    onVendorChange?: (option: POVendorSelectOption | null) => void;
    vendorError?: string;
    // Terms Select Props
    termOptions?: POTermSelectOption[];
    termPagination?: POVendorPaginationState;
    termInputValue?: string;
    onTermInputChange?: (inputValue: string) => Promise<POTermSelectOption[]>;
    onTermMenuScrollToBottom?: () => void;
    selectedTerm?: POTermSelectOption | null;
    onTermChange?: (option: POTermSelectOption | null) => void;
    termError?: string;
    // Location Select Props
    locationOptions?: POLocationSelectOption[];
    locationPagination?: POLocationPaginationState;
    locationInputValue?: string;
    onLocationInputChange?: (inputValue: string) => Promise<POLocationSelectOption[]>;
    onLocationMenuScrollToBottom?: () => void;
    selectedLocation?: POLocationSelectOption | null;
    onLocationChange?: (option: POLocationSelectOption | null) => void;
    locationError?: string;
    // Class Select Props
    classOptions?: POClassSelectOption[]; // Tambahkan props untuk class options
    classPagination?: POClassPaginationState;
    classInputValue?: string;
    onClassInputChange?: (inputValue: string) => Promise<POClassSelectOption[]>;
    onClassMenuScrollToBottom?: () => void;
    selectedClass?: POClassSelectOption | null;
    onClassChange?: (option: POClassSelectOption | null) => void;
    classError?: string;
    // Department Select Props
    departmentOptions?: PODepartmentSelectOption[]; // Tambahkan props untuk department options
    departmentPagination?: PODepartmentPaginationState;
    departmentInputValue?: string;
    onDepartmentInputChange?: (inputValue: string) => Promise<PODepartmentSelectOption[]>;
    onDepartmentMenuScrollToBottom?: () => void;
    selectedDepartment?: PODepartmentSelectOption | null;
    onDepartmentChange?: (option: PODepartmentSelectOption | null) => void;
    departmentError?: string;
}

const receiveFields: React.FC<POFormFieldsProps> = ({
    formData,
    poDetail,
    errors,
    masterData,
    subsidiaryId,
    onInputChange,
    onSelectChange,
    onDateChange,
    // Location props
    locationOptions = [],
    locationPagination = { page: 1, hasMore: true, loading: false },
    locationInputValue = '',
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    selectedLocation,
    onLocationChange,
    locationError,
    // Class props
    classOptions = [],
    classPagination = { page: 1, hasMore: true, loading: false },
    classInputValue = '',
    onClassInputChange,
    onClassMenuScrollToBottom,
    selectedClass,
    onClassChange,
    classError,
    // Department props
    departmentOptions = [],
    departmentPagination = { page: 1, hasMore: true, loading: false },
    departmentInputValue = '',
    onDepartmentInputChange,
    onDepartmentMenuScrollToBottom,
    selectedDepartment,
    onDepartmentChange,
    departmentError
}) => {
    // Get computed field configurations
    // Gabungkan formData (editable) dengan data PO read-only dari poDetail
    const mergedFormData: any = {
        ...formData,
        currency: poDetail?.currency_id,
        subsidiary: poDetail?.subsidiary,
        vendor_name: poDetail?.vendor_name,
        terms_display: poDetail?.terms_display,
        approvalstatus: poDetail?.approvalstatus,
        nextapprover: poDetail?.nextapprover,
        class_name: poDetail?.class_display,
    };
    console.log ({poDetail})
    const primaryFields = getPrimaryInfoFields(masterData || undefined);
    const classificationFields = getClassificationInfoFields(
        masterData || undefined, 
        subsidiaryId ? Number(subsidiaryId) : undefined
    );
    // const interCompanyFields = getInterCompanyManageFields();
    const renderInput = (
        name: string,
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false,
        disabled: boolean = false
    ) => {
        return (
            <div>
                <Label>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                {(disabled) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                        String(mergedFormData[name]) || '-'
                    }</p>
                ) : <>
                    <Input
                        type={type}
                        name={name}
                        value={String(mergedFormData[name]) ?? ''}
                        onKeyPress={type === 'number' ? handleKeyPress : undefined}
                        onChange={onInputChange}
                        className={`w-full px-3 py-2 ${
                            errors[name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                        min={type === 'number' ? "1" : undefined}
                    />
                    {errors[name] && (
                        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                    )}
                </>}
            </div>
        );
    };
    const renderSelect = (
        name: string,
        label: string,
        options: Array<{label: string, value: string}>,
        placeholder?: string,
        required: boolean = false,
        isClearable: boolean = true,
        isSearchable: boolean = true,
        disabled: boolean = false
    ) => {
        return (
            <div>
                <Label>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                {(disabled) ? (
                    <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                        options.find(option => String(option.value) === String(mergedFormData[name] ?? ''))?.label || '-'
                    }</p>
                ) : <>
                <CustomSelect
                    options={options}
                    value={options.find(option => String(option.value) === String(mergedFormData[name] ?? '')) || null}
                    onChange={(option) => onSelectChange(name, option?.value || '')}
                    placeholder={placeholder || `Pilih ${label.toLowerCase()}`}
                    isClearable={isClearable}
                    isSearchable={isSearchable}
                    className="font-secondary"
                    error={errors[name]}
                    disabled={disabled}
                />
                {errors[name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                )}
                </>}
            </div>
        );
    };
    // Simplified date picker untuk use di renderField  
    const renderSimpleDate = (field: any) => {
        const [showDatePicker, setShowDatePicker] = React.useState(false);
        const datePickerRef = React.useRef<HTMLDivElement>(null);
        
        const fieldValue = mergedFormData[field.name];
        // Safe date parsing untuk format DD/M/YYYY
        const currentDate = fieldValue ? parseTanggalToDate(String(fieldValue)) : null;

        const handleDateChange = (date: Date | any) => {
            setShowDatePicker(false);
            // Calendar dari react-date-range mengirim Date object langsung
            const selectedDate = date instanceof Date ? date : new Date(date);
            if (onDateChange) {
                // Konversi ke format DD/M/YYYY yang konsisten dengan sistem
                const tanggalFormatted = convertDateToTanggal(selectedDate);
                onDateChange(field.name, tanggalFormatted);
            }
        };

        // Close date picker when clicking outside
        React.useEffect(() => {
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
                <div className="relative" ref={datePickerRef}>
                    <div 
                        className={`flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500 ${
                            errors[field.name] ? 'border-red-500' : 'border-gray-300'
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
                                // minDate={field.minDate || new Date()}
                            />
                        </div>
                    )}
                </div>
                {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                )}
            </div>
        );
    };
    const renderField = (field: any, disabled: boolean = false) => {
        switch (field.type) {
            case "text":
                return renderInput(
                    field.name, 
                    field.label, 
                    'text', 
                    field.placeholder,
                    field.required || false
                );

            case "textarea":
                return (
                    <div>
                        <Label>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {(mergedFormData.approvalstatus === 2 || mergedFormData.approvalstatus === 3) || (mergedFormData.approvalstatus === 1 && mergedFormData.nextapprover !== null) ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[100px] flex items-start">{
                                String((mergedFormData as any)[field.name] || '-')
                            }</p>
                        ) : (<>
                        <TextArea 
                            name={field.name}
                            value={String((mergedFormData as any)[field.name] || '')}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                const syntheticEvent = {
                                    target: {
                                        name: field.name,
                                        value: e.target.value
                                    }
                                } as React.ChangeEvent<HTMLInputElement>;
                                onInputChange(syntheticEvent);
                            }}
                            rows={9} 
                            placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[field.name] ? 'border-red-500 ' : 'border-gray-300'
                            }`}
                        />
                        {errors[field.name] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                        )}
                        </>)}
                    </div>
                );

            case "select":
                return renderSelect(
                    field.name, 
                    field.label, 
                    field.options || [], 
                    field.placeholder || `Pilih ${field.label.toLowerCase()}`, 
                    field.required || false,
                    !field.required, // isClearable based on required
                    true,   // isSearchable
                    field.disabled || false  // disabled
                );

            case "date":
                return renderSimpleDate(field);
            case "select-location":
                return (
                    <div>
                        <Label>
                            Location <span className="text-red-500">*</span>
                        </Label>
                        {(disabled) ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                                locationOptions.find(option => String(option.value) === String(formData.location ?? ''))?.label || '-'
                            }</p>
                        ) : (<>
                        <CustomAsyncSelect
                            name="location"
                            placeholder="Select location..."
                            value={selectedLocation}
                            error={locationError}
                            defaultOptions={locationOptions}
                            loadOptions={onLocationInputChange}
                            onMenuScrollToBottom={onLocationMenuScrollToBottom}
                            isLoading={locationPagination.loading}
                            noOptionsMessage={() => "No locations found"}
                            loadingMessage={() => "Loading locations..."}
                            isSearchable={true}
                            inputValue={locationInputValue}
                            onInputChange={onLocationInputChange}
                            onChange={onLocationChange}
                        />
                        {locationError && (
                            <span className="text-sm text-red-500 mt-1 block">{locationError}</span>
                        )}
                        </>)}
                    </div>
                );
            case "select-vendor":
                return (
                    <div>
                        <Label>
                            Vendor <span className="text-red-500">*</span>
                        </Label>
                        <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                            mergedFormData.vendor_name  || '-'
                        }</p>
                    </div>
                );
            case "select-class":
                return (
                    <div>
                        <Label>
                            Class <span className="text-red-500">*</span>
                        </Label>
                        {(disabled) ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                                mergedFormData.class_name  || '-'
                            }</p>
                        ) : (<>
                        <CustomAsyncSelect
                            name="classid"
                            placeholder="Select class..."
                            value={selectedClass}
                            error={classError}
                            defaultOptions={classOptions}
                            loadOptions={onClassInputChange}
                            onMenuScrollToBottom={onClassMenuScrollToBottom}
                            isLoading={classPagination.loading}
                            noOptionsMessage={() => "No classes found"}
                            loadingMessage={() => "Loading classes..."}
                            isSearchable={true}
                            inputValue={classInputValue}
                            onInputChange={onClassInputChange}
                            onChange={onClassChange}
                        />
                        {classError && (
                            <span className="text-sm text-red-500 mt-1 block">{classError}</span>
                        )}
                        </>)}
                    </div>
                );
            case "select-department":
                return (
                    <div>
                        <Label>
                            Department <span className="text-red-500">*</span>
                        </Label>
                        {(disabled) ? (
                            <p className="mt-1 text-gray-800 text-md border-0 border-b-1 rounded-none min-h-[42px] flex items-center">{
                                departmentOptions.find(option => String(option.value) === String(formData.department ?? ''))?.label || '-'
                            }</p>
                        ) : (<>
                        <CustomAsyncSelect
                            name="departmentid"
                            placeholder="Select department..."
                            value={selectedDepartment}
                            error={departmentError}
                            defaultOptions={departmentOptions}
                            loadOptions={onDepartmentInputChange}
                            onMenuScrollToBottom={onDepartmentMenuScrollToBottom}
                            isLoading={departmentPagination.loading}
                            noOptionsMessage={() => "No departments found"}
                            loadingMessage={() => "Loading departments..."}
                            isSearchable={true}
                            inputValue={departmentInputValue}
                            onInputChange={onDepartmentInputChange}
                            onChange={onDepartmentChange}
                        />
                        {departmentError && (
                            <span className="text-sm text-red-500 mt-1 block">{departmentError}</span>
                        )}
                        </>)}
                    </div>
                );
            default:
                return renderInput(
                    field.name, 
                    field.label, 
                    'text', 
                    field.placeholder,
                    field.required || false
                );
        }
    };

    return (<>
        <div className="grid grid-cols-1 md:grid-cols-3 mb-0">
            <div className={`space-y-6 gap-2 md:col-span-3`}>
                <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900 md:col-span-2">Primary Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {primaryFields.map((field) => (
                                <div key={field.name}>
                                    {renderField(field)}
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                    <h3 className="text-md font-primary-bold font-medium text-gray-900 md:col-span-2">Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classificationFields.map((field) => (
                                <div key={field.name}>
                                    {renderField(field)}
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </div>
    </>);
}

export default receiveFields

