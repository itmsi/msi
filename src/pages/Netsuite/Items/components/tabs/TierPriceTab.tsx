import React from 'react';
import { TableColumn } from 'react-data-table-component';
// import { MdClear, MdSearch } from 'react-icons/md';
// import Input from '@/components/form/input/InputField';
import CustomDataTable from '@/components/ui/table';
import { formatQty } from '@/helpers/generalHelper';
import { useItemTierPrices } from '../../hooks/useItemRelation';
import { ItemTierPrice } from '../../types/items';

interface TierPriceTabProps {
    netsuiteItemId?: string;
}

// Response tidak mengirim currency, jadi nilai ditampilkan sebagai angka saja
const formatAmount = (value?: string): string => formatQty(value, 2);

const TierPriceTab: React.FC<TierPriceTabProps> = ({ netsuiteItemId }) => {
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
    } = useItemTierPrices(netsuiteItemId);

    const columns: TableColumn<ItemTierPrice>[] = [
        {
            name: 'Price Level',
            selector: row => row.price_level || '-',
            cell: row => (
                <div className="py-2 font-medium text-gray-900">
                    {row.price_level || '-'}
                </div>
            ),
            wrap: true,
            minWidth: '280px'
        },
        {
            name: 'Quantity',
            selector: row => formatQty(row.quantity),
            center: true,
            width: '180px'
        },
        {
            name: 'Price',
            selector: row => formatAmount(row.price),
            right: true,
            width: '220px'
        },
    ];

    return (
        <div className="p-6 font-secondary">
            {/* <div className="mb-4">
                <div className="relative md:max-w-sm">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        id="search_tier_price"
                        type="text"
                        placeholder="Search Price Level... (Press Enter)"
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
                    <div className="p-6 text-center text-sm text-gray-500">No tier price data found</div>
                }
            />
        </div>
    );
};

export default TierPriceTab;
