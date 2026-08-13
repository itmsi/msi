import moment from 'moment';

export function toNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
}

export function formatNumber(value: string | number | null | undefined): string {
    return new Intl.NumberFormat('id-ID').format(toNumber(value));
}

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = moment(dateString);
    return date.isValid() ? date.format('DD MMM YYYY') : '-';
}

export function daysUntil(dateString: string | null | undefined): number | null {
    if (!dateString) return null;
    const target = moment(dateString).startOf('day');
    if (!target.isValid()) return null;
    return target.diff(moment().startOf('day'), 'days');
}
