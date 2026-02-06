import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { ManageQuotationItem } from '@/pages/Quotation/Manage/types/quotation';
import { formatCurrency, formatDate, formatDateTime, getStatusBadge } from '@/helpers/generalHelper';
import { useQuotationContractor } from '../hooks/useQuotationContractor';

interface ContractorQuotationInformationProps {
    customerID: string;
}

const ContractorQuotationInformation: React.FC<ContractorQuotationInformationProps> = ({ customerID }) => {
    const { quotations, loading, error } = useQuotationContractor({ customerID });

    const quotationColumns: TableColumn<ManageQuotationItem>[] = [
        {
            name: 'Quotation No',
            selector: (row) => row.manage_quotation_no,
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-[#0253a5]">
                        {row.manage_quotation_no}
                    </div>
                    <div className="block text-sm text-gray-500">{formatDate(row.manage_quotation_date)} - {formatDate(row.manage_quotation_valid_date)}</div>
                </div>
            ),
            width: '220px',
        },
        {
            name: 'Customer Name',
            selector: (row) => row.customer_name,
            wrap: true,
        },
        {
            name: 'Quotation For',
            selector: (row) => row.quotation_for || 'customer',
            cell: (row) => (
                <span className="capitalize text-sm">
                    {row.quotation_for === 'leasing' ? 'Leasing' : 'Customer'}
                </span>
            ),
            center: true,
            width: '140px',
        },
        {
            name: 'Island',
            selector: (row) => row.island_name,
            center: true,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            cell: (row) => {
                const badge = getStatusBadge(row.status);
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                    </span>
                );
            },
            center: true,
        },
        {
            name: 'Grand Total',
            selector: (row) => row.manage_quotation_grand_total,
            cell: (row) => (
                <span className="font-semibold">{formatCurrency(row.manage_quotation_grand_total)}</span>
            ),
        },
        {
            name: 'Updated By',
            selector: row => row.updated_at || '',
            sortable: false,
            cell: (row) => (
                <div className="flex flex-col py-2">
                    <span className="font-medium text-gray-900">
                        {row.updated_by_name || '-'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.updated_at ? formatDateTime(row.updated_at) : '-'}
                    </span>
                </div>
            ),
            width: '200px'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg leading-6 font-primary-bold text-gray-900">Informasi Quotation</h2>
                    </div>
                </div>
            </div>
            
            
            <div className="p-6 font-secondary">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
                
                <CustomDataTable
                    columns={quotationColumns}
                    data={quotations}
                    pagination={false}
                    loading={loading}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="600px"
                    responsive
                    highlightOnHover
                    striped={false}
                    persistTableHead
                    borderRadius="8px"
                    onRowClicked={(row) => window.open(`/quotations/manage/edit/${row.manage_quotation_id}`, '_blank')}
                />
            </div>
        </div>
    );
};

export default ContractorQuotationInformation;