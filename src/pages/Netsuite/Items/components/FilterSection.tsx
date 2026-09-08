import React from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';

interface FilterSectionProps {
    filterItemType?: string;
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
}

const ITEM_TYPE_OPTIONS = [
    { value: 'Inventory Item', label: 'Inventory Item' },
    { value: 'Non-inventory Item', label: 'Non-inventory Item' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
    filterItemType,
    onFilterChange,
    onClearFilters,
}) => {
    const currentItemTypeValue = filterItemType
        ? ITEM_TYPE_OPTIONS.find(o => o.value === filterItemType) || null
        : null;

    const hasActiveFilters = Boolean(filterItemType);

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
