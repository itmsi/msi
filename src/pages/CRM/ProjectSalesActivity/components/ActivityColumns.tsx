import { TableColumn } from 'react-data-table-component';
import { ProjectSalesActivitySummaryItem } from '../types/projectSalesActivity';
import { formatDate } from '@/helpers/generalHelper';
import { ActivityTypeBadge } from '../../Contractors/components/ContractorBadges';
import { FaImage, FaIndustry, FaMapPin } from 'react-icons/fa';

export const getActivityColumns = (): TableColumn<ProjectSalesActivitySummaryItem>[] => [
    {
        name: 'Date Visited',
        selector: (row: ProjectSalesActivitySummaryItem) => row.created_at || '-',
        cell: (row: ProjectSalesActivitySummaryItem) => (
            <div className=" items-center gap-3 py-2">
                <div className="font-medium text-gray-900">
                    {row.created_at ? formatDate(row.created_at) : '-'}
                </div>
            </div>
        ),
        width: '160px'
    },
    {
        name: 'Sales Name',
        selector: (row: ProjectSalesActivitySummaryItem) => row.employee_name || '-',
        cell: (row: ProjectSalesActivitySummaryItem) => (
            <div className="py-2">
                <p className="text-sm font-medium text-gray-900">
                    {row.employee_name || '-'}
                </p>
            </div>
        ),
        width: '250px'
    },
    {
        name: 'Contractor Name',
        selector: (row: ProjectSalesActivitySummaryItem) => row.customer_name || '-',
        cell: (row: ProjectSalesActivitySummaryItem) => (
            <div className="py-2">
                <p className="text-sm font-medium text-gray-900">
                    {row.customer_name || '-'}
                </p>
                <div className="text-xs text-gray-900 flex items-center">
                    <FaIndustry className="text-gray-500 text-xs mr-2" /> {row.iup_name}
                </div>
            </div>
        ),
        width: '350px'
    },
    {
        name: 'Project Name',
        selector: (row: ProjectSalesActivitySummaryItem) => row.project_name || '-',
        // width: '160px',
        cell: (row: ProjectSalesActivitySummaryItem) => (
            <div className="py-2">
                <p className="text-sm font-medium text-gray-900">
                    {row.project_name || '-'}
                </p>
            </div>
        ),
        width: '250px'
    },
    {
        name: 'Status',
        selector: (row: ProjectSalesActivitySummaryItem) => row?.image || 'Find',
        cell: (row: ProjectSalesActivitySummaryItem) => <ActivityTypeBadge type={(row?.project_status as 'Find' | 'Pull' | 'Survey') || 'Find'} />
    },
    {
        name: 'Locations',
        selector: row => row?.project_status || 'find',
        cell: row => (
            <div className="items-center capitalize">
                {row.project_status ? (
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${row.latitude},${row.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-gray-200 border rounded-full font-medium bg-[#a2d2ff]`}
                    >
                        <FaMapPin /> View Location
                    </a>
                ) : '-'}
            </div>
        ),
        center: true,
        width: '250px'
    },
    {
        name: 'Image Preview',
        selector: row => row?.image || 'find',
        cell: row => (
            <div className="items-center capitalize">
                {row.image ? (
                    <a 
                        href={row.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-blue-200 border rounded-md font-medium `}
                    >
                        <FaImage /> View Image
                    </a>
                ) : '-'}
            </div>
        ),
        center: true,
        width: '250px'
    },
    {
        name: 'Description',
        selector: row => row?.description || 'find',
        cell: row => (
            <div className="items-center capitalize">
                {row.description ? (
                    <div >
                        {row.description ? row.description : '-'}
                    </div>
                ) : '-'}
            </div>
        ),
        width: '250px'
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