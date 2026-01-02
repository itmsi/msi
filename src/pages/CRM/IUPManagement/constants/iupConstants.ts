// IUP Management constants
export const STATUS_OPTIONS = [
    { value: 'aktif', label: 'Active' },
    { value: 'non aktif', label: 'Inactive' }
] as const;

export const BUSINESS_TYPES = [
    { value: 'PT', label: 'PT (Perseroan Terbatas)' },
    { value: 'CV', label: 'CV (Commanditaire Vennootschap)' },
    { value: 'UD', label: 'UD (Usaha Dagang)' },
    { value: 'Koperasi', label: 'Koperasi' }
] as const;

export const PERMIT_TYPES = [
    { value: 'IUP', label: 'IUP' },
    { value: 'IUPK', label: 'IUPK' },
    { value: 'IPR', label: 'IPR' }
] as const;

export const AUTHORIZED_OFFICERS = [
    { value: 'MENTERI', label: 'MENTERI' },
    { value: 'GUBERNUR', label: 'GUBERNUR' },
    { value: 'BUPATI', label: 'BUPATI' },
    { value: 'WALIKOTA', label: 'WALIKOTA' }
] as const;

export const ACTIVITY_STAGES = [
    { value: 'EKSPLORASI', label: 'EKSPLORASI' },
    { value: 'OPERASI PRODUKSI', label: 'OPERASI PRODUKSI' },
    { value: 'KONSTRUKSI', label: 'KONSTRUKSI' }
] as const;