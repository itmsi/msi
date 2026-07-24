import { useMemo } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';
import { MdClear, MdSearch, MdAdd, MdDeleteOutline } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import CustomDataTable from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/helpers/generalHelper';
import Button from '@/components/ui/button/Button';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { HaulingPriceItem } from './types/calculator';
import { useCalculatorManagement } from './hooks/useCalculatorManagement';
import { createByDateColumn } from '@/components/ui/table/columnUtils';
import PageHeaderManage from '@/components/common/PageHeaderManage';

export default function Manage() {
    const navigate = useNavigate();
    const {
        haulingPrices,
        pagination,
        loading,
        error,
        searchTerm,
        sortOrder,
        confirmDelete,

        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleClearSearch,
        handleFilterChange,
        handleKeyPress,
        handleDelete,
        confirmDeleteItem,
        cancelDelete,
    } = useCalculatorManagement();

    const columns: TableColumn<HaulingPriceItem>[] = [
        {
            name: 'Customer',
            selector: row => row.contractor_name || '-',
            cell: (row) => (<>
                <Link to={`/hauling-calculator/edit/${row.hauling_prices_id}`} className="absolute inset-0" />
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.contractor_name || '-'}</div>
                    <div className="block text-sm text-gray-500">{row.iup_name || '-'}</div>
                </div>
            </>),
            width: '250px',
        },
        {
            name: 'Periode',
            selector: row => row.periode_harga || '-',
            wrap: true,
            // width: '200px',
        },
        {
            name: 'Efektif',
            selector: row => formatDate(row.effective_date) || '-',
            wrap: true,
            // width: '200px',
            center: true,
        },
        {
            name: 'Hauling',
            selector: row => row.harga_hauling_lama || '-',
            cell: row => <span>{formatCurrency(parseFloat(row.harga_hauling_lama || '0'))}</span>,
            // width: '200px',
        },
        {
            name: 'Harga Solar',
            cell: (row) => (
                <div className="items-center gap-3 py-2">
                    <div className="block text-sm text-gray-500">
                        Lama : <span className="font-medium text-gray-700">{formatCurrency(parseFloat(row.harga_solar_lama || '0'))}</span>
                    </div>
                    <div className="block text-sm text-gray-500">
                        Baru : <span className={`font-medium ${parseFloat(row.harga_solar_baru || '0') <= parseFloat(row.harga_solar_lama || '0') ? 'text-green-600' : 'text-red-500'}`}>
                            {formatCurrency(parseFloat(row.harga_solar_baru || '0'))}
                        </span>
                    </div>
                </div>
            ),
            width: '180px',
        },
        createByDateColumn('Updated By', 'updated_at', 'updated_by_name'),
        {
            name: 'Aksi',
            width: '110px',
            center: true,
            cell: (row) => (
                <div className="flex gap-2">
                        <button
                            onClick={() => handleDelete(row.hauling_prices_id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50"
                            title="Hapus"
                        >
                            <MdDeleteOutline size={18} />
                        </button>
                </div>
            ),
        },
    ];

    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search... (Enter untuk cari)"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={`pl-10 py-2 w-full ${searchTerm ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <CustomSelect
                    id="sort_order"
                    name="sort_order"
                    value={sortOrder ? { value: sortOrder, label: sortOrder === 'asc' ? 'Ascending' : 'Descending' } : null}
                    onChange={(opt) => handleFilterChange('sort_order', opt?.value || 'desc')}
                    options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' },
                    ]}
                    placeholder="Order by"
                    isClearable={false}
                    isSearchable={false}
                    className="w-full"
                />
            </div>
        </div>
    ), [searchTerm, sortOrder, handleSearchChange, handleKeyPress, handleClearSearch, handleFilterChange]);

    return (
        <>
            <PageMeta
                title="Hauling Price Calculation - Motor Sights International"
                description="Manage Hauling Price Calculations - Motor Sights International"
                image="/motor-sights-international.png"
            />

            <div className="space-y-3">
                <PageHeaderManage
                    title="Manage Hauling Price Calculations"
                    subtitle="Manage hauling price calculations and related information"
                    actions={[
                        {
                        key: 'create',
                        element: (
                                <Button
                                    onClick={() => navigate('/hauling-calculator/create')}
                                    className="flex items-center gap-2"
                                >
                                    <MdAdd className="mr-2" size={20} />
                                    Create Hauling Price Calculation
                                </Button>
                        )}
                    ]}
                />

                {/* Search & Filter */}
                <div className="bg-white shadow rounded-lg px-6 py-4">
                    {SearchAndFilters}
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}
                        <CustomDataTable
                            columns={columns}
                            data={haulingPrices}
                            loading={loading}
                            pagination
                            paginationServer
                            paginationTotalRows={pagination?.total || 0}
                            paginationPerPage={pagination?.limit || 10}
                            paginationDefaultPage={pagination?.page || 1}
                            paginationRowsPerPageOptions={[10, 20, 50, 100]}
                            onChangePage={handlePageChange}
                            onChangeRowsPerPage={handleRowsPerPageChange}
                            fixedHeader
                            fixedHeaderScrollHeight="625px"
                            responsive
                            highlightOnHover
                            striped={false}
                            persistTableHead
                            borderRadius="8px"
                        />
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmDelete.show}
                onClose={cancelDelete}
                onConfirm={confirmDeleteItem}
                title="Hapus Data"
                message="Apakah Anda yakin ingin menghapus data hauling price ini?"
                confirmText="Hapus"
                type="danger"
            />
        </>
    );
}


