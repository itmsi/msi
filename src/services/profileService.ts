import { apiGet, apiPutMultipart } from '@/helpers/apiHelper';
import { ProfileResponse, ProfileFormData } from '@/types/profile';

const url = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${url}/auth/sso`;

export class profileService {
    static async getProfile() {
        return await apiGet<ProfileResponse>(`${API_BASE_URL}/profil`);
    }

    static async updateProfileMultipart(formData: ProfileFormData, imageFile?: File) {
        const multipartData = new FormData();
        
        // Add form fields
        multipartData.append('employee_name', formData.employee_name);
        multipartData.append('employee_email', formData.employee_email);
        
        // if (formData.employee_exmail_account) {
        //     multipartData.append('employee_exmail_account', formData.employee_exmail_account);
        // }
        // if (formData.employee_mobile) {
        //     multipartData.append('employee_mobile', formData.employee_mobile);
        // }
        // if (formData.employee_office_number) {
        //     multipartData.append('employee_office_number', formData.employee_office_number);
        // }
        // if (formData.employee_address) {
        //     multipartData.append('employee_address', formData.employee_address);
        // }
        
        // Add password fields if provided
        if (formData.current_password) {
            multipartData.append('current_password', formData.current_password);
        }
        if (formData.new_password) {
            multipartData.append('new_password', formData.new_password);
        }
        if (formData.confirm_password) {
            multipartData.append('confirm_password', formData.confirm_password);
        }
        
        // Add image file if provided
        if (imageFile) {
            multipartData.append('employee_foto', imageFile);
        }

        return await apiPutMultipart<ProfileResponse>(`${API_BASE_URL}/profil`, multipartData);
    }
}
