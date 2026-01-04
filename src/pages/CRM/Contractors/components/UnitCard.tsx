import React, { useEffect, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { ContractorUnit } from '../types/contractor';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { handleKeyPress } from '@/helpers/generalHelper';

interface UnitCardProps {
    unit: ContractorUnit;
    index: number;
    errors: Record<string, string>;
    onChange: (field: keyof ContractorUnit, value: string | number) => void;
    onRemove: () => void;
    // Brand select props
    brandOptions: any[];
    brandInputValue: string;
    brandPagination?: { loading: boolean };
    onBrandInputChange: (value: string) => void;
    onBrandMenuScroll: () => void;
    onBrandSelect: (option: any) => void;
}

const UnitCard: React.FC<UnitCardProps> = ({
    unit,
    index,
    errors,
    onChange,
    onRemove,
    brandOptions,
    brandInputValue,
    brandPagination = { loading: false },
    onBrandInputChange,
    onBrandMenuScroll,
    onBrandSelect
}) => {
    // State untuk menyimpan recently selected options dan loaded options for edit mode
    
    const [recentlySelectedBrand, setRecentlySelectedBrand] = useState<any>(null);
    const [loadedEditOptions, setLoadedEditOptions] = React.useState<{
        brand: any | null;
    }>({ brand: null });
    
    // Effect to load names for IDs in edit mode
    useEffect(() => {
        const loadEditModeOptions = async () => {
            if (unit.brand_id && !brandOptions.find(opt => opt.value === unit.brand_id)) {
                const tempBrandOption = {
                    value: unit.brand_id,
                    label: unit.brand_name,
                    __isFromEdit: true
                };
                setLoadedEditOptions(prev => ({ ...prev, brand: tempBrandOption }));
            } else if (unit.brand_id && brandOptions.find(opt => opt.value === unit.brand_id)) {
                const foundOption = brandOptions.find(opt => opt.value === unit.brand_id);
                setLoadedEditOptions(prev => ({ ...prev, brand: foundOption }));
            }
            
        };
        
        loadEditModeOptions();
    }, [unit.brand_id, brandOptions]);
    
    // Create a more robust selectedBrand logic
    const selectedBrand = React.useMemo(() => {
        if (!unit.brand_id) return null;
        
        if (recentlySelectedBrand && recentlySelectedBrand.value === unit.brand_id) {
            return recentlySelectedBrand;
        }
        
        let found = brandOptions.find(option => option.value === unit.brand_id);
        if (found) {
            return found;
        }
        
        if (loadedEditOptions.brand && loadedEditOptions.brand.value === unit.brand_id) {
            return loadedEditOptions.brand;
        }
        
        return {
            value: unit.brand_id,
            label: unit.brand_name,
            __isPlaceholder: true
        };
    }, [unit.brand_id, brandOptions, recentlySelectedBrand, loadedEditOptions.brand]);
    
    // Helper untuk render input field
    const renderInput = (
        field: keyof ContractorUnit,
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => {
        const errorKey = `unit_${index}_${field}`;
        return (
            <div>
                <Label>
                    {label} {required && '*'}
                </Label>
                <Input
                    type={'text'}
                    value={unit[field]}
                    onKeyPress={type === 'number' ? handleKeyPress : undefined}
                    onChange={(e) => {
                        const value = type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value;
                        onChange(field, value);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[errorKey] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    min={type === 'number' ? "1" : undefined}
                />
                {errors[errorKey] && (
                    <p className="text-red-500 text-sm mt-1">{errors[errorKey]}</p>
                )}
            </div>
        );
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-700">Unit #{index + 1}</h3>
                <Button
                    type="button"
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    variant="outline"
                    size="sm"
                >
                    <MdDelete className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Brand Select */}
                <div>
                    <Label>
                        Brand *
                    </Label>
                    <CustomAsyncSelect
                        loadOptions={async (_inputValue) => {
                            let allOptions = [...brandOptions];
                            
                            // If we have a selected option that's not in current options, add it
                            if (selectedBrand && !allOptions.find(opt => opt.value === selectedBrand.value)) {
                                allOptions.unshift(selectedBrand);
                            }
                            
                            return allOptions;
                        }}
                        defaultOptions={(() => {
                            let defaultOpts = brandOptions?.length > 0 ? [...brandOptions] : [];
                            
                            // Ensure selected option is in default options
                            if (selectedBrand && !defaultOpts.find(opt => opt.value === selectedBrand.value)) {
                                defaultOpts.unshift(selectedBrand);
                            }
                            
                            return defaultOpts;
                        })()}
                        inputValue={brandInputValue}
                        value={selectedBrand}
                        isLoading={brandPagination.loading}
                        onInputChange={onBrandInputChange}
                        onMenuScrollToBottom={onBrandMenuScroll}
                        onChange={(option) => {
                            // Save recently selected option
                            setRecentlySelectedBrand(option);
                            onBrandSelect(option);
                        }}
                        placeholder="Type to search brand..."
                        isSearchable={true}
                        noOptionsMessage={() => "No brands found"}
                        loadingMessage={() => "Loading brands..."}
                        error={errors[`unit_${index}_brand`]}
                        isClearable={false}                    
                    />
                    {errors[`unit_${index}_brand`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`unit_${index}_brand`]}</p>
                    )}
                </div>

                {renderInput('type', 'Type', 'text', 'ex. Dump Truck', true)}
                {renderInput('specification', 'Specification', 'text', 'ex. 6x4', true)}
                {renderInput('engine', 'Engine', 'text', undefined, true)}
                {/* {renderInput('physical_availability', 'Physical Availability', 'text', 'e.g., 85%', true)} */}
                
                <div className="md:col-span-2 lg:col-span-1">
                    {renderInput('quantity', 'Quantity', 'number', undefined, true)}
                </div>
            </div>
        </div>
    );
};

export default UnitCard;