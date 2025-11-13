import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";
import { handleKeyPress } from "@/helpers/generalHelper";
import { BankAccountFormData, BankAccountValidationErrors } from "./types/bank";
import { useCreateBankAccount } from "./hooks/useBankCreate";

export default function CreateBank() {
    const navigate = useNavigate();

    // Hook for creating bank account
    const { 
        isCreating, 
        validationErrors, 
        clearFieldError,
        createBankAccount 
    } = useCreateBankAccount();

    // State for form data
    const [formData, setFormData] = useState<BankAccountFormData>({
        bank_account_name: '',
        bank_account_number: '',
        bank_account_type: ''
    });

    // Form input handlers
    const handleInputChange = (field: keyof BankAccountFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            clearFieldError(field);
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const errors: BankAccountValidationErrors = {};

        if (!formData.bank_account_name.trim()) {
            errors.bank_account_name = 'Bank account name is required';
        }

        if (!formData.bank_account_number.trim()) {
            errors.bank_account_number = 'Bank account number is required';
        }

        if (!formData.bank_account_type.trim()) {
            errors.bank_account_type = 'Bank account type is required';
        }

        return Object.keys(errors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            const response = await createBankAccount(formData);
            
            if (response.success) {
                toast.success('Bank account created successfully');
                navigate('/bank-accounts');
            }
        } catch (error: any) {
            console.error('Error creating bank account:', error);
            toast.error(error.message || 'An error occurred while creating bank account');
        }
    };

    return (
        <>
            <PageMeta
                title="Create Bank Account | MSI"
                description="Create a new bank account"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/bank-accounts">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdPerson size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Bank Account</h1>
                        </div>
                    </div>

                    {/* Account Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-3 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                
                                {/* Account Name */}
                                <div className="md:col-span-4">
                                    <Label htmlFor="bank_account_name">Account Name *</Label>
                                    <Input
                                        id="bank_account_name"
                                        type="text"
                                        value={formData.bank_account_name}
                                        onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                                        placeholder="Enter bank account name"
                                        error={!!validationErrors.bank_account_name}
                                    />
                                    {validationErrors.bank_account_name && (
                                        <span className="text-sm text-red-500">{validationErrors.bank_account_name}</span>
                                    )}
                                </div>

                                {/* Account Number */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="bank_account_number">Account Number *</Label>
                                    <Input
                                        id="bank_account_number"
                                        type="text"
                                        value={formData.bank_account_number}
                                        onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter account number"
                                        error={!!validationErrors.bank_account_number}
                                    />
                                    {validationErrors.bank_account_number && (
                                        <span className="text-sm text-red-500">{validationErrors.bank_account_number}</span>
                                    )}
                                </div>

                                {/* Account Type */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="bank_account_type">Account Type *</Label>
                                    <Input
                                        id="bank_account_type"
                                        type="text"
                                        value={formData.bank_account_type}
                                        onChange={(e) => handleInputChange('bank_account_type', e.target.value)}
                                        placeholder="Enter account type"
                                        error={!!validationErrors.bank_account_type}
                                    />
                                    {validationErrors.bank_account_type && (
                                        <span className="text-sm text-red-500">{validationErrors.bank_account_type}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/bank-accounts')}
                                className="px-6 rounded-full"
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                <MdSave size={20} />
                                {isCreating ? 'Creating...' : 'Create Bank Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}