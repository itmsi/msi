import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { formatCurrency, formatDateTime } from '@/helpers/generalHelper';
import { RorEntity } from '@/pages/ROECalculator/Manage/types/roecalculator';
import { useRoeCalculatorManagement } from '@/pages/ROECalculator/Manage/hooks/useRoeCalculatorManagement';

interface ContractorROEInformationProps {
    iup_customer_id: string;
}

const ContractorROEInformation: React.FC<ContractorROEInformationProps> = ({ iup_customer_id }) => {
    const { roeCalculator, loading, error } = useRoeCalculatorManagement({ iup_customer_id });

    const columns: TableColumn<RorEntity>[] = [
        {
            name: 'Customer',
            selector: row => row.customer_name || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">
                        {row.customer_name}
                    </div>
                    <div className={`block text-sm text-gray-500 ${parseFloat(String(row?.roe_individual_percentage || '0')) < 0 ? 'text-red-500' : 'text-green-600'}`}>ROE : {row.roe_individual_percentage || '0'}%</div>
                    <div className={`block text-sm text-gray-500 ${parseFloat(String(row?.roa_individual_percentage || '0')) < 0 ? 'text-red-500' : 'text-green-600'}`}>ROA : {row.roa_individual_percentage || '0'}%</div>
                </div>
            ),
        },
        {
            name: 'Commodity',
            selector: row => row.commodity || '-',
        },
        {
            name: 'Revenue',
            selector: row => row.revenue_monthly || '-',
            cell: (row) => (
                <div className=" items-center gap-3 py-2">
                    <div 
                        className={`block text-sm text-gray-500 ${parseFloat(String(row?.revenue_monthly || '0')) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatCurrency(String(row?.revenue_monthly)) || '0'}
                    </div>
                </div>
            )
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

    const handleBreakdown = (row: any) => {
        row.step === 4 ? 
            window.open(`/roe-roa-calculator/manage/breakdown/${row.id}`, '_blank') : 
            window.open(`/roe-roa-calculator/manage/edit/${row.id}?step=${row.step || 1}`, '_blank');
    };
    return (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg leading-6 font-primary-bold text-gray-900">Informasi Project</h2>
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
                    columns={columns}
                    data={roeCalculator}
                    pagination={false}
                    loading={loading}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="600px"
                    responsive
                    highlightOnHover
                    striped={false}
                    persistTableHead
                    borderRadius="8px"
                    onRowClicked={handleBreakdown}
                />
            </div>
        </div>
    );
};

export default ContractorROEInformation;