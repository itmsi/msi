import { useState } from 'react';
import { MdExpandLess, MdExpandMore, MdFilterListAlt } from 'react-icons/md';
import SearchInput from '@/components/form/input/SearchInput';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { useCandidateFilterOptions } from '../hooks/UsecandidateFilterOptions';
import type { FilterState } from '../hooks/Usecandidatemanagement';

const STATUS_OPTIONS = [
    { value: 'New', label: 'New' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Interviewed', label: 'Interviewed' },
    { value: 'Complete', label: 'Complete' },
];

const INTERVIEWER_OPTIONS = [
    { value: 'HR', label: 'HR' },
    { value: 'GM', label: 'GM' },
    { value: 'VP', label: 'VP' },
    { value: 'BOD', label: 'BOD' },
    { value: 'PUB', label: 'USER' },
];

const SORT_ORDER_OPTIONS = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
];

interface FilterSectionProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onClearSearch: () => void;
    searchPlaceholder?: string;

    filters: FilterState;
    onFilterChange: (filters: Partial<FilterState>) => void;
    onClearFilters: () => void;

    defaultOpen?: boolean;
}

export default function FilterSection({
    searchValue,
    onSearchChange,
    onSearch,
    onClearSearch,
    searchPlaceholder = 'Search candidate... (Press Enter)',
    filters,
    onFilterChange,
    onClearFilters,
    defaultOpen = false,
}: FilterSectionProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(defaultOpen);
    const [optionsEnabled, setOptionsEnabled] = useState(defaultOpen);

    const {
        groups,
        loadingGroup,
        companies,
        loadingCompany,
        departments,
        loadingDept,
        jobTitles,
        loadingJob,
    } = useCandidateFilterOptions(filters.company_id, filters.department_id, optionsEnabled);

    const handleToggleFilter = () => {
        setOptionsEnabled(true);
        setShowAdvancedFilters((prev) => !prev);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 w-full">
                    <SearchInput
                        value={searchValue}
                        onChange={onSearchChange}
                        onSearch={onSearch}
                        onClear={onClearSearch}
                        placeholder={searchPlaceholder}
                    />
                </div>

                <div className="flex items-center w-full md:w-44">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={SORT_ORDER_OPTIONS.find((option) => option.value === filters.sort_order) || null}
                        onChange={(option) => onFilterChange({ sort_order: (option?.value as 'asc' | 'desc') || 'desc' })}
                        options={SORT_ORDER_OPTIONS}
                        placeholder="Order by"
                        isClearable={false}
                        isSearchable={false}
                        className="w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleToggleFilter}
                        variant="outline"
                        size="sm"
                        className="h-10.5"
                    >
                        <MdFilterListAlt className="w-4 h-4 mr-2" />
                        Filter
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className='md:col-span-2'>
                            <CustomSelect
                                placeholder="All Status"
                                options={STATUS_OPTIONS}
                                value={filters.candidate_status ? { value: filters.candidate_status, label: filters.candidate_status } : null}
                                onChange={(opt) => onFilterChange({ candidate_status: opt?.value || '' })}
                                isClearable
                                isSearchable={false}
                            />
                        </div>

                        <div className='md:col-span-2'>
                            <CustomSelect
                                placeholder="All Interviewers"
                                options={INTERVIEWER_OPTIONS}
                                value={
                                    filters.assign_role
                                        ? INTERVIEWER_OPTIONS.find((o) => o.value === filters.assign_role) || { value: filters.assign_role, label: filters.assign_role }
                                        : null
                                }
                                onChange={(opt) => onFilterChange({ assign_role: opt?.value || '' })}
                                isClearable
                                isSearchable={false}
                            />
                        </div>

                        <div>
                            <CustomSelect
                                placeholder={loadingGroup ? 'Loading...' : 'All Groups'}
                                options={groups.map((g) => ({ value: g.group_id, label: g.group_name }))}
                                value={
                                    filters.group_id
                                        ? { value: filters.group_id, label: groups.find((g) => g.group_id === filters.group_id)?.group_name || filters.group_id }
                                        : null
                                }
                                onChange={(opt) => onFilterChange({ group_id: opt?.value || '' })}
                                disabled={loadingGroup}
                                isClearable
                                isSearchable={false}
                            />
                        </div>

                        <div>
                            <CustomSelect
                                placeholder={loadingCompany ? 'Loading...' : 'All Companies'}
                                options={companies.map((c) => ({ value: c.company_id, label: c.company_name }))}
                                value={
                                    filters.company_id
                                        ? { value: filters.company_id, label: companies.find((c) => c.company_id === filters.company_id)?.company_name || filters.company_id }
                                        : null
                                }
                                onChange={(opt) => onFilterChange({ company_id: opt?.value || '', department_id: '', title_id: '' })}
                                disabled={loadingCompany}
                                isClearable
                                isSearchable={false}
                            />
                        </div>

                        <div>
                            <CustomSelect
                                placeholder={!filters.company_id ? 'Select a company first' : loadingDept ? 'Loading...' : 'All Departments'}
                                options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))}
                                value={
                                    filters.department_id
                                        ? { value: filters.department_id, label: departments.find((d) => d.department_id === filters.department_id)?.department_name || filters.department_id }
                                        : null
                                }
                                onChange={(opt) => onFilterChange({ department_id: opt?.value || '', title_id: '' })}
                                disabled={loadingDept || !filters.company_id}
                                isClearable
                                isSearchable={false}
                            />
                        </div>

                        <div>
                            <CustomSelect
                                placeholder={!filters.department_id ? 'Select a department first' : loadingJob ? 'Loading...' : 'All Titles'}
                                options={jobTitles.map((j) => ({ value: j.title_id, label: j.title_name }))}
                                value={
                                    filters.title_id
                                        ? { value: filters.title_id, label: jobTitles.find((j) => j.title_id === filters.title_id)?.title_name || filters.title_id }
                                        : null
                                }
                                onChange={(opt) => onFilterChange({ title_id: opt?.value || '' })}
                                disabled={loadingJob || !filters.department_id}
                                isClearable
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
                            Clear All
                        </Button>
                    </div>

                </div>
            )}
        </>
    );
}
