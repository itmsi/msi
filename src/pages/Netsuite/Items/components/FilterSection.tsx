import React, { useEffect, useMemo, useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { SelectOption } from '@/types/asyncSelect';

interface FilterSectionProps {
    filterItemType?: string;
    filterLocation?: string;
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
}

const ITEM_TYPE_OPTIONS = [
    { value: 'Inventory Item', label: 'Inventory Item' },
    { value: 'Non-inventory Item', label: 'Non-inventory Item' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
    filterItemType,
    filterLocation,
    onFilterChange,
    onClearFilters,
}) => {
    const currentItemTypeValue = filterItemType
        ? ITEM_TYPE_OPTIONS.find(o => o.value === filterItemType) || null
        : null;

    const hasActiveFilters = Boolean(filterItemType) || Boolean(filterLocation);
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

    const [pickedLocation, setPickedLocation] = useState<SelectOption | null>(null);
    const [locationSelectError, setLocationSelectError] = useState<string>('');

    // Initialize hooks only once when not yet initialized
    useEffect(() => {
        if (!locationInitialized && !locationLoading) {
            initializeLocationOptions();
        }
    }, [locationInitialized, locationLoading, initializeLocationOptions]);

    const selectedLocation = useMemo(() => {
        if (!filterLocation) return null;
        if (pickedLocation?.value === filterLocation) return pickedLocation;
        return POLocationOptions.find(opt => opt.value === filterLocation) || null;
    }, [filterLocation, pickedLocation, POLocationOptions]);
    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Item Type */}
                <div>
                    <label htmlFor='item_type' className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                    <CustomSelect
                        id="item_type"
                        name="item_type"
                        value={currentItemTypeValue}
                        onChange={(selected) => onFilterChange('item_type', selected?.value || '')}
                        options={ITEM_TYPE_OPTIONS}
                        placeholder="All Item Types"
                        isClearable={true}
                        isSearchable={false}
                        className="w-full"
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
                                setPickedLocation(option);
                                onFilterChange('location', option?.value || '');
                                if (locationSelectError) {
                                    setLocationSelectError('');
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
                        onClick={onClearFilters}
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
