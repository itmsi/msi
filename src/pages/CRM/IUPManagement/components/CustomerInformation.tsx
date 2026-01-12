import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { CustomerInfo } from '../types/iupmanagement';
import { useNavigate } from 'react-router';

interface CustomerInformationProps {
    customers: CustomerInfo[];
}

const CustomerInformation: React.FC<CustomerInformationProps> = ({ customers }) => {
    const navigate = useNavigate();
    // Define columns for customer data table
    const customerColumns: TableColumn<CustomerInfo>[] = [
        {
            name: 'Customer Name',
            selector: (row: CustomerInfo) => row.customer_name || '-',
            wrap: true,
            cell: (row: CustomerInfo) => (
                <div className="py-2">
                    <p className="font-medium text-gray-900 text-sm">
                        {row.customer_name || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Phone Number',
            selector: (row: CustomerInfo) => row.customer_phone || '-',
            wrap: true,
            cell: (row: CustomerInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.customer_phone || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Contact Person',
            selector: (row: CustomerInfo) => row.contact_person || '-',
            wrap: true,
            cell: (row: CustomerInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.contact_person || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Segmentation',
            selector: (row: CustomerInfo) => row.segmentation_name_en || '-',
            width: '160px',
            wrap: true,
            cell: (row: CustomerInfo) => (
                <div className="py-2">
                    <p className="text-gray-700 text-sm">
                        {row.segmentation_name_en || '-'}
                    </p>
                </div>
            ),
        },
        {
            name: 'Fleet Count',
            selector: (row: CustomerInfo) => row.number_of_fleet || '0',
            width: '160px',
            wrap: true,
            center: true,
            cell: (row: CustomerInfo) => (
                <div className="py-2">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded-md">
                        {row.number_of_fleet || '0'}
                    </span>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: (row: CustomerInfo) => row.status || 'Unknown',
            width: '120px',
            center: true,
            cell: (row: CustomerInfo) => (
                <div className="py-2">
                    <span className={`capitalize inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {row.status || 'Unknown'}
                    </span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Customer Information</h3>
            <p className="text-sm text-gray-500">There are no customers associated with this IUP.</p>
        </div>
    );

    // if (customers.length === 0) {
    //     return null;
    // }

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Customer Information</h2>
                    </div>
                </div>
            </div>
            
            
            <div className="p-6 font-secondary">
                <CustomDataTable
                    columns={customerColumns}
                    data={customers}
                    pagination={false}
                    highlightOnHover
                    responsive
                    noDataComponent={<NoDataComponent />}
                    striped={false}
                    persistTableHead
                    headerBackground="rgba(2, 83, 165, 0.1)"
                    hoverBackground="rgba(223, 232, 242, 0.3)"
                    onRowClicked={(row) => navigate(`/crm/iup-management/edit/${row.customer_name}`)}
                />
            </div>
        </div>
    );
};

export default CustomerInformation;