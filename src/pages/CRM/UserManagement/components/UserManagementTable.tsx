import React, { useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { MdExpandMore, MdExpandLess, MdDeleteOutline } from 'react-icons/md';
import { FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { Employee, Territory, Pagination } from '../types/usermanagement';
import Badge from '@/components/ui/badge/Badge';
import { createActionsColumn } from '@/components/ui/table';

interface UserManagementTableProps {
    employees: Employee[];
    loading: boolean;
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (perPage: number, page: number) => void;
    onRowClick?: (employee: Employee) => void;
    handleEdit: (employee: Employee) => void;
    handleDelete: (employee: Employee) => void;
}

// Component untuk menampilkan territory list
const TerritoryList: React.FC<{ territories: Territory[]; isExpanded: boolean }> = ({ 
    territories, 
    isExpanded 
}) => {
    if (!isExpanded || territories.length === 0) {
        return <span className="text-sm text-gray-500">({territories.length} territories)</span>;
    }

    return (
        <div className="mt-2 space-y-1">
            {territories.map((territory, index) => (
                <div key={index} className="flex items-center text-sm">
                    <FaMapMarkerAlt className="text-blue-500 mr-2 text-xs" />
                    <span className="text-gray-700">{territory.title}</span>
                </div>
            ))}
        </div>
    );
};

const UserManagementTable: React.FC<UserManagementTableProps> = ({
    employees,
    loading,
    pagination,
    onPageChange,
    onRowsPerPageChange,
    onRowClick,
    // handleEdit,
    handleDelete
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Toggle expanded territory untuk employee tertentu
    const toggleExpanded = (employeeId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(employeeId)) {
            newExpanded.delete(employeeId);
        } else {
            newExpanded.add(employeeId);
        }
        setExpandedRows(newExpanded);
    };

    const columns: TableColumn<Employee>[] = [
        {
            name: 'Employee',
            selector: (row) => row.employee_name || 'N/A',
            cell: (row) => (
                <div className="flex items-center py-2">
                    <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600 text-sm" />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {row.employee_name || 'No Name'}
                        </div>
                        {row.employee_title && (
                            <div className="text-xs text-blue-600 mt-1">
                                {row.employee_title}
                            </div>
                        )}
                    </div>
                </div>
            ),
            minWidth: '250px',
            sortable: true
        },
        {
            name: 'Territories Access',
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center mb-2">
                        <Badge 
                            variant="outline" 
                            color="primary" 
                            size="sm"
                        >
                            {row.territories.length} Areas
                        </Badge>
                        {row.territories.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(row.employee_id);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {expandedRows.has(row.employee_id) ? (
                                    <MdExpandLess className="text-lg" />
                                ) : (
                                    <MdExpandMore className="text-lg" />
                                )}
                            </button>
                        )}
                    </div>
                    <TerritoryList 
                        territories={row.territories}
                        isExpanded={expandedRows.has(row.employee_id)}
                    />
                </div>
            ),
            minWidth: '350px',
            wrap: true
        },
        // {
        //     name: 'Status',
        //     cell: (row) => (
        //         <div className="text-center">
        //             <Badge 
        //                 variant="solid"
        //                 color={row.employee_name ? "success" : "warning"}
        //                 size="sm"
        //             >
        //                 {row.employee_name ? "Active" : "Inactive"}
        //             </Badge>
        //         </div>
        //     ),
        //     width: '100px'
        // },
        createActionsColumn([
            // {
            //     icon: MdEdit,
            //     onClick: handleEdit,
            //     className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
            //     tooltip: 'read',
            //     permission: 'update'
            // },
            {
                icon: MdDeleteOutline,
                onClick: handleDelete,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={employees}
            loading={loading}
            pagination={true}
            paginationServer={true}
            paginationTotalRows={pagination.total}
            paginationPerPage={pagination.limit}
            paginationDefaultPage={pagination.page}
            paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
            onChangePage={onPageChange}
            onChangeRowsPerPage={onRowsPerPageChange}
            onRowClicked={onRowClick}
            striped={false}
            fixedHeader={true}
            fixedHeaderScrollHeight="600px"
            noDataComponent={
                <div className="text-center py-8 text-gray-500">
                    No employees added yet
                </div>
            }
            responsive
            highlightOnHover
            persistTableHead
            headerBackground="rgba(2, 83, 165, 0.1)"
            hoverBackground="rgba(223, 232, 242, 0.3)"
            borderRadius="8px"
        />
    );
};

export default UserManagementTable;