import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useConfirmation } from '@/hooks/useConfirmation';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import { MdAdd, MdClear, MdExpandLess, MdExpandMore, MdFilterListAlt, MdSearch } from 'react-icons/md';
import { toast } from 'react-hot-toast';

// Activity specific imports
import { useActivities } from './hooks/useActivities';
import { ActivityFilters } from './types/activity';
import { getActivityColumns, NoDataComponent, FilterSection } from './components';


const Activity: React.FC = () => {
    const navigate = useNavigate();
    const {
        // State
        activities,
        loading,
        error,
        pagination,
        searchValue,
        setSearchValue,
        filters,
        
        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        handleFilters,
        
        // Search functions
        handleKeyPress,
        handleClearSearch
    } = useActivities();

    const { modalProps } = useConfirmation();

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Handle filter toggle
    const handleToggleFilter = () => {
        setShowAdvancedFilters(prev => !prev);
    };

    // Handle filter changes from FilterSection
    const handleFilterChange = (field: string, value: string) => {
        if (field === 'transaction_type') {
            handleFilters({ transaction_type: value });
        } else if (field === 'sort_by') {
            handleFilters({ sort_by: value });
        } else if (field === 'sort_order') {
            handleFilters({ sort_order: value as 'asc' | 'desc' | '' });
        } else if (field === 'start_date') {
            handleFilters({ start_date: value });
        } else if (field === 'end_date') {
            handleFilters({ end_date: value });
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        handleFilters({
            search: '',
            transaction_type: '',
            transaction_source: '',
            sort_by: 'updated_at',
            sort_order: 'desc',
            start_date: '',
            end_date: ''
        });
    };

    // Handle search clear
    const handleClearSearchLocal = () => {
        setSearchValue('');
        handleClearSearch();
    };

    // Handle row click - navigate to detail page
    const handleRowClick = (row: any) => {
        navigate(`/crm/activity/edit/${row.transactions_id}`);
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
                            handleFilterChange('sort_order', selectedOption?.value || 'desc')
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
                    onFilterChange={handleFilterChange}
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
            
            <div className="bg-white shadow rounded-lg">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Activities Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage and view customer activity transactions
                            </p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={() => navigate('/crm/activity/create')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Create Activity
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>


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
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleRowsPerPageChange}
                        onRowClicked={handleRowClick}
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
                
                <ConfirmationModal {...modalProps} />
            </div>
        </>
    );
};

export default Activity;