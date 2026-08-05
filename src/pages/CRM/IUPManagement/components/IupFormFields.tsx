import React from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { handleKeyPress } from '@/helpers/generalHelper';
import IupSalesPicMultiSelect from './IupSalesPicMultiSelect';

interface IupFormData {
    company_name: string;
    iup_code: string;
    sales_pic: string[];
}

interface IupFormFieldsProps {
    formData: IupFormData;
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSalesPicChange: (ids: string[]) => void;
}

const IupFormFields: React.FC<IupFormFieldsProps> = ({
    formData,
    errors,
    onInputChange,
    onSalesPicChange
}) => {
    // Helper function untuk render input field dengan consistent styling
    const renderInput = (
        name: Exclude<keyof IupFormData, 'sales_pic'>,
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
            {/* IUP Segmentation Selection */}
            {renderInput('iup_code', 'IUP Code', 'text', false)}
            {/* Sales PIC - Multi Select (berdampingan dengan IUP Code) */}
            <IupSalesPicMultiSelect
                value={formData.sales_pic || []}
                onChange={onSalesPicChange}
                label="PIC"
                placeholder="Select PIC..."
            />
        </>
    );
};

export default IupFormFields;