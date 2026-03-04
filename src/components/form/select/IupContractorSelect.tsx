import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useContractorSelect } from '@/hooks/useContractorSelect';
import { useIupSelect } from '@/hooks/useIupSelect';

interface IupContractorSelectProps {
    // IUP Selection Props
    iupValue?: { value: string; label: string } | null;
    iupLabel?: string;
    iupPlaceholder?: string;
    iupRequired?: boolean;
    iupError?: string;
    
    // Contractor Selection Props
    contractorValue?: { value: string; label: string; customer_name?: string } | null;
    contractorLabel?: string;
    contractorPlaceholder?: string;
    contractorRequired?: boolean;
    contractorError?: string;
    
    // Event handlers
    onIupChange?: (iup: { value: string; label: string } | null) => void;
    onContractorChange?: (contractor: { value: string; label: string; customer_name?: string } | null) => void;
    
    // Common props
    disabled?: boolean;
    className?: string;
    
    // Layout props
    layout?: 'horizontal' | 'vertical';
    gridCols?: string;
}

interface ContractorSelectOption {
    value: string;
    label: string;
    customer_name?: string;
}

const IupContractorSelect: React.FC<IupContractorSelectProps> = ({
    // IUP props
    iupValue,
    iupLabel = "IUP Selection",
    iupPlaceholder = "Select IUP...",
    iupRequired = false,
    iupError,
    
    // Contractor props
    contractorValue,
    contractorLabel = "Contractor",
    contractorPlaceholder = "Select Contractor...",
    contractorRequired = false,
    contractorError,
    
    // Event handlers
    onIupChange,
    onContractorChange,
    
    // Common props
    disabled = false,
    className = "",
    
    // Layout props
    layout = 'horizontal',
    gridCols = "grid-cols-1 md:grid-cols-2",
}) => {
    // IUP Hook
    const {
        iupOptions,
        inputValue: iupInputValue,
        handleInputChange: handleIupInputChange,
        handleMenuScrollToBottom: handleIupMenuScrollToBottom,
        initializeOptions: initializeIupOptions
    } = useIupSelect();

    // Contractor Hook
    const {
        contractorOptions,
        inputValue: contractorInputValue,
        handleInputChange: handleContractorInputChange,
        pagination: contractorPagination,
        handleMenuScrollToBottom: handleContractorMenuScrollToBottom,
        initializeOptions: initializeContractorOptions,
        loadContractorOptions
    } = useContractorSelect();

    // Internal state
    const [selectedIup, setSelectedIup] = useState<{ value: string; label: string } | null>(iupValue || null);
    const [selectedContractor, setSelectedContractor] = useState<ContractorSelectOption | null>(contractorValue || null);

    // Initialize options once
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initializeIupOptions();
            initializeContractorOptions();
        }
    }, [initializeIupOptions, initializeContractorOptions]);

    // Sync with external values - only update if different
    useEffect(() => {
        const newIupValue = iupValue ? { value: iupValue.value, label: iupValue.label } : null;
        if (selectedIup?.value !== newIupValue?.value) {
            setSelectedIup(newIupValue);
        }
    }, [iupValue?.value, iupValue?.label]);

    useEffect(() => {
        const newContractorValue = contractorValue ? { 
            value: contractorValue.value, 
            label: contractorValue.label,
            customer_name: contractorValue.customer_name 
        } : null;
        if (selectedContractor?.value !== newContractorValue?.value) {
            setSelectedContractor(newContractorValue);
        }
    }, [contractorValue?.value, contractorValue?.label, contractorValue?.customer_name]);

    // Load contractors when IUP changes - use useCallback to prevent infinite calls
    const loadContractorsByIup = useCallback(async () => {
        if (selectedIup?.value) {
            try {
                await loadContractorOptions('', [], 1, selectedIup.value, 'contractor', true);
            } catch (error) {
                console.error('Error loading contractors:', error);
            }
        }
    }, [selectedIup?.value, loadContractorOptions]);

    useEffect(() => {
        loadContractorsByIup();
    }, [loadContractorsByIup]);

    // Handle IUP change with proper memoization
    const handleIupChangeInternal = useCallback((option: any) => {
        const newIup = option ? { value: option.value, label: option.label } : null;
        
        // Only update if actually changed
        if (selectedIup?.value !== newIup?.value) {
            setSelectedIup(newIup);
            
            // Clear contractor when IUP changes
            setSelectedContractor(null);
            onContractorChange?.(null);
            
            // Reset contractor options to force reload
            initializeContractorOptions();
            
            // Emit to parent
            onIupChange?.(newIup);
        }
    }, [selectedIup?.value, onIupChange, onContractorChange, initializeContractorOptions]);

    // Handle Contractor change with proper memoization
    const handleContractorChangeInternal = useCallback((option: any) => {
        const newContractor = option ? { 
            value: option.value, 
            label: option.label,
            customer_name: option.customer_name 
        } : null;
        
        // Only update if actually changed
        if (selectedContractor?.value !== newContractor?.value) {
            setSelectedContractor(newContractor);
            onContractorChange?.(newContractor);
        }
    }, [selectedContractor?.value, onContractorChange]);

    // Memoized default options for contractor
    const contractorDefaultOptions = useMemo(() => {
        if (!selectedIup) return [];
        
        let defaultOpts = contractorOptions?.length > 0 ? [...contractorOptions] : [];
        
        // Ensure selected contractor is in default options for edit mode
        if (selectedContractor && !defaultOpts.find(opt => opt.value === selectedContractor.value)) {
            defaultOpts.unshift(selectedContractor);
        }
        
        return defaultOpts;
    }, [selectedIup, contractorOptions, selectedContractor]);

    // Memoized load options for contractor
    const loadContractorOptionsCallback = useCallback(async (inputValue: string) => {
        if (!selectedIup) {
            return Promise.resolve([]);
        }
        
        try {
            const options = await loadContractorOptions(inputValue, [], 1, selectedIup.value, 'contractor', true);
            let allOptions = [...options];
            
            // Ensure selected contractor is always in options for edit mode
            if (selectedContractor && !allOptions.find(opt => opt.value === selectedContractor.value)) {
                allOptions.unshift(selectedContractor);
            }
            
            return allOptions;
        } catch (error) {
            console.error('Error loading contractor options:', error);
            return [];
        }
    }, [selectedIup, loadContractorOptions, selectedContractor]);

    const containerClass = layout === 'horizontal' 
        ? `grid ${gridCols} gap-6` 
        : 'space-y-6';

    const wrapperClass = `${containerClass} ${className}`.trim();

    return (
        <div className={wrapperClass}>
            {/* IUP Selection */}
            <div>
                <Label>
                    {iupLabel} {iupRequired && <span className="text-red-500">*</span>}
                </Label>
                <CustomAsyncSelect
                    loadOptions={handleIupInputChange}
                    defaultOptions={iupOptions}
                    inputValue={iupInputValue}
                    value={selectedIup}
                    onInputChange={handleIupInputChange}
                    onMenuScrollToBottom={handleIupMenuScrollToBottom}
                    onChange={handleIupChangeInternal}
                    placeholder={iupPlaceholder}
                    isClearable={!iupRequired}
                    noOptionsMessage={() => "No IUP found"}
                    loadingMessage={() => "Loading IUPs..."}
                    disabled={disabled}
                />
                {iupError && (
                    <p className="text-red-500 text-sm mt-1">{iupError}</p>
                )}
            </div>

            {/* Contractor Selection */}
            <div>
                <Label>
                    {contractorLabel} {contractorRequired && <span className="text-red-500">*</span>}
                </Label>
                <CustomAsyncSelect
                    loadOptions={loadContractorOptionsCallback}
                    defaultOptions={contractorDefaultOptions}
                    inputValue={contractorInputValue}
                    value={selectedContractor}
                    key={`contractor-select-${selectedIup?.value || 'no-iup'}`}
                    onInputChange={(inputValue) => {
                        if (selectedIup) {
                            handleContractorInputChange(inputValue, selectedIup.value, 'contractor');
                        }
                    }}
                    onMenuScrollToBottom={handleContractorMenuScrollToBottom}
                    onChange={handleContractorChangeInternal}
                    placeholder={!selectedIup ? "Please select IUP first" : contractorPlaceholder}
                    isLoading={contractorPagination.loading}
                    disabled={!selectedIup || disabled}
                    isClearable={!contractorRequired}
                    noOptionsMessage={() => !selectedIup ? "Please select IUP first" : "No contractors found"}
                    loadingMessage={() => "Loading contractors..."}
                />
                {contractorError && (
                    <p className="text-red-500 text-sm mt-1">{contractorError}</p>
                )}
            </div>
        </div>
    );
};

export default IupContractorSelect;