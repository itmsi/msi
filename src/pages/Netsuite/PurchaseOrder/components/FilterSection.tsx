import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { useApprovalStatusSelect } from '@/hooks/useApprovalStatusSelect';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { usePOStatusSelect } from '@/hooks/usePOStatusSelect';
import { useSubsidiarySelect } from '@/hooks/useSubsidiarySelect';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';

interface FilterSectionProps {
    filterApprovalStatus?: string;
    filterSubsidiary?: string;
    filterLocation?: string;
    filterStatus?: string;
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
    filterApprovalStatus,
    filterSubsidiary,
    filterLocation,
    filterStatus,
    onFilterChange,
    onClearFilters,
}) => {

    const { subsidiaryOptions, loading: subsidiaryLoading, initializeOptions } = useSubsidiarySelect();
    
    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);
    
    const currentSubsidiaryValue = filterSubsidiary
        ? subsidiaryOptions.find(o => o.value === filterSubsidiary) || null
        : null;

    // Approval Status
    const { approvalStatusOptions, loading: approvalStatusLoading, initializeOptions: initializeApprovalStatusOptions } = useApprovalStatusSelect();
    
    useEffect(() => {
        initializeApprovalStatusOptions();
    }, [initializeApprovalStatusOptions]);
    
    const currentApprovalStatusValue = filterApprovalStatus
        ? approvalStatusOptions.find(o => o.value === filterApprovalStatus) || null
        : null;

    // Status
    const { poStatusOptions, loading: statusLoading, initializeOptions: initializeStatusOptions } = usePOStatusSelect();
    
    useEffect(() => {
        initializeStatusOptions();
    }, [initializeStatusOptions]);
    
    const currentStatusValue = filterStatus
        ? poStatusOptions.find(o => o.value === filterStatus) || null
        : null;


    // Location select untuk header dan items (is_parent = false)
    const {
        POLocationOptions,
        pagination: locationPagination,
        inputValue: locationInputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom: handleLocationMenuScrollToBottom,
        initializeOptions: initializeLocationOptions,
        initialized: locationInitialized,
        isLoading: locationLoading
    } = usePOLocationSelect(30, false);
    
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [locationSelectError, setLocationSelectError] = useState<string>('');

    // Initialize hooks only once when not yet initialized
    useEffect(() => {
        if (!locationInitialized && !locationLoading) {
            initializeLocationOptions();
        }
    }, [locationInitialized, locationLoading, initializeLocationOptions]);
    
    // Sync internal state with filter props
    useEffect(() => {
        if (filterLocation) {
            const locationOption = POLocationOptions.find(opt => opt.value === filterLocation);
            if (locationOption) {
                if (!selectedLocation || selectedLocation.value !== filterLocation) {
                    setSelectedLocation(locationOption);
                }
            } else if (selectedLocation?.value !== filterLocation) {
                // If exact match not found but filterLocation exists, create a temporary option
                // This handles cases where the option hasn't loaded yet
                setSelectedLocation({ 
                    value: filterLocation, 
                    label: `Location ${filterLocation}` 
                });
            }
        } else if (!filterLocation && selectedLocation) {
            setSelectedLocation(null);
        }
    }, [filterLocation, POLocationOptions]);
    
    const {
        employeeOptions,
        pagination: employeePagination,
        inputValue: employeeInputValue,
        setUserNetsuite,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions
    } = useEmployeeSelect();

    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [employeeSelectError, setEmployeeSelectError] = useState<string>('');

    useEffect(() => {
        setUserNetsuite(true);
        initializeEmployeeOptions();
    }, [initializeEmployeeOptions]);

    const handleClearAll = () => {
        onClearFilters();
        setSelectedEmployee(null);
    };
    
    // Check if any filters are active
    
    const [searchParams] = useSearchParams();
    const checkToggleFilter = searchParams.get('subsidiary') || searchParams.get('location') || searchParams.get('approvalstatus') || searchParams.get('po_status') || searchParams.get('created_by');
    const hasActiveFilters = checkToggleFilter !== null;
    // const hasActiveFilters = filterSubsidiary || filterLocation || filterApprovalStatus || filterStatus || selectedEmployee;
    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Subsidiary */}
                <div>
                    <label htmlFor='subsidiary' className="block text-sm font-medium text-gray-700 mb-1">Subsidiary</label>
                    <CustomSelect
                        id="subsidiary"
                        name="subsidiary"
                        value={currentSubsidiaryValue}
                        onChange={(selected) => onFilterChange('subsidiary', selected?.value || '')}
                        options={subsidiaryOptions}
                        placeholder={subsidiaryLoading ? 'Loading...' : 'All Subsidiaries'}
                        isClearable={true}
                        isSearchable={true}
                        className="w-full"
                        isLoading={subsidiaryLoading}
                    />
                </div>
                
                {/* Location */}
                <div>
                    <label htmlFor='location' className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <CustomAsyncSelect
                        id="location"
                        name="location"
                        placeholder="All Locations"
                        value={selectedLocation}
                        error={locationSelectError}
                        defaultOptions={POLocationOptions}
                        loadOptions={handleLocationInputChange}
                        onMenuScrollToBottom={handleLocationMenuScrollToBottom}
                        isLoading={locationPagination.loading}
                        noOptionsMessage={() => "No locations found"}
                        loadingMessage={() => "Loading locations..."}
                        isSearchable={true}
                        inputValue={locationInputValue}
                        onInputChange={handleLocationInputChange}
                        onChange={
                            (option) => {
                                setSelectedLocation(option);
                                onFilterChange('location', option?.value || '');
                                if (locationSelectError) {
                                    setLocationSelectError('');
                                }
                            }
                        }
                    />
                </div>

                {/* APPROVAL STATUS */}
                <div>
                    <label htmlFor='approvalstatus' className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                    <CustomSelect
                        id="approvalstatus"
                        name="approvalstatus"
                        value={currentApprovalStatusValue}
                        onChange={(selected) => onFilterChange('approvalstatus', selected?.value || '')}
                        options={approvalStatusOptions}
                        placeholder={approvalStatusLoading ? 'Loading...' : 'All Approval Statuses'}
                        isClearable={true}
                        isSearchable={true}
                        className="w-full"
                        isLoading={approvalStatusLoading}
                    />
                </div>
                

                {/* STATUS */}
                <div>
                    <label htmlFor='po_status' className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <CustomSelect
                        id="po_status"
                        name="po_status"
                        value={currentStatusValue}
                        onChange={(selected) => onFilterChange('po_status', selected?.value || '')}
                        options={poStatusOptions}
                        placeholder={statusLoading ? 'Loading...' : 'All Statuses'}
                        isClearable={true}
                        isSearchable={true}
                        className="w-full"
                        isLoading={statusLoading}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <CustomAsyncSelect
                        id="employee_id"
                        placeholder="Select employee..."
                        value={selectedEmployee}
                        defaultOptions={employeeOptions}
                        loadOptions={handleEmployeeInputChange}
                        onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                        isLoading={employeePagination.loading}
                        noOptionsMessage={() => "No employees found"}
                        loadingMessage={() => "Loading employees..."}
                        isSearchable={true}
                        inputValue={employeeInputValue}
                        onInputChange={(inputValue) => {
                            handleEmployeeInputChange(inputValue);
                        }}
                        onChange={
                            (option) => {
                                setSelectedEmployee(option);
                                onFilterChange('created_by', option?.value || '');
                                if (employeeSelectError) {
                                    setEmployeeSelectError('');
                                }
                            }
                        }
                    />
                </div>
                
                
            </div>
            
            {/* Filter actions */}
            {hasActiveFilters && (
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                        size="sm"
                    >
                        Clear All
                    </Button>
                </div>
            )}
        </div>
    )
}
export default FilterSection;

