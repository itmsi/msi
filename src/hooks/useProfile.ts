import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ProfileData, ProfileFormData } from '@/types/profile';
import { profileService } from '@/services/profileService';

interface UseProfileReturn {
    profile: ProfileData | null;
    loading: boolean;
    updating: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    updateProfileWithImage: (formData: ProfileFormData, imageFile?: File) => Promise<boolean>;
    clearError: () => void;
}

export const useProfile = (autoFetch = true): UseProfileReturn => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(autoFetch);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await profileService.getProfile();
            
            if (response.data.success && response.data.data) {
                setProfile(response.data.data);
            } else {
                const errorMessage = response.data.message || 'Failed to fetch profile data';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile data';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfileWithImage = useCallback(async (formData: ProfileFormData, imageFile?: File): Promise<boolean> => {
        try {
            setUpdating(true);
            setError(null);
            
            // Validate passwords if changing
            if (formData.new_password || formData.confirm_password) {
                if (!formData.current_password) {
                    const errorMessage = 'Current password is required to change password';
                    setError(errorMessage);
                    toast.error(errorMessage);
                    return false;
                }
                if (formData.new_password !== formData.confirm_password) {
                    const errorMessage = 'New password and confirm password do not match';
                    setError(errorMessage);
                    toast.error(errorMessage);
                    return false;
                }
                if (formData.new_password.length < 8) {
                    const errorMessage = 'New password must be at least 8 characters long';
                    setError(errorMessage);
                    toast.error(errorMessage);
                    return false;
                }
            }
            
            const response = await profileService.updateProfileMultipart(formData, imageFile);
            
            if (response.data.success && response.data.data) {
                setProfile(response.data.data);
                toast.success(response.data.message || 'Profile updated successfully');
                return true;
            } else {
                const errorMessage = response.message || 'Failed to update profile';
                setError(errorMessage);
                toast.error(errorMessage);
                return false;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setUpdating(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchProfile();
        }
    }, [fetchProfile, autoFetch]);

    return {
        profile,
        loading,
        updating,
        error,
        fetchProfile,
        updateProfileWithImage,
        clearError
    };
};

// Helper function to convert ProfileData to ProfileFormData
export const profileToFormData = (profile: ProfileData): ProfileFormData => {
    return {
        employee_name: profile.employee_name || '',
        employee_email: profile.employee_email || '',
        employee_mobile: profile.employee_mobile || '',
        employee_office_number: profile.employee_office_number || '',
        employee_address: profile.employee_address || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    };
};