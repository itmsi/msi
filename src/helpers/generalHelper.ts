import { ENUM_MONTH } from './constants';
import { AuthService } from '@/services/authService';

export const buildLabel = (...parts: (string | undefined | null)[]) => {
    return parts.filter(Boolean).join(' - ');
};

export function formatMonthYear(monthYear?: string): string {
    if (!monthYear) return '-';

    const [year, monthNum] = monthYear.split('-');
    const monthOption = ENUM_MONTH.find((m) => m.value === monthNum);

    return monthOption ? `${monthOption.label}/${year}` : '-';
}

export function extractMonthFromDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getUTCMonth() + 1).toString(); // getUTCMonth 0-based
    return month.padStart(2, '0'); // jadi "09"
}

export function formatFloatingValue(value: number | string | null | undefined, decimals: number = 2): number {
    if (value === null || value === undefined || value === '') return 0;

    const num = Number(value);
    if (isNaN(num)) return 0;

    return parseFloat(num.toFixed(decimals));
}

export const allowOnlyNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
        return;
    }
    
    if (
        !/[0-9.,]/.test(e.key) &&
        !allowedKeys.includes(e.key)
    ) {
        e.preventDefault();
    }
};

export const parseNumberInput = (value: string | undefined | null, isZero?: boolean) => {
    if (!value && isZero) return 0;
    if (!value) return undefined;

    if (typeof value === 'string') {
        return Number(value?.replace(',', '.'));
    }
    return value;
};

export const parseDecimalInput = (value: string | number | undefined | null, defaultVal: number = 0): number => {
    if (!value && value !== 0) return defaultVal;
    
    if (typeof value === 'number') {
        return isNaN(value) ? defaultVal : value;
    }

    const str = value.toString().trim();
    if (!str) return defaultVal;

    const cleaned = str.replace(/[^\d,.]/g, '');
    if (!cleaned) return defaultVal;

    let normalized = cleaned.replace(',', '.');
    
    const dots = (normalized.match(/\./g) || []).length;
    if (dots > 1) {
        const lastDotIdx = normalized.lastIndexOf('.');
        const beforeLastDot = normalized.substring(0, lastDotIdx).replace(/\./g, '');
        const afterLastDot = normalized.substring(lastDotIdx);
        normalized = beforeLastDot + afterLastDot;
    }
    
    const result = parseFloat(normalized);
    return isNaN(result) ? defaultVal : result;
};

// Format tanggal dari "24/3/2026" menjadi "24 March 2026" 
export const formatTanggal = (dateString?: string): string => {
    if (!dateString) return '-';

    // Split string berdasarkan "/" 
    const parts = dateString.trim().split('/');
    if (parts.length !== 3) return dateString; // return original jika format tidak valid

    const [hari, bulanNum, tahun] = parts;
    
    // Cari nama bulan dari ENUM_MONTH
    const namaBulan = ENUM_MONTH.find(m => m.value === bulanNum.padStart(2, '0'));
    
    // Jika bulan tidak ditemukan, return original
    if (!namaBulan) return dateString;
    
    return `${hari} ${namaBulan.label} ${tahun}`;
};

// Parse tanggal dari format "25/3/2026"
export const parseTanggalToDate = (dateString?: string): Date | null => {
    if (!dateString) return null;

    // Split string berdasarkan "/"
    const parts = dateString.trim().split('/');
    if (parts.length !== 3) return null;

    const [hari, bulan, tahun] = parts;
    
    // Validasi apakah semua parts adalah angka
    if (isNaN(Number(hari)) || isNaN(Number(bulan)) || isNaN(Number(tahun))) {
        return null;
    }

    // JavaScript Date constructor menggunakan format (year, monthIndex, day)
    // monthIndex dimulai dari 0 (Januari = 0)
    const dateObj = new Date(Number(tahun), Number(bulan) - 1, Number(hari));
    
    // Validasi apakah date yang dibuat valid
    if (isNaN(dateObj.getTime())) return null;
    
    return dateObj;
};

// Konversi Date object ke format DD/M/YYYY
export const convertDateToTanggal = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return '';
    
    const hari = date.getDate();
    const bulan = date.getMonth() + 1; // getMonth() returns 0-based month
    const tahun = date.getFullYear();
    
    return `${hari}/${bulan}/${tahun}`;
};

