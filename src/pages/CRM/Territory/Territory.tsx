import React from 'react';
import { MdAdd} from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { useTerritoryManagement } from './hooks';
import TerritoryTable from './components/TerritoryTable';
import AddTerritoryModal from './components/AddTerritoryModal';
import EditTerritoryModal from './components/EditTerritoryModal';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

const Territory: React.FC = () => {
    const {
        territories,
        loading,
        error,
        showAddModal,
        showEditModal,
        addModalConfig,
        editTerritoryData,
        modalProps,
        handleRowClick,
        handleAddChild,
        handleAddTerritory,
        handleEdit,
        handleDelete,
        handleCreateSubmit,
        handleUpdateSubmit,
        handleCloseModal,
        handleCloseEditModal
    } = useTerritoryManagement();

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
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="text-yellow-600 font-semibold text-sm">IZ</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total IUP Zones
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {territories.reduce((sum, island) => 
                                                    sum + (island.children?.reduce((groupSum, group) => 
                                                        groupSum + (group.children?.reduce((areaSum, area) => 
                                                            areaSum + (area.children?.length || 0), 0) || 0), 0) || 0), 0)}
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
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-semibold text-sm">IS</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total IUP Segmentations
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
                                                                zoneSum + (zone.children?.reduce((segmentSum, segment) => 
                                                                    segmentSum + (segment.children?.length || 0), 0) || 0), 0) || 0), 0) || 0), 0) || 0), 0)}
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