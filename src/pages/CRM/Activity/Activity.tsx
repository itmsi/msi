import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useConfirmation } from '@/hooks/useConfirmation';
import CustomDataTable from '@/components/ui/table/CustomDataTable';

// Activity specific imports
import { useActivities } from './hooks/useActivities';
import { getActivityColumns, NoDataComponent, ActivityFilters, ActivitySearch } from './components';
import { toast } from 'react-hot-toast';
import { MdAdd } from 'react-icons/md';

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

    // Handle search clear
    const handleClearSearchLocal = () => {
        setSearchValue('');
        handleClearSearch();
    };
    // Handle row click - navigate to detail page
    const handleRowClick = (row: any) => {
        navigate(`/crm/activity/edit/${row.transactions_id}`);
    };

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

                {/* Search */}
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-7 gap-3 border-b border-gray-200">
                    <ActivitySearch
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        onKeyPress={handleKeyPress}
                        onClear={handleClearSearchLocal}
                        loading={loading}
                    />
                    {/* Filters */}
                    <ActivityFilters
                        filters={filters}
                        onFiltersChange={handleFilters}
                    />
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