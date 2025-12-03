import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";
import { useBankEdit } from "./hooks/useBankEdit";
import { BankAccountFormData } from "./types/bank";
import { BankService } from "./services/bankService";

export default function EditBank() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [isLoading, setIsLoading] = useState(true);

    // Hook for updating bank account
    const { 
        isUpdating, 
        validationErrors, 
        clearFieldError,
        updateBankAccount 
    } = useBankEdit();

    // State for form data
    const [formData, setFormData] = useState<BankAccountFormData>({
        bank_account_name: '',
        bank_account_number: '',
        bank_account_type: ''
    });

    // Load bank account data when component mounts
    useEffect(() => {
        if (id) {
            loadBankAccountData(id);
        }
    }, [id]);

    const loadBankAccountData = async (bankAccountId: string) => {
        try {
            setIsLoading(true);
            const response = await BankService.getBankAccountById(bankAccountId);

            if (response.data.success && response.data.data) {
                const bankAccount = response.data.data;
                setFormData({
                    bank_account_name: bankAccount.bank_account_name || '',
                    bank_account_number: bankAccount.bank_account_number || '',
                    bank_account_type: bankAccount.bank_account_type || ''
                });
            } else {
                toast.error('Bank account not found');
                navigate('/quotations/administration/bank-accounts');
            }
        } catch (error: any) {
            console.error('Error loading bank account:', error);
            toast.error('Failed to load bank account data');
            navigate('/quotations/administration/bank-accounts');
        } finally {
            setIsLoading(false);
        }
    };

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

    // Form validation (client side)
    const validateForm = (): boolean => {
        let hasErrors = false;

        if (!formData.bank_account_name.trim()) {
            toast.error('Bank account name is required');
            hasErrors = true;
        }

        if (!formData.bank_account_number.trim()) {
            toast.error('Bank account number is required');
            hasErrors = true;
        }

        if (!formData.bank_account_type.trim()) {
            toast.error('Bank account type is required');
            hasErrors = true;
        }

        return !hasErrors;
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        if (!id) {
            toast.error('Bank account ID is missing');
            return;
        }

        try {
            const response = await updateBankAccount(id, formData);
            
            if (response) {
                toast.success('Bank account updated successfully');
                navigate('/quotations/administration/bank-accounts');
            }
        } catch (error: any) {
            console.error('Error updating bank account:', error);
            toast.error(error.message || 'An error occurred while updating bank account');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading bank account data...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit Bank Account | MSI"
                description="Edit bank account information"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/quotations/administration/bank-accounts">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdPerson size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Bank Account</h1>
                        </div>
                    </div>

                    {/* Bank Account Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-3 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                
                                {/* Bank Account Type */}
                                <div className="md:col-span-4">
                                    <Label htmlFor="bank_account_name">Account Name *</Label>
                                    <Input
                                        id="bank_account_name"
                                        type="text"
                                        value={formData.bank_account_name}
                                        onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                                        placeholder="Enter account name"
                                        error={!!validationErrors.bank_account_name}
                                    />
                                    {validationErrors.bank_account_name && (
                                        <span className="text-sm text-red-500">{validationErrors.bank_account_name}</span>
                                    )}
                                </div>

                                {/* Bank Account Number */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="bank_account_number">Account Number *</Label>
                                    <Input
                                        id="bank_account_number"
                                        type="text"
                                        value={formData.bank_account_number}
                                        onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                                        placeholder="Enter bank account number"
                                        error={!!validationErrors.bank_account_number}
                                    />
                                    {validationErrors.bank_account_number && (
                                        <span className="text-sm text-red-500">{validationErrors.bank_account_number}</span>
                                    )}
                                </div>

                                {/* Account type */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="bank_account_type">Bank Accounts *</Label>
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
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/administration/bank-accounts')}
                                className="px-6 rounded-full"
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                <MdSave size={20} />
                                {isUpdating ? 'Updating...' : 'Update Bank Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}