// Do One Thing: Orchestrate Sales Tracking Components & Logic
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import toast from 'react-hot-toast';

import { useSalesTracking } from './hooks/useSalesTracking';
import { useSalesTrackingForm } from './hooks/useSalesTrackingForm';
import NewItemSelector from './NewItemSelector';
import SalesTrackingList from './SalesTrackingList';
import { SalesTrackingFormData, SalesTrackingItem } from '../../types/salesTracking';

interface SalesTrackingContainerProps {
    className?: string;
}

const SalesTrackingContainer: React.FC<SalesTrackingContainerProps> = ({ className = '' }) => {
    const { id: projectId } = useParams<{ id: string }>();
    const { showConfirmation, modalProps } = useConfirmation();
    const [tempItems, setTempItems] = useState<SalesTrackingItem[]>([]);
    
    // Data management
    const {
        salesData,
        isLoading,
        loadSalesTracking,
        createSalesTracking,
        updateSalesTracking,
        deleteSalesTracking
    } = useSalesTracking(projectId);

    // Form management
    const {
        formDataMap,
        initializeFormData,
        handleFormDataChange,
        buildFormData
    } = useSalesTrackingForm();

    const allSalesData = useMemo(() => {
        const typeOrder = ['Not Started', 'Find', 'Pull', 'Survey', 'BAST'];
        const combinedData = [...tempItems, ...salesData];
        
        return combinedData.sort((a, b) => {
            const indexA = typeOrder.indexOf(a.type);
            const indexB = typeOrder.indexOf(b.type);
            
            // If type not found in order array, put it at the end
            const orderA = indexA === -1 ? typeOrder.length : indexA;
            const orderB = indexB === -1 ? typeOrder.length : indexB;
            
            return orderA - orderB;
        });
    }, [salesData, tempItems]); 

    useEffect(() => {
        loadSalesTracking();
    }, [projectId]);

    useEffect(() => {
        if (allSalesData.length > 0) {
            initializeFormData(allSalesData);
        }
    }, [allSalesData, initializeFormData]);

    const handleSubmit = async (
        formData: SalesTrackingFormData, 
        projectDetailId: string, 
        type: string
    ) => {
        if (!projectId) return;

        try {
            const isNewItem = projectDetailId.startsWith('temp_');
            const apiFormData = buildFormData(formData, projectId, type);
            
            let response: any;
            if (isNewItem) {
                response = await createSalesTracking(apiFormData);
                setTempItems(prev => prev.filter(item => item.project_detail_id !== projectDetailId));
            } else {
                response = await updateSalesTracking(projectDetailId, apiFormData);
            }
            
            const message = response?.message || (isNewItem ? 'Data berhasil ditambahkan!' : 'Data berhasil diperbarui!');
            toast.success(message);
            
            await loadSalesTracking();
            
        } catch (error: any) {
            console.error('Error submitting form:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Gagal menyimpan data';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (type: string) => {
        const confirmed = await showConfirmation({
            title: 'Hapus Data Sales Tracking',
            message: `Apakah Anda yakin ingin menghapus semua data ${type}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'danger',
        });
        
        if (!confirmed) return;

        try {
            // Get all items for this type
            const itemsToDelete = allSalesData.filter(item => item.type === type);
            
            // Separate temp items and existing items
            const tempItemsToDelete = itemsToDelete.filter(item => item.project_detail_id.startsWith('temp_'));
            const existingItemsToDelete = itemsToDelete.filter(item => !item.project_detail_id.startsWith('temp_'));
            
            // Remove temp items from state (no API call needed)
            if (tempItemsToDelete.length > 0) {
                setTempItems(prev => prev.filter(item => item.type !== type));
            }
            
            // Delete existing items via API
            if (existingItemsToDelete.length > 0) {
                for (const item of existingItemsToDelete) {
                    await deleteSalesTracking(item.project_detail_id);
                }
            }
            
            toast.success(`Data ${type} berhasil dihapus!`);
        } catch (error: any) {
            console.error('Error deleting data:', error);
            toast.error(error.message || 'Gagal menghapus data');
        }
    };

    const handleAddNewItem = (newItem: SalesTrackingItem) => {
        // Add to temporary items list
        setTempItems(prev => [newItem, ...prev]);
    };

    if (isLoading) {
        return (
            <div className={`${className} flex items-center justify-center py-8`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="ml-2 text-gray-600">Loading sales tracking data...</span>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-5 col-span-1 min-h-80">
                <h2 className="text-lg font-primary-bold font-medium text-gray-900 pb-6 relative">
                    Sales Tracking
                </h2>
                {projectId && (
                    <NewItemSelector 
                        projectId={projectId} 
                        onAddItem={handleAddNewItem}
                    />
                )}
                
                <SalesTrackingList
                    salesData={allSalesData}
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

export default SalesTrackingContainer;