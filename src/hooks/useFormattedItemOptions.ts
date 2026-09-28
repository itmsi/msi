import { useCallback, useMemo } from 'react';

/**
 * Format label option item menjadi "itemId - displayName".
 * Dipakai di semua halaman NetSuite (Create & Edit) agar select item
 * konsisten dengan halaman Transfer Order.
 */
export const formatItemOptionLabel = <T extends Record<string, any>>(opt: T | null | undefined): T | null | undefined => {
    if (!opt) return opt;
    const itemId = opt?.data?.itemId ?? opt?.itemId;
    const displayName = opt?.data?.displayName ?? opt?.displayName ?? '';
    if (!itemId) return opt;
    return { ...opt, label: displayName ? `${itemId} - ${displayName}` : String(itemId) };
};

export const formatItemOptions = (options: any[] | null | undefined): any[] =>
    (options || []).map(formatItemOptionLabel);

/**
 * Hook helper untuk select item NetSuite.
 *
 * @param options        daftar option (defaultOptions) yang sudah dimuat
 * @param onInputChange  fungsi load options async dari select
 * @returns defaultOptions & loadOptions yang labelnya sudah diformat
 */
export const useFormattedItemOptions = (
    options: any[] | null | undefined,
    onInputChange?: (val: string) => Promise<any[]>
) => {
    const defaultOptions = useMemo(() => formatItemOptions(options), [options]);

    const loadOptions = useCallback(
        async (val: string) => formatItemOptions(onInputChange ? await onInputChange(val) : []),
        [onInputChange]
    );

    return { defaultOptions, loadOptions };
};
