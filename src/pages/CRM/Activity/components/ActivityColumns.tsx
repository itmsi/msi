import { TableColumn } from 'react-data-table-component';
import { Activity } from '../types/activity';

// Helper function to format date
const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
};

// Helper function to get transaction type badge color
const getTransactionTypeBadge = (type: string): string => {
    switch (type?.toLowerCase()) {
        case 'find':
            return 'bg-green-100 text-green-800';
        case 'visit':
            return 'bg-blue-100 text-blue-800';
        case 'call':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Helper function to get transaction source badge color
const getTransactionSourceBadge = (source: string): string => {
    switch (source?.toLowerCase()) {
        case 'manual':
            return 'bg-purple-100 text-purple-800';
        case 'automatic':
            return 'bg-blue-100 text-blue-800';
        case 'system':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getActivityColumns = (): TableColumn<Activity>[] => [
    {
        name: 'Transaction Type',
        selector: (row: Activity) => row.transaction_type || '-',
        // width: '140px',
        cell: (row: Activity) => (
            <div className="py-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeBadge(row.transaction_type)}`}>
                    {row.transaction_type || '-'}
                </span>
            </div>
        ),
    },
    {
        name: 'Transaction Source',
        selector: (row: Activity) => row.transaction_source || '-',
        // width: '140px',
        cell: (row: Activity) => (
            <div className="py-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionSourceBadge(row.transaction_source)}`}>
                    {row.transaction_source || '-'}
                </span>
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
        name: 'Summary Point',
        selector: (row: Activity) => row.summary_point || '-',
        wrap: true,
        cell: (row: Activity) => (
            <div className="py-2">
                <p className="text-sm text-gray-700 truncate max-w-xs" title={row.summary_point}>
                    {row.summary_point || '-'}
                </p>
            </div>
        ),
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
        selector: (row: Activity) => row.updated_at,
        // width: '130px',
        cell: (row: Activity) => (
            <div className="py-2">
                <p className="text-sm text-gray-900">
                    {formatDate(row.updated_at)}
                </p>
            </div>
        ),
    },
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