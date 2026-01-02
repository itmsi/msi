import CustomSelect from '@/components/form/select/CustomSelect';
import React from 'react';

interface ContractorFiltersProps {
    selectedStatus: string;
    selectedMineType: string;
    onStatusChange: (status: string) => void;
    onMineTypeChange: (type: string) => void;
}

const ContractorFilters: React.FC<ContractorFiltersProps> = ({
    selectedStatus,
    selectedMineType,
    onStatusChange,
    onMineTypeChange,
}) => {
    
    const STATUS_OPTIONS = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];
    const MINE_TYPE_OPTIONS = [
        { value: 'all', label: 'All Types' },
        { value: 'batu bara', label: 'Batu Bara' },
        { value: 'nikel', label: 'Nikel' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    // Find current selected options for CustomSelect value prop
    const selectedStatusOption = STATUS_OPTIONS.find(option => option.value === selectedStatus);
    const selectedMineTypeOption = MINE_TYPE_OPTIONS.find(option => option.value === selectedMineType);

    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <CustomSelect
                    id="status"
                    value={selectedStatusOption}
                    onChange={(option) => onStatusChange(option?.value || 'all')}
                    options={STATUS_OPTIONS}
                    className="w-full"
                    placeholder="Select status"
                    isClearable={false}
                    isSearchable={false}
                />
            </div>

            <div className="flex-1">
                <CustomSelect
                    id="mineType"
                    value={selectedMineTypeOption}
                    onChange={(option) => onMineTypeChange(option?.value || 'all')}
                    options={MINE_TYPE_OPTIONS}
                    className="w-full"
                    placeholder="Select mine type"
                    isClearable={false}
                    isSearchable={false}
                />
            </div>
        </div>
    );
};

export default ContractorFilters;
