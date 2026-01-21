import React from 'react';
import { ActivityFilters } from '../types/activity';
import CustomSelect from '@/components/form/select/CustomSelect';

interface ActivityFiltersProps {
    filters: ActivityFilters;
    onFiltersChange: (filters: Partial<ActivityFilters>) => void;
}

const ActivityFiltersComponent: React.FC<ActivityFiltersProps> = ({
    filters,
    onFiltersChange,
}) => {
    const transactionTypes = [
        { value: '', label: 'All Transaction Types' },
        { value: 'find', label: 'Find' },
        { value: 'pull', label: 'Pull' },
        { value: 'survey', label: 'Survey' }
    ];

    const sortOptions = [
        { value: 'updated_at', label: 'Updated Date' },
        { value: 'created_at', label: 'Created Date' }
    ];

    const sortOrderOptions = [
        { value: 'desc', label: 'Descending' },
        { value: 'asc', label: 'Ascending' }
    ];

    return (
        <>
            <div className='md:col-span-2'>
                <CustomSelect
                    value={transactionTypes.find(option => option.value === filters.transaction_type) || null}
                    onChange={(option) => onFiltersChange({ transaction_type: option?.value || '' })}
                    options={transactionTypes}
                    placeholder="Filter by Transaction Type"
                    className="w-full md:col-span-2"
                    isClearable={false}
                    isSearchable={false}
                />
            </div>
            
            <div className='md:col-span-1'>
                <CustomSelect
                    value={sortOptions.find(option => option.value === filters.sort_by) || null}
                    onChange={(option) => onFiltersChange({ sort_by: option?.value || '' })}
                    options={sortOptions}
                    placeholder="Sort by Field"
                    className="w-full"
                    isClearable={false}
                    isSearchable={false}
                />
            </div>
            
            <div className='md:col-span-1'>
                <CustomSelect
                    value={sortOrderOptions.find(option => option.value === filters.sort_order) || null}
                    onChange={(option) => onFiltersChange({ sort_order: (option?.value || '') as 'asc' | 'desc' | '' })}
                    options={sortOrderOptions}
                    placeholder="Sort Order"
                    className="w-full"
                    isClearable={false}
                    isSearchable={false}
                />
            </div>
        </>
    );
};

export default ActivityFiltersComponent;