import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";
import { CustomerService } from "./services/customerService";
import { useCustomerEdit } from "./hooks/useCustomerEdit";
import { CustomerFormData } from "./types/customer";

export default function EditCustomer() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [isLoading, setIsLoading] = useState(true);
    
    // Hook for updating customer

    
    // State for form data
    const [formData, setFormData] = useState<>({

    });

    // Load customer data when component mounts
    useEffect(() => {
        if (id) {
            loadAccessoriesData(id);
        }
    }, [id]);

    const loadAccessoriesData = async (accessoriesId: string) => {
        try {
            setIsLoading(true);
            const response = await (accessoriesId);
            
            if (response.data.success && response.data.data) {
                const accessories = response.data.data;
                setFormData({
                    
                });
            } else {
                toast.error('Accessories not found');
                navigate('/quotations/accessories');
            }
        } catch (error: any) {
            console.error('Error loading accessories:', error);
            toast.error('Failed to load accessories data');
            navigate('/quotations/accessories');
        } finally {
            setIsLoading(false);
        }
    };

    // Form input handlers
    const handleInputChange = (field: keyof AccessoriesFormData, value: string) => {
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
            toast.error('Accessories ID is missing');
            return;
        }

        try {
            const response = await updateAccessories(id, formData);
            
            if (response) {
                toast.success('Accessories updated successfully');
                navigate('/quotations/accessories');
            }
        } catch (error: any) {
            console.error('Error updating accessories:', error);
            toast.error(error.message || 'An error occurred while updating accessories');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading accessories data...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit Accessories | MSI"
                description="Edit accessories information"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/quotations/accessories">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdPerson size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Accessories</h1>
                        </div>
                    </div>

                    {/* Accessories Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-3 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                
                                
                            </div>
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/accessories')}
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
                                {isUpdating ? 'Updating...' : 'Update Accessories'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}