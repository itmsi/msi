import React from 'react';
import { MdAdd } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import { ContactPerson } from '../types/customer';
import CustomerPersonsCard from './CustomerPersonsCard';

interface CustomerPersonsSectionProps {
    contacts: ContactPerson[];
    errors: Record<string, string>;
    onAddContact: () => void;
    onRemoveContact: (index: number) => void;
    onContactChange: (index: number, field: keyof ContactPerson, value: string | number) => void;
}

const CustomerPersonsSection: React.FC<CustomerPersonsSectionProps> = ({
    contacts,
    errors,
    onAddContact,
    onRemoveContact,
    onContactChange
}) => {    
    return (
        <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-primary-bold font-medium text-gray-900">Contacts</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddContact}
                    className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-4 h-4" />
                    Add Contact
                </Button>
            </div>

            {contacts.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    No contacts added yet. Click "Add Contact" to get started.
                </div>
            ) : (
                <div className="space-y-4">
                    {contacts.map((contact, index) => (
                        <CustomerPersonsCard
                            key={index}
                            contact={contact}
                            index={index}
                            errors={errors}
                            onChange={(field, value) => onContactChange(index, field, value)}
                            onRemove={() => onRemoveContact(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerPersonsSection;
