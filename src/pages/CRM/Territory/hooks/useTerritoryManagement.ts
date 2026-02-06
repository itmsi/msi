import { useState } from 'react';
import { useTerritory } from './useTerritory';
import { useConfirmation } from '@/hooks/useConfirmation';
import { CreateTerritoryRequest, UpdateTerritoryRequest, DeleteTerritoryRequest } from '../types/territory';
import { ExpandableRowData } from '../components/TerritoryTable';

export const useTerritoryManagement = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [addModalConfig, setAddModalConfig] = useState<{
        parentRow?: ExpandableRowData;
        childType: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
    }>({ childType: 'island' });
    const [editTerritoryData, setEditTerritoryData] = useState<ExpandableRowData | undefined>();
    
    const {
        territories,
        loading,
        error,
        createTerritory,
        updateTerritory,
        deleteTerritory
    } = useTerritory();
    
    const { showConfirmation, modalProps } = useConfirmation();

    const handleRowClick = () => {
        // Bisa ditambahkan navigate ke detail atau action lain
    };

    const handleAddChild = (parentRow: ExpandableRowData, childType: string) => {
        setAddModalConfig({
            parentRow,
            childType: childType as 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup'
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
            message: `Are you sure you want to delete "${row.name}"?\\n\\nType: ${typeLabel}\\nCode: ${row.code}\\n\\nThis action cannot be undone and will also delete all child territories.`,
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

    return {
        // Territory data from useTerritory
        territories,
        loading,
        error,
        
        // Modal states
        showAddModal,
        showEditModal,
        addModalConfig,
        editTerritoryData,
        
        // Confirmation modal
        modalProps,
        
        // Handlers
        handleRowClick,
        handleAddChild,
        handleAddTerritory,
        handleEdit,
        handleDelete,
        handleCreateSubmit,
        handleUpdateSubmit,
        handleCloseModal,
        handleCloseEditModal
    };
};