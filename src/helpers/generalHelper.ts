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

export const hasChanged = <T extends object>(oldData: T, newData: Partial<T>, keys: (keyof T)[]): boolean => {
    return keys.some((key) => oldData[key] !== newData[key]);
};
