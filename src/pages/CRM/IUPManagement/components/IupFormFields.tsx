import React from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { handleKeyPress } from '@/helpers/generalHelper';

interface IupFormData {
    company_name: string;
}

interface IupFormFieldsProps {
    formData: IupFormData;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const IupFormFields: React.FC<IupFormFieldsProps> = ({
    formData,
    errors,
    onInputChange
}) => {
    // Helper function untuk render input field dengan consistent styling
    const renderInput = (
        name: keyof IupFormData,
        label: string,
        type: string = 'text',
        required: boolean = false
    ) => (
        <div>
            <Label>
                {label} {required && '*'}
            </Label>
            <Input
                type={'text'}
                name={name}
                value={formData[name]}
                onKeyPress={type === 'number' ? handleKeyPress : undefined}
                onChange={onInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[name] ? 'border-red-500' : 'border-gray-300'
                }`}
                min={type === 'number' ? "1" : undefined}
            />
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
        </div>
    );
    return (
        <>
            {renderInput('company_name', 'IUP Name', 'text', true)}
        </>
    );
};

export default IupFormFields;