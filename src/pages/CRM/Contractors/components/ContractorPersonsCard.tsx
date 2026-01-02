import React from 'react';
import { MdDelete } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import { contactPerson } from '../types/contractor';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { handleKeyPress } from '@/helpers/generalHelper';

interface ContractorPersonsCardProps {
    contact: contactPerson;
    index: number;
    errors: Record<string, string>;
    onChange: (field: keyof contactPerson, value: string | number) => void;
    onRemove: () => void;
}

const ContractorPersonsCard: React.FC<ContractorPersonsCardProps> = ({
    contact,
    index,
    errors,
    onChange,
    onRemove,
}) => {
    
    // Helper untuk render input field
    const renderInput = (
        field: keyof contactPerson,
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => {
        const errorKey = `contact_${index}_${field}`;
        return (
            <div>
                <Label>
                    {label} {required && '*'}
                </Label>
                <Input
                    type={'text'}
                    value={contact[field]}
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
                <h3 className="text-md font-medium text-gray-700">Contact #{index + 1}</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {renderInput('name', 'Name', 'text', '', false)}
                {renderInput('email', 'Email', 'text', '', false)}
                {renderInput('phone', 'Phone', 'text', '', false)}
                {renderInput('position', 'Position', 'text', '', false)}
            </div>
        </div>
    );
};

export default ContractorPersonsCard;