import React from 'react';
import { ContractorFormData, contactPerson } from '../types/contractor';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import ContactPersonsSection from './ContractorPersonsSection';

interface CustomerInfoProps {
    formData: ContractorFormData;
    errors: Record<string, string>;
    onChange: (field: keyof ContractorFormData['customer_data'], value: string) => void;
    onAddContact: () => void;
    onRemoveContact: (index: number) => void;
    onContactChange: (index: number, field: keyof contactPerson, value: string | number) => void;
}

const CustomerInfoSection: React.FC<CustomerInfoProps> = ({ 
    formData, 
    errors, 
    onChange,
    onAddContact,
    onRemoveContact,
    onContactChange 
}) => {
    const { customer_data } = formData;

    // Helper untuk render input field
    const renderInput = (
        field: keyof ContractorFormData['customer_data'],
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => (
        <div>
            <Label>
                {label} {required && '*'}
            </Label>
            <Input
                type={type}
                value={(customer_data[field] as string) || ''}
                onChange={(e) => onChange(field, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[field] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            />
            {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 space-y-6 p-6">
            <h3 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('customer_name', 'Customer Name', 'text', undefined, true)}
                {renderInput('customer_code', 'Customer Code', 'text')}
                {renderInput('customer_email', 'Customer Email', 'email', undefined, true)}
                {renderInput('customer_phone', 'Customer Phone', 'tel', undefined, true)}
                {renderInput('job_title', 'Job Title')}
                {renderInput('contact_person', 'Contact Person')}
                {renderInput('customer_address', 'Customer Address')}
                {renderInput('customer_city', 'City')}
                {renderInput('customer_state', 'State')}
                {renderInput('customer_zip', 'ZIP Code')}
                {renderInput('customer_country', 'Country')}
            </div>
            
            <ContactPersonsSection
                contact={formData.customer_data.contact_persons || []}
                errors={errors}
                onAddContact={onAddContact}
                onRemoveContact={onRemoveContact}
                onContactChange={onContactChange}
            />
        </div>
    );
};

export default CustomerInfoSection;