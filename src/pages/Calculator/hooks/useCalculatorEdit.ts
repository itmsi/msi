import { useState, useEffect } from 'react';
import { CalculatorService } from '../services/calculatorService';
import { FormState, HaulingPriceDetail, MetodeAdjustment } from '../types/calculator';
import { parseISO } from 'date-fns';

// Konversi string desimal dari API (mis. "3000.00") ke string integer bersih (mis. "3000")
// agar parseRibuan tidak salah baca titik sebagai pemisah ribuan
function apiNum(val: string | null | undefined): string {
    if (!val) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : String(n);
}

function mapDetailToForm(detail: HaulingPriceDetail): FormState {
    return {
        iupId: detail.iup_id ?? '',
        iupName: detail.iup_name ?? '',
        contractorId: detail.contractor_id ?? '',
        contractorName: detail.contractor_name ?? '',
        periodeHarga: detail.periode_harga ?? '',
        effectiveDate: detail.effective_date ? parseISO(detail.effective_date) : null,
        shift_per_hari: apiNum(detail.shift_per_hari),
        ritase_per_shift: apiNum(detail.ritase_per_shift),
        fuel_consumption: apiNum(detail.fuel_consumption_l_km),
        idle_factor: apiNum(detail.idle_factor_persen),
        hargaHaulingLama: apiNum(detail.harga_hauling_lama),
        hargaSolarLama: apiNum(detail.harga_solar_lama),
        hargaSolarBaru: apiNum(detail.harga_solar_baru),
        metode: (detail.metode as MetodeAdjustment) ?? 'share',
        porsiBiayaBBM: apiNum(detail.porsi_biaya_bbm_persen),
        tonasePerRitase: apiNum(detail.tonase_per_unit),
        jarakHaul: apiNum(detail.jarak_haul_km),
        adjustment: apiNum(detail.adjustment_tambahan),
        notesKhusus: detail.notes_khusus ?? '',
        catatan: detail.catatan ?? '',
        // fields not stored in detail
        persentaseBiayaSolar: '',
        konsumsiSolarPerHm: '',
        jarakAngkutKm: '',
    };
}

export const useCalculatorEdit = (id: string) => {
    const [form, setForm] = useState<FormState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await CalculatorService.getHaulingPriceDetailById(id);
                if (response.success) {
                    setForm(mapDetailToForm(response.data));
                } else {
                    setError(response.message || 'Gagal memuat data.');
                }
            } catch {
                setError('Terjadi kesalahan saat memuat data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { form, setForm, loading, error };
};
