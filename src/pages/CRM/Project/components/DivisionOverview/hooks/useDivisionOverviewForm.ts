// Custom hook untuk form management - Do One Thing: Manage Form State & Operations  
import { useState, useCallback } from 'react';
import { DivisionOverviewFormData, DivisionOverviewItem } from '../../../types/divisionOverview';

export const useDivisionOverviewForm = () => {
    const [formDataMap, setFormDataMap] = useState<Record<string, DivisionOverviewFormData>>({});

    const initializeFormData = useCallback((divisionData: DivisionOverviewItem[]) => {
        setFormDataMap(prev => {
            const updatedFormData = { ...prev };
            divisionData.forEach((item, index) => {
                const itemKey = `${item.devision_project_name}_${index}`;
                // Only initialize if key doesn't exist yet
                if (!updatedFormData[itemKey]) {
                    updatedFormData[itemKey] = {
                        remarks: item.remarks || '',
                        existing_attachments: item.property_attachment || [],
                        property_attachment_files: [],
                        property_attachment_delete: []
                    };
                }
            });
            return updatedFormData;
        });
    }, []);

    const handleFormDataChange = useCallback((itemKey: string, formData: DivisionOverviewFormData) => {
        setFormDataMap(prev => ({
            ...prev,
            [itemKey]: formData
        }));
    }, []);

    const buildFormData = useCallback((
        formData: DivisionOverviewFormData, 
        projectId: string, 
        divisionId: string
    ): FormData => {
        const apiFormData = new FormData();
        apiFormData.append('project_id', projectId);
        apiFormData.append('division_project_id', divisionId);
        apiFormData.append('remarks', formData.remarks);
        
        // Add files jika ada
        if (formData.property_attachment_files && formData.property_attachment_files.length > 0) {
            formData.property_attachment_files.forEach(file => {
                apiFormData.append('property_attachment', file);
            });
        }
        
        // Add delete attachments jika ada
        if (formData.property_attachment_delete && formData.property_attachment_delete.length > 0) {
            apiFormData.append('property_attachment_delete', JSON.stringify(formData.property_attachment_delete));
        }

        return apiFormData;
    }, []);

    return {
        formDataMap,
        initializeFormData,
        handleFormDataChange,
        buildFormData
    };
};