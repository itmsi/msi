import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MdKeyboardArrowLeft, MdSave, MdEdit } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-hot-toast";
import Switch from "@/components/form/switch/Switch";
import Loading from "@/components/common/Loading";
import Avatar from "@/components/common/Avatar";
import { useUserDetail } from "@/hooks/useAdministration";

export default function EditUser() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // Custom hook untuk handle semua logic
    const {
        user,
        isLoading,
        isSubmitting,
        validationErrors,
        formData,
        photoPreview,
        fetchUser,
        updateUser,
        handleInputChange
    } = useUserDetail();

    // Fetch user data on mount
    useEffect(() => {
        if (!id) {
            toast.error('User ID is required');
            navigate('/employees');
            return;
        }
        
        fetchUser(id).then(success => {
            if (!success) navigate('/employees');
        });
    }, [id, navigate, fetchUser]);

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id) {
            toast.error('User ID is required');
            return;
        }

        const success = await updateUser(id);
        if (success) navigate('/employees');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loading />
            </div>
        );
    }

    // Show error if no user data
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-gray-500 mb-4">User not found</p>
                <Button onClick={() => navigate('/employees')}>
                    Back to Users
                </Button>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit User | MSI"
                description="Edit user information"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/employees">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                Edit {user.type}
                            </h1>
                        </div>
                    </div>

                    {/* User Information Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="md:col-span-2 p-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* User Photo */}
                                <div className="md:col-span-4">
                                    <div className="pb-8 border-b border-gray-200">
                                        <div className="flex flex-col items-center gap-6 sm:flex-row">
                                            <div className="relative">
                                                <Avatar
                                                    src={photoPreview || user.photo || undefined}
                                                    nama={user.full_name}
                                                    size={96}
                                                    className="border-2 border-gray-200"
                                                    alt="Profile Preview"
                                                />
                                            </div>
                                            
                                            <div className="text-center sm:text-left">
                                                <h2 className="text-2xl font-primary-bold text-gray-900 mb-2">
                                                    {user.full_name}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Type Display */}
                                <div className="md:col-span-2">
                                    <Label>User Type</Label>
                                    <div className="mt-1 px-4 py-2 bg-gray-100 rounded-md text-gray-700">
                                        {user.type}
                                    </div>
                                </div>

                                {/* Full Name Display */}
                                <div className="md:col-span-2">
                                    <Label>Full Name</Label>
                                    <div className="mt-1 px-4 py-2 bg-gray-100 rounded-md text-gray-700">
                                        {user.full_name || '-'}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter email"
                                        error={!!validationErrors.email}
                                    />
                                    {validationErrors.email && (
                                        <span className="text-sm text-red-500">{validationErrors.email}</span>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Leave blank to keep current password"
                                        error={!!validationErrors.password}
                                    />
                                    {validationErrors.password && (
                                        <span className="text-sm text-red-500">{validationErrors.password}</span>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave blank if you don't want to change the password
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="md:col-span-4">
                                    <Switch 
                                        label="Status Active" 
                                        showStatusText={true} 
                                        position="left"
                                        checked={formData.is_active}
                                        onChange={(checked) => handleInputChange('is_active', checked)}
                                    />
                                </div>
                            </div>
                            <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                        </div>

                        {/* Information Section */}
                        <div className="md:col-span-1 p-8 lg:ps-0">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">User Details</h2>
                            <div className="space-y-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Current Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="text-gray-900 font-medium">{user.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name:</span>
                                            <span className="text-gray-900">{user.full_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-medium text-yellow-900 mb-2">Password Update</h3>
                                    <p className="text-sm text-yellow-700">
                                        Only fill in the password field if you want to change the user's password. 
                                        The user will need to use the new password for their next login.
                                    </p>
                                </div>
                            </div>
                        </div>
                            
                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/employees')}
                                className="px-6 rounded-full"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 flex items-center gap-2 rounded-full"
                            >
                                <MdSave size={20} />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}