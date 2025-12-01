import { Customer } from '../types/customer';

export class CustomerUtilityService {

    static validateCustomer(customerData: Partial<Customer>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Required fields validation
        if (!customerData.customer_name || customerData.customer_name.trim().length === 0) {
            errors.push('Customer name is required');
        }

        if (!customerData.customer_email || customerData.customer_email.trim().length === 0) {
            errors.push('Customer email is required');
        } else if (!this.isValidEmail(customerData.customer_email)) {
            errors.push('Please enter a valid email address');
        }

        if (!customerData.customer_phone || customerData.customer_phone.trim().length === 0) {
            errors.push('Customer phone is required');
        } else if (!this.isValidPhone(customerData.customer_phone)) {
            errors.push('Please enter a valid phone number');
        }

        // Optional but validate if provided
        if (customerData.customer_address && customerData.customer_address.length > 500) {
            errors.push('Address cannot exceed 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static formatCustomerName(name: string): string {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    static formatPhoneNumber(phone: string): string {
        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Format Indonesian phone numbers
        if (cleaned.startsWith('62')) {
            return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 9)} ${cleaned.substring(9)}`;
        } else if (cleaned.startsWith('08')) {
            return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
        }
        
        return phone; // Return original if format not recognized
    }

    static getCustomerInitials(name: string): string {
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
    }

    static getCustomerStatus(customer: Customer): 'complete' | 'incomplete' | 'missing_contact' {
        const hasName = customer.customer_name && customer.customer_name.trim().length > 0;
        const hasEmail = customer.customer_email && customer.customer_email.trim().length > 0;
        const hasPhone = customer.customer_phone && customer.customer_phone.trim().length > 0;
        const hasAddress = customer.customer_address && customer.customer_address.trim().length > 0;

        if (!hasEmail && !hasPhone) {
            return 'missing_contact';
        }

        if (hasName && hasEmail && hasPhone && hasAddress) {
            return 'complete';
        }

        return 'incomplete';
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private static isValidPhone(phone: string): boolean {
        const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
        return phoneRegex.test(phone.replace(/\s|-/g, ''));
    }

    static getCustomerAvatarColor(customerId: string): string {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#14b8a6',
            '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
            '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
        ];
        
        // Use customer ID to generate consistent color
        let hash = 0;
        for (let i = 0; i < customerId.length; i++) {
            hash = customerId.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
}