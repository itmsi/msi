// Profile Types
export interface ProfileData {
    employee_id: string;
    employee_name: string;
    employee_email: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    employee_foto: string;
    title_name: string;
    department_name: string;
    company_name: string;
    created_at: string;
    updated_at: string;
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    data: ProfileData;
    timestamp: string;
}

export interface UpdateProfileRequest {
    employee_name: string;
    employee_email: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
}

export interface ProfileFormData {
    employee_name: string;
    employee_email: string;
    employee_mobile: string;
    employee_office_number: string;
    employee_address: string;
    current_password: string;
    new_password: string;
    confirm_password: string;
}