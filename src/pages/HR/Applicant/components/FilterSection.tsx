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

export type ApplicantFilterField = 'sort_order' | 'is_completed';

export interface ApplicantFilterValues {
    sort_order: 'asc' | 'desc';
    is_completed: '' | 'true' | 'false';
}

interface FilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchKeyPress: (e: React.KeyboardEvent) => void;
    onClearSearch: () => void;

    filters: ApplicantFilterValues;
    onFilterChange: (field: ApplicantFilterField, value: string) => void;
    onClearFilters: () => void;

    searchPlaceholder?: string;
    defaultOpen?: boolean;
}

const SORT_ORDER_OPTIONS = [
    { value: 'desc', label: 'Terbaru' },
    { value: 'asc', label: 'Terlama' },
];

const COMPLETED_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'true', label: 'Selesai' },
    { value: 'false', label: 'Belum Selesai' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
    searchValue,
    onSearchChange,
    onSearchKeyPress,
    onClearSearch,
    filters,
    onFilterChange,
    onClearFilters,
    searchPlaceholder = 'Cari... (tekan Enter)',
    defaultOpen = false,
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(defaultOpen);

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
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
                        onChange={(option) => onFilterChange('sort_order', option?.value || 'desc')}
                        options={SORT_ORDER_OPTIONS}
                        placeholder="Urutkan"
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

            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="is_completed" className="block text-sm font-medium text-gray-700 mb-1">Status Formulir</label>
                            <CustomSelect
                                id="is_completed"
                                name="is_completed"
                                value={COMPLETED_OPTIONS.find(option => option.value === filters.is_completed) || COMPLETED_OPTIONS[0]}
                                onChange={(option) => onFilterChange('is_completed', option?.value || '')}
                                options={COMPLETED_OPTIONS}
                                placeholder="Semua Status"
                                isClearable={false}
                                isSearchable={false}
                            />
                        </div>
                    </div>

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
