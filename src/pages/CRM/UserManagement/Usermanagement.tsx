import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaFilter } from 'react-icons/fa';
import { MdAdd } from 'react-icons/md';
import { useUsermanagement } from './hooks/useUsermanagement';
import UserManagementTable from './components/UserManagementTable';
import { Employee } from './types/usermanagement';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { useConfirmation } from '@/hooks/useConfirmation';
import { UsermanagementServices } from './services/usermanagementServices';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const {
        employees,
        loading,
        pagination,
        handlePageChange,
        handleRowsPerPageChange,
        handleSearch,
        refetch
    } = useUsermanagement();

    const { showConfirmation, modalProps } = useConfirmation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                setSearchQuery(searchInput);
                handleSearch(searchInput);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, handleSearch]);

    const stats = useMemo(() => {
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(emp => emp.employee_name).length;
        const inactiveEmployees = totalEmployees - activeEmployees;
        const totalTerritories = employees.reduce((sum, emp) => sum + emp.territories.length, 0);

        return {
            total: totalEmployees,
            active: activeEmployees,
            inactive: inactiveEmployees,
            territories: totalTerritories
        };
    }, [employees]);

    const handleDelete = async (employee: Employee) => {
        const typeLabel = employee.employee_name;
                
        const confirmed = await showConfirmation({
            title: `Delete ${typeLabel}`,
            message: `Are you sure you want to delete "${employee.employee_name}"?\n\nType: ${typeLabel}\nCode: ${employee.employee_name}\n\nThis action cannot be undone and will also delete all child territories.`,
            confirmText: `Delete ${typeLabel}`,
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            await UsermanagementServices.deleteUserAccess(employee.employee_id);
            refetch();
        }
    };

    return (
        <>
            <PageMeta 
                title="User Management - CRM" 
                description="Manage employee access and territory assignments"
                image="/motor-sights-international.png"
            />
            <div className="space-y-6">
                
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    User Management
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage employee access and territory assignments
                                </p>
                            </div>
                            <div className="flex space-x-3">                                
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={() => navigate('/crm/user-management/create')}
                                        className="flex items-center"
                                    >
                                        <MdAdd className="mr-2" />
                                        Create Access
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaUsers className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Employees
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.total}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaFilter className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Territories
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.territories}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6 font-secondary">
                        <UserManagementTable
                            employees={employees}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            onRowClick={(employee) => navigate(`/crm/user-management/edit/${employee.employee_id}`)}
                            handleEdit={(employee) => navigate(`/crm/user-management/edit/${employee.employee_id}`)}
                            handleDelete={handleDelete}
                        />
                    </div>
                </div>
                
                <ConfirmationModal {...modalProps} />
            </div>
        </>
    );
};

export default UserManagement;