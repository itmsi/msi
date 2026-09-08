import React from 'react';
import { TableColumn } from 'react-data-table-component';
// import { MdClear, MdSearch } from 'react-icons/md';
// import Input from '@/components/form/input/InputField';
import CustomDataTable from '@/components/ui/table';
import { useItemSerialNumbers } from '../../hooks/useItemRelation';
import { ItemSerialNumber } from '../../types/items';

interface SerialNumberTabProps {
    netsuiteItemId?: string;
}

const SerialNumberTab: React.FC<SerialNumberTabProps> = ({ netsuiteItemId }) => {
    const {
        rows,
        loading,
        error,
        pagination,
        // searchValue,
        // setSearchValue,
        handlePageChange,
        handleRowsPerPageChange,
        // handleKeyPress,
        // handleClearSearch,
    } = useItemSerialNumbers(netsuiteItemId);

    const columns: TableColumn<ItemSerialNumber>[] = [
        {
            name: 'Serial Number',
            selector: row => row.serial_number || '-',
            cell: row => (
                <div className="py-2 font-medium text-gray-900">
                    {row.serial_number || '-'}
                </div>
            ),
            wrap: true,
            minWidth: '260px'
        },
        {
            name: 'Location ID',
            selector: row => row.inventorylocationId || '-',
            center: true,
            width: '160px'
        },
        {
            name: 'Status',
            selector: row => (row.is_used ? 'Available' : 'Not Available'),
            cell: row => (
                <span className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs border rounded-full font-medium ${row.is_used
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {row.is_used ? 'Available' : 'Not Available'}
                </span>
            ),
            center: true,
            width: '180px'
        }
    ];

    return (
        <div className="p-6 font-secondary">
            {/* <div className="mb-4">
                <div className="relative md:max-w-sm">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        id="search_serial_number"
                        type="text"
                        placeholder="Search Serial Number... (Press Enter)"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className={`pl-10 py-2 w-full ${searchValue ? 'pr-10' : 'pr-4'}`}
                    />
                    {searchValue && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            type="button"
                        >
                            <MdClear className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div> */}

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <CustomDataTable
                columns={columns}
                data={rows}
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
                fixedHeaderScrollHeight="500px"
                responsive
                highlightOnHover={false}
                striped={false}
                persistTableHead
                borderRadius="8px"
                noDataComponent={
                    <div className="p-6 text-center text-sm text-gray-500">No serial number data found</div>
                }
            />
        </div>
    );
};

export default SerialNumberTab;
