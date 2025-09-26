import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { MdSave, MdEdit, MdPerson } from "react-icons/md";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import PageMeta from "@/components/common/PageMeta";
import LoadingSpinner from "@/components/common/Loading";
import { useProfile, profileToFormData } from "@/hooks/useProfile";
import { ProfileFormData } from "@/types/profile";
import TextArea from "@/components/form/input/TextArea";

export default function UserProfiles() {
    const {
        profile,
        loading,
        updating,
        updateProfileWithImage,
        clearError
    } = useProfile(true);

    const [formData, setFormData] = useState<ProfileFormData>({
        employee_name: '',
        employee_email: '',
        employee_mobile: '',
        employee_office_number: '',
        employee_address: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update form data when profile is loaded
    useEffect(() => {
        if (profile) {
            setFormData(profileToFormData(profile));
        }
    }, [profile]);

    const handleSubmit = async () => {
        try {
            clearError();
            
            const success = await updateProfileWithImage(formData, selectedImageFile || undefined);
            
            if (success) {
                setSelectedImageFile(null);
                setImagePreview(null);
                // Clear password fields after successful update
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file (JPEG, PNG, GIF)');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size must be less than 5MB');
            return;
        }
        
        setSelectedImageFile(file);
        // toast.success('Image selected successfully');
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-4">Loading Profile</h2>
                    <p className="text-gray-600">Please wait while we fetch your profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Profile | Motor Sights International"
                description="This is React.js Profile Dashboard page for Motor Sights International"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50 overflow-auto max-w-(--breakpoint-xl) mx-auto">
                <div className="mx-auto px-4 sm:px-3">
                    
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-3">
                            <MdPerson size={24} className="text-primary" />
                            <h1 className="font-primary-bold font-normal text-xl">My Profile</h1>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-2xl shadow-sm">
                        
                        {/* PROFILE HEADER */}
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex flex-col items-center gap-6 sm:flex-row">
                                <div className="relative">
                                    <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full bg-gray-100">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
                                                alt="Profile Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : profile?.employee_foto ? (
                                            <img 
                                                src={profile.employee_foto} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <MdPerson size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        id="profile-image-upload"
                                    />
                                    <label
                                        htmlFor="profile-image-upload"
                                        className="absolute -bottom-1 -right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors cursor-pointer"
                                    >
                                        <MdEdit size={14} />
                                    </label>
                                </div>
                                
                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-primary-bold text-gray-900 mb-2">
                                        {profile?.employee_name}
                                    </h2>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p className="font-medium">{profile?.title_name}</p>
                                        <p>{profile?.department_name} • {profile?.company_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM FIELDS */}
                        <div className="p-8 grid lg:grid-cols-2 gap-8">
                            
                            {/* BASIC INFORMATION */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-primary-bold text-gray-900 mb-4 border-b pb-4 border-gray-200">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="md:col-span-2">
                                        <Label className="flex items-center gap-2">
                                            Full Name
                                        </Label>
                                        <Input
                                            value={formData.employee_name}
                                            onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                                            placeholder="Enter full name"
                                            className="w-full text-gray-700 opacity-100"
                                            disabled={true}
                                        />
                                    </div>

                                    <div>
                                        <Label className="flex items-center gap-2">
                                            Company
                                        </Label>
                                        <Input
                                            type="text"
                                            value={profile?.company_name || ''}
                                            placeholder="Company"
                                            className="w-full text-gray-700 opacity-100"
                                            disabled={true}
                                        />
                                    </div>

                                    <div>
                                        <Label className="flex items-center gap-2">
                                            Department
                                        </Label>
                                        <Input
                                            type="text"
                                            value={profile?.department_name || ''}
                                            placeholder="Department"
                                            className="w-full text-gray-700 opacity-100"
                                            disabled={true}
                                        />
                                    </div>

                                    <div>
                                        <Label className="flex items-center gap-2">
                                            Position
                                        </Label>
                                        <Input
                                            type="text"
                                            value={profile?.title_name || ''}
                                            placeholder="Position"
                                            className="w-full text-gray-700 opacity-100"
                                            disabled={true}
                                        />
                                    </div>

                                    <div>
                                        <Label className="flex items-center gap-2">
                                            Email Address
                                        </Label>
                                        <Input
                                            type="email"
                                            value={formData.employee_email}
                                            onChange={(e) => setFormData({...formData, employee_email: e.target.value})}
                                            placeholder="Enter email address"
                                            className="w-full text-gray-700 opacity-100"
                                            disabled={true}
                                        />
                                    </div>

                                </div>

                            </div>

                            {/* CONTACT & SECURITY */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-primary-bold text-gray-900 mb-4 border-b pb-4 border-gray-200">Security</h3>

                                {/* PASSWORD FIELDS - Only show in edit mode */}
                                <div>
                                    <Label>Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.current ? "text" : "password"}
                                            // value={formData.current_password}
                                            onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                                            placeholder="Enter current password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                                        >
                                            {showPasswords.current ? (
                                                <EyeIcon className="fill-gray-500 size-4" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label>New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={formData.new_password}
                                            onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                                            placeholder="Enter new password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                                        >
                                            {showPasswords.new ? (
                                                <EyeIcon className="fill-gray-500 size-4" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={formData.confirm_password}
                                            onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                                            placeholder="Confirm new password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeIcon className="fill-gray-500 size-4" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                                <Button
                                    disabled={updating || !formData.employee_name || !formData.employee_email}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave size={20} />
                                    {updating ? 'Updating...' : 'Update Profile'}
                                </Button>
                            </div>
                    </form>

                </div>
            </div>
        </>
    );
}
