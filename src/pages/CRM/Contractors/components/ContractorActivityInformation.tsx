import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { ContractorActivityInfo } from '../types/contractor';
import { ActivityTypeBadge } from './ContractorBadges';

interface ContractorActivityInformationProps {
    customers: ContractorActivityInfo[];
}

const ContractorActivityInformation: React.FC = () => {
    
    const contractorData = [
        {
            "iup_namecustomer_iup_name": "PT MESTIKA AGUNG SEJAHTERA - MUSTIKA INDAH PERMAI",
            "transactions_id": "e4efd58f-5004-4457-ae97-03c8d9807249",
            "transaction_type": "Find",
            "transaction_date": "2025-02-02",
            "sales_name": "Haris",
            "pain_point": "bla bla bla",
            "solution_point": "bla bla bla"
        },
        {
            "iup_namecustomer_iup_name": "CV BINTANG SARANA ANDALAN",
            "transactions_id": "4ba40d5f-8438-4136-aace-8d3c23297fc6",
            "transaction_type": "Find",
            "transaction_date": "2025-01-25",
            "sales_name": "Dharma",
            "pain_point": "bla bla bla",
            "solution_point": "bla bla bla"
        },
        {
            "iup_namecustomer_iup_name": "PT GATRA MANDIRI ABADI",
            "transactions_id": "43728395-1588-4588-8a71-7c28003c3247",
            "transaction_type": "Find",
            "transaction_date": "2025-01-22",
            "sales_name": "Dharma",
            "pain_point": "bla bla bla",
            "solution_point": "bla bla bla"
        }
    ]
    
    const contractorColumns: TableColumn<ContractorActivityInfo>[] = [
        {
            name: 'Customer Name',
            selector: (row: ContractorActivityInfo) => row.iup_namecustomer_iup_name || '-',
            wrap: true,
            cell: (row: ContractorActivityInfo) => (
                <div className="py-2">
                    <p className="font-medium text-gray-900 text-sm">
                        {row.iup_namecustomer_iup_name || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Transaction Type',
            selector: (row) => row?.transaction_type || 'find',
            cell: (row) => <ActivityTypeBadge type={(row?.transaction_type.toLowerCase() as 'find' | 'pull' | 'survey') || 'find'} />,
            center: true,
        },
        {
            name: 'Visit Date',
            selector: (row: ContractorActivityInfo) => row.transaction_date || '-',
            wrap: true,
            cell: (row: ContractorActivityInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.transaction_date || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Sales Name',
            selector: (row: ContractorActivityInfo) => row.sales_name || '-',
            wrap: true,
            cell: (row: ContractorActivityInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.sales_name || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Pain Point',
            selector: (row: ContractorActivityInfo) => row.pain_point || '-',
            wrap: true,
            center: true,
            cell: (row: ContractorActivityInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.pain_point || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Solution',
            selector: (row: ContractorActivityInfo) => row.solution_point || '-',
            center: true,
            cell: (row: ContractorActivityInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.solution_point || 'Unknown'}
                    </p>
                </div>
            ),
        },
    ];

    // No data component
    const NoDataComponent = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Activity Information</h3>
            <p className="text-sm text-gray-500">There are no activities associated with this IUP.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Activity Information</h2>
                    </div>
                </div>
            </div>
            
            
            <div className="p-6 font-secondary">
                <CustomDataTable
                    columns={contractorColumns}
                    data={contractorData}
                    pagination={false}
                    highlightOnHover
                    responsive
                    noDataComponent={<NoDataComponent />}
                    striped={false}
                    persistTableHead
                    headerBackground="rgba(2, 83, 165, 0.1)"
                    hoverBackground="rgba(223, 232, 242, 0.3)"
                    onRowClicked={(row) => window.open(`/crm/activity/edit/${row.transactions_id}`, '_blank')}
                />
            </div>
        </div>
    );
};

export default ContractorActivityInformation;