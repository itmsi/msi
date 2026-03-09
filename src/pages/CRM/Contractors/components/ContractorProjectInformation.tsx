import React from 'react';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { formatDateTime } from '@/helpers/generalHelper';
import { useProjectManagement } from '../../Project/hooks/useProjectManagement';
import { ProjectItem } from '../../Project/types/project';
import { ActivityTypeBadge } from './ContractorBadges';
import Badge from '@/components/ui/badge/Badge';

interface ContractorProjectInformationProps {
    iup_customer_id: string;
}

const ContractorProjectInformation: React.FC<ContractorProjectInformationProps> = ({ iup_customer_id }) => {
    const { projects, loading, error } = useProjectManagement({ iup_customer_id });

    const columns: TableColumn<ProjectItem>[] = [
        {
            name: 'Project Name',
            selector: row => row.project_name || '-',
            cell: row => (<>
                <a
                    href={`/crm/project/edit/${row.project_id}`}
                    className="absolute inset-0"
                    target='_blank'
                />
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.project_name || '-'}</div>
                    <div className="text-sm text-gray-500">{row.customer_name || ''}</div>
                </div>
            </>),
            wrap: true,
        },
        {
            name: 'Sales',
            selector: row => row.employee_name || '-',
            wrap: true,
        },
        {
            name: 'Division',
            cell: row => (
                <div className="flex flex-wrap gap-1 py-1">
                    {row.devision_project_names && row.devision_project_names.length > 0
                        ? row.devision_project_names.map((name, idx) => (
                            <Badge 
                                key={idx} 
                                variant="solid" color="primary"
                            >
                                {name}
                            </Badge>
                        ))
                        : <span className="text-gray-400 text-sm">-</span>
                    }
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Status',
            selector: row => row.status || '-',
            cell: row => (
                <ActivityTypeBadge
                    type={(row.status as 'Not Started' | 'Find' | 'Pull' | 'Survey' | 'BAST') || 'Not Started'}
                />
            ),
        },
        {
            name: 'Updated By',
            selector: row => row.updated_by_name || '-',
            cell: row => (
                <div className="items-center gap-3 py-2">
                    <div className="font-medium text-gray-900">{row.updated_by_name || '-'}</div>
                    <div className="block text-sm text-gray-500">{formatDateTime(row.updated_at)}</div>
                </div>
            ),
        }
    ];

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
                    data={projects}
                    pagination={false}
                    loading={loading}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="600px"
                    responsive
                    highlightOnHover
                    striped={false}
                    persistTableHead
                    borderRadius="8px"
                    onRowClicked={(row) => window.open(`/crm/project/edit/${row.project_id}`, '_blank')}
                />
            </div>
        </div>
    );
};

export default ContractorProjectInformation;