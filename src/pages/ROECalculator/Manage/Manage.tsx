import PageMeta from "@/components/common/PageMeta";
import { PermissionGate } from "@/components/common/PermissionComponents";
import Button from "@/components/ui/button/Button";
import CustomDataTable, { createActionsColumn } from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import { MdAdd, MdClear, MdDeleteOutline, MdEdit, MdSearch } from "react-icons/md";
import { useNavigate } from "react-router";
import { RorEntity } from "./types/roecalculator";
import { useRoeCalculatorManagement } from "./hooks/useRoeCalculatorManagement";
import { useMemo } from "react";
import Input from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/select/CustomSelect";

export default function ManageRor() {
    const navigate = useNavigate();
    const {
        searchTerm,
        sortOrder,
        sortCommodity,
        // currentPage,
        // itemsPerPage,
        roeCalculator,
        pagination,
        loading,
        // error,
        
        // confirmDelete,
        // setConfirmDelete,
        // deleteRorCalculator,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleEdit,
        handleDelete,
        // confirmdeleteRorCalculator,
        // cancelDelete 
    } = useRoeCalculatorManagement();

    const columns: TableColumn<RorEntity>[] = [
        {
            name: 'Customer',
            selector: row => row.customer_name || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row.customer_name}
                    </div>
                    <div className="block text-sm text-gray-500">ROE : {row.roe_individual_percentage || '-'}</div>
                    <div className="block text-sm text-gray-500">ROA : {row.roa_individual_percentage || '-'}</div>
                </div>
            ),
        },
        {
            name: 'Commodity',
            selector: row => row.commodity || '-',
        },
        {
            name: 'Revenue',
            selector: row => row.roe_individual_percentage || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row.roe_individual_percentage}
                    </div>
                    <div className="block text-sm text-gray-500">{row.roe_individual_percentage}</div>
                    <div className="block text-sm text-gray-500">{row.roa_individual_percentage}</div>
                </div>
            )
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEdit,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];
    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search by quotation number, customer ID..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleManualSearch();
                                }
                            }}
                            className={`pl-10 py-2 w-full rounded-r-none ${searchTerm ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearFilters}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={handleManualSearch}
                        className="rounded-l-none px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 border-l-0"
                        size="sm"
                    >
                        <MdSearch className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <CustomSelect
                    id="sort_status"
                    name="sort_status"
                    value={sortCommodity ? { 
                        value: sortCommodity, 
                        label: sortCommodity === 'batu bara' ? 'batu bara' : sortCommodity === 'nikel' ? 'Nikel' : ''
                    } : null}
                    onChange={(selectedOption) => 
                        handleFilterChange('commodity', selectedOption?.value || '')
                    }
                    options={[
                        { value: 'batu bara', label: 'batu bara' },
                        { value: 'nikel', label: 'Nikel' }
                    ]}
                    placeholder="Status"
                    isClearable={false}
                    isSearchable={false}
                    className="w-60"
                />
            </div>
            
            {/* Sort Order */}
            <div className="flex items-center gap-2">
                <CustomSelect
                    id="sort_order"
                    name="sort_order"
                    value={sortOrder ? { 
                        value: sortOrder, 
                        label: sortOrder === 'asc' ? 'Ascending' : 'Descending' 
                    } : null}
                    onChange={(selectedOption) => 
                        handleFilterChange('sort_order', selectedOption?.value || '')
                    }
                    options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' }
                    ]}
                    placeholder="Order by"
                    isClearable={false}
                    isSearchable={false}
                    className="w-40"
                />
            </div>
            
        </div>
    ), [searchTerm, sortOrder, sortCommodity, loading, roeCalculator.length, handleSearchChange, handleManualSearch, handleClearFilters, handleFilterChange]);
    
    return (
        <>
            <PageMeta
                title="Manage ROE & ROA Calculator - Motor Sights International" 
                description="Manage ROE & ROA Calculator - Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-white shadow rounded-lg">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage ROE & ROA Calculator</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage and organize your ROE & ROA Calculator database</p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={() => navigate('/roe-roa-calculator/manage/create')}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Create ROE & ROA Calculator
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200">
                    {SearchAndFilters}
                </div>

                {/* Data Table */}
                <div className="p-6 font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={roeCalculator || []}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleRowsPerPageChange}
                        fixedHeader={true}
                        fixedHeaderScrollHeight="600px"
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        borderRadius="8px"
                        onRowClicked={handleEdit}
                    />
                </div>
            </div>
        </>
    );
}