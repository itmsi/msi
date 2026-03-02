import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type LangCode = 'id' | 'en' | 'zh';

export type TranslationMap = Record<string, Record<LangCode, string>>;

export interface LangOption {
    code: LangCode;
    label: string;
    flag: string;
}
const generateFlag = (countryCode: string): string => {
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
};
export const SUPPORTED_LANGS: LangOption[] = [
    { code: 'en', label: 'English', flag: generateFlag('EN') },
    { code: 'id', label: 'Indonesia', flag: generateFlag('ID') },
    { code: 'zh', label: '中文', flag: generateFlag('CN') },
];

/**
 * Hook general untuk bilingual label berdasarkan URL param `lang`.
 * Bisa dipakai di halaman mana saja, tinggal passing labels-nya.
 *
 * @example
 * const { langField, lang, setLang } = useLanguage(myLabels);
 * <Label>{langField('fieldName')}</Label>
 */
export function useLanguage(labels?: TranslationMap, defaultLang: LangCode = 'en') {
    const [searchParams, setSearchParams] = useSearchParams();

    const lang = useMemo<LangCode>(() => {
        const paramLang = searchParams.get('lang') as LangCode | null;
        if (paramLang && ['id', 'en', 'zh'].includes(paramLang)) return paramLang;
        return defaultLang;
    }, [searchParams, defaultLang]);

    const langField = useCallback(
        (key: string): string => {
            if (!labels) return key;
            const entry = labels[key];
            if (!entry) return key;
            return entry[lang] || entry['en'] || key;
        },
        [lang, labels]
    );

    const setLang = useCallback(
        (newLang: LangCode) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('lang', newLang);
                return next;
            }, { replace: true });
        },
        [setSearchParams]
    );

    return { lang, langField, setLang, supportedLangs: SUPPORTED_LANGS };
}
