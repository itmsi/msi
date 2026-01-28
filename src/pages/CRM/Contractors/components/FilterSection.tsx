import React, { useEffect, useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { SegementationSelectOption, useSegementationSelect } from '@/hooks/useSegmentSelect';

interface FilterSectionProps {
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
        id: 'status',
        label: 'Filter by Status',
        options: [
            { value: '', label: 'All Status' },
            { value: 'aktif', label: 'Active' },
            { value: 'non aktif', label: 'Inactive' }
        ],
        placeholder: 'Filter by Status'
    },
    {
        id: 'sort_by',
        label: 'Sort by',
        options: [
            { value: '', label: 'All Modify' },
            { value: 'updated_at', label: 'Updated' },
            { value: 'created_at', label: 'Created' }
        ],
        placeholder: 'Sort by',
    }
];

const FilterSection: React.FC<FilterSectionProps> = ({
    onFilterChange,
    onClearFilters,
    onApplyFilters
}) => {
    const {
        segementationOptions,
        inputValue: segmentationInputValue,
        handleInputChange: handleSegmentationInputChange,
        pagination: segmentationPagination,
        handleMenuScrollToBottom: handleSegmentationMenuScrollToBottom,
        initializeOptions: initializeSegementationOptions
    } = useSegementationSelect();

    const [selectedSegment, setSelectedSegment] = useState<SegementationSelectOption | null>(null);

    const [filterValues, setFilterValues] = useState<{[key: string]: string}>({
        status: '',
        sort_by: ''
    });

    useEffect(() => {
        initializeSegementationOptions();
    }, [initializeSegementationOptions]);

    const getCurrentValue = (filterId: string): { value: string; label: string } | null => {
        const value = filterValues[filterId];
        if (!value) return null;
        
        const config = filterConfigs.find(config => config.id === filterId);
        const option = config?.options.find(opt => opt.value === value);
        
        return option || null;
    };

    const handleFilterChangeInternal = (filterId: string, selectedOption: FilterOption | null) => {
        if (filterId === 'segmentation') {
            const segment = segementationOptions.find(opt => opt.value === selectedOption?.value) || null;
            setSelectedSegment(segment);
        } else {
            setFilterValues(prev => ({
                ...prev,
                [filterId]: selectedOption?.value || ''
            }));
        }
        
        onFilterChange(filterId, selectedOption?.value || '');
    };
    
    const handleClearAllFilters = () => {
        setSelectedSegment(null);
        setFilterValues({
            status: '',
            sort_by: ''
        });
        onClearFilters();
    };
    
    return (
        <div className="mt-4 pt-4 border-t border-gray-200 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <CustomAsyncSelect
                    placeholder="Select Segmentation..."
                    value={selectedSegment}
                    defaultOptions={segementationOptions}
                    loadOptions={handleSegmentationInputChange}
                    onMenuScrollToBottom={() => {
                        handleSegmentationMenuScrollToBottom();
                    }}
                    isLoading={segmentationPagination.loading}
                    noOptionsMessage={() => "No segments found"}
                    loadingMessage={() => segementationOptions.length > 0 ? "Loading segments..." : ""}
                    isSearchable={true}
                    isClearable={true}
                    inputValue={segmentationInputValue}
                    className="w-full md:col-span-2"
                    onInputChange={(inputValue) => {
                        handleSegmentationInputChange(inputValue);
                    }}
                    onChange={(option: SegementationSelectOption | null) => {
                        setSelectedSegment(option);
                        onFilterChange('segmentation', option?.value || '');
                    }}
                />
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
                {onApplyFilters && (
                    <Button
                        onClick={onApplyFilters}
                        className="px-4 py-2"
                        size="sm"
                    >
                        Apply Filters
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FilterSection;