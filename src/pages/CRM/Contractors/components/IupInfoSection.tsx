import React, { useEffect, useMemo, useState, useCallback } from 'react';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { ContractorFormData } from '../types/contractor';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';
import { ContractorSelectOption, useContractorSelect } from '@/hooks/useContractorSelect';
import Input from '@/components/form/input/InputField';

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

    const {
        contractorOptions,
        inputValue: contractorInputValue,
        handleInputChange: handleContractorInputChange,
        pagination: contractorPagination,
        handleMenuScrollToBottom: handleContractorMenuScrollToBottom,
        loadContractorOptions
    } = useContractorSelect();

    // Load contractors when IUP or Type changes
    useEffect(() => {
        if (iup_customers.iup_id && iup_customers.type) {
            if (!iup_customers.parent_contractor_id) {
                setSelectedContractor(null);
                if (onChange) {
                    onChange('parent_contractor_id' as any, '');
                }
            }
            loadContractorOptions('', [], 1, iup_customers.iup_id, 'contractor', true);
        }
    }, [iup_customers.iup_id, iup_customers.type]);

    // Load contractors on initial mount for edit mode
    useEffect(() => {
        if (iup_customers.parent_contractor_id && iup_customers.iup_id && iup_customers.type && contractorOptions.length === 0) {
            loadContractorOptions('', [], 1, iup_customers.iup_id, 'contractor', true);
        }
    }, [iup_customers.parent_contractor_id, iup_customers.iup_id, iup_customers.type, contractorOptions.length]);

    const [selectedContractor, setSelectedContractor] = useState<ContractorSelectOption | null>(null);
    
    useEffect(() => {
        if (iup_customers.parent_contractor_id && contractorOptions.length > 0) {
            const existingContractor = contractorOptions.find(option => option.value === iup_customers.parent_contractor_id);
            if (existingContractor && !selectedContractor) {
                setSelectedContractor(existingContractor);
            }
        }
    }, [iup_customers.parent_contractor_id, contractorOptions, selectedContractor]);
    
    const handleContractorChange = useCallback((option: ContractorSelectOption | null) => {
        if (option) {
            if (onChange) {
                onChange('parent_contractor_id' as any, option.value);
            }
        } else {
            if (onChange) {
                onChange('parent_contractor_id' as any, '');
            } 
        }
    }, [onChange]);
    
    const [recentlySelectedIup, setRecentlySelectedIup] = React.useState<any>(null);
    const [recentlySelectedSegmentation, setRecentlySelectedSegmentation] = React.useState<any>(null);
    const [loadedEditOptions, setLoadedEditOptions] = React.useState<{
        iup: any | null;
        segmentation: any | null;
    }>({ iup: null, segmentation: null });
    
    useEffect(() => {
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
    const selectedIup = useMemo(() => {
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

    const selectedSegementasi = useMemo(() => {
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

    const selectedCustomer = useMemo(() => {
        if (!iup_customers.parent_contractor_id) return null;
        
        if (selectedContractor && selectedContractor.value === iup_customers.parent_contractor_id) {
            return selectedContractor;
        }
        
        let found = contractorOptions.find(option => option.value === iup_customers.parent_contractor_id);
        if (found) {
            return found;
        }
        
        return {
            value: iup_customers.parent_contractor_id,
            label: iup_customers.parent_contractor_name || 
                  formData.customer_data?.customer_name ||
                  'Loading Customer...',
            __isPlaceholder: true
        };
    }, [iup_customers.parent_contractor_id, iup_customers.parent_contractor_name, selectedContractor, contractorOptions, formData.customer_data]);

    const STATUS_OPTIONS = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];
    const TYPE_OPTIONS = [
        { value: 'contractor', label: 'Contractor' },
        { value: 'sub_contractor', label: 'Sub Contractor' }
    ];

    const renderInput = (
        field: keyof Omit<ContractorFormData['iup_customers'], 'units'>,
        label: string,
        placeholder?: string,
        required: boolean = false
    ) => (
        <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && '*'}
            </Label>
            <Input
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
                            let allOptions = [...iupOptions];
                            
                            if (selectedIup && !allOptions.find(opt => opt.value === selectedIup.value)) {
                                allOptions.unshift(selectedIup);
                            }
                            
                            return allOptions;
                        }}
                        defaultOptions={(() => {
                            let defaultOpts = iupOptions?.length > 0 ? [...iupOptions] : [];
                            
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
                            
                            // Reset customer selection when IUP changes
                            setSelectedContractor(null);
                            onChange('parent_contractor_id' as any, '');
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
                            let allOptions = [...segementationOptions];
                            
                            if (selectedSegementasi && !allOptions.find(opt => opt.value === selectedSegementasi.value)) {
                                allOptions.unshift(selectedSegementasi);
                            }
                            
                            return allOptions;
                        }}
                        defaultOptions={(() => {
                            let defaultOpts = segementationOptions?.length > 0 ? [...segementationOptions] : [];
                            
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
                <div>
                    <Label>
                        Type
                    </Label>
                    
                    <CustomSelect
                        value={TYPE_OPTIONS.find(option => option.value === iup_customers.type) || null}
                        onChange={(option) => {
                            const newType = option?.value as 'contractor' | 'sub_contractor';
                            onChange('type', newType);
                            
                            // Reset customer selection when type changes
                            setSelectedContractor(null);
                            onChange('parent_contractor_id' as any, '');
                        }}
                        options={TYPE_OPTIONS}
                        placeholder="Select type"
                        isClearable={false}
                        isSearchable={false}
                    />
                </div>
                <div>
                    <Label>
                        Customer
                    </Label>
                    <CustomAsyncSelect
                        loadOptions={async (inputValue) => {
                            if (!iup_customers.iup_id || !iup_customers.type) {
                                return Promise.resolve([]);
                            }
                            
                            const options = await loadContractorOptions(inputValue, [], 1, iup_customers.iup_id, 'contractor', true);
                            let allOptions = [...options];
                            
                            // Ensure selected customer is always in options for edit mode
                            if (selectedCustomer && !allOptions.find(opt => opt.value === selectedCustomer.value)) {
                                allOptions.unshift(selectedCustomer);
                            }
                            
                            return allOptions;
                        }}
                        defaultOptions={(() => {
                            let defaultOpts = contractorOptions?.length > 0 ? [...contractorOptions] : [];
                            
                            // Ensure selected customer is in default options for edit mode
                            if (selectedCustomer && !defaultOpts.find(opt => opt.value === selectedCustomer.value)) {
                                defaultOpts.unshift(selectedCustomer);
                            }
                            
                            return defaultOpts;
                        })()}
                        inputValue={contractorInputValue}
                        value={selectedCustomer}
                        key={`customer-select-${iup_customers.parent_contractor_id || 'empty'}`} // Force re-render on value change
                        onInputChange={(inputValue) => {
                            if (iup_customers.iup_id && iup_customers.type) {
                                handleContractorInputChange(inputValue, iup_customers.iup_id, 'contractor');
                            }
                        }}
                        onMenuScrollToBottom={handleContractorMenuScrollToBottom}
                        onChange={(option: any) => {
                            setSelectedContractor(option);
                            handleContractorChange(option);
                        }}
                        placeholder={!iup_customers.iup_id || !iup_customers.type ? "Please select IUP and Type first" : "Select Customer..."}
                        isLoading={contractorPagination.loading}
                        disabled={!iup_customers.iup_id || !iup_customers.type || iup_customers.type === 'contractor'}
                        isClearable={false}
                        noOptionsMessage={() => !iup_customers.iup_id || !iup_customers.type ? "Please select IUP and Type first" : "No customers found"}
                        loadingMessage={() => "Loading customers..."}
                    />
                    {errors.parent_contractor_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.parent_contractor_id}</p>
                    )}
                </div>


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