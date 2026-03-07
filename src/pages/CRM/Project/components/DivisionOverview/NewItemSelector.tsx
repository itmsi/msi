// Do One Thing: Manage New Item Selection & Creation
import React, { useEffect, useRef, useState } from 'react';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import Button from '@/components/ui/button/Button';
import { MdAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useDivisionSelect } from '@/hooks/useDivisionSelect';
import { DivisionOverviewItem } from '../../types/divisionOverview';

interface NewItemSelectorProps {
    projectId: string;
    onAddItem: (newItem: DivisionOverviewItem) => void;
}

const NewItemSelector: React.FC<NewItemSelectorProps> = ({ projectId, onAddItem }) => {
    
    const {
        divisionOptions,
        inputValue,
        handleInputChange: handleDivisionInputChange,
        handleMenuScrollToBottom: handleDivisionMenuScrollToBottom,
        initializeOptions
    } = useDivisionSelect();
    
    const [selectedDivision, setSelectedDivision] = useState<{ value: string; label: string } | null>(null);

    // Initialize options once
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initializeOptions();
        }
    }, [initializeOptions]);

    const handleAddItem = () => {
        if (!selectedDivision || !projectId) {
            toast.error('Pilih division terlebih dahulu!');
            return;
        }

        try {
            // Generate ID sementara untuk item baru
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const newItem: DivisionOverviewItem = {
                project_detail_id: tempId,
                project_id: projectId,
                project_detail_division_id: '',
                division_project_id: selectedDivision.value,
                devision_project_name: selectedDivision.label,
                remarks: '',
                property_attachment: null
            };

            onAddItem(newItem);
            setSelectedDivision(null); // Reset selection
            
            toast.success(`Data ${selectedDivision.label} berhasil ditambahkan!`);
            
        } catch (error: any) {
            console.error('Error adding new item:', error);
            toast.error('Gagal menambahkan data baru');
        }
    };

    return (
        <div className="flex gap-4 mb-6">
            <div className="flex-1">
                <CustomAsyncSelect
                    id="division"
                    name="division"
                    loadOptions={handleDivisionInputChange}
                    defaultOptions={divisionOptions}
                    inputValue={inputValue}
                    value={selectedDivision}
                    onInputChange={handleDivisionInputChange}
                    onMenuScrollToBottom={handleDivisionMenuScrollToBottom}
                    onChange={(option: any) => {
                        setSelectedDivision(option);
                    }}
                    placeholder={'Select division...'}
                    isClearable={true}
                    noOptionsMessage={() => "No division found"}
                    loadingMessage={() => "Loading divisions..."}
                />
            </div>
            <Button 
                type="button" 
                onClick={handleAddItem} 
                className="flex items-center h-11 gap-2"
                disabled={!selectedDivision}
            >
                <MdAdd size={16} />
                Add
            </Button>
        </div>
    );
};

export default NewItemSelector;