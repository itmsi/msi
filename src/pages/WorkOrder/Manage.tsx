import React, { useMemo } from 'react';
import { MdClear, MdSearch } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import Input from '@/components/form/input/InputField';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useConfirmation } from '@/hooks/useConfirmation';
// import { ContractorServices } from './services/contractorServices';
import CustomSelect from '@/components/form/select/CustomSelect';
import WorkOrderTable from './components/WorkOrderTable';
import { useWorkOrder } from './hooks/useWorkOrder';
import { WorkOrderItem } from './types/workorder';
import { WorkOrderService } from './services/workOrderService';
import PageHeaderManage from '@/components/common/PageHeaderManage';
import toast from 'react-hot-toast';
import { format } from 'date-fns'
// import FilterSection from './components/FilterSection';

const Manage: React.FC = () => {
    // const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const {
        // State
        workOrders,
        loading,
        error,
        pagination,
        filters,
        searchValue,
        setSearchValue,
        
        // Actions
        handlePageChange,
        handleRowsPerPageChange,
        handleFilterChange,
        refetch,
        
        // Search functions
        handleKeyPress,
        handleClearSearch
    } = useWorkOrder();

    const { showConfirmation, modalProps } = useConfirmation();

    // const handleToggleFilter = () => {
    //     setShowAdvancedFilters(prev => !prev);
    // };

    // const handleClearFilters = () => {
    //     setSearchValue('');
    //     handleFilterChange({
    //         sort_order: 'desc', // Kembalikan ke default
    //         status: '',
    //         search: ''
    //     });
    // };

    const handleDelete = async (workorder: WorkOrderItem) => {
        const typeLabel = workorder.customer_name;
                
        const confirmed = await showConfirmation({
            title: `Delete ${typeLabel}`,
            message: `Are you sure you want to delete "${workorder.customer_name}"?\n\nType: ${typeLabel}\nCode: ${workorder.customer_name}\n\nThis action cannot be undone and will also delete all child territories.`,
            confirmText: `Delete ${typeLabel}`,
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await WorkOrderService.deleteWorkOrder(workorder.work_order_id);
            refetch();
        }
    };

    const SearchAndFilters = useMemo(() => { 
        return (
        <>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search workorders... (Press Enter to search)"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchValue && (
                            <button
                                onClick={() => {
                                    handleClearSearch();
                                }}
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
            
            {/* <div className="flex items-center gap-2">
                <Button
                    onClick={handleToggleFilter}
                    className="h-[42px] px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300"
                    size="sm"
                >
                    <MdFilterListAlt className="w-4 h-4 mr-2" />
                    Filter
                    {showAdvancedFilters ? <MdExpandLess className="w-4 h-4 ml-1" /> : <MdExpandMore className="w-4 h-4 ml-1" />}
                </Button>
            </div> */}
        </div>
        
        {/* {showAdvancedFilters && (
            <FilterSection
                // onFilterChange={handleFilterChange}
                onFilterChange={(field, value) => handleFilterChange({ [field]: value })}
                onClearFilters={handleClearFilters}
            />
        )} */}
        </>
    
    )}, [searchValue, filters, setSearchValue, handleKeyPress, handleClearSearch, handleFilterChange]);
    const handleStartRepairProcess = async (woid: string) => {
        const start = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        const params = {
            work_order_status: 'onprogress',
            repair_start_date: start
        };
        const response = await WorkOrderService.repairProcessWorkOrder(woid, params);
        if (response.status === 200) {
            toast.success('Repair process started successfully');
            refetch();
        } else {
            toast.error('Failed to start repair process');
        }
    }
    const handleEndRepairProcess = async (woid: string) => {
        const end = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        const params = {
            work_order_status: 'complete',
            repair_end_date: end
        };
        const response = await WorkOrderService.repairProcessWorkOrder(woid, params);
        if (response.status === 200) {
            toast.success('Repair process ended successfully');
            refetch();
        } else {
            toast.error('Failed to end repair process');
        }
    }
    return (
        <>
            <PageMeta 
                title="Work Order Management | Motor Sights International" 
                description="Manage work orders and assignments for Motor Sights International"
                image="/motor-sights-international.png"
            />
            <div className="space-y-3">
                <PageHeaderManage
                    title="Work Order Management"
                    subtitle="Manage work orders and assignments"
                />

                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>

                {/* Table Section */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-error-50 text-error-600 rounded-md">
                                {error}
                            </div>
                        )}
                        
                        <WorkOrderTable
                            workOrders={workOrders}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            handleStartRepairProcess={(workOrder) => handleStartRepairProcess(workOrder.work_order_id)}
                            handleEndRepairProcess={(workOrder) => handleEndRepairProcess(workOrder.work_order_id)}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
                
                <ConfirmationModal {...modalProps} />
            </div>
        </>
    );
};

export default Manage;