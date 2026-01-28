import React, { useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';

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
        placeholder: 'Sort by Field',
    }
];

const FilterSection: React.FC<FilterSectionProps> = ({
    onFilterChange,
    onClearFilters
}) => {
    const [filterValues, setFilterValues] = useState<{[key: string]: string}>({
        transaction_type: '',
        sort_by: ''
    });

    const getCurrentValue = (filterId: string): { value: string; label: string } | null => {
        const value = filterValues[filterId];
        if (!value) return null;
        
        const config = filterConfigs.find(config => config.id === filterId);
        const option = config?.options.find(opt => opt.value === value);
        
        return option || null;
    };

    const handleFilterChangeInternal = (filterId: string, selectedOption: FilterOption | null) => {
        setFilterValues(prev => ({
            ...prev,
            [filterId]: selectedOption?.value || ''
        }));
        
        onFilterChange(filterId, selectedOption?.value || '');
    };
    
    const handleClearAllFilters = () => {
        setFilterValues({
            transaction_type: '',
            sort_by: ''
        });
        onClearFilters();
    };
    
    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filterConfigs.map((config) => (
                    <div key={config.id}>
                        <CustomSelect
                            id={config.id}
                            name={config.id}
                            value={getCurrentValue(config.id)}
                            onChange={(selectedOption) => handleFilterChangeInternal(config.id, selectedOption)}
                            options={config.options}
                            placeholder={config.placeholder}
                            isClearable={true}
                            isSearchable={false}
                            className="w-full"
                        />
                    </div>
                ))}
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
            </div>
        </div>
    );
};

export default FilterSection;
