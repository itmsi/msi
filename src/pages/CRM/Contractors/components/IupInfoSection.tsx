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
    
    // State untuk menyimpan recently selected options dan loaded options for edit mode
    const [recentlySelectedIup, setRecentlySelectedIup] = React.useState<any>(null);
    const [recentlySelectedSegmentation, setRecentlySelectedSegmentation] = React.useState<any>(null);
    const [loadedEditOptions, setLoadedEditOptions] = React.useState<{
        iup: any | null;
        segmentation: any | null;
    }>({ iup: null, segmentation: null });
    
    // Effect to load names for IDs in edit mode
    React.useEffect(() => {
        const loadEditModeOptions = async () => {
            if (iup_customers.iup_id && !iupOptions.find(opt => opt.value === iup_customers.iup_id)) {
                const tempIupOption = {
                    value: iup_customers.iup_id,
                    label: iup_customers.iup_name,
                    __isFromEdit: true
                };
                setLoadedEditOptions(prev => ({ ...prev, iup: tempIupOption }));
            } else if (iup_customers.iup_id && iupOptions.find(opt => opt.value === iup_customers.iup_id)) {
                const foundOption = iupOptions.find(opt => opt.value === iup_customers.iup_id);
                setLoadedEditOptions(prev => ({ ...prev, iup: foundOption }));
            }
            
            if (iup_customers.segmentation_id && !segementationOptions.find(opt => opt.value === iup_customers.segmentation_id)) {
                const tempSegmentationOption = {
                    value: iup_customers.segmentation_id,
                    label: iup_customers.segmentation_name,
                    __isFromEdit: true
                };
                setLoadedEditOptions(prev => ({ ...prev, segmentation: tempSegmentationOption }));
            } else if (iup_customers.segmentation_id && segementationOptions.find(opt => opt.value === iup_customers.segmentation_id)) {
                const foundOption = segementationOptions.find(opt => opt.value === iup_customers.segmentation_id);
                setLoadedEditOptions(prev => ({ ...prev, segmentation: foundOption }));
            }
        };
        
        loadEditModeOptions();
    }, [iup_customers.iup_id, iup_customers.segmentation_id, iupOptions, segementationOptions]);
    
    // Create a more robust selectedIup logic
    const selectedIup = React.useMemo(() => {
        if (!iup_customers.iup_id) return null;
        
        if (recentlySelectedIup && recentlySelectedIup.value === iup_customers.iup_id) {
            return recentlySelectedIup;
        }
        
        let found = iupOptions.find(option => option.value === iup_customers.iup_id);
        if (found) {
            return found;
        }
        
        if (loadedEditOptions.iup && loadedEditOptions.iup.value === iup_customers.iup_id) {
            return loadedEditOptions.iup;
        }
        
        return {
            value: iup_customers.iup_id,
            label: iup_customers.iup_name,
            __isPlaceholder: true
        };
    }, [iup_customers.iup_id, iupOptions, recentlySelectedIup, loadedEditOptions.iup]);

    // Create a more robust selectedSegementasi logic  
    const selectedSegementasi = React.useMemo(() => {
        if (!iup_customers.segmentation_id) return null;
        
        if (recentlySelectedSegmentation && recentlySelectedSegmentation.value === iup_customers.segmentation_id) {
            return recentlySelectedSegmentation;
        }
        
        let found = segementationOptions.find(option => option.value === iup_customers.segmentation_id);
        if (found) {
            return found;
        }
        
        if (loadedEditOptions.segmentation && loadedEditOptions.segmentation.value === iup_customers.segmentation_id) {
            return loadedEditOptions.segmentation;
        }
        
        return {
            value: iup_customers.segmentation_id,
            label: iup_customers.segmentation_name,
            __isPlaceholder: true
        };
    }, [iup_customers.segmentation_id, segementationOptions, recentlySelectedSegmentation, loadedEditOptions.segmentation]);

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
                            // Ensure selected option is included in options
                            let allOptions = [...iupOptions];
                            
                            // If we have a selected option that's not in current options, add it
                            if (selectedIup && !allOptions.find(opt => opt.value === selectedIup.value)) {
                                allOptions.unshift(selectedIup);
                            }
                            
                            return allOptions;
                        }}
                        defaultOptions={(() => {
                            let defaultOpts = iupOptions?.length > 0 ? [...iupOptions] : [];
                            
                            // Ensure selected option is in default options
                            if (selectedIup && !defaultOpts.find(opt => opt.value === selectedIup.value)) {
                                defaultOpts.unshift(selectedIup);
                            }
                            
                            return defaultOpts;
                        })()}
                        inputValue={iupInputValue}
                        value={selectedIup}
                        onInputChange={onIupInputChange}
                        onMenuScrollToBottom={onIupMenuScroll}
                        onChange={(option) => {
                            // Save recently selected option
                            setRecentlySelectedIup(option);
                            onIupSelect(option);
                        }}
                        placeholder="Select IUP..."
                        error={errors.iup_id}
                        isClearable={false}
                        noOptionsMessage={() => "No IUP found"}
                        loadingMessage={() => "Loading IUPs..."}
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
                            // Ensure selected option is included in options
                            let allOptions = [...segementationOptions];
                            
                            // If we have a selected option that's not in current options, add it
                            if (selectedSegementasi && !allOptions.find(opt => opt.value === selectedSegementasi.value)) {
                                allOptions.unshift(selectedSegementasi);
                            }
                            
                            return allOptions;
                        }}
                        defaultOptions={(() => {
                            let defaultOpts = segementationOptions?.length > 0 ? [...segementationOptions] : [];
                            
                            // Ensure selected option is in default options
                            if (selectedSegementasi && !defaultOpts.find(opt => opt.value === selectedSegementasi.value)) {
                                defaultOpts.unshift(selectedSegementasi);
                            }
                            
                            return defaultOpts;
                        })()}
                        inputValue={segementationInputValue}
                        value={selectedSegementasi}
                        onInputChange={onSegementationInputChange}
                        onMenuScrollToBottom={onSegementationMenuScroll}
                        onChange={(option) => {
                            // Save recently selected option
                            setRecentlySelectedSegmentation(option);
                            onSegementationSelect(option);
                        }}
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