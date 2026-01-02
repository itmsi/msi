import React from 'react';
import Label from '@/components/form/Label';

interface IupFormFieldsProps {
    formData: string[];
    onInputChange: (activityName: string, checked: boolean) => void;
}

const ActivitySelections: React.FC<IupFormFieldsProps> = ({
    formData,
    onInputChange
}) => {
    // Helper function untuk render input field dengan consistent styling
    const renderCheckbox = (
        name: string,
        label: string,
        description: string,
        required: boolean = false
    ) => {
        const isChecked = formData.includes(name);
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onInputChange(name, e.target.checked);
        };

        return (
            <div className='cursor-pointer inline-flex items-center'>
                <div className="checkbox">
                    <input 
                        type="checkbox"
                        id={name}
                        name={name}
                        checked={isChecked}
                        onChange={handleChange}
                    />
                    <svg viewBox="0 0 35.6 35.6">
                        <circle className="background" cx="17.8" cy="17.8" r="17.8"></circle>
                        <circle className="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
                        <polyline className="check" points="11.78 18.12 15.55 22.23 25.17 12.87"></polyline>
                    </svg>
                </div>
                <div className="text-sm/6 ms-2">
                    <Label htmlFor={name} className="font-medium text-gray-900 mb-0 cursor-pointer">
                        {label} {required && '*'}
                        <p id={`${name}-description`} className="text-gray-500 text-xs font-normal">
                            {description}
                        </p>
                    </Label>
                </div>
            </div>
        );
    };
    return (
        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm mb-6 p-6">
                <div className="space-y-4 grid grid-cols-1 gap-2">
                    {renderCheckbox('find', 'Find', 'Process finding new customers and business opportunities.')}
                    {renderCheckbox('pull', 'Pull', 'Process pulling new customers and business opportunities.')}
                    {renderCheckbox('survey', 'Survey', 'Process surveying new customers and business opportunities.')}
                </div>
            </div>
        </div>
    );
};

export default ActivitySelections;