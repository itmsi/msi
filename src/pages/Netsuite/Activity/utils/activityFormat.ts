import moment from 'moment';
import { ActivityItem, ActivityRow } from '../types/activity';

const TIMESTAMP_FORMATS = [
    'YYYY-MM-DD HH:mm:ss.SSS Z',
    'YYYY-MM-DD HH:mm:ss Z',
    'YYYY-MM-DD HH:mm:ss.SSS',
    'YYYY-MM-DD HH:mm:ss',
    moment.ISO_8601,
];

export interface ActivityTimestampParts {
    date: string;
    time: string;
    offset: string;
}

export const parseActivityTimestamp = (value?: string | null): ActivityTimestampParts => {
    if (!value) return { date: '-', time: '-', offset: '' };

    const parsed = moment.parseZone(value.trim(), TIMESTAMP_FORMATS);
    if (!parsed.isValid()) return { date: value, time: '-', offset: '' };

    return {
        date: parsed.format('DD MMMM YYYY'),
        time: parsed.format('HH:mm:ss'),
        offset: parsed.format('ZZ'),
    };
};

export const getActivityStatus =(item: ActivityItem): { ok: boolean; label: string } => {
    const statusCode = Number(item.status_code);
    const ok = statusCode >= 200 && statusCode < 300;

    return {
        ok,
        label: ok ? `${statusCode} Success` : `${statusCode} Error`,
    };
};

export const getRecordCount = (item: ActivityItem): number | null => {
    const total = item.response?.total_records;
    if (typeof total === 'number') return total;

    return Array.isArray(item.response?.data) ? item.response.data.length : null;
};

export const toActivityRows = (items: ActivityItem[]): ActivityRow[] =>
    items.map((item, index) => ({
        ...item,
        id: `${item.created_at || 'no-date'}-${item.url || 'no-url'}-${index}`,
        activityId: item.id,
    }));

export const DEFAULT_START_TIME = '00:00';
export const DEFAULT_END_TIME = '23:59';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isValidTime = (value: string): boolean => TIME_PATTERN.test(value);

interface TimeRangeFilters {
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
}

// Pada hari yang sama jam mulai tidak boleh melewati jam selesai. Sisi yang bukan sumber
// perubahan ikut disamakan supaya rentang tidak pernah terbalik. Format HH:mm sudah
// berurutan secara leksikografis, jadi perbandingan string cukup.
export const alignTimeRange = <T extends TimeRangeFilters>(
    filters: T,
    changed: 'start_time' | 'end_time'
): T => {
    if (filters.start_date !== filters.end_date || filters.start_time <= filters.end_time) return filters;

    return changed === 'start_time'
        ? { ...filters, end_time: filters.start_time }
        : { ...filters, start_time: filters.end_time };
};

export const toRequestStartDate = (date: string, time: string = DEFAULT_START_TIME): string =>
    date ? moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').startOf('minute').format('YYYY-MM-DD HH:mm:ss.SSS ZZ') : '';

export const toRequestEndDate = (date: string, time: string = DEFAULT_END_TIME): string =>
    date ? moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').endOf('minute').format('YYYY-MM-DD HH:mm:ss.SSS ZZ') : '';

export const formatJson = (value: unknown): string => {
    if (value === null || value === undefined) return '';

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

export type JsonTokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'plain';

export interface JsonToken {
    text: string;
    type: JsonTokenType;
}

const JSON_TOKEN_PATTERN = /("(?:\\.|[^\\"])*"\s*:|"(?:\\.|[^\\"])*"|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export const tokenizeJson =(json: string): JsonToken[] => {
    const tokens: JsonToken[] = [];
    let lastIndex = 0;

    for (const match of json.matchAll(JSON_TOKEN_PATTERN)) {
        const text = match[0];
        const index = match.index ?? 0;

        if (index > lastIndex) {
            tokens.push({ text: json.slice(lastIndex, index), type: 'plain' });
        }

        if (text.startsWith('"')) {
            tokens.push({ text, type: text.trimEnd().endsWith(':') ? 'key' : 'string' });
        } else if (text === 'true' || text === 'false') {
            tokens.push({ text, type: 'boolean' });
        } else if (text === 'null') {
            tokens.push({ text, type: 'null' });
        } else {
            tokens.push({ text, type: 'number' });
        }

        lastIndex = index + text.length;
    }

    if (lastIndex < json.length) {
        tokens.push({ text: json.slice(lastIndex), type: 'plain' });
    }

    return tokens;
};
