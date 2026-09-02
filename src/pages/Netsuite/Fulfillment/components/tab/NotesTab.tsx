import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { FulfillmentUserNote } from '../../types/fulfillment';
import { TableColumn } from 'react-data-table-component';
import { UserNotesItem } from '@/pages/Netsuite/SalesOrders/types/salesOrder';
import { formatTanggal } from '@/helpers/generalHelper';

interface NotesTabProps {
    notes: FulfillmentUserNote[];
}

export default function NotesTab({ notes }: NotesTabProps) {
    const parseNetsuiteDate = (dateStr: string): number => {
        const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
        if (!match) return 0;
        let [, day, month, year, hour, minute, meridiem] = match;
        let h = parseInt(hour);
        if (meridiem.toLowerCase() === 'pm' && h !== 12) h += 12;
        if (meridiem.toLowerCase() === 'am' && h === 12) h = 0;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, parseInt(minute)).getTime();
    };

    const sortedNotes = [...notes].sort((a, b) => {
        const dateA = a.date ? parseNetsuiteDate(a.date) : 0;
        const dateB = b.date ? parseNetsuiteDate(b.date) : 0;
        return dateB - dateA;
    });

    const columns: TableColumn<UserNotesItem>[] = [
        {
            name: 'Date',
            selector: row => row.date ? formatTanggal(row.date) || '-' : '-',
            wrap: true,
            width: '230px',
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
}
