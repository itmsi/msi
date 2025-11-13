import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdPerson } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";
import { handleKeyPress } from "@/helpers/generalHelper";



export default function CreateCustomer() {
    const navigate = useNavigate();

    // State for form data
    const [formData, setFormData] = useState<>({

    });

    // Form input handlers
    const handleInputChange = (field: keyof , value: string) => {
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
        
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            const response = await (formData);
            
            if (response.success) {
                toast.success('Customer created successfully');
                navigate('/customers');
            }
        } catch (error: any) {
            console.error('Error creating customer:', error);
            toast.error(error.message || 'An error occurred while creating customer');
        }
    };

    return (
        <>
            <PageMeta
                title="Create Customer | MSI"
                description="Create a new customer"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/administration/customers">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdPerson size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Accessories</h1>
                        </div>
                    </div>

                    {/* Accessories Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-3 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Basic Information</h2>
                                
                            </div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/quotations/accessories')}
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
                                {isCreating ? 'Creating...' : 'Create Accessories'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}