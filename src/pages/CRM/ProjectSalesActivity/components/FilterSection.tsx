import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/button/Button';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { MdDateRange, MdClear } from 'react-icons/md';
import IupContractorSelect from '@/components/form/select/IupContractorSelect';
import { useIupSelect } from '@/hooks/useIupSelect';
import { ContractorServices } from '@/pages/CRM/Contractors/services/contractorServices';
import moment from 'moment';

type FilterState = {
    search?: string;
    sort_order?: 'asc' | 'desc';
    project_id?: string;
    iup_id?: string;
    iup_customer_id?: string;
    project_status?: string;
    start_date?: string;
    end_date?: string;
};
interface FilterSectionProps {
    filterIup?: string;
    filterContractor?: string;
    filterStartDate?: string;
    filterEndDate?: string;
    // onFilterChange: (field: string, value: string) => void;
    onFilterChange: (fields: Partial<FilterState>) => void;
    onClearFilters: () => void;
}

type SelectValue = { value: string; label: string };

const FilterSection: React.FC<FilterSectionProps> = ({
    filterIup,
    filterContractor,
    filterStartDate,
    filterEndDate,
    onFilterChange,
    onClearFilters
}) => {
    const datePickerRef = useRef<HTMLDivElement>(null);
    const { getIupById } = useIupSelect();
    
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

    const [resolvedIupValue, setResolvedIupValue] = useState<SelectValue | null>(null);
    const [resolvedContractorValue, setResolvedContractorValue] = useState<SelectValue | null>(null);

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

    useEffect(() => {
        let isMounted = true;

        const fetchIupLabel = async () => {
            if (!filterIup) {
                setResolvedIupValue(null);
                return;
            }

            try {
                const iup = await getIupById(filterIup);
                if (!isMounted) return;

                setResolvedIupValue(iup ? { value: iup.value, label: iup.label } : { value: filterIup, label: '' });
            } catch {
                if (!isMounted) return;
                setResolvedIupValue({ value: filterIup, label: '' });
            }
        };

        fetchIupLabel();
        return () => {
            isMounted = false;
        };
    }, [filterIup, getIupById]);

    useEffect(() => {
        let isMounted = true;

        const fetchContractorLabel = async () => {
            if (!filterContractor) {
                setResolvedContractorValue(null);
                return;
            }

            try {
                const response = await ContractorServices.getContractorById(filterContractor);
                if (!isMounted) return;

                const customerName = response?.data?.customer_data?.customer_name || '';
                setResolvedContractorValue({
                    value: filterContractor,
                    label: customerName
                });
            } catch {
                if (!isMounted) return;
                setResolvedContractorValue({ value: filterContractor, label: '' });
            }
        };

        fetchContractorLabel();
        return () => {
            isMounted = false;
        };
    }, [filterContractor]);

    useEffect(() => {
        if (filterStartDate && filterEndDate) {
            setSelectedDateRange({
                startDate: filterStartDate,
                endDate: filterEndDate
            });

            setDateRangeState([{
                startDate: moment(filterStartDate, 'DD MMM YYYY').toDate(),
                endDate: moment(filterEndDate, 'DD MMM YYYY').toDate(),
                key: 'selection'
            }]);
            return;
        }

        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);
    }, [filterStartDate, filterEndDate]);

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
            const formattedStartDate = moment(selection.startDate, 'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY') ;
            const formattedEndDate = moment(selection.endDate, 'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY') ;
            
            setSelectedDateRange({
                startDate: formattedStartDate,
                endDate: formattedEndDate
            });
            onFilterChange({
                start_date: formattedStartDate,
                end_date: formattedEndDate
            });
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
        onFilterChange({ start_date: '', end_date: '' });
        setShowDatePicker(false);
    };

    const handleClearAllFilters = () => {
        setSelectedDateRange({ startDate: '', endDate: '' });
        setDateRangeState([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);
        onClearFilters();
    };
    
    // Handle IUP and Contractor selection from the reusable component - memoized
    const handleIupChange = useCallback((iup: { value: string; label: string } | null) => {
        onFilterChange({'iup_id': iup?.value || ''});
    }, [onFilterChange]);

    const handleContractorChange = useCallback((contractor: { value: string; label: string } | null) => {
        onFilterChange({'iup_customer_id': contractor?.value || ''});
    }, [onFilterChange]);

    // Memoized values to prevent unnecessary re-renders
    const iupValue = useMemo(() => {
        return resolvedIupValue;
    }, [resolvedIupValue]);

    const contractorValue = useMemo(() => {
        return resolvedContractorValue;
    }, [resolvedContractorValue]);

    // Check if any filters are active
    const hasActiveFilters = iupValue || contractorValue || selectedDateRange.startDate || selectedDateRange.endDate;
    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* IUP Selection and Contractor - Reusable Component */}
                <IupContractorSelect
                    iupValue={iupValue}
                    contractorValue={contractorValue}
                    iupLabel=""
                    iupRequired={false}
                    contractorLabel=""
                    contractorRequired={false}
                    onIupChange={handleIupChange}
                    onContractorChange={handleContractorChange}
                    // disabledContractor={false}
                    disabled={false}
                    layout="horizontal"
                    gridCols="grid-cols-1 md:grid-cols-2"
                    className="md:col-span-2"
                />
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
            
            {hasActiveFilters && (
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button 
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                    size="sm"
                >
                    Clear All
                </Button>
            </div>
            )}
        </div>
    );
};

export default FilterSection;
