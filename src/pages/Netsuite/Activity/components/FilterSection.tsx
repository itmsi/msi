import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
    MdClear,
    MdDateRange,
    MdExpandLess,
    MdExpandMore,
    MdFilterListAlt,
} from 'react-icons/md';
import SearchInput from '@/components/form/input/SearchInput';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import ModuleNameSelectField from '@/components/form/select/ModuleNameSelectField';
import { formatDateToYMD, getProfile } from '@/helpers/generalHelper';

export type ActivityFilterField = 'sort_order' | 'type_data' | 'client' | 'status' | 'module_name';

export interface ActivityFilterValues {
    sort_order: 'asc' | 'desc';
    type_data: string;
    client: string;
    status: string;
    module_name: string;
    start_date: string;
    end_date: string;
}

interface FilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onClearSearch: () => void;

    filters: ActivityFilterValues;
    typeDataOptions: { value: string; label: string }[];
    clientOptions: { value: string; label: string }[];
    onFilterChange: (field: ActivityFilterField, value: string) => void;
    onDateRangeChange: (startDate: string, endDate: string) => void;
    onClearFilters: () => void;

    searchPlaceholder?: string;
    defaultOpen?: boolean;
}

const SORT_ORDER_OPTIONS = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' }
];
const SORT_STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' }
];

const FilterSection: React.FC<FilterSectionProps> = ({
    searchValue,
    onSearchChange,
    onSearch,
    onClearSearch,
    filters,
    typeDataOptions,
    clientOptions,
    onFilterChange,
    onDateRangeChange,
    onClearFilters,
    searchPlaceholder = 'Search... (Press Enter)',
    defaultOpen = false,
}) => {
    const profileSSO = getProfile() as any;
    const profileSSOITI = profileSSO.company_name;
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(defaultOpen);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [dateRangeState, setDateRangeState] = useState([{
        startDate: filters.start_date ? moment(filters.start_date, 'YYYY-MM-DD').toDate() : new Date(),
        endDate: filters.end_date ? moment(filters.end_date, 'YYYY-MM-DD').toDate() : new Date(),
        key: 'selection',
    }]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Kalender ikut nilai filter di URL, supaya tetap benar setelah refresh atau tombol Back.
    useEffect(() => {
        setDateRangeState([{
            startDate: filters.start_date ? moment(filters.start_date, 'YYYY-MM-DD').toDate() : new Date(),
            endDate: filters.end_date ? moment(filters.end_date, 'YYYY-MM-DD').toDate() : new Date(),
            key: 'selection',
        }]);
    }, [filters.start_date, filters.end_date]);

    const handleDateRangeSelect = useCallback((item: RangeKeyDict) => {
        const selection = item.selection;
        if (!selection?.startDate || !selection?.endDate) return;

        setDateRangeState([{
            startDate: selection.startDate,
            endDate: selection.endDate,
            key: 'selection',
        }]);
        onDateRangeChange(formatDateToYMD(selection.startDate), formatDateToYMD(selection.endDate));
    }, [onDateRangeChange]);

    const dateRangeDisplayText = filters.start_date && filters.end_date
        ? `${moment(filters.start_date).format('DD MMM YYYY')} - ${moment(filters.end_date).format('DD MMM YYYY')}`
        : 'Select Date Range';

    const FilterAscDesc = () => (
        <div className="flex items-center gap-2">
            <CustomSelect
                id="sort_order"
                name="sort_order"
                value={SORT_ORDER_OPTIONS.find(option => option.value === filters.sort_order) || null}
                onChange={(option) => onFilterChange('sort_order', option?.value || 'desc')}
                options={SORT_ORDER_OPTIONS}
                placeholder="Sort by"
                isClearable={false}
                isSearchable={false}
                className="w-40"
            />
        </div>
    )
    const FilterStatus = () => (
        <CustomSelect
            id="status"
            name="status"
            value={SORT_STATUS_OPTIONS.find(option => option.value === filters.status) || null}
            onChange={(option) => onFilterChange('status', option?.value || '')}
            options={SORT_STATUS_OPTIONS}
            placeholder="Status"
            isClearable={false}
            isSearchable={false}
        // className="w-40"
        />
    )
    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
                    <SearchInput
                        value={searchValue}
                        onChange={onSearchChange}
                        onSearch={onSearch}
                        onClear={onClearSearch}
                        placeholder={searchPlaceholder}
                    />
                </div>

                <FilterAscDesc />
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
                        {profileSSOITI === 'MSI' && <>
                            <div>
                                <label htmlFor="type_data" className="block text-sm font-medium text-gray-700 mb-1">Type Data</label>
                                <CustomSelect
                                    id="type_data"
                                    name="type_data"
                                    value={typeDataOptions.find(option => option.value === filters.type_data) || typeDataOptions[0]}
                                    onChange={(option) => onFilterChange('type_data', option?.value || '')}
                                    options={typeDataOptions}
                                    placeholder="All Types"
                                    isClearable={false}
                                    isSearchable={false}
                                />
                            </div>

                            <div>
                                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                <CustomSelect
                                    id="client"
                                    name="client"
                                    value={clientOptions.find(option => option.value === filters.client) || clientOptions[0]}
                                    onChange={(option) => onFilterChange('client', option?.value || '')}
                                    options={clientOptions}
                                    placeholder="All Clients"
                                    isClearable={false}
                                    isSearchable={false}
                                />
                            </div>
                        </>}
                        <div className="" ref={datePickerRef}>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowDatePicker(prev => !prev)}
                                    className="h-10.5 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 w-full"
                                >
                                    <MdDateRange className="w-4 h-4 text-gray-400" />
                                    {dateRangeDisplayText}
                                </button>

                                {showDatePicker && (
                                    <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                        <DateRange
                                            ranges={dateRangeState}
                                            onChange={handleDateRangeSelect}
                                            moveRangeOnFirstSelection={false}
                                            rangeColors={['#3b82f6']}
                                            maxDate={new Date()}
                                        />
                                        <div className="flex justify-end px-3 py-2 border-t border-gray-200 bg-gray-50">
                                            <Button type="button" onClick={() => setShowDatePicker(false)} size="sm" className="px-4 py-1">
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <FilterStatus />
                        </div>

                        <ModuleNameSelectField
                            value={filters.module_name}
                            onChange={(option) => onFilterChange('module_name', option?.value || '')}
                        />
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
