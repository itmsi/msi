import React, { useState } from 'react';
import {
    MdClear,
    MdExpandLess,
    MdExpandMore,
    MdFilterListAlt,
} from 'react-icons/md';
import SearchInput from '@/components/form/input/SearchInput';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import { useLanguage } from '@/components/lang/useLanguage';
import { applicantManage } from '../language/applicantManage';

export type ApplicantFilterField = 'sort_order' | 'is_completed';

export interface ApplicantFilterValues {
    sort_order: 'asc' | 'desc';
    is_completed: '' | 'true' | 'false';
}

interface FilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onClearSearch: () => void;

    filters: ApplicantFilterValues;
    onFilterChange: (field: ApplicantFilterField, value: string) => void;
    onClearFilters: () => void;

    searchPlaceholder?: string;
    defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
    searchValue,
    onSearchChange,
    onSearch,
    onClearSearch,
    filters,
    onFilterChange,
    onClearFilters,
    searchPlaceholder,
    defaultOpen = false,
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(defaultOpen);
    const { langField } = useLanguage(applicantManage);

    const sortOrderOptions = [
        { value: '', label: '' },
        { value: 'desc', label: langField('newest') },
        { value: 'asc', label: langField('oldest') },
    ];

    const completedOptions = [
        { value: '', label: langField('allStatus') },
        { value: 'true', label: langField('completed') },
        { value: 'false', label: langField('notCompleted') },
    ];

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
                    <SearchInput
                        id="applicant_search"
                        value={searchValue}
                        onChange={onSearchChange}
                        onSearch={onSearch}
                        onClear={onClearSearch}
                        placeholder={searchPlaceholder || langField('searchDefaultPlaceholder')}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={sortOrderOptions.find(option => option.value === filters.sort_order) || null}
                        onChange={(option) => onFilterChange('sort_order', option?.value || 'desc')}
                        options={sortOrderOptions}
                        placeholder={langField('orderBy')}
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
                        {langField('filter')}
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="is_completed" className="block text-sm font-medium text-gray-700 mb-1">{langField('formStatus')}</label>
                            <CustomSelect
                                id="is_completed"
                                name="is_completed"
                                value={completedOptions.find(option => option.value === filters.is_completed) || completedOptions[0]}
                                onChange={(option) => onFilterChange('is_completed', option?.value || '')}
                                options={completedOptions}
                                placeholder={langField('allStatus')}
                                isClearable={false}
                                isSearchable={false}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                        <Button
                            onClick={onClearFilters}
                            className="px-4 py-2 bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300"
                            size="sm"
                        >
                            <MdClear className="w-4 h-4 mr-1" />
                            {langField('clearAll')}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FilterSection;
