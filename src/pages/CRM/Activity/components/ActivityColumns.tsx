import { TableColumn } from 'react-data-table-component';
import { Activity } from '../types/activity';
import { formatDate, formatDateTime } from '@/helpers/generalHelper';
import Badge from '@/components/ui/badge/Badge';
import { ActivityTypeBadge } from '../../Contractors/components/ContractorBadges';

export const getActivityColumns = (): TableColumn<Activity>[] => [
    {
        name: 'Transaction Type',
        selector: (row) => row?.transaction_type || 'find',
        cell: (row) => <ActivityTypeBadge type={(row?.transaction_type as 'Find' | 'Pull' | 'Survey') || 'Find'} />
    },
    {
        name: 'Transaction Source',
        selector: (row: Activity) => row.transaction_source || '-',
        // width: '140px',
        cell: (row: Activity) => (
            <div className="capitalize">
                <Badge
                    color={row.transaction_source.toLowerCase() === 'manual' ? 'primary' :'info'}
                    variant='light'
                >
                    {row.transaction_source}
                </Badge>
            </div>
        ),
    },
    {
        name: 'Segmentation',
        selector: (row: Activity) => row.segmentation_properties?.segmentation_name_en || '-',
        // width: '160px',
        cell: (row: Activity) => (
            <div className="py-2">
                <p className="text-sm font-medium text-gray-900">
                    {row.segmentation_properties?.segmentation_name_en || '-'}
                </p>
            </div>
        ),
    },
    {
        name: 'Date',
        selector: (row: Activity) => row.transaction_date || '-',
        cell: (row: Activity) => (
            <div className=" items-center gap-3 py-2">
                <div className="font-medium text-gray-900">
                    {row.transaction_date ? formatDate(row.transaction_date) : '-'}
                </div>
                <div className="block text-sm text-gray-500">
                    {row.transaction_time || '-'}
                </div>
            </div>
        ),
        width: '160px'
    },
    {
        name: 'Location',
        selector: (row: Activity) => `${row.latitude}, ${row.longitude}`,
        // width: '140px',
        cell: (row: Activity) => (
            <div className="py-2">
                <p className="text-xs text-gray-600">
                    {row.latitude && row.longitude ? 
                        `${parseFloat(row.latitude).toFixed(4)}, ${parseFloat(row.longitude).toFixed(4)}` : 
                        '-'
                    }
                </p>
            </div>
        ),
    },
    {
        name: 'Updated At',
        selector: row => row.updated_at,
        cell: (row) => (
            <div className="items-center gap-3 py-2">
                <div className="font-medium text-gray-900">
                    {row?.updated_by_name || '-'}
                </div>
                <div className="block text-sm text-gray-500">{`${formatDateTime(row.updated_at)}`}</div>
            </div>
        ),
        width: '200px'
    }
];

// No data component
export const NoDataComponent = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <p className="text-gray-500 text-sm">No activity data found</p>
        <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
    </div>
);