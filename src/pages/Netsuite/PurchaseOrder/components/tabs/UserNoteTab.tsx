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
    // Format: "29/5/2026 4:36 pm" → DD/M/YYYY H:MM am/pm
    const parseNetsuiteDate = (dateStr: string): number => {
        const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
        if (!match) return 0;
        let [, day, month, year, hour, minute, meridiem] = match;
        let h = parseInt(hour);
        if (meridiem.toLowerCase() === 'pm' && h !== 12) h += 12;
        if (meridiem.toLowerCase() === 'am' && h === 12) h = 0;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, parseInt(minute)).getTime();
    };

    const sortedNotes = [...noteList].sort((a, b) => {
        const dateA = a.date ? parseNetsuiteDate(a.date) : 0;
        const dateB = b.date ? parseNetsuiteDate(b.date) : 0;
        return dateB - dateA;
    });

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
                data={sortedNotes}
                loading={isLoading}
                pagination={false}
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
