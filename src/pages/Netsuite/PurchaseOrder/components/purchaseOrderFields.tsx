import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { formatDate, handleKeyPress } from '@/helpers/generalHelper';
import React from 'react'
import { PurchaseOrderForm, MasterDataFormFieldItems } from '../types/purchaseorder';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import TextArea from '@/components/form/input/TextArea';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { 
    getPrimaryInfoFields, 
    getAdditionalInfoFields, 
    getClassificationInfoFields, 
    getInterCompanyManageFields 
} from './FieldForm';
import { POVendorSelectOption, POVendorPaginationState } from '@/hooks/usePOVendorSelect';
import { POLocationSelectOption, POLocationPaginationState } from '@/hooks/usePOLocationSelect';
import { StatusTypeBadge } from '@/components/ui/badge/StatusBadge';

interface POFormFieldsProps {
    formData: PurchaseOrderForm;
    modeEdit?: boolean;
    errors: Record<string, string>;
    masterData?: MasterDataFormFieldItems | null;
    loadingMasterData?: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange?: (name: string, value: string) => void; // Add date change handler
    // Vendor Select Props
    vendorOptions?: POVendorSelectOption[];
    vendorPagination?: POVendorPaginationState;
    vendorInputValue?: string;
    onVendorInputChange?: (inputValue: string) => Promise<POVendorSelectOption[]>;
    onVendorMenuScrollToBottom?: () => void;
    selectedVendor?: POVendorSelectOption | null;
    onVendorChange?: (option: POVendorSelectOption | null) => void;
    vendorError?: string;
    // Location Select Props
    locationOptions?: POLocationSelectOption[];
    locationPagination?: POLocationPaginationState;
    locationInputValue?: string;
    onLocationInputChange?: (inputValue: string) => Promise<POLocationSelectOption[]>;
    onLocationMenuScrollToBottom?: () => void;
    selectedLocation?: POLocationSelectOption | null;
    onLocationChange?: (option: POLocationSelectOption | null) => void;
    locationError?: string;
}

