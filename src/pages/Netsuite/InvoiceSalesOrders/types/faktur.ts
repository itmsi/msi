export interface FakturDetail {
    baris?: string;
    barang_or_jasa?: string;
    kode_barang_jasa?: string;
    nama_barang_or_jasa?: string;
    nama_satuan_ukur?: string;
    harga_satuan?: number;
    jumlah_barang_jasa?: number;
    total_diskon?: number;
    dpp?: number;
    dpp_nilai_lain?: number;
    tarif_ppn?: number;
    ppn?: number;
    tarif_ppnnbm?: number;
    ppnbm?: number;
}

export interface Faktur {
    faktur_id?: string;
    sales_invoice_id?: number;
    baris?: string;
    tanggal_faktur?: string;
    jenis_faktur?: string;
    kode_transaksi?: string;
    keterangan_tambahan?: string;
    dokumen_pendukung?: string;
    referensi?: string;
    cap_fasilitas?: string;
    id_tku_Penjual?: string;
    npwp_or_nik_pembeli?: string;
    jenis_id_pembeli?: string;
    negara_pembeli?: string;
    nomor_dokumen_pembeli?: string;
    nama_pembeli?: string;
    alamat_pembeli?: string;
    email_pembeli?: string;
    id_tku_pembeli?: string;
    details: FakturDetail[];
    created_at?: string;
    updated_at?: string;
}

export interface FakturResponse {
    success: boolean;
    data: Faktur;
    message?: string;
}

export interface ReferenceRequest {
    page: number;
    limit: number;
    search: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    type: string;
}

export interface ReferenceItem {
    id: string | number;
    code: string;
    description: string;
    name?: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

export interface ReferenceResponseData {
    items: ReferenceItem[];
    pagination: PaginationInfo;
}

export interface ReferenceResponse {
    success: boolean;
    data: ReferenceResponseData;
    message?: string;
}
