import PageMeta from "@/components/common/PageMeta";
import { PermissionGate, PermissionButton } from "@/components/common/PermissionComponents";
import Button from "@/components/ui/button/Button";
import CustomDataTable from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import { MdAdd, MdClear, MdDeleteOutline, MdEdit, MdSearch, MdOutlineAutoGraph } from "react-icons/md";
import { useNavigate } from "react-router";
import { RorEntity } from "./types/roecalculator";
import { useRoeCalculatorManagement } from "./hooks/useRoeCalculatorManagement";
import { useMemo } from "react";
import Input from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/select/CustomSelect";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { formatCurrency } from "@/helpers/generalHelper";
import { FaRegFilePdf } from "react-icons/fa6";

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
        
        confirmDelete,
        
        // Handlers
        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleManualSearch,
        handleClearFilters,
        handleFilterChange,
        handleBreakdown,
        handleEdit,
        handleDelete,
        confirmdeleteRorCalculator,
        cancelDelete,
        handleDownload,
    } = useRoeCalculatorManagement();

    // Conditional row click handler based on step
    const handleRowClick = (row: any) => {
        if (row.step === 4) {
            handleBreakdown(row);
        } else {
            handleEdit(row);
        }
    };

    const columns: TableColumn<RorEntity>[] = [
        {
            name: 'Customer',
            selector: row => row.customer_name || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row.customer_name}
                    </div>
                    <div className={`block text-sm text-gray-500 ${parseFloat(String(row?.roe_individual_percentage || '0')) < 0 ? 'text-red-500' : 'text-green-600'}`}>ROE : {row.roe_individual_percentage || '0'}%</div>
                    <div className={`block text-sm text-gray-500 ${parseFloat(String(row?.roa_individual_percentage || '0')) < 0 ? 'text-red-500' : 'text-green-600'}`}>ROA : {row.roa_individual_percentage || '0'}%</div>
                </div>
            ),
        },
        {
            name: 'Commodity',
            selector: row => row.commodity || '-',
        },
        {
            name: 'Revenue',
            selector: row => row.revenue_monthly || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div 
                        className={`block text-sm text-gray-500 ${parseFloat(String(row?.revenue_monthly || '0')) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatCurrency(String(row?.revenue_monthly)) || '0'}
                    </div>
                </div>
            )
        },
        {
            name: 'Actions',
            cell: (row: any) => (
                <div className="flex justify-end gap-1">
                    {/* Conditional breakdown action - only show when step is 4 */}
                    {row.step === 4 && (<>
                        <PermissionButton 
                            permission="read"
                            onClick={() => {
                                handleBreakdown(row);
                            }}
                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0`}
                            title="Breakdown"
                        >
                            <MdOutlineAutoGraph size={16} />
                        </PermissionButton>
                    
                    
                        <PermissionButton 
                            permission="read"
                            onClick={() => {
                                handleDownload(row);
                            }}
                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0`}
                            title="Download"
                        >
                            <FaRegFilePdf size={16} />
                        </PermissionButton>
                    </>)}
                    
                    <PermissionButton 
                        permission="update"
                        onClick={() => handleEdit(row)}
                        className={`p-2 rounded-md text-sm font-medium transition-colors relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0`}
                        title="Edit"
                    >
                        <MdEdit size={16} />
                    </PermissionButton>
                    
                    <PermissionButton 
                        permission="delete"
                        onClick={() => {
                            handleDelete(row);
                        }}
                        className="!p-2 !rounded-lg !text-red-600 hover:!text-red-700 hover:!bg-red-50 !transition-colors !border-0"
                        title="Delete"
                    >
                        <MdDeleteOutline size={16} />
                    </PermissionButton>
                </div>
            ),
            width: '200px',
            center: true,
            ignoreRowClick: true,
        }
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
                        onRowClicked={handleRowClick}
                    />
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={cancelDelete}
                onConfirm={confirmdeleteRorCalculator}
                title="Delete ROE & ROA Calculator"
                message="Are you sure you want to delete this ROE & ROA Calculator? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                loading={loading}
            />
        </>
    );
}