import React from 'react';
import Accordion from '@/components/ui/accordion/Accordion';
import { AccordionItemData } from '@/components/ui/accordion/types';
import DivisionOverviewItemComponent from './DivisionOverviewItem';
import { DivisionOverviewItem, DivisionOverviewFormData } from '../../types/divisionOverview';
import Badge from '@/components/ui/badge/Badge';

interface DivisionOverviewListProps {
    divisionData: DivisionOverviewItem[];
    formDataMap: Record<string, DivisionOverviewFormData>;
    onFormDataChange: (itemKey: string, formData: DivisionOverviewFormData) => void;
    onSubmit: (formData: DivisionOverviewFormData, projectDetailId: string, divisionName: string, projectDetailDivisionId: string) => Promise<void>;
    onDelete: (divisionName: string, projectDetailId?: string) => Promise<void>;
}

const DivisionOverviewList: React.FC<DivisionOverviewListProps> = ({
    divisionData,
    formDataMap,
    onFormDataChange,
    onSubmit,
    onDelete
}) => {
    // Group data berdasarkan division name
    const groupedData = divisionData.reduce((acc, item, index) => {
        const key = item.devision_project_name;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push({ ...item, index });
        return acc;
    }, {} as Record<string, (DivisionOverviewItem & { index: number })[]>);

    // Convert ke format accordion
    const accordionItems: AccordionItemData[] = Object.entries(groupedData).map(([divisionName, items]) => {
        const hasNewItem = items.every(item => item.project_detail_id?.startsWith('temp_'));
        
        return {
            id: divisionName,
            judul: hasNewItem ? (
                <div className="flex items-center justify-between w-full">
                    <span className='me-2'>{divisionName}</span>
                    <Badge variant="dot" color="success">
                        New
                    </Badge>
                </div>
            ) : divisionName,
            showDeleteButton: true,
            onDelete: () => onDelete(divisionName),
            konten: (
                <div className="space-y-4">
                    {items.map((item) => {
                        const currentItemKey = `${item.devision_project_name}_${item.index}`;
                        const currentFormData = formDataMap[currentItemKey] || {
                            remarks: item.remarks || '',
                            existing_attachments: item.property_attachment || [],
                            property_attachment_files: [],
                            property_attachment_delete: []
                        };

                        const isNewItem = item.project_detail_id?.startsWith('temp_') || false;
                        
                        return (
                            <DivisionOverviewItemComponent
                                key={currentItemKey}
                                formData={currentFormData}
                                onFormDataChange={(data: DivisionOverviewFormData) => onFormDataChange(currentItemKey, data)}
                                onSubmit={(data: DivisionOverviewFormData) => onSubmit(data, item.project_id, item?.division_project_id || '',  item.project_detail_division_id)}
                                isSubmitting={false}
                                isNewItem={isNewItem}
                                type={item.devision_project_name}
                            />
                        );
                    })}
                </div>
            )
        };
    });

    if (!divisionData || divisionData.length === 0) {
        return (
            <div className="text-center py-8 h-80 flex items-center justify-center">
                <p className="text-gray-500">There is no division overview data for this project</p>
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

export default DivisionOverviewList;