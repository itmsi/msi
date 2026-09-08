import React from 'react';
import { TableColumn } from 'react-data-table-component';
// import { MdClear, MdSearch } from 'react-icons/md';
// import Input from '@/components/form/input/InputField';
import CustomDataTable from '@/components/ui/table';
import { formatQty } from '@/helpers/generalHelper';
import { useItemLocations } from '../../hooks/useItemRelation';
import { ItemLocation } from '../../types/items';

interface LocationTabProps {
    netsuiteItemId?: string;
}

const LocationTab: React.FC<LocationTabProps> = ({ netsuiteItemId }) => {
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
    } = useItemLocations(netsuiteItemId);

    const columns: TableColumn<ItemLocation>[] = [
        {
            name: 'Location',
            selector: row => row.location_name || '-',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.location_name || '-'}</div>
                    {/* <div className="block text-sm text-gray-500">ID: {row.inventorylocationId ?? '-'}</div> */}
                </div>
            ),
            wrap: true,
            minWidth: '260px'
        },
        {
            name: 'Available',
            selector: row => formatQty(row.qtyAvailable),
            center: true,
            width: '140px'
        },
        {
            name: 'On Hand',
            selector: row => formatQty(row.qtyOnHand),
            center: true,
            width: '140px'
        },
        {
            name: 'On Order',
            selector: row => formatQty(row.qtyOnOrder),
            center: true,
            width: '140px'
        },
        {
            name: 'Committed',
            selector: row => formatQty(row.qtyCommitted),
            center: true,
            width: '140px'
        },
        {
            name: 'Back Order',
            selector: row => formatQty(row.qtyBackOrder),
            center: true,
            width: '140px'
        },
        {
            name: 'Serial Numbers',
            selector: row => row.serialNumbers?.length ?? 0,
            center: true,
            width: '160px'
        },
    ];

    return (
        <div className="p-6 font-secondary">
            {/* <div className="mb-4">
                <div className="relative md:max-w-sm">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        id="search_location"
                        type="text"
                        placeholder="Search Location... (Press Enter)"
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
                    <div className="p-6 text-center text-sm text-gray-500">No location data found</div>
                }
            />
        </div>
    );
};

export default LocationTab;
