import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table';
import { AttachFileItem } from '../types/fulfillment';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface FilesItemsProps {
    files: AttachFileItem[];
}

export default function FilesItems({ files }: FilesItemsProps) {
    const columns: TableColumn<AttachFileItem>[] = [
        {
            name: 'File Name',
            selector: row => row.fileName || '-',
            cell: row => (
                <div className="flex items-center gap-2 py-1">
                    <Link
                        to={row.fileUrl}
                        target="_blank"
                        className="flex text-blue-400 hover:underline items-center"
                    >
                        <FaExternalLinkAlt className='me-1' size={12} /> {row.fileName || '-'}
                    </Link>
                </div>
            ),
            wrap: true,
        }
    ];

    return (
        <div className="mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900">Item files</h3>
            <div className="font-secondary">
                <CustomDataTable
                    columns={columns}
                    data={files}
                    pagination={false}
                    responsive
                    highlightOnHover
                    striped={false}
                    noDataComponent={
                        <div className="text-center py-8 text-gray-500">No item lines found</div>
                    }
                />
            </div>
        </div>
    );
}
