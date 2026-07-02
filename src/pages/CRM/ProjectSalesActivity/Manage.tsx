import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import { MdAdd, MdClear, MdExpandLess, MdExpandMore, MdFilterListAlt, MdSearch } from 'react-icons/md';
import { toast } from 'react-hot-toast';

// Activity specific imports
import { getActivityColumns, NoDataComponent, FilterSection } from './components';
import { useProjectSalesActivity } from './hooks/useProjectSalesActivity';

const ManageProjectSalesActivity: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const {
        activities,
        loading,
        error,
        pagination,
        filters,
        searchValue,
        setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        handleKeyPress,
        handleClearSearch,
    } = useProjectSalesActivity();

    const handlePageChangeAman = useCallback((halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        if (halamanBaru === halamanSaatIni) return;
        handlePageChange(halamanBaru);
    }, [pagination?.page, handlePageChange]);
    
    const handleRowsPerPageAman = useCallback((limitBaru: number, halamanBaru: number) => {
        const halamanSaatIni = pagination?.page || 1;
        const limitSaatIni = pagination?.limit || 10;
        if (limitBaru === limitSaatIni && halamanBaru === halamanSaatIni) return;
        handleRowsPerPageChange(limitBaru, halamanBaru);
    }, [pagination?.page, pagination?.limit, handleRowsPerPageChange]);
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Handle filter toggle
    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    // Clear all filters
    const handleClearFilters = () => {
        handleFilterChange({
            search: '',
            sort_order: 'desc',
            iup_id: '',
            iup_customer_id: '',
            start_date: '',
            end_date: ''
        });
    };

    // Handle search clear
    const handleClearSearchLocal = () => {
        setSearchValue('');
        handleClearSearch();
    };

    // SearchAndFilters component matching IUP Management/Contractors pattern
    const SearchAndFilters = useMemo(() => {
        return (<>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search transactions... (Press Enter to search)"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                            />
                            {searchValue && (
                                <button
                                    onClick={handleClearSearchLocal}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    type="button"
                                >
                                    <MdClear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={filters.sort_order ? {
                            value: filters.sort_order,
                            label: filters.sort_order === 'asc' ? 'Ascending' : 'Descending'
                        } : null}
                        onChange={(selectedOption) =>
                            handleFilterChange({ sort_order: (selectedOption?.value as 'asc' | 'desc') || 'desc' })
                        }
                        options={[
                            { value: 'asc', label: 'Ascending' },
                            { value: 'desc', label: 'Descending' }
                        ]}
                        placeholder="Order by"
                        isClearable={false}
                        isSearchable={false}
                        className="w-full"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleToggleFilter}
                        className="h-[42px] px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300"
                        size="sm"
                    >
                        <MdFilterListAlt className="w-4 h-4 mr-2" />
                        Filter
                        {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                    </Button>
                </div>
            </div>
            
            {showAdvancedFilters && (
                <FilterSection
                    filterIup={filters.iup_id || location.search.includes('iup=') ? filters.iup_id || '' : ''}
                    filterStartDate={filters.start_date || location.search.includes('start_date=') ? filters.start_date || '' : ''}
                    filterEndDate={filters.end_date || location.search.includes('end_date=') ? filters.end_date || '' : ''}
                    onFilterChange={(field, value) => handleFilterChange({ [field]: value })}
                    onClearFilters={handleClearFilters}
                />
            )}
        </>);
    }, [searchValue, filters, showAdvancedFilters, setSearchValue, handleKeyPress, handleClearSearchLocal, handleFilterChange, handleToggleFilter, handleClearFilters]);


    // Show error toast if error exists
    React.useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <>
            <PageMeta
                title="Activity Management | CRM"
                description="Manage customer activities and transactions"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Search and Filter Section */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>


                <div className="bg-white shadow rounded-lg">
                    {/* Data Table */}
                    <div className="p-6 font-secondary">
                        <CustomDataTable
                            columns={getActivityColumns()}
                            data={activities}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination.total || 0}
                            paginationPerPage={pagination.limit || 10}
                            paginationDefaultPage={pagination.page || 1}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            onChangePage={handlePageChangeAman}
                            onChangeRowsPerPage={handleRowsPerPageAman}
                            noDataComponent={<NoDataComponent />}
                            striped={false}
                            persistTableHead
                            highlightOnHover
                            responsive
                            borderRadius="8px"
                            fixedHeader={true}
                            fixedHeaderScrollHeight="600px"
                        />
                    </div>
                </div>
                
            </div>
        </>
    );
};

export default ManageProjectSalesActivity;