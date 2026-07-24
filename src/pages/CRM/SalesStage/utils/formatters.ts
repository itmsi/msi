export const fmtShort = (v: number) => {
    if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(v % 1_000_000_000_000 === 0 ? 0 : 1)} T`;
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(v % 1_000_000_000 === 0 ? 0 : 1)} M`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)} Jt`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)} Rb`;
    return v.toString();
};
export const fmtCard = (v: string | null) => {
    const n = parseInt((v || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? (v || '-') : `Rp ${fmtShort(n)}`;
};