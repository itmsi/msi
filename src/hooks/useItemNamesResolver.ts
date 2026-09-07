import { useCallback, useMemo, useState } from 'react';
import { ApiError } from '@/helpers/apiHelper';
import { parseDecimalInput } from '@/helpers/generalHelper';
import { ItemsService } from '@/pages/Netsuite/Items/services/itemsService';
import { ItemNameMatch, ItemNameResult, ItemNameStatus } from '@/pages/Netsuite/Items/types/items';

const MAX_NAMES_PER_REQUEST = 200;

export type PasteItemStatus = ItemNameStatus | 'duplicate';

export interface PasteItemRow {
    key: string;
    rowNumber: number;
    name: string;
    quantity: number;
    status: PasteItemStatus;
    matches: ItemNameMatch[];
    selectedInternalId: string | null;
}

export interface ResolvedPasteItem {
    internalId: string;
    itemId: string;
    displayName: string;
    quantity: number;
}

interface PasteEntry {
    key: string;
    rowNumber: number;
    name: string;
    quantity: number;
    apiStatus: ItemNameStatus;
    matches: ItemNameMatch[];
    selectedInternalId: string | null;
}

interface ParsedRow {
    name: string;
    quantity: number;
}

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();

const cleanCell = (value: string): string => value.trim().replace(/^"(.*)"$/s, '$1').trim();

export const parseExcelRows = (text: string): ParsedRow[] => {
    return text
        .split(/\r\n|\r|\n/)
        .map(line => {
            const columns = line.split('\t');
            const name = cleanCell(columns[0] || '');
            if (!name) return null;

            const quantity = parseDecimalInput(cleanCell(columns[1] || ''), 1);

            return { name, quantity: quantity > 0 ? quantity : 1 };
        })
        .filter((row): row is ParsedRow => row !== null);
};

const toItemNameMatch = (raw: ItemNameMatch): ItemNameMatch => ({
    internalId: raw?.internalId !== undefined && raw?.internalId !== null ? String(raw.internalId) : '',
    itemId: raw?.itemId || '',
    displayName: raw?.displayName || '',
    itemType: raw?.itemType,
    itemTypeId: raw?.itemTypeId,
});

const collectMatches = (result?: ItemNameResult): ItemNameMatch[] => {
    const raw = [
        ...(result?.item ? [result.item] : []),
        ...(result?.candidates || []),
    ];

    const byInternalId = new Map<string, ItemNameMatch>();
    raw.map(toItemNameMatch)
        .filter(match => Boolean(match.internalId))
        .forEach(match => byInternalId.set(match.internalId, match));

    return Array.from(byInternalId.values());
};

const chunkNames = (names: string[]): string[][] => {
    const chunks: string[][] = [];
    for (let i = 0; i < names.length; i += MAX_NAMES_PER_REQUEST) {
        chunks.push(names.slice(i, i + MAX_NAMES_PER_REQUEST));
    }
    return chunks;
};

export const useItemNamesResolver = (itemTypeIds?: string[]) => {
    const [entries, setEntries] = useState<PasteEntry[]>([]);
    const [existingInternalIds, setExistingInternalIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resolveText = useCallback(async (text: string, existingIds: string[] = []) => {
        const parsedRows = parseExcelRows(text);

        if (parsedRows.length === 0) {
            setEntries([]);
            setError('Tidak ada baris yang bisa dibaca. Pastikan data disalin dari Excel.');
            return;
        }

        const uniqueNames = Array.from(
            new Map(parsedRows.map(row => [normalizeName(row.name), row.name])).values()
        );

        try {
            setLoading(true);
            setError(null);

            const responses = await Promise.all(
                chunkNames(uniqueNames).map(names => ItemsService.validateItemNames({
                    names,
                    ...(itemTypeIds && itemTypeIds.length > 0 ? { item_type_id: itemTypeIds } : {})
                }))
            );

            const failed = responses.find(response => !response?.success);
            if (failed) {
                setEntries([]);
                setError(failed.message || 'Validasi item gagal');
                return;
            }

            const resultByName = new Map<string, ItemNameResult>();
            responses.forEach(response => {
                (response.data?.results || []).forEach(result => {
                    resultByName.set(normalizeName(result.name), result);
                });
            });

            setExistingInternalIds(existingIds);
            setEntries(parsedRows.map((row, index) => {
                const result = resultByName.get(normalizeName(row.name));
                const apiStatus: ItemNameStatus = result?.status || 'not_found';

                const usableMatches = collectMatches(result);

                return {
                    key: `${index}-${row.name}`,
                    rowNumber: index + 1,
                    name: row.name,
                    quantity: row.quantity,
                    apiStatus,
                    matches: usableMatches,
                    selectedInternalId: usableMatches.length === 1 ? usableMatches[0].internalId : null,
                };
            }));
        } catch (err) {
            const apiError = err as ApiError;
            setEntries([]);
            setError(apiError?.message || 'Validasi item gagal');
            console.error('Error validating item names:', err);
        } finally {
            setLoading(false);
        }
    }, [itemTypeIds]);

    const rows: PasteItemRow[] = useMemo(() => {
        const usedInternalIds = new Set(existingInternalIds);

        return entries.map(entry => {
            let status: PasteItemStatus;

            if (entry.matches.length === 0) {
                status = 'not_found';
            } else if (!entry.selectedInternalId) {
                status = 'ambiguous';
            } else if (usedInternalIds.has(entry.selectedInternalId)) {
                status = 'duplicate';
            } else {
                usedInternalIds.add(entry.selectedInternalId);
                status = 'found';
            }

            return {
                key: entry.key,
                rowNumber: entry.rowNumber,
                name: entry.name,
                quantity: entry.quantity,
                status,
                matches: entry.matches,
                selectedInternalId: entry.selectedInternalId,
            };
        });
    }, [entries, existingInternalIds]);

    const summary = useMemo(() => ({
        total: rows.length,
        found: rows.filter(row => row.status === 'found').length,
        ambiguous: rows.filter(row => row.status === 'ambiguous').length,
        notFound: rows.filter(row => row.status === 'not_found').length,
        duplicate: rows.filter(row => row.status === 'duplicate').length,
    }), [rows]);

    const resolvedItems: ResolvedPasteItem[] = useMemo(() => {
        return rows
            .filter(row => row.status === 'found' && row.selectedInternalId)
            .map(row => {
                const match = row.matches.find(item => item.internalId === row.selectedInternalId);
                return {
                    internalId: row.selectedInternalId as string,
                    itemId: match?.itemId || '',
                    displayName: match?.displayName || row.name,
                    quantity: row.quantity,
                };
            });
    }, [rows]);

    const selectMatch = useCallback((key: string, internalId: string | null) => {
        setEntries(prev => prev.map(entry => (
            entry.key === key ? { ...entry, selectedInternalId: internalId } : entry
        )));
    }, []);

    const updateQuantity = useCallback((key: string, quantity: number) => {
        setEntries(prev => prev.map(entry => (
            entry.key === key ? { ...entry, quantity } : entry
        )));
    }, []);

    const removeRow = useCallback((key: string) => {
        setEntries(prev => prev.filter(entry => entry.key !== key));
    }, []);

    const reset = useCallback(() => {
        setEntries([]);
        setExistingInternalIds([]);
        setError(null);
    }, []);

    return {
        rows,
        summary,
        resolvedItems,
        loading,
        error,
        resolveText,
        selectMatch,
        updateQuantity,
        removeRow,
        reset,
    };
};
