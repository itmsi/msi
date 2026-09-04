import { TableColumn } from 'react-data-table-component';
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
    const columns: TableColumn<Item>[] = [
        // {
        //     name: 'Internal ID',
        //     selector: row => row.internalId || '-',
        //     wrap: true,
        //     width: '140px'
        // },
        {
            name: 'Item ID',
            selector: row => row.itemId || '-',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.itemId || '-'}</div>
                    <div className="block text-sm text-gray-500">ID: {row.internalId || '-'}</div>
                </div>
            ),
            wrap: true,
            width: '180px'
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
        },
        // {
        //     name: 'Last Modified Date',
        //     selector: row => row.lastModifiedDate || '-',
        //     format: row => formatLastModified(row.lastModifiedDate),
        //     wrap: true,
        //     width: '220px',
        //     center: true
        // },
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
