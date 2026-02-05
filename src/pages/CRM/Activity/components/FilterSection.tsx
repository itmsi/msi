import React, { useEffect, useRef, useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { MdDateRange, MdClear } from 'react-icons/md';
import { formatDateToYMD } from '@/helpers/generalHelper';

interface FilterSectionProps {
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
}

interface FilterOption {
    value: string;
    label: string;
}

// Config filter - mudah untuk extend dengan field baru
const filterConfigs = [
    {
        id: 'transaction_type',
        label: 'Transaction Type',
        options: [
            { value: '', label: 'All Transaction Types' },
            { value: 'Find', label: 'Find' },
            { value: 'Pull', label: 'Pull' },
            { value: 'Survey', label: 'Survey' }
        ],
        placeholder: 'Filter by Transaction Type'
    },
    {
        id: 'sort_by',
        label: 'Sort By',
        options: [
            { value: '', label: 'Default Sort' },
            { value: 'updated_at', label: 'Updated Date' },
            { value: 'created_at', label: 'Created Date' }
        ],
        placeholder: 'Sort by Field'
    }
];

const FilterSection: React.FC<FilterSectionProps> = ({
    onFilterChange,
    onClearFilters
}) => {
    const datePickerRef = useRef<HTMLDivElement>(null);
    
    // Internal filter state
    const [filterValues, setFilterValues] = useState<{[key: string]: string}>({
        transaction_type: '',
        sort_by: 'updated_at'
    });
    
    // Date Range states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const [dateRangeState, setDateRangeState] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    }]);

    // Initialize date range state (akan diupdate saat ada perubahan dari parent)
    // useEffect(() => {
    //     if (filters.start_date && filters.end_date) {
    //         setSelectedDateRange({
    //             startDate: filters.start_date,
    //             endDate: filters.end_date
    //         });
    //         
    //         // Update date range state for DateRange component
    //         setDateRangeState([{
    //             startDate: new Date(filters.start_date),
    //             endDate: new Date(filters.end_date),
    //             key: 'selection'
    //         }]);
    //     }
    // }, [filters.start_date, filters.end_date]);

    // Handle click outside to close date picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCurrentValue = (filterId: string): FilterOption | null => {
        const value = filterValues[filterId];
        if (!value) return null;
        
        const config = filterConfigs.find(config => config.id === filterId);
        const option = config?.options.find(opt => opt.value === value);
        
        return option || null;
    };

    // Get display text for date range
    const getDateRangeDisplayText = (): string => {
        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            return `${selectedDateRange.startDate} - ${selectedDateRange.endDate}`;
        }
        return 'Select Date Range';
    };

    const handleDateRangeChange = (item: any) => {
        const selection = item.selection;
        setDateRangeState([selection]);
        
        if (selection.startDate && selection.endDate) {
            const formattedStartDate = formatDateToYMD(selection.startDate);
            const formattedEndDate = formatDateToYMD(selection.endDate);
            
            setSelectedDateRange({
                startDate: formattedStartDate,
                endDate: formattedEndDate
            });
            
            onFilterChange('start_date', formattedStartDate);
            onFilterChange('end_date', formattedEndDate);
        }
    };
    
    // Clear date range
    const handleClearDateRange = () => {
        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);
        onFilterChange('start_date', '');
        onFilterChange('end_date', '');
        setShowDatePicker(false);
    };

    const renderFilter = (config: typeof filterConfigs[0]) => {
        const currentValue = getCurrentValue(config.id);
        
        return (
            <div key={config.id}>
                <CustomSelect
                    value={currentValue}
                    onChange={(option) => {
                        const newValue = option?.value || '';
                        setFilterValues(prev => ({ ...prev, [config.id]: newValue }));
                        onFilterChange(config.id, newValue);
                    }}
                    options={config.options}
                    placeholder={config.placeholder}
                    className="w-full"
                    isClearable={false}
                    isSearchable={false}
                />
            </div>
        );
    };

    const handleClearAllFilters = () => {
        setFilterValues({
            transaction_type: '',
            sort_by: 'updated_at'
        });
        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);
        onClearFilters();
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filterConfigs.map(config => renderFilter(config))}
                <div className="relative" ref={datePickerRef}>
                    <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-h-[43px] flex items-center justify-between"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <div className="flex items-center gap-2">
                            <MdDateRange className="text-gray-400" />
                            <span className={`${
                                selectedDateRange.startDate && selectedDateRange.endDate 
                                    ? 'text-gray-900' 
                                    : 'text-gray-500'
                            }`}>
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
            
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button 
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                    size="sm"
                >
                    Clear All
                </Button>
            </div>
        </div>
    );
};

export default FilterSection;
