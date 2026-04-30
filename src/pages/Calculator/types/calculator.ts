export type MetodeAdjustment = 'share' | 'consumption';

export interface FormState {
    iupId: string;
    iupName: string;
    contractorId: string;
    contractorName: string;
    periodeHarga: string;
    effectiveDate: Date | null;
    shift_per_hari: string;
    ritase_per_shift: string;
    fuel_consumption: string;
    idle_factor: string;
    hargaHaulingLama: string;
    hargaSolarLama: string;
    hargaSolarBaru: string;
    metode: MetodeAdjustment;
    // share method
    persentaseBiayaSolar: string;
    // consumption method
    konsumsiSolarPerHm: string;
    jarakAngkutKm: string;
    // unit & haul info
    tonasePerRitase: string;
    jarakHaul: string;
    adjustment: string;
    porsiBiayaBBM: string;
    // opsional
    notesKhusus: string;
    catatan: string;
}

export interface HasilKalkulasi {
    selisihSolar: number;
    persenPerubahanSolar: number;
    adjustmentHarga: number;
    hargaHaulingBaru: number;
    // breakdown komponen BBM
    komponenNonBBM?: number;
    komponenBBMLama?: number;
    komponenBBMBaru?: number;
    // metrik tambahan
    persenPerubahanHauling?: number;
    revenueEstimasiLama?: number;
    revenueEstimasiBaru?: number;
    persenPerubahanRevenue?: number;
}

export interface KalkulasiRequest {
    page: number;
    limit: number;
    sort_order: 'asc' | 'desc' | '';
    sort_by?: 'updated_at' | 'created_at' | '';
    search?: string;
    project_id?: string;
}

// RESPONSE KALKULASI REQUEST
export interface HasilMetode {
    selisih_solar: number;
    adjustment_harga: number;
    komponen_non_bbm: number;
    komponen_bbm_baru: number;
    komponen_bbm_lama: number;
    harga_hauling_baru: number;
    revenue_estimasi_baru: number;
    revenue_estimasi_lama: number;
    persen_perubahan_solar: number;
    persen_perubahan_hauling: number;
    persen_perubahan_revenue: number;
}

export interface HasilHitungItem {
    hasil_metode_1?: HasilMetode;
    hasil_metode_2?: HasilMetode;
}

export interface HaulingPriceItem {
    hauling_prices_id: string;
    periode_harga: string;
    effective_date: string;

    harga_hauling_lama: string;
    harga_solar_lama: string;
    harga_solar_baru: string;

    porsi_biaya_bbm_persen: string;
    fuel_consumption_l_km: string;
    tonase_per_unit: string;
    adjustment_tambahan: string;
    jarak_haul_km: string;

    catatan: string;

    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    update_by_name: string;

    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;

    iup_customer_id: string | null;
    iup_id: string | null;
    iup_name: string | null;

    contractor_id: string | null;
    contractor_name: string | null;

    shift_per_hari: string | null;
    ritase_per_shift: string | null;
    idle_factor_persen: string | null;

    notes_khusus: string | null;

    hasil_hitung: HasilHitungItem[] | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface HaulingPriceData {
    data: HaulingPriceItem[];
    pagination: Pagination;
}

export interface HaulingPriceResponse {
    success: boolean;
    message: string;
    data: HaulingPriceData;
}

// DETAIL HAULING RESPONSE BY ID
export interface HasilMetode {
    selisih_solar: number;
    adjustment_harga: number;
    komponen_non_bbm: number;
    komponen_bbm_baru: number;
    komponen_bbm_lama: number;
    harga_hauling_baru: number;
    revenue_estimasi_baru: number;
    revenue_estimasi_lama: number;
    persen_perubahan_solar: number;
    persen_perubahan_hauling: number;
    persen_perubahan_revenue: number;
}

export interface HasilHitungItem {
    hasil_metode_1?: HasilMetode;
    hasil_metode_2?: HasilMetode;
}

export interface HaulingPriceDetail {
    hauling_prices_id: string;
    periode_harga: string;
    effective_date: string;

    harga_hauling_lama: string;
    harga_solar_lama: string;
    harga_solar_baru: string;

    metode: string;
    porsi_biaya_bbm_persen: string;
    fuel_consumption_l_km: string;
    tonase_per_unit: string;
    adjustment_tambahan: string;
    jarak_haul_km: string;

    catatan: string;

    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;

    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;

    iup_customer_id: string | null;
    iup_id: string | null;
    iup_name: string | null;

    contractor_id: string | null;
    contractor_name: string | null;

    shift_per_hari: string | null;
    ritase_per_shift: string | null;
    idle_factor_persen: string | null;

    notes_khusus: string | null;

    hasil_hitung: HasilHitungItem[] | null;
}

export interface HaulingPriceDetailResponse {
    success: boolean;
    message: string;
    data: HaulingPriceDetail;
}