const purchaseOrderFields: React.FC<POFormFieldsProps> = ({
    formData,
    modeEdit = false,
    errors,
    masterData,
    onInputChange,
    onSelectChange,
    onDateChange,
    // Vendor props
    vendorOptions = [],
    vendorPagination = { page: 1, hasMore: true, loading: false },
    vendorInputValue = '',
    onVendorInputChange,
    onVendorMenuScrollToBottom,
    selectedVendor,
    onVendorChange,
    vendorError,
    // Location props
    locationOptions = [],
    locationPagination = { page: 1, hasMore: true, loading: false },
    locationInputValue = '',
    onLocationInputChange,
    onLocationMenuScrollToBottom,
    selectedLocation,
    onLocationChange,
    locationError
}) => {
    // Get computed field configurations
    const primaryFields = getPrimaryInfoFields(masterData || undefined);
    const additionalFields = getAdditionalInfoFields(masterData || undefined);
    const classificationFields = getClassificationInfoFields(masterData || undefined);
    const interCompanyFields = getInterCompanyManageFields();
    const renderInput = (
        name: keyof PurchaseOrderForm,
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => {
        return (
            <div>
                <Label>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    type={'text'}
                    name={name}
                    value={String(formData[name]) ?? ''}
                    onKeyPress={type === 'number' ? handleKeyPress : undefined}
                    onChange={onInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    min={type === 'number' ? "1" : undefined}
                />
                {errors[name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                )}
            </div>
        );
    };
    const renderSelect = (
        name: keyof PurchaseOrderForm,
        label: string,
        options: Array<{label: string, value: string}>,
        placeholder?: string,
        required: boolean = false,
        isClearable: boolean = true,
        isSearchable: boolean = true
    ) => {
        return (
            <div>
                <Label>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <CustomSelect
                    options={options}
                    value={options.find(option => String(option.value) === String(formData[name] ?? '')) || null}
                    onChange={(option) => onSelectChange(name, option?.value || '')}
                    placeholder={placeholder || `Pilih ${label.toLowerCase()}`}
                    isClearable={isClearable}
                    isSearchable={isSearchable}
                    className="font-secondary"
                    error={errors[name]}
                />
                {errors[name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                )}
            </div>
        );
    };
    // Simplified date picker untuk use di renderField  
    const renderSimpleDate = (field: any) => {
        const [showDatePicker, setShowDatePicker] = React.useState(false);
        const datePickerRef = React.useRef<HTMLDivElement>(null);
        
        const fieldValue = formData[field.name as keyof PurchaseOrderForm];
        // Type guard to ensure we only pass date-compatible values to Date constructor
        const isValidDateValue = (value: any): value is string | number | null => {
            return value === null || value === undefined || typeof value === 'string' || typeof value === 'number';
        };
        
        const currentDate = (fieldValue && isValidDateValue(fieldValue)) ? new Date(fieldValue) : null;

        const handleDateChange = (date: Date | any) => {
            setShowDatePicker(false);
            // Calendar dari react-date-range mengirim Date object langsung
            const selectedDate = date instanceof Date ? date : new Date(date);
            if (onDateChange) {
                onDateChange(field.name, selectedDate.toISOString());
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
                            errors[field.name as keyof PurchaseOrderForm] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <span className={currentDate ? "text-gray-700" : "text-gray-400"}>
                            {currentDate ? formatDate(currentDate.toISOString()) : (field.placeholder || `Pilih ${field.label.toLowerCase()}`)}
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
                {errors[field.name as keyof PurchaseOrderForm] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.name as keyof PurchaseOrderForm]}</p>
                )}
            </div>
        );
    };
    const renderField = (field: any) => {
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
                        <TextArea 
                            name={field.name}
                            value={String(formData[field.name as keyof PurchaseOrderForm] || '')}
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
                                errors[field.name as keyof PurchaseOrderForm] ? 'border-red-500 ' : 'border-gray-300'
                            }`}
                        />
                        {errors[field.name as keyof PurchaseOrderForm] && (
                            <p className="text-red-500 text-sm mt-1">{errors[field.name as keyof PurchaseOrderForm]}</p>
                        )}
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
                    true   // isSearchable
                );

            case "date":
                return renderSimpleDate(field);
            case "select-location":
                return (
                    <div>
                        <Label>
                            Location <span className="text-red-500">*</span>
                        </Label>
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
                    </div>
                );
            case "select-vendor":
                return (
                    <div>
                        <Label>
                            Vendor <span className="text-red-500">*</span>
                        </Label>
                        <CustomAsyncSelect
                            name="vendorid"
                            placeholder="Select vendor..."
                            value={selectedVendor}
                            error={vendorError}
                            defaultOptions={vendorOptions}
                            loadOptions={onVendorInputChange}
                            onMenuScrollToBottom={onVendorMenuScrollToBottom}
                            isLoading={vendorPagination.loading}
                            noOptionsMessage={() => "No vendors found"}
                            loadingMessage={() => "Loading vendors..."}
                            isSearchable={true}
                            inputValue={vendorInputValue}
                            onInputChange={onVendorInputChange}
                            onChange={onVendorChange}
                        />
                        {vendorError && (
                            <span className="text-sm text-red-500 mt-1 block">{vendorError}</span>
                        )}
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

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Primary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {primaryFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {additionalFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {classificationFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                </div>
            </div>
            {modeEdit && (
            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Approval</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className='mb-1.5 block text-sm text-gray-700'>Approval Status</p>
                        <StatusTypeBadge
                            type={Number(formData.approvalstatus) as 1 | 2 | 3} 
                        />
                    </div>
                    <div>
                        <p className='mb-1.5 block text-sm text-gray-700'>Created By</p>
                        <p>{formData.custbody_msi_createdby_api}</p>
                    </div>
                </div>
            </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Intercompany Management</h3>
                <div className="grid grid-cols-1 gap-4">

                        {interCompanyFields.map((field) => (
                            <div key={field.name}>
                                {renderField(field)}
                            </div>
                        ))}
                </div>
            
            </div>
        </div>
    )
}

export default purchaseOrderFields
