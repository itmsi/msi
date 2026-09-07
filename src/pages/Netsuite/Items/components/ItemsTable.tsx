import { TableColumn } from 'react-data-table-component';
import { Link, useLocation } from 'react-router-dom';
import CustomDataTable from '@/components/ui/table';
import { Item, ItemsPagination } from '../types/items';

interface ItemsTableProps {
    items: Item[];
    loading: boolean;
    pagination: ItemsPagination;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (limit: number, page: number) => void;
}

const ItemsTable = ({
    items,
    loading,
    pagination,
    onChangePage,
    onChangeRowsPerPage,
}: ItemsTableProps) => {
    const location = useLocation();

    const columns: TableColumn<Item>[] = [
        {
            name: 'Item ID',
            selector: row => row.itemId || '-',
            cell: row => (<>
                <Link
                    to={`/netsuite/items/view/${row.internalId}`}
                    state={{ from: location.search }}
                    className="absolute inset-0 cursor-pointer"
                />
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.itemId || '-'}</div>
                </div>
            </>),
            wrap: true,
            width: '350px'
        },
        {
            name: 'Display Name',
            selector: row => row.displayName || '-',
            wrap: true,
            minWidth: '420px'
        },
        {
            name: 'Item Type',
            selector: row => row.itemType || '-',
            cell: row => (
                <div className="items-center">
                    {row.itemType ? (
                        <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#d0e6ef]">
                            {row.itemType}
                        </span>
                    ) : '-'}
                </div>
            ),
            center: true,
            width: '180px'
        }
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={items}
            loading={loading}
            pagination
            paginationServer
            paginationTotalRows={pagination?.total || 0}
            paginationPerPage={pagination?.limit || 10}
            paginationDefaultPage={pagination?.page || 1}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
            fixedHeader={true}
            fixedHeaderScrollHeight="625px"
            responsive
            highlightOnHover={false}
            striped={false}
            persistTableHead
            borderRadius="8px"
        />
    );
};

export default ItemsTable;
