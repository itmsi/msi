import React, { useState, useEffect } from 'react';
import { ContractorFormData, contactPerson } from '../types/contractor';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import ContactPersonsSection from './ContractorPersonsSection';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useCustomerSelect } from '@/hooks/useCustomerSelect';

interface CustomerInfoProps {
    formData: ContractorFormData;
    errors: Record<string, string>;
    onChange: (field: keyof ContractorFormData['customer_data'], value: string) => void;
    onAddContact: () => void;
    onRemoveContact: (index: number) => void;
    onContactChange: (index: number, field: keyof contactPerson, value: string | number) => void;
    onNewCustomerToggle: (isNew: boolean) => void;
    onExistingCustomerSelect: (option: any) => Promise<void>;
}

const CustomerInfoSection: React.FC<CustomerInfoProps> = ({ 
    formData, 
    errors, 
    onChange,
    onAddContact,
    onRemoveContact,
    onContactChange,
    onNewCustomerToggle,
    onExistingCustomerSelect
}) => {
    const { customer_data } = formData;
    const { new_customer } = customer_data;

    const {
        customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions
    } = useCustomerSelect(30);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    useEffect(() => {
        initializeCustomerOptions();
    }, [initializeCustomerOptions]);

    // Helper untuk render input field
    const renderInput = (
        field: keyof ContractorFormData['customer_data'],
        label: string,
        type: string = 'text',
        placeholder?: string,
        required: boolean = false
    ) => (
        <div>
            <Label htmlFor={field}>
                {label} {required && '*'}
            </Label>
            <Input
                id={field}
                type={type}
                value={(customer_data[field] as string) || ''}
                onChange={(e) => {
                    const replaceDot = e.target.value.replace(/\./g, "")
                    field === 'customer_name' ? onChange(field, replaceDot.toUpperCase()) : onChange(field, e.target.value);
                }}
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

            {/* Toggle: New / Existing Customer — hanya tampil di halaman Create */}
            {onNewCustomerToggle && onExistingCustomerSelect && (
                <>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">Customer Type:</span>
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => onNewCustomerToggle(true)}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    new_customer
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                New Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => onNewCustomerToggle(false)}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                                    !new_customer
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Existing Customer
                            </button>
                        </div>
                    </div>

                    {/* Existing Customer Select */}
                    {!new_customer && (
                        <div>
                            <Label htmlFor="existing_customer_select">
                                Select Customer <span className="text-red-500">*</span>
                            </Label>
                            <CustomAsyncSelect
                                name="existing_customer_select"
                                placeholder="Cari dan pilih customer..."
                                value={selectedCustomer}
                                defaultOptions={customerOptions}
                                loadOptions={handleCustomerInputChange}
                                onMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                                isLoading={customerPagination.loading}
                                noOptionsMessage={() => "No customers found"}
                                loadingMessage={() => "Loading customers..."}
                                isSearchable={true}
                                inputValue={customerInputValue}
                                onInputChange={(inputValue) => {
                                    handleCustomerInputChange(inputValue);
                                }}
                                onChange={(option: any) => {
                                    setSelectedCustomer(option);
                                    if (onExistingCustomerSelect) onExistingCustomerSelect(option);
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Customer Info Form — selalu tampil di Edit, di Create hanya jika kondisi terpenuhi */}
            {(!onNewCustomerToggle || (!new_customer && !!customer_data.customer_name) || new_customer) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('customer_name', 'Customer Name', 'text', undefined, true)}
                    {renderInput('customer_code', 'Customer Code')}
                    {renderInput('customer_email', 'Customer Email', 'email')}
                    {renderInput('customer_phone', 'Customer Phone', 'tel', undefined, true)}
                    {renderInput('job_title', 'Job Title')}
                    {renderInput('contact_person', 'Contact Person')}
                    {renderInput('customer_address', 'Customer Address')}
                    {renderInput('customer_city', 'City')}
                    {renderInput('customer_state', 'State')}
                    {renderInput('customer_zip', 'ZIP Code')}
                    {renderInput('customer_country', 'Country')}
                </div>
            ) : null}

            {/* Contact Persons */}
            {(new_customer || customer_data.customer_name) && (
                <ContactPersonsSection
                    contact={formData.customer_data.contact_persons || []}
                    errors={errors}
                    onAddContact={onAddContact}
                    onRemoveContact={onRemoveContact}
                    onContactChange={onContactChange}
                />
            )}
        </div>
    );
};

export default CustomerInfoSection;