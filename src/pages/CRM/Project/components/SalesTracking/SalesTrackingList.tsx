import React, { useState } from 'react';
import Accordion from '@/components/ui/accordion/Accordion';
import { AccordionItemData } from '@/components/ui/accordion/types';
import SalesTrackingItemComponent from './SalesTrackingItem';
import { SalesTrackingItem, SalesTrackingFormData } from '../../types/salesTracking';
import Badge from '@/components/ui/badge/Badge';

interface SalesTrackingListProps {
    salesData: SalesTrackingItem[];
    formDataMap: Record<string, SalesTrackingFormData>;
    onFormDataChange: (itemKey: string, formData: SalesTrackingFormData) => void;
    onSubmit: (formData: SalesTrackingFormData, projectDetailId: string, type: string) => Promise<void>;
    onDelete: (type: string, projectDetailId?: string) => Promise<void>;
}

const SalesTrackingList: React.FC<SalesTrackingListProps> = ({
    salesData,
    formDataMap,
    onFormDataChange,
    onSubmit,
    onDelete
}) => {
    const [submittingItems, setSubmittingItems] = useState<Set<string>>(new Set());

    const handleSubmit = async (formData: SalesTrackingFormData, projectDetailId: string, type: string) => {
        const itemKey = projectDetailId;
        
        setSubmittingItems(prev => new Set(prev).add(itemKey));
        
        try {
            await onSubmit(formData, projectDetailId, type);
        } finally {
            setSubmittingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemKey);
                return newSet;
            });
        }
    };
    // Group data berdasarkan type
    const groupedData = salesData.reduce((acc, item, index) => {
        const key = item.type;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push({ ...item, index });
        return acc;
    }, {} as Record<string, (SalesTrackingItem & { index: number })[]>);

    // Convert ke format accordion
    const accordionItems: AccordionItemData[] = Object.entries(groupedData).map(([type, items]) => {
        // Check if this group has any new items
        const hasNewItem = items.every(item => item.project_detail_id.startsWith('temp_'));
        
        return {
            id: type,
            judul: hasNewItem ? (
                <div className="flex items-center justify-between w-full">
                    <span className='me-2'>{type}</span>
                    <Badge variant="dot" color="success">
                        New
                    </Badge>
                </div>
            ) : type,
            showDeleteButton: true,
            onDelete: () => onDelete(type),
            konten: (
                <div className="space-y-4">
                    {items.map((item) => {
                        const currentItemKey = `${item.type}_${item.index}`;
                        const currentFormData = formDataMap[currentItemKey] || {
                            remarks: item.remarks || '',
                            existing_attachments: item.property_attachment || [],
                            property_attachment_files: [],
                            property_attachment_delete: []
                        };

                        const isNewItem = item.project_detail_id.startsWith('temp_');
                        const isSubmitting = submittingItems.has(item.project_detail_id);
                        
                        return (
                            <SalesTrackingItemComponent
                                key={currentItemKey}
                                formData={currentFormData}
                                onFormDataChange={(data: SalesTrackingFormData) => onFormDataChange(currentItemKey, data)}
                                onSubmit={(data: SalesTrackingFormData) => handleSubmit(data, item.project_detail_id, item.type)}
                                isSubmitting={isSubmitting}
                                isNewItem={isNewItem}
                                type={item.type}
                            />
                        );
                    })}
                </div>
            )
        };
    });

    if (!salesData || salesData.length === 0) {
        return (
            <div className="text-center py-8 h-80 flex items-center justify-center">
                <p className="text-gray-500">There is no sales tracking data for this project</p>
            </div>
        );
    }

    return (
        <Accordion
            items={accordionItems}
            allowMultiple={true}
            defaultOpenItems={Object.keys(groupedData).slice(0, 1)}
            className="space-y-3"
            itemClassName="bg-white border border-gray-200 rounded-lg shadow-sm"
        />
    );
};

export default SalesTrackingList;