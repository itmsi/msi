import React from 'react';
import { MdDelete } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { handleKeyPress } from '@/helpers/generalHelper';
import { ContractorUnit } from '../../Contractors/types/contractor';

interface UnitCardProps {
    unit: ContractorUnit;
    index: number;
    errors: Record<string, string>;
    onChange: (field: keyof ContractorUnit, value: string | number) => void;
    onRemove: () => void;
}

const UnitCardCustom: React.FC<UnitCardProps> = ({
    unit,
    index,
    errors,
    onChange,
    onRemove,
}) => {
    // State untuk menyimpan recently selected options dan loaded options for edit mode
    
    
    // Helper untuk render input field
    const renderInput = (
        field: keyof ContractorUnit,
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => {
        const errorKey = `unit_${index}_${field}`;
        return (
            <div>
                <Label>
                    {label} {required && '*'}
                </Label>
                <Input
                    type={'text'}
                    value={unit[field]}
                    onKeyPress={type === 'number' ? handleKeyPress : undefined}
                    onChange={(e) => {
                        const value = type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value;
                        onChange(field, value);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[errorKey] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    min={type === 'number' ? "1" : undefined}
                />
                {errors[errorKey] && (
                    <p className="text-red-500 text-sm mt-1">{errors[errorKey]}</p>
                )}
            </div>
        );
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-gray-700">Unit #{index + 1}</h3>
                <Button
                    type="button"
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    variant="outline"
                    size="sm"
                >
                    <MdDelete className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {renderInput('brand', 'Brand', 'text', 'ex. MS600', true)}
                {renderInput('type', 'Type', 'text', 'ex. Dump Truck', true)}
                {renderInput('specification', 'Specification', 'text', 'ex. 6x4', true)}
                {renderInput('engine', 'Engine', 'text', undefined, true)}
                {/* {renderInput('physical_availability', 'Physical Availability', 'text', 'e.g., 85%', true)} */}
                
                <div className="md:col-span-2 lg:col-span-1">
                    {renderInput('quantity', 'Quantity', 'number', undefined, true)}
                </div>
            </div>
        </div>
    );
};

export default UnitCardCustom;