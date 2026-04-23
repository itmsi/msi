import React from 'react';
import { UserNotesItem } from '../../types/purchaseorder';
import CustomDataTable from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import { formatTanggal } from '@/helpers/generalHelper';

interface UserNoteTabProps {
    noteList: UserNotesItem[];
    isLoading: boolean;
}
const UserNoteTab: React.FC<UserNoteTabProps> = ({
    noteList,
    isLoading,
}) => {
    
    const columns: TableColumn<UserNotesItem>[] = [
        {
            name: 'Date',
            selector: row => row.date ? formatTanggal(row.date) || '-' : '-',
            width: '200px',
        },
        {
            name: 'Author',
            selector: row => row.author || '-',
            wrap: true,
        },
        {
            name: 'Title',
            selector: row => row.title || '-',
            wrap: true,
        },
        {
            name: 'Memo',
            selector: row => row.note || '-',
            wrap: true,
        },
        {
            name: 'Direction',
            selector: row => row.direction || '-',
            wrap: true,
        },
        {
            name: 'Type',
            selector: row => row.type || '-',
            wrap: true,
        }
    ];

    return (
        <div className="p-6 font-secondary">
            <CustomDataTable
                columns={columns}
                data={noteList}
                loading={isLoading}
                fixedHeader
                fixedHeaderScrollHeight="500px"
                highlightOnHover
                persistTableHead
                responsive
                borderRadius="8px"
            />
        </div>
    );
};

export default UserNoteTab;
