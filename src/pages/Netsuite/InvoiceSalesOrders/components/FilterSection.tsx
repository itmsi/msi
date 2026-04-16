import React, { useEffect, useRef, useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { MdDateRange, MdClear } from 'react-icons/md';
import { formatDateToYMD } from '@/helpers/generalHelper';
import { useSubsidiarySelect } from '@/hooks/useSubsidiarySelect';

interface FilterSectionProps {
    filterApprovalStatus?: string;
    filterStartDate?: string;
    filterEndDate?: string;
    filterSubsidiary?: string;
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
}

const APPROVAL_STATUS_OPTIONS = [
    { value: '1', label: 'Paid In Full' },
    { value: '2', label: 'Pending Approval' },
    { value: '3', label: 'Rejected' },
];

const FilterSection: React.FC<FilterSectionProps> = ({
    filterApprovalStatus,
    filterStartDate,
    filterEndDate,
    filterSubsidiary,
    onFilterChange,
    onClearFilters,
}) => {
    const { subsidiaryOptions, loading: subsidiaryLoading, initializeOptions } = useSubsidiarySelect();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: filterStartDate || '',
        endDate: filterEndDate || '',
    });
    const [dateRangeState, setDateRangeState] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);

    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initializeOptions();
    }, [initializeOptions]);

    // Sync external clear
    useEffect(() => {
        if (!filterStartDate && !filterEndDate) {
            setSelectedDateRange({ startDate: '', endDate: '' });
            setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        }
    }, [filterStartDate, filterEndDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateRangeChange = (item: any) => {
        const selection = item.selection;
        setDateRangeState([selection]);

        if (selection.startDate && selection.endDate) {
            const formattedStart = formatDateToYMD(selection.startDate);
            const formattedEnd = formatDateToYMD(selection.endDate);
            setSelectedDateRange({ startDate: formattedStart, endDate: formattedEnd });
            onFilterChange('trandate_start', formattedStart);
            onFilterChange('trandate_end', formattedEnd);
        }
    };

    const handleClearDateRange = () => {
        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        onFilterChange('trandate_start', '');
        onFilterChange('trandate_end', '');
        setShowDatePicker(false);
    };

    const handleClearAll = () => {
        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
        setShowDatePicker(false);
        onClearFilters();
    };

    const getDateRangeDisplayText = (): string => {
        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            return `${selectedDateRange.startDate} → ${selectedDateRange.endDate}`;
        }
        return 'Select date range...';
    };

    const currentStatusValue = filterApprovalStatus
        ? APPROVAL_STATUS_OPTIONS.find(o => o.value === filterApprovalStatus) || null
        : null;

    const currentSubsidiaryValue = filterSubsidiary
        ? subsidiaryOptions.find(o => o.value === filterSubsidiary) || null
        : null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Subsidiary */}
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

                {/* Approval Status */}
                <CustomSelect
                    id="approvalstatus"
                    name="approvalstatus"
                    value={currentStatusValue}
                    onChange={(selected) => onFilterChange('approvalstatus', selected?.value || '')}
                    options={APPROVAL_STATUS_OPTIONS}
                    placeholder="All Statuses"
                    isClearable={true}
                    isSearchable={false}
                    className="w-full"
                />

                {/* Date Range Picker */}
                <div className="relative" ref={datePickerRef}>
                    <div
                        className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-[43px] flex items-center justify-between"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <div className="flex items-center gap-2">
                            <MdDateRange className="text-gray-400" size={18} />
                            <span className={`text-sm ${selectedDateRange.startDate && selectedDateRange.endDate ? 'text-gray-900' : 'text-gray-400'}`}>
                                {getDateRangeDisplayText()}
                            </span>
                        </div>
                        {selectedDateRange.startDate && selectedDateRange.endDate && (
                            <MdClear
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearDateRange();
                                }}
                            />
                        )}
                    </div>

                    {showDatePicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg">
                            <DateRange
                                editableDateInputs={true}
                                onChange={handleDateRangeChange}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRangeState}
                                direction="horizontal"
                                rangeColors={['#0253a5']}
                                color="#0253a5"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Filter actions */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                    size="sm"
                >
                    Clear All Filters
                </Button>
            </div>
        </div>
    );
};

export default FilterSection;
