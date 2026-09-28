import { PriceLevelOption, SalesOrderFormItem } from '../types/salesOrder';

// Internal ID standar NetSuite: -1 = Custom, 1 = Base Price ("Harga Dasar")
export const CUSTOM_PRICE_LEVEL: PriceLevelOption = { id: -1, name: 'Custom', price: 0, tiers: [] };
export const DEFAULT_PRICE_LEVEL_NAME = 'Harga Dasar';
const PRICE_LEVEL_ID_BY_NAME: Record<string, number> = {
    [DEFAULT_PRICE_LEVEL_NAME.toLowerCase()]: 1,
};

export const isCustomPriceLevel = (name?: string | null) =>
    !name || name.toLowerCase() === CUSTOM_PRICE_LEVEL.name.toLowerCase();

/**
 * Parse kolom price_levels item. Format dari NetSuite:
 * { "0": [{ priceLevel, priceLevelId, price }], "10": [...], ... } (key = minimum qty tier).
 * Custom tidak ikut (ditambahkan terpisah di UI).
 */
export const parsePriceLevels = (raw: unknown): PriceLevelOption[] => {
    let source = raw;
    if (typeof source === 'string') {
        try {
            source = JSON.parse(source);
        } catch {
            return [];
        }
    }
    if (!source || typeof source !== 'object') return [];

    const entries: [number, any[]][] = Array.isArray(source)
        ? [[0, source]]
        : Object.entries(source as Record<string, any[]>).map(([qty, rows]) => [Number(qty) || 0, rows || []]);

    const levels = new Map<string, PriceLevelOption>();
    entries.forEach(([minQty, rows]) => {
        rows.forEach(row => {
            const name = String(row?.priceLevel ?? row?.price_level ?? '').trim();
            if (!name || isCustomPriceLevel(name)) return;
            const price = Number(row?.price) || 0;

            let level = levels.get(name);
            if (!level) {
                const rawId = row?.priceLevelId ?? row?.price_level_id;
                level = {
                    id: rawId != null && rawId !== '' ? Number(rawId) : PRICE_LEVEL_ID_BY_NAME[name.toLowerCase()] ?? null,
                    name,
                    price: 0,
                    tiers: [],
                };
                levels.set(name, level);
            }

            const tier = level.tiers.find(t => t.minQty === minQty);
            if (!tier) {
                level.tiers.push({ minQty, price });
            } else {
                // Data lama (tanpa info qty tier) menumpuk semua tier di key yang sama:
                // ambil harga tertinggi = harga tier dasar (qty terkecil)
                tier.price = Math.max(tier.price, price);
            }
        });
    });

    return Array.from(levels.values()).map(level => {
        const tiers = [...level.tiers].sort((a, b) => a.minQty - b.minQty);
        return { ...level, tiers, price: tiers[0]?.price ?? 0 };
    });
};

/** Harga price level untuk qty tertentu: tier dengan minQty terbesar yang <= qty */
export const getPriceForQty = (level: PriceLevelOption, qty: number): number => {
    let price = level.price;
    level.tiers.forEach(tier => {
        if (qty >= tier.minQty) price = tier.price;
    });
    return price;
};

/**
 * Field price level + rate awal untuk item baru (qty 1):
 * punya price level -> default "Harga Dasar", tidak punya -> Custom.
 */
export const getInitialPriceLevel = (options: PriceLevelOption[]): Pick<SalesOrderFormItem, 'price_level' | 'price_level_name' | 'rate'> => {
    const base = options.find(o => o.name.toLowerCase() === DEFAULT_PRICE_LEVEL_NAME.toLowerCase());
    if (base) {
        return { price_level: base.id, price_level_name: base.name, rate: getPriceForQty(base, 1) };
    }
    return { price_level: CUSTOM_PRICE_LEVEL.id, price_level_name: CUSTOM_PRICE_LEVEL.name, rate: 0 };
};
