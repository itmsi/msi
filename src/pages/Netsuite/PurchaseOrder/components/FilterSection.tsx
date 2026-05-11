import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { useSubsidiarySelect } from '@/hooks/useSubsidiarySelect';
import React, { useEffect, useState } from 'react'

interface FilterSectionProps {
    filterSubsidiary?: string;
    filterLocation?: string;
    filterStatus?: string;
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
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
    // const currentStatusValue = filterStatus
    //     ? [{ value: 1, label: 'Pending Approval' }, { value: 2, label: 'Approved' }, { value: 3, label: 'Rejected' }].find(o => o.value === Number(filterStatus)) || null
    //     : null;

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
    
    
    // const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<any>(null);
    // const [approvalStatusSelectError, setApprovalStatusSelectError] = useState<string>('');
        
    // const [selectedStatus, setSelectedStatus] = useState<any>(null);
    // const [statusSelectError, setStatusSelectError] = useState<string>('');

    // Initialize hooks only once when not yet initialized
    // useEffect(() => {
    //     if (!statusInitialized && !statusLoading) {
    //         initializeStatusOptions();
    //     }
    // }, [statusInitialized, statusLoading, initializeStatusOptions]);
    
    // Sync internal state with filter props
    // useEffect(() => {
    //     if (filterStatus) {
    //         const approvalStatusOption = statusOptions.approvalStatus.find(opt => opt.value === filterStatus);
    //         const statusOption = statusOptions.status.find(opt => opt.value === filterStatus);
    //         if (approvalStatusOption) {
    //             if (!selectedApprovalStatus || selectedApprovalStatus.value !== filterStatus) {
    //                 setSelectedApprovalStatus(approvalStatusOption);
    //             }
    //         } else if (selectedApprovalStatus?.value !== filterStatus) {
    //             setSelectedApprovalStatus({ 
    //                 value: filterStatus, 
    //                 label: `Status ${filterStatus}` 
    //             });
    //         }
    //     } else if (!filterStatus && selectedApprovalStatus) {
    //         setSelectedApprovalStatus(null);
    //     }
    // }, [filterStatus, statusOptions]);

    const handleClearAll = () => {
        onClearFilters();
    };
    
    // Check if any filters are active
    const hasActiveFilters = filterSubsidiary || filterLocation || filterStatus;
    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        // value={currentStatusValue}
                        onChange={(selected) => onFilterChange('approvalstatus', selected?.value || '')}
                        options={[
                            { value: 1, label: 'Pending Approval' },
                            { value: 2, label: 'Approved' },
                            { value: 3, label: 'Rejected' }
                        ]}
                        isClearable={true}
                        isSearchable={true}
                        className="w-full"
                    />
                </div>
                
                {/* STATUS */}
                <div>
                    <label htmlFor='status' className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <CustomSelect
                        id="status"
                        name="status"
                        // value={currentStatusValue}
                        onChange={(selected) => onFilterChange('status', selected?.value || '')}
                        options={[
                            { value: 'pendingBilling', label: 'Pending Billing' },
                            { value: 'pendingSupApproval', label: 'Pending Supervisor Approval' },
                            { value: 'pendingReceipt', label: 'Pending Receipt' },
                            // { value: 'rejected', label: 'Rejected' }
                        ]}
                        isClearable={true}
                        isSearchable={true}
                        className="w-full"
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

