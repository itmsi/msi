import React, { useState } from 'react';
import { MdAdd} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useTerritory } from './hooks/useTerritory';
import TerritoryTable, { ExpandableRowData } from './components/TerritoryTable';
import AddTerritoryModal from './components/AddTerritoryModal';
import EditTerritoryModal from './components/EditTerritoryModal';
import { CreateTerritoryRequest, UpdateTerritoryRequest, DeleteTerritoryRequest } from './types/territory';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const Territory: React.FC = () => {
    // const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [addModalConfig, setAddModalConfig] = useState<{
        parentRow?: ExpandableRowData;
        childType: 'island' | 'group' | 'area' | 'iup_zone' | 'iup';
    }>({ childType: 'island' });
    const [editTerritoryData, setEditTerritoryData] = useState<ExpandableRowData | undefined>();
    
    const {
        territories,
        loading,
        error,
        // fetchTerritories,
        // searchTerritories,
        createTerritory,
        updateTerritory,
        deleteTerritory
    } = useTerritory();
    
    const { showConfirmation, modalProps } = useConfirmation();

    // const handleSearch = (e: React.FormEvent) => {
    //     e.preventDefault();
    //     searchTerritories(searchTerm);
    // };

    // const handleRefresh = () => {
    //     setSearchTerm('');
    //     fetchTerritories();
    // };
    //     searchTerritories(searchTerm);
    // };

    // const handleRefresh = () => {
    //     setSearchTerm('');
    //     fetchTerritories();
    // };

    // const handleRowClick = (row: ExpandableRowData) => {
    //     // Bisa ditambahkan navigate ke detail atau action lain
    // };
    const handleRowClick = () => {
        // Bisa ditambahkan navigate ke detail atau action lain
    };

    const handleAddChild = (parentRow: ExpandableRowData, childType: string) => {
        setAddModalConfig({
            parentRow,
            childType: childType as 'island' | 'group' | 'area' | 'iup_zone' | 'iup'
        });
        setShowAddModal(true);
    };

    const handleAddTerritory = () => {
        // Add new island (root level)
        setAddModalConfig({
            parentRow: undefined,
            childType: 'island'
        });
        setShowAddModal(true);
    };

    const handleEdit = (row: ExpandableRowData) => {
        setEditTerritoryData(row);
        setShowEditModal(true);
    };

    const handleDelete = async (row: ExpandableRowData) => {
        const typeLabel = row.type.replace('_', ' ').toUpperCase();
        
        const confirmed = await showConfirmation({
            title: `Delete ${typeLabel}`,
            message: `Are you sure you want to delete "${row.name}"?\n\nType: ${typeLabel}\nCode: ${row.code}\n\nThis action cannot be undone and will also delete all child territories.`,
            confirmText: `Delete ${typeLabel}`,
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (confirmed) {
            const deleteParams: DeleteTerritoryRequest = {
                id: row.id,
                type: row.type
            };
            
            const result = await deleteTerritory(deleteParams);
            if (result.success) {
                // Data akan otomatis refresh dari hook
            }
        }
    };

    const handleCreateSubmit = async (data: CreateTerritoryRequest) => {
        const result = await createTerritory(data);
        
        if (result.success) {
            setShowAddModal(false);
            // Reset form config
            setAddModalConfig({ childType: 'island' });
        }
    };

    const handleUpdateSubmit = async (id: string, data: UpdateTerritoryRequest) => {
        const result = await updateTerritory(id, data);
        
        if (result.success) {
            setShowEditModal(false);
            setEditTerritoryData(undefined);
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditTerritoryData(undefined);
        setAddModalConfig({ childType: 'island' });
    };

    return (
        <>
            <PageMeta 
                title="Territory Management - CRM System" 
                description="Manage and organize territory database with hierarchical structure"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Territory Management
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage and organize your territory database with hierarchical structure
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                {/* <Button
                                    variant="outline"
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="flex items-center"
                                >
                                    <MdRefresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button> */}
                                
                                <PermissionGate permission="create">
                                    <Button
                                        onClick={handleAddTerritory}
                                        className="flex items-center"
                                    >
                                        <MdAdd className="mr-2" />
                                        Add Territory
                                    </Button>
                                </PermissionGate>
                            </div>
                        </div>
                    </div>
                    
                    {/* Search Section */}
                    {/* <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <form onSubmit={handleSearch} className="flex items-center space-x-4">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search territory by name or code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={loading}
                                className="flex items-center"
                            >
                                <MdSearch className="mr-2" />
                                Search
                            </Button>
                        </form>
                    </div> */}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error loading territory data
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-sm">I</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Islands
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {territories.length}
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
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 font-semibold text-sm">G</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Groups
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {territories.reduce((sum, island) => sum + (island.children?.length || 0), 0)}
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
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-orange-600 font-semibold text-sm">A</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Areas
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {territories.reduce((sum, island) => 
                                                    sum + (island.children?.reduce((groupSum, group) => 
                                                        groupSum + (group.children?.length || 0), 0) || 0), 0)}
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
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-purple-600 font-semibold text-sm">IUP</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total IUPs
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {territories.reduce((sum, island) => 
                                                    sum + (island.children?.reduce((groupSum, group) => 
                                                        groupSum + (group.children?.reduce((areaSum, area) => 
                                                            areaSum + (area.children?.reduce((zoneSum, zone) => 
                                                                zoneSum + (zone.children?.length || 0), 0) || 0), 0) || 0), 0) || 0), 0)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Territory Table */}
                
                <div className="bg-white shadow rounded-lg">
                    <TerritoryTable 
                        territories={territories}
                        loading={loading}
                        onRowClick={handleRowClick}
                        onAddChild={handleAddChild}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Add Territory Modal */}
                <AddTerritoryModal
                    isOpen={showAddModal}
                    onClose={handleCloseModal}
                    onSubmit={handleCreateSubmit}
                    parentRow={addModalConfig.parentRow}
                    childType={addModalConfig.childType}
                    loading={loading}
                />

                {/* Edit Territory Modal */}
                <EditTerritoryModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    onSubmit={handleUpdateSubmit}
                    territoryData={editTerritoryData}
                    loading={loading}
                />
                
                
                {/* Confirmation Modal */}
                <ConfirmationModal {...modalProps} />
            </div>
        </>
    );
};

export default Territory;