//CODE ORIGINAL
export const formatNumberInput = (value: string | number | undefined | null): string => {
    if (!value && value !== 0) return '';
    const cleanFormatValue = value.toString().replace(/[^\d]/g, '');
    if (!cleanFormatValue) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanFormatValue));
};

//CODE FADLAN
export const formatNumberInputFadlan = (value: string | number | undefined | null): string => {
    if (!value && value !== 0) return '';

    const stringValue = value.toString();
    const [integerPart, decimalPart] = stringValue.replace(/[^\d.]/g, '').split('.');
    
    const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart || '0', 10));
    
    if (decimalPart !== undefined) {
        return `${formattedInteger},${decimalPart}`;
    }
    
    return formattedInteger;
};

export const formatNumberPriceKoma = (value: string | number | undefined | null): string => {
    if (!value && value !== 0) return '';

    const stringValue = value.toString();
    const [integerPart, decimalPart] = stringValue.replace(/[^\d.]/g, '').split('.');
    
    const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart || '0', 10));
    
    if (decimalPart !== undefined) {
        return `${formattedInteger},${decimalPart}`;
    }
    
    return formattedInteger;
};

// New helper for currency formatting with proper decimal support
export const formatCurrencyIDR = (value: string | number | undefined | null, maxDecimals: number = 2): string => {
    if (!value && value !== 0) return '';
    
    let stringValue = value.toString();
    
    // Handle case where value might already be formatted (contains dots and commas)
    if (typeof value === 'string' && (value.includes('.') || value.includes(','))) {
        // If it's already a formatted string, parse it first
        const cleaned = value.replace(/\./g, '').replace(',', '.');
        const numericValue = parseFloat(cleaned);
        if (isNaN(numericValue)) return '';
        stringValue = numericValue.toString();
    } else {
        // Convert number to string
        const numericValue = parseFloat(stringValue);
        if (isNaN(numericValue)) return '';
        stringValue = numericValue.toString();
    }
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = stringValue.split('.');
    
    // Format integer part with thousand separators (dots)
    const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart || '0', 10));
    
    // Handle decimal part
    if (decimalPart !== undefined && decimalPart.length > 0) {
        // Limit decimal places
        const limitedDecimals = decimalPart.slice(0, maxDecimals);
        return `${formattedInteger},${limitedDecimals}`;
    }
    
    return formattedInteger;
};

// Helper to format during typing (more lenient)
export const formatCurrencyTyping = (value: string): string => {
    if (!value) return '';
    
    // Remove all non-digit characters except comma
    const cleaned = value.replace(/[^\d,]/g, '');
    
    // Split by comma
    const parts = cleaned.split(',');
    
    if (parts.length > 2) {
        // If more than one comma, keep only the first part and first decimal
        return formatCurrencyTyping(`${parts[0]},${parts[1]}`);
    }
    
    const integerPart = parts[0] || '';
    const decimalPart = parts[1];
    
    if (!integerPart) return '';
    
    // Format integer part
    const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart, 10));
    
    // Return with or without decimal part
    if (decimalPart !== undefined) {
        // Limit to 2 decimal places
        const limitedDecimal = decimalPart.slice(0, 2);
        return `${formattedInteger},${limitedDecimal}`;
    }
    
    // Check if original value ended with comma (user is starting to type decimal)
    if (value.endsWith(',')) {
        return `${formattedInteger},`;
    }
    
    return formattedInteger;
};

// Helper to parse currency back to number
export const parseCurrencyIDR = (value: string): number => {
    if (!value) return 0;
    
    // Remove thousand separators (dots) and replace decimal separator (comma) with dot
    const cleanValue = value
        .replace(/\./g, '')  // Remove thousand separators
        .replace(',', '.');  // Replace decimal separator
    
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : numericValue;
};

// Key press handler for currency input (supports decimal)
export const handleCurrencyKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', 'Enter'];
    
    // Allow control keys
    if (e.ctrlKey && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
        return;
    }
    
    // Allow navigation keys
    if (allowedKeys.includes(e.key)) {
        return;
    }
    
    const input = e.currentTarget;
    const currentValue = input.value;
    
    // Allow digits
    if (/[0-9]/.test(e.key)) {
        return;
    }
    
    // Allow comma for decimal separator (only one comma allowed)
    if (e.key === ',') {
        // Don't allow comma if one already exists
        if (currentValue.includes(',')) {
            e.preventDefault();
            return;
        }
        // Allow comma
        return;
    }
    
    // Prevent all other characters
    e.preventDefault();
};
export const formatCurrencyForBackend = (value: string | number | null | undefined): string => {
    if (!value && value !== 0) return '';
    
    let numericValue: number;
    
    if (typeof value === 'string') {
        if (value.includes(',')) {
            numericValue = parseCurrencyIDR(value);
        } else if (value.includes('.')) {
            const lastDotIndex = value.lastIndexOf('.');
            const afterDot = value.substring(lastDotIndex + 1);
            
            if (afterDot.length <= 3 && /^\d+$/.test(afterDot)) {
                numericValue = parseFloat(value);
            } else {
                numericValue = parseFloat(value.replace(/\./g, ''));
            }
        } else {
            numericValue = parseFloat(value);
        }
    } else {
        numericValue = value;
    }
    
    return (numericValue % 1 !== 0) ? numericValue.toFixed(2) : numericValue.toString();
};
export const formatNumberInputwithComma = (value: string | number | undefined | null): string => {
    if (!value && value !== 0) return '';

    const stringValue = value.toString();
    
    let integerPart: string, decimalPart: string | undefined;
    
    if (stringValue.includes(',')) {
        [integerPart, decimalPart] = stringValue.replace(/[^\d,]/g, '').split(',');
    } else if (stringValue.includes('.')) {
        [integerPart, decimalPart] = stringValue.replace(/[^\d.]/g, '').split('.');
    } else {
        integerPart = stringValue.replace(/[^\d]/g, '');
        decimalPart = undefined;
    }
    
    const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart || '0', 10));
    
    if (decimalPart !== undefined) {
        return `${formattedInteger},${decimalPart}`;
    }
    
    return formattedInteger;
};

export const parseFormatNumber = (formatValue: string): string => {
    if (!formatValue) return '';
    return formatValue.replace(/\./g, '');
};

export const resetFormatNumbers = (
    formData: any, 
    numericFields: string[] = []
): any => {
    const resetData = { ...formData };
    const fieldsToReset = numericFields.length > 0 
        ? numericFields 
        : Object.keys(resetData).filter(key => {
            const value = resetData[key];
            return typeof value === 'string' && /^\d{1,3}(\.\d{3})*$/.test(value);
        });
    
    fieldsToReset.forEach(field => {
        if (resetData[field]) {
            resetData[field] = parseFormatNumber(resetData[field].toString());
        }
    });
    
    return resetData;
};
export const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
        [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)
    ) {
        return;
    }
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
};
export const handlePercentageInput = (
    inputValue: string, 
    min: number = 0, 
    max: number = 100
): string => {
    const numericValue = inputValue.replace(/[^\d]/g, '');
    const percentage = parseInt(numericValue) || 0;
    const validatedPercentage = Math.min(max, Math.max(min, percentage));
    return validatedPercentage.toString();
};

export const handlePercentageInputComma = (
    inputValue: string, 
    min: number = 0, 
    max: number = 100
): string => {
    if (!inputValue) return '';

    const cleanedValue = inputValue.replace(/[^\d,]/g, '');
    
    if (cleanedValue === ',') return '0,';
    if (cleanedValue.startsWith(',')) return '0' + cleanedValue;

    const parts = cleanedValue.split(',');
    if (parts.length > 2) return parts[0] + ',' + parts.slice(1).join('');
    
    const dotValue = cleanedValue.replace(',', '.');
    
    const numericValue = parseFloat(dotValue);

    if (isNaN(numericValue)) return cleanedValue;

    if (numericValue > max) return max.toString().replace('.', ',');
    if (numericValue < min) return min.toString().replace('.', ',');

    // Limit decimal places to 2 (optional, but good for currency/percentage)
    if (parts.length > 1 && parts[1].length > 2) {
        return parts[0] + ',' + parts[1].substring(0, 2);
    }

    return cleanedValue;
};

export const hasChanged = <T extends object>(oldData: T, newData: Partial<T>, keys: (keyof T)[]): boolean => {
    return keys.some((key) => oldData[key] !== newData[key]);
};

export const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        // minimumFractionDigits: 2,
        // maximumFractionDigits: 2,
    }).format(numValue);
};
export const formatCurrencyID = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        // minimumFractionDigits: 2,
        // maximumFractionDigits: 2,
    }).format(numValue);
};
export const formatCurrencyZH = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '￥0';
    
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        // minimumFractionDigits: 2,
        // maximumFractionDigits: 2,
    }).format(numValue);
};

export const tableDateFormat = {
    day: '2-digit' as const,
    month: 'short' as const,
    year: 'numeric' as const
}
export const tableDateFormatTime = {
    day: '2-digit' as const,
    month: 'short' as const,
    year: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    second: '2-digit' as const
}

export const formatDate = (dateString: string, includeTime: boolean = false) => {
    const date = new Date(dateString);
    
    if (includeTime) {
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Fungsi tambahan untuk format DateTime yang lebih spesifik
export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// Fungsi untuk format waktu saja
export const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

export const formatDateToYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDateToDMYmiring = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
};

export const formatDecimalValue = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
};

export const formatIntegerValue = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return Math.round(numValue).toString();
};

export const formatPercentageValue = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
};

export const twodigitcomma = (value: string | number): string => {
    const parts = value.toString().split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
    }
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    return value.toString();
}

export const fourdigitcomma = (value: string | number): string => {
    const parts = value.toString().split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
    }
    if (parts[1] && parts[1].length > 4) {
        value = parts[0] + '.' + parts[1].substring(0, 4);
    }
    return value.toString();
}

// Handle numeric input with support for decimal values starting with 0 (e.g., 0.12)
export const handleDecimalInput = (
    rawValue: string, 
    onValidInput: (value: string) => void, 
    onInvalidInput: () => void,
    formatWithComma: boolean = true,
    maxIntegerDigits?: number,
    maxDecimalDigits: number = 4
) => {
    if (rawValue === '') {
        onInvalidInput();
        return;
    }
    
    const cleanValue = rawValue.replace(/[^\d.]/g, '');
    const [integerPart, decimalPart] = cleanValue.split('.');
    
    // Check max integer digits
    if (maxIntegerDigits && integerPart && integerPart.length > maxIntegerDigits) {
        return;
    }
    
    // Check max decimal digits
    if (decimalPart && decimalPart.length > maxDecimalDigits) {
        return;
    }
    
    let processedValue = cleanValue;
    if (integerPart && integerPart.length > 1 && integerPart.startsWith('0') && !cleanValue.startsWith('0.')) {
        const trimmedInteger = integerPart.replace(/^0+/, '') || '0';
        processedValue = decimalPart !== undefined ? `${trimmedInteger}.${decimalPart}` : trimmedInteger;
    }
    
    if (processedValue === '0' || processedValue.startsWith('0.')) {
        onValidInput(processedValue);
        return;
    }
    
    const numericValue = parseFloat(processedValue) || 0;
    
    if (numericValue <= 0) {
        onInvalidInput();
    } else {
        const finalValue = formatWithComma ? fourdigitcomma(processedValue) : processedValue;
        onValidInput(finalValue);
    }
};
// Handle numeric input with support for decimal values starting with 0 (e.g., 0.12)
export const handleDecimalInputComma = (
    rawValue: string, 
    onValidInput: (value: string) => void, 
    onInvalidInput: () => void,
    formatWithComma: boolean = true,
    maxIntegerDigits?: number,
    maxDecimalDigits: number = 4
) => {
    if (rawValue === '') {
        onInvalidInput();
        return;
    }
    
    const cleanValue = rawValue.replace(/[^\d,]/g, '');
    const [integerPart, decimalPart] = cleanValue.split(',');
    
    if (maxIntegerDigits && integerPart && integerPart.length > maxIntegerDigits) {
        return;
    }
    
    if (decimalPart && decimalPart.length > maxDecimalDigits) {
        return; 
    }
    
    if (cleanValue === '0' || cleanValue.startsWith('0,')) {
        onValidInput(cleanValue);
        return;
    }
    
    const numericValue = parseFloat(cleanValue) || 0;
    
    if (numericValue <= 0) {
        onInvalidInput();
    } else {
        const finalValue = formatWithComma ? fourdigitcomma(cleanValue) : cleanValue;
        onValidInput(finalValue);
    }
};

export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('62')) {
        return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 9)} ${cleaned.substring(9)}`;
    } else if (cleaned.startsWith('08')) {
        return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
    }
    
    return phone;
}

export const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
        submit: { bg: 'bg-green-100', text: 'text-green-800', label: 'Submit' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
        approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };

    return statusConfig[status.toLowerCase()] || statusConfig.draft;
};

// Get company_name from logged in user
export const getCompanyName = (): string => {
    const user = AuthService.getCurrentUser();
    return (user as any)?.company_name || '';
};