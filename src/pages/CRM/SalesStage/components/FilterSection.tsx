
import Button from '@/components/ui/button/Button';
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import IUPAreaSelectField from '@/components/form/select/IUPAreaSelectField';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';
import { SOLUTION_OPTIONS } from '../types/salesStage';
import { FilterState } from '../hooks/useSalesStage';
import IUPEmployeeCRMSelectField from '@/components/form/select/IUPEmployeeCRMSelectField';

interface FilterSectionProps {
    onFilterChange: (field: string, value: string) => void;
    onClearFilters: () => void;
    urlFilters: FilterState;
}

const FilterSection: React.FC<FilterSectionProps> = ({
    onFilterChange,
    onClearFilters,
    urlFilters
}) => {
    const [selectedIupId, setSelectedIupId] = useState<string>('');
    const handleIupChange = (iupId: string) => {
        setSelectedIupId(iupId);
        onFilterChange('iup_id', iupId);
    };

    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const handleEmployeeChange = (employeeId: string) => {
        setSelectedEmployee(employeeId);
        onFilterChange('employee_id', employeeId);
    };

    const handleClearAll = () => {
        setSelectedIupId('');
        setSelectedEmployee(null);
        onClearFilters();
    };
    
    // Check if any filters are active
    
    const [searchParams] = useSearchParams();
    const checkToggleFilter = searchParams.get('iup_id') || searchParams.get('employee_id') || searchParams.get('solution');
    const hasActiveFilters = checkToggleFilter !== null && checkToggleFilter !== '';

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                    <Label>
                        Solutions
                    </Label>
                    
                    <CustomSelect
                        value={SOLUTION_OPTIONS.find(option => option.value !== '' && option.value === urlFilters.solution) || null}
                        onChange={(option) => onFilterChange('solution', option?.value ?? '')}
                        options={SOLUTION_OPTIONS}
                        placeholder="Select solution"
                        isClearable={false}
                        isSearchable={false}
                    />
                </div>
                <IUPAreaSelectField
                    value={selectedIupId}
                    onChange={handleIupChange}
                    required={false}
                />
                
                <IUPEmployeeCRMSelectField
                    value={selectedEmployee}
                    onChange={handleEmployeeChange}
                    required={false}
                    label="Sales Employee"
                    placeholder="Search sales..."
                />
            </div>
            
            {/* Filter actions */}
            {hasActiveFilters && (
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button
                        onClick={handleClearAll}
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

