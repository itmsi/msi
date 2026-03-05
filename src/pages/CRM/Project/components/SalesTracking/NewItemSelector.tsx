// Do One Thing: Manage New Item Selection & Creation
import React, { useState } from 'react';
import CustomSelect from '@/components/form/select/CustomSelect';
import Button from '@/components/ui/button/Button';
import { MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { SalesTrackingItem } from '../../types/salesTracking';

interface NewItemSelectorProps {
    projectId: string;
    onAddItem: (newItem: SalesTrackingItem) => void;
}

const STATUS_OPTIONS = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'Find', label: 'Find' },
    { value: 'Pull', label: 'Pull' },
    { value: 'Survey', label: 'Survey' },
    { value: 'BAST', label: 'BAST' },
];

const NewItemSelector: React.FC<NewItemSelectorProps> = ({ projectId, onAddItem }) => {
    const [selectedStatus, setSelectedStatus] = useState<{ value: string; label: string } | null>(null);

    const handleAddItem = () => {
        if (!selectedStatus || !projectId) {
            toast.error('Pilih status terlebih dahulu!');
            return;
        }

        try {
            // Generate ID sementara untuk item baru
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const newItem: SalesTrackingItem = {
                project_detail_id: tempId,
                project_id: projectId,
                type: selectedStatus.value as SalesTrackingItem['type'],
                remarks: '',
                property_attachment: null
            };

            onAddItem(newItem);
            setSelectedStatus(null); // Reset selection
            
            toast.success(`Data ${selectedStatus.label} berhasil ditambahkan!`);
            
        } catch (error: any) {
            console.error('Error adding new item:', error);
            toast.error('Gagal menambahkan data baru');
        }
    };

    return (
        <div className="flex gap-2 mb-6">
            <div className="flex-1">
                <CustomSelect
                    id="status"
                    name="status"
                    value={selectedStatus}
                    onChange={(option) => setSelectedStatus(option)}
                    options={STATUS_OPTIONS}
                    placeholder="Select status..."
                    isClearable={true}
                    isSearchable={false}
                    className="w-full"
                />
            </div>
            <Button 
                type="button" 
                onClick={handleAddItem} 
                className="flex items-center gap-2 h-11 rounded-md"
                disabled={!selectedStatus}
            >
                <MdAdd size={16} />
                Add
            </Button>
        </div>
    );
};

export default NewItemSelector;