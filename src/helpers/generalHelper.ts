import { ENUM_MONTH } from './constants';

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
        !/[0-9.,]/.test(e.key) && // hanya angka, koma, titik
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

// Parse decimal input - handles both comma and dot as decimal separator
// Examples: "12.5" -> 12.5, "20,1" -> 20.1, "100" -> 100
export const parseDecimalInput = (value: string | number | undefined | null, defaultVal: number = 0): number => {
    if (!value && value !== 0) return defaultVal;
    
    if (typeof value === 'number') {
        return isNaN(value) ? defaultVal : value;
    }

    const str = value.toString().trim();
    if (!str) return defaultVal;

    // Keep only digits, dots, and commas
    const cleaned = str.replace(/[^\d,.]/g, '');
    if (!cleaned) return defaultVal;

    // Replace comma with dot for JS parsing
    let normalized = cleaned.replace(',', '.');
    
    // Handle multiple dots (e.g., "1.000.5" -> "1000.5")
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

// export const formatNumberInput = (value: string | number | null | undefined): string => {
//     if (value === null) return '';
//     if (value === undefined || value === '') return '';
//     if (value === 0) return '0';
    
//     const stringValue = value.toString();
//     const [integerPart, decimalPart] = stringValue.replace(/[^\d.]/g, '').split('.');
    
//     // Format the integer part with thousand separators
//     const formattedInteger = new Intl.NumberFormat('id-ID').format(parseInt(integerPart || '0', 10));
    
//     // If there's a decimal part, add it back
//     if (decimalPart !== undefined) {
//         return `${formattedInteger},${decimalPart}`;
//     }

//     console.log(formattedInteger);
    
//     return formattedInteger;
// };



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
    // Return empty if empty
    if (!inputValue) return '';

    // Allow typing only numbers and comma
    const cleanedValue = inputValue.replace(/[^\d,]/g, '');
    
    // Check if it's just a comma or starts with comma, prefix with 0
    if (cleanedValue === ',') return '0,';
    if (cleanedValue.startsWith(',')) return '0' + cleanedValue;

    // Split by comma to check for multiple commas
    const parts = cleanedValue.split(',');
    if (parts.length > 2) return parts[0] + ',' + parts.slice(1).join('');
    
    // Validate range
    // Replace comma with dot for parsing
    const dotValue = cleanedValue.replace(',', '.');
    // If it ends with dot (comma originally), we can't fully parse it as float yet for validation if we want to allow "50,"
    // So we only validate if it's a complete number or doesn't end in comma
    
    const numericValue = parseFloat(dotValue);

    if (isNaN(numericValue)) return cleanedValue; // Should be handled by regex above but safe check

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
        return; // Don't update if exceeds max integer digits
    }
    
    // Check max decimal digits
    if (decimalPart && decimalPart.length > maxDecimalDigits) {
        return; // Don't update if exceeds max decimal digits
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
    
    // Check max integer digits
    if (maxIntegerDigits && integerPart && integerPart.length > maxIntegerDigits) {
        return;
    }
    
    // Check max decimal digits
    if (decimalPart && decimalPart.length > maxDecimalDigits) {
        return; 
    }
    
    // Allow typing "0" or "0,x" patterns for decimal input
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