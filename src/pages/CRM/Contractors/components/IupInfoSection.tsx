import React from 'react';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { ContractorFormData } from '../types/contractor';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';

interface IupInfoProps {
    formData: ContractorFormData;
    errors: Record<string, string>;
    onChange: (field: keyof Omit<ContractorFormData['iup_customers'], 'units'>, value: string) => void;
    // IUP Select props
    iupOptions: any[];
    iupInputValue: string;
    onIupInputChange: (value: string) => void;
    onIupMenuScroll: () => void;
    onIupSelect: (option: any) => void;
    // IUP Select props
    segementationOptions: any[];
    segementationInputValue: string;
    onSegementationInputChange: (value: string) => void;
    onSegementationMenuScroll: () => void;
    onSegementationSelect: (option: any) => void;
    segementationPagination?: { loading: boolean };
}

const IupInfoSection: React.FC<IupInfoProps> = ({
    formData,
    errors,
    onChange,
    iupOptions,
    iupInputValue,
    onIupInputChange,
    onIupMenuScroll,
    onIupSelect,
    segementationOptions,
    segementationInputValue,
    onSegementationInputChange,
    onSegementationMenuScroll,
    onSegementationSelect,
}) => {
    const { iup_customers } = formData;
    
    const selectedIup = iup_customers.iup_id 
        ? iupOptions.find(option => option.value === iup_customers.iup_id) || null
        : null;

    const selectedSegementasi = iup_customers.segmentation_id 
        ? segementationOptions.find(option => option.value === iup_customers.segmentation_id) || null
        : null;

    const STATUS_OPTIONS = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];
    // Helper untuk render text input
    const renderInput = (
        field: keyof Omit<ContractorFormData['iup_customers'], 'units'>,
        label: string,
        placeholder?: string,
        required: boolean = false
    ) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && '*'}
            </label>
            <input
                type="text"
                value={iup_customers[field] as string}
                onChange={(e) => onChange(field, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[field] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            />
            {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
        </div>
    );

    return (<>
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information Mandatory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {renderInput('achievement_production_bim', 'Achievement Production BIM')}
                {renderInput('business_project_bim', 'Business Project BIM')}
                {renderInput('unit_brand_bim', 'Unit Brand BIM')}
                {renderInput('unit_quantity_bim', 'Unit Quantity BIM')}
                {renderInput('unit_type_bim', 'Unit Type BIM')}
                {renderInput('unit_specification_bim', 'Unit Specification BIM')}
                {renderInput('physical_availability_bim', 'Physical Availability BIM')}

            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">IUP Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IUP Selection */}
                <div>
                    <Label>
                        IUP Selection *
                    </Label>
                    <CustomAsyncSelect
                        loadOptions={async (_inputValue) => {
                            return iupOptions;
                        }}
                        defaultOptions={iupOptions?.length > 0 ? iupOptions : []}
                        inputValue={iupInputValue}
                        value={selectedIup}
                        onInputChange={onIupInputChange}
                        onMenuScrollToBottom={onIupMenuScroll}
                        onChange={onIupSelect}
                        placeholder="Select IUP..."
                        error={errors.iup_id}
                        isClearable={false}
                    />
                    {errors.iup_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.iup_id}</p>
                    )}
                </div>
                <div>
                    <Label>
                        Segementation *
                    </Label>
                    <CustomAsyncSelect
                        loadOptions={async (_inputValue) => {
                            return segementationOptions;
                        }}
                        defaultOptions={segementationOptions?.length > 0 ? segementationOptions : []}
                        inputValue={segementationInputValue}
                        value={selectedSegementasi}
                        onInputChange={onSegementationInputChange}
                        onMenuScrollToBottom={onSegementationMenuScroll}
                        onChange={onSegementationSelect}
                        placeholder="Select Segementation..."
                        isSearchable={true}
                        noOptionsMessage={() => "No Segementation found"}
                        loadingMessage={() => "Loading segementations..."}
                        error={errors.segmentation_id}
                        isClearable={false}
                    />
                    {errors.segmentation_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.segmentation_id}</p>
                    )}
                </div>

                {renderInput('rkab', 'RKAB', undefined, true)}
                {renderInput('ritase', 'Ritase')}
                {renderInput('hauling_distance', 'Hauling Distance')}
                {renderInput('barging_distance', 'Barging Distance')}
                {renderInput('tonase', 'Tonase')}
                {renderInput('working_days', 'Working Days')}
                {renderInput('price_per_ton', 'Price Per Ton')}
                {renderInput('fuel_consumption', 'Fuel Consumption')}
                {renderInput('tire_cost', 'Tire Cost')}
                {renderInput('sparepart_cost', 'Sparepart Cost')}
                {renderInput('manpower_cost', 'Manpower Cost')}
                {/* Status Select */}
                <div>
                    <Label>
                        Status
                    </Label>
                    
                    <CustomSelect
                        value={STATUS_OPTIONS.find(option => option.value === iup_customers.status) || null}
                        onChange={(option) => onChange('status', option?.value as 'active' | 'inactive')}
                        options={STATUS_OPTIONS}
                        placeholder="Select status"
                        isClearable={false}
                        isSearchable={false}
                    />
                </div>
            </div>
        </div>
    </>);
};

export default IupInfoSection;