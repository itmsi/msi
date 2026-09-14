import React, { useState } from 'react';
import {
    MdClear,
    MdExpandLess,
    MdExpandMore,
    MdFilterListAlt,
    MdSearch,
} from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';

export type FulfillmentFilterField = 'sort_order' | 'status' | 'source_type';

export interface FulfillmentFilterValues {
    sort_order: 'asc' | 'desc';
    status: string;
    source_type: string;
}

interface FilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchKeyPress: (e: React.KeyboardEvent) => void;
    onClearSearch: () => void;

    filters: FulfillmentFilterValues;
    onFilterChange: (field: FulfillmentFilterField, value: string) => void;
    onClearFilters: () => void;

    searchPlaceholder?: string;
    defaultOpen?: boolean;
}

const SORT_ORDER_OPTIONS = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending Fulfillment' },
    { value: 'picked', label: 'Picked' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
];

// Nilainya sama dengan source_type di response list
const TYPE_OPTIONS = [
    { value: 'transfer_order', label: 'Transfer Order' },
    { value: 'sales_order', label: 'Sales Order' },
    { value: 'vendor_return', label: 'Vendor Return Authorization' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
    searchValue,
    onSearchChange,
    onSearchKeyPress,
    onClearSearch,
    filters,
    onFilterChange,
    onClearFilters,
    searchPlaceholder = 'Search... (Press Enter)',
    defaultOpen = false,
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(defaultOpen);

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                id="search"
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyPress={onSearchKeyPress}
                                className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                            />
                            {searchValue && (
                                <button
                                    onClick={onClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    type="button"
                                >
                                    <MdClear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={SORT_ORDER_OPTIONS.find(option => option.value === filters.sort_order) || null}
                        onChange={(selectedOption) => onFilterChange('sort_order', selectedOption?.value || 'desc')}
                        options={SORT_ORDER_OPTIONS}
                        placeholder="Order by"
                        isClearable={false}
                        isSearchable={false}
                        className="w-40"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowAdvancedFilters(prev => !prev)}
                        className="h-10.5 px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 relative"
                        size="sm"
                    >
                        <MdFilterListAlt className="w-4 h-4 mr-2" />
                        Filter
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="source_type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <CustomSelect
                                id="source_type"
                                name="source_type"
                                value={TYPE_OPTIONS.find(option => option.value === filters.source_type) || null}
                                onChange={(option) => onFilterChange('source_type', option?.value || '')}
                                options={TYPE_OPTIONS}
                                placeholder="All Types"
                                isClearable={true}
                                isSearchable={true}
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <CustomSelect
                                id="status"
                                name="status"
                                value={STATUS_OPTIONS.find(option => option.value === filters.status) || null}
                                onChange={(option) => onFilterChange('status', option?.value || '')}
                                options={STATUS_OPTIONS}
                                placeholder="All Status"
                                isClearable={true}
                                isSearchable={true}
                            />
                        </div>
                    </div>

                    {/* Filter actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Button
                            onClick={onClearFilters}
                            className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                            size="sm"
                        >
                            <MdClear className="w-4 h-4 mr-1" />
                            Clear All
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FilterSection;
