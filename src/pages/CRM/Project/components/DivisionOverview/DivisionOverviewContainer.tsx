// Do One Thing: Orchestrate Division Overview Components & Logic
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import toast from 'react-hot-toast';

import { useDivisionOverview } from './hooks/useDivisionOverview';
import { useDivisionOverviewForm } from './hooks/useDivisionOverviewForm';
import NewItemSelector from './NewItemSelector';
import DivisionOverviewList from './DivisionOverviewList';
import { DivisionOverviewFormData, DivisionOverviewItem } from '../../types/divisionOverview';

interface DivisionOverviewContainerProps {
    className?: string;
}

const DivisionOverviewContainer: React.FC<DivisionOverviewContainerProps> = ({ className = '' }) => {
    const { id: projectId } = useParams<{ id: string }>();
    const { showConfirmation, modalProps } = useConfirmation();
    const [tempItems, setTempItems] = useState<DivisionOverviewItem[]>([]);
    
    // Data management
    const {
        divisionData,
        isLoading,
        loadDivisionOverview,
        createDivisionOverview,
        updateDivisionOverview,
        deleteDivisionOverview
    } = useDivisionOverview(projectId);

    // Form management
    const {
        formDataMap,
        initializeFormData,
        handleFormDataChange,
        buildFormData
    } = useDivisionOverviewForm();

    const allDivisionData = useMemo(() => {
        const combinedData = [...tempItems, ...divisionData];
        
        // Sort by division name alphabetically
        return combinedData.sort((a, b) => {
            return a.devision_project_name.localeCompare(b.devision_project_name);
        });
    }, [divisionData, tempItems]); 

    useEffect(() => {
        loadDivisionOverview();
    }, [projectId]);

    useEffect(() => {
        if (allDivisionData.length > 0) {
            initializeFormData(allDivisionData);
        }
    }, [allDivisionData, initializeFormData]);

    const handleSubmit = async (
        formData: DivisionOverviewFormData, 
        projectDetailId: string, 
        divisionName: string
    ) => {
        if (!projectId) return;

        try {
            const isNewItem = projectDetailId.startsWith('temp_');
            const apiFormData = buildFormData(formData, projectId, divisionName);
            
            let response: any;
            if (isNewItem) {
                response = await createDivisionOverview(apiFormData);
                setTempItems(prev => prev.filter(item => item.project_detail_id !== projectDetailId));
            } else {
                response = await updateDivisionOverview(projectDetailId, apiFormData);
            }
            
            const message = response?.message || (isNewItem ? 'Data berhasil ditambahkan!' : 'Data berhasil diperbarui!');
            toast.success(message);
            
        } catch (error: any) {
            console.error('Error submitting form:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Gagal menyimpan data';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (divisionName: string) => {
        const confirmed = await showConfirmation({
            title: 'Hapus Data Division Overview',
            message: `Apakah Anda yakin ingin menghapus semua data ${divisionName}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger',
        });
        
        if (!confirmed) return;

        try {
            // Get all items for this division
            const itemsToDelete = allDivisionData.filter(item => item.devision_project_name === divisionName);
            
            // Separate temp items and existing items
            const tempItemsToDelete = itemsToDelete.filter(item => item.project_detail_id.startsWith('temp_'));
            const existingItemsToDelete = itemsToDelete.filter(item => !item.project_detail_id.startsWith('temp_'));
            
            // Remove temp items from state (no API call needed)
            if (tempItemsToDelete.length > 0) {
                setTempItems(prev => prev.filter(item => item.devision_project_name !== divisionName));
            }
            
            // Delete existing items via API
            if (existingItemsToDelete.length > 0) {
                for (const item of existingItemsToDelete) {
                    await deleteDivisionOverview(item.project_detail_id);
                }
            }
            
            toast.success(`Data ${divisionName} berhasil dihapus!`);
        } catch (error: any) {
            console.error('Error deleting data:', error);
            toast.error(error.message || 'Gagal menghapus data');
        }
    };

    const handleAddNewItem = (newItem: DivisionOverviewItem) => {
        // Add to temporary items list
        setTempItems(prev => [newItem, ...prev]);
    };

    if (isLoading) {
        return (
            <div className={`${className} flex items-center justify-center py-8`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="ml-2 text-gray-600">Loading division overview data...</span>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-5 col-span-1 min-h-80">
                <h2 className="text-lg font-primary-bold font-medium text-gray-900 pb-6 relative">
                    Division Overview
                </h2>
                {projectId && (
                    <NewItemSelector 
                        projectId={projectId} 
                        onAddItem={handleAddNewItem}
                    />
                )}
                
                <DivisionOverviewList
                    divisionData={allDivisionData}
                    formDataMap={formDataMap}
                    onFormDataChange={handleFormDataChange}
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                />
            </div>
            <ConfirmationModal {...modalProps} />
        </div>
    );
};

export default DivisionOverviewContainer;