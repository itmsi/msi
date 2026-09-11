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
    MdSearch,
} from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { usePOLocationSelect } from '@/hooks/usePOLocationSelect';
import { formatDateToYMD } from '@/helpers/generalHelper';

export type TransferOrderFilterField =
    | 'sort_order'
    | 'from_location_id'
    | 'to_location_id'
    | 'status_name';

export interface TransferOrderFilterValues {
    sort_order: 'asc' | 'desc';
    from_location_id: string;
    to_location_id: string;
    status_name: string;
    start_date: string;
    end_date: string;
}

interface FilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearchKeyPress: (e: React.KeyboardEvent) => void;
    onClearSearch: () => void;

    filters: TransferOrderFilterValues;
    statusOptions: { value: string; label: string }[];
    onFilterChange: (field: TransferOrderFilterField, value: string) => void;
    onDateRangeChange: (startDate: string, endDate: string) => void;
    onClearFilters: () => void;

    searchPlaceholder?: string;
    defaultOpen?: boolean;
}

type LocationOption = { value: string; label: string };

const SORT_ORDER_OPTIONS = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
    searchValue,
    onSearchChange,
    onSearchKeyPress,
    onClearSearch,
    filters,
    statusOptions,
    onFilterChange,
    onDateRangeChange,
    onClearFilters,
    searchPlaceholder = 'Search... (Press Enter)',
    defaultOpen = false,
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(defaultOpen);

    // From Location
    const {
        POLocationOptions: locationOptions,
        pagination: locationPagination,
        inputValue: locationInputValue,
        handleInputChange: handleLocationInputChange,
        handleMenuScrollToBottom: handleLocationMenuScrollToBottom,
        initializeOptions: initializeLocationOptions,
    } = usePOLocationSelect(30, false);

    // To Location
    const {
        POLocationOptions: transferLocationOptions,
        pagination: transferLocationPagination,
        inputValue: transferLocationInputValue,
        handleInputChange: handleTransferLocationInputChange,
        handleMenuScrollToBottom: handleTransferLocationMenuScrollToBottom,
        initializeOptions: initializeTransferLocationOptions,
    } = usePOLocationSelect(30, false);

    useEffect(() => {
        initializeLocationOptions();
        initializeTransferLocationOptions();
    }, [initializeLocationOptions, initializeTransferLocationOptions]);

    const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
    const [selectedTransferLocation, setSelectedTransferLocation] = useState<LocationOption | null>(null);

    useEffect(() => {
        if (!filters.from_location_id) {
            setSelectedLocation(null);
            return;
        }

        const option = locationOptions.find(opt => opt.value === filters.from_location_id);
        setSelectedLocation((prev) => {
            if (option) return option;
            if (prev?.value === filters.from_location_id) return prev;
            return { value: filters.from_location_id, label: `Location ${filters.from_location_id}` };
        });
    }, [filters.from_location_id, locationOptions]);

    useEffect(() => {
        if (!filters.to_location_id) {
            setSelectedTransferLocation(null);
            return;
        }

        const option = transferLocationOptions.find(opt => opt.value === filters.to_location_id);
        setSelectedTransferLocation((prev) => {
            if (option) return option;
            if (prev?.value === filters.to_location_id) return prev;
            return { value: filters.to_location_id, label: `Location ${filters.to_location_id}` };
        });
    }, [filters.to_location_id, transferLocationOptions]);

    // Date range
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [dateRangeState, setDateRangeState] = useState([{
        startDate: new Date(),
        endDate: new Date(),
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

    useEffect(() => {
        if (!filters.start_date && !filters.end_date) {
            setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        }
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

    const handleClearDateRange = useCallback(() => {
        setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        setShowDatePicker(false);
        onDateRangeChange('', '');
    }, [onDateRangeChange]);

    const handleClearAll = () => {
        setSelectedLocation(null);
        setSelectedTransferLocation(null);
        onClearFilters();
    };

    const dateRangeDisplayText = filters.start_date && filters.end_date
        ? `${moment(filters.start_date).format('DD MMM YYYY')} - ${moment(filters.end_date).format('DD MMM YYYY')}`
        : 'Select Date Range';

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                            <CustomAsyncSelect
                                name="filter_location"
                                value={selectedLocation}
                                onChange={(opt) => {
                                    setSelectedLocation(opt);
                                    onFilterChange('from_location_id', opt?.value || '');
                                }}
                                defaultOptions={locationOptions}
                                loadOptions={handleLocationInputChange}
                                onMenuScrollToBottom={handleLocationMenuScrollToBottom}
                                isLoading={locationPagination.loading}
                                inputValue={locationInputValue}
                                onInputChange={handleLocationInputChange}
                                placeholder="All Locations"
                                isClearable={true}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                            <CustomAsyncSelect
                                name="filter_transferlocation"
                                value={selectedTransferLocation}
                                onChange={(opt) => {
                                    setSelectedTransferLocation(opt);
                                    onFilterChange('to_location_id', opt?.value || '');
                                }}
                                defaultOptions={transferLocationOptions}
                                loadOptions={handleTransferLocationInputChange}
                                onMenuScrollToBottom={handleTransferLocationMenuScrollToBottom}
                                isLoading={transferLocationPagination.loading}
                                inputValue={transferLocationInputValue}
                                onInputChange={handleTransferLocationInputChange}
                                placeholder="All Locations"
                                isClearable={true}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <CustomSelect
                                options={statusOptions}
                                value={statusOptions.find(option => option.value === filters.status_name) || null}
                                onChange={(option) => onFilterChange('status_name', option?.value || '')}
                                placeholder="Select Status"
                                isClearable={false}
                                isSearchable={false}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <div className="relative" ref={datePickerRef}>
                                <div
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-10.7 flex items-center justify-between"
                                    onClick={() => setShowDatePicker(prev => !prev)}
                                >
                                    <div className="flex items-center gap-2">
                                        <MdDateRange className="text-gray-400" />
                                        <span className={filters.start_date && filters.end_date ? 'text-gray-900' : 'text-gray-500'}>
                                            {dateRangeDisplayText}
                                        </span>
                                    </div>
                                    {filters.start_date && filters.end_date && (
                                        <MdClear
                                            className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearDateRange();
                                            }}
                                        />
                                    )}
                                </div>

                                {showDatePicker && (
                                    <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <DateRange
                                            editableDateInputs={true}
                                            onChange={handleDateRangeSelect}
                                            moveRangeOnFirstSelection={false}
                                            ranges={dateRangeState}
                                            direction="horizontal"
                                            rangeColors={['#0253a5']}
                                            color="#0253a5"
                                        />
                                        <div className="flex justify-end px-3 py-2 border-t border-gray-200 bg-gray-50">
                                            <Button
                                                type="button"
                                                onClick={() => setShowDatePicker(false)}
                                                size="sm"
                                                className="px-4 py-1"
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filter actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Button
                            onClick={handleClearAll}
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
