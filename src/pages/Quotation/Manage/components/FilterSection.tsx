import React, { useEffect, useState, useRef } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { IslandSelectOption, useIslandSelect } from '@/hooks/useIslandSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { MdDateRange, MdClear } from 'react-icons/md';
import { formatDateToYMD } from '@/helpers/generalHelper';

interface FilterSectionProps {
    quotationFor?: string;
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
    onApplyFilters?: () => void;
}

interface FilterOption {
    value: string;
    label: string;
}

// Config filter - mudah untuk extend dengan field baru
const filterConfigs = [
    {
        id: 'quotation_for',
        label: 'Quotation For',
        options: [
            { value: 'customer', label: 'Customer' },
            { value: 'leasing', label: 'Leasing' }
        ],
        placeholder: 'All Types'
    }
];

const FilterSection: React.FC<FilterSectionProps> = ({
    quotationFor,
    onFilterChange,
    onClearFilters
}) => {
    const {
        islandOptions,
        pagination: islandPagination,
        inputValue: islandInputValue,
        handleInputChange: handleIslandInputChange,
        handleMenuScrollToBottom: handleIslandMenuScrollToBottom,
        initializeOptions: initializeIslandOptions
    } = useIslandSelect();
    const [selectedIsland, setSelectedIsland] = useState<IslandSelectOption | null>(null);
    
    // Date Range states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initializeIslandOptions();
    }, [initializeIslandOptions]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const getCurrentValue = (filterId: string): { value: string; label: string } | null => {
        switch (filterId) {
            case 'quotation_for':
                return quotationFor ? {
                    value: quotationFor,
                    label: quotationFor === 'customer' ? 'Customer' : 'Leasing'
                } : null;
            default:
                return null;
        }
    };

    const handleFilterChange = (filterId: string, selectedOption: FilterOption | null) => {
        if (filterId === 'status' || filterId === 'date_range') {
            console.log(`${filterId} filter:`, selectedOption?.value);
            return;
        }
        
        if (filterId === 'island') {
            const island = islandOptions.find(opt => opt.value === selectedOption?.value) || null;
            setSelectedIsland(island);
        }
        
        onFilterChange(filterId, selectedOption?.value || '');
    };

    const [dateRangeState, setDateRangeState] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    }]);
    
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
    
    // Clear all filters handler
    const handleClearAllFilters = () => {
        setSelectedIsland(null);
        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);
        setShowDatePicker(false);
        onClearFilters();
    };
    
    // Get display text for date range
    const getDateRangeDisplayText = (): string => {
        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            return `${selectedDateRange.startDate} - ${selectedDateRange.endDate}`;
        }
        return 'Select Date Range';
    };
    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <CustomAsyncSelect
                    placeholder="Select Island..."
                    value={selectedIsland}
                    defaultOptions={islandOptions}
                    loadOptions={handleIslandInputChange}
                    onMenuScrollToBottom={handleIslandMenuScrollToBottom}
                    isLoading={islandPagination.loading}
                    noOptionsMessage={() => "No islands found"}
                    loadingMessage={() => "Loading islands"}
                    isSearchable={true}
                    isClearable={true}
                    inputValue={islandInputValue}
                    onInputChange={(inputValue) => {
                        handleIslandInputChange(inputValue);
                    }}
                    onChange={(option: IslandSelectOption | null) => {
                        setSelectedIsland(option);
                        onFilterChange('island_id', option?.value || '');
                    }}
                />
                {filterConfigs.map((config) => (
                    <div key={config.id}>
                        <CustomSelect
                            id={config.id}
                            name={config.id}
                            value={getCurrentValue(config.id)}
                            onChange={(selectedOption) => handleFilterChange(config.id, selectedOption)}
                            options={config.options}
                            placeholder={config.placeholder}
                            isClearable={true}
                            isSearchable={false}
                            className="w-full"
                        />
                    </div>
                ))}
                
                {/* DATE RANGE PICKER */}
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

            {/* Filter actions */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                    size="sm"
                >
                    Clear All
                </Button>
                {/* {onApplyFilters && (
                    <Button
                        onClick={onApplyFilters}
                        className="px-4 py-2"
                        size="sm"
                    >
                        Apply Filters
                    </Button>
                )} */}
            </div>
        </div>
    );
};

export default FilterSection;