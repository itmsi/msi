import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

import { CalculatorService } from '../services/calculatorService';
import { FormState, HasilKalkulasi } from '../types/calculator';
import { parseRibuan } from '../utils/kalkulasiHelper';

interface SubmitPayload {
    hasilMetode1?: HasilKalkulasi;
    hasilMetode2?: HasilKalkulasi;
    haulingPriceId?: string; // jika diisi → update, jika kosong → create
}

function parseDecimalVal(val: string): number {
    return parseFloat(val.replace(',', '.')) || 0;
}

function buildHasilPayload(hasil: HasilKalkulasi) {
    return {
        selisih_solar: hasil.selisihSolar,
        persen_perubahan_solar: hasil.persenPerubahanSolar,
        adjustment_harga: hasil.adjustmentHarga,
        harga_hauling_baru: hasil.hargaHaulingBaru,
        komponen_non_bbm: hasil.komponenNonBBM ?? 0,
        komponen_bbm_lama: hasil.komponenBBMLama ?? 0,
        komponen_bbm_baru: hasil.komponenBBMBaru ?? 0,
        persen_perubahan_hauling: hasil.persenPerubahanHauling ?? 0,
        revenue_estimasi_lama: hasil.revenueEstimasiLama ?? 0,
        revenue_estimasi_baru: hasil.revenueEstimasiBaru ?? 0,
        persen_perubahan_revenue: hasil.persenPerubahanRevenue ?? 0,
    };
}

export function useCalculatorTransaction() {
    const [isLoading, setIsLoading] = useState(false);

    async function submit(form: FormState, { hasilMetode1, hasilMetode2, haulingPriceId }: SubmitPayload): Promise<boolean> {
        setIsLoading(true);
        try {
            const hasilHitung: Record<string, ReturnType<typeof buildHasilPayload>>[] = [];
            if (hasilMetode1 || hasilMetode2) {
                const entry: Record<string, ReturnType<typeof buildHasilPayload>> = {};
                if (hasilMetode1) entry.hasil_metode_1 = buildHasilPayload(hasilMetode1);
                if (hasilMetode2) entry.hasil_metode_2 = buildHasilPayload(hasilMetode2);
                hasilHitung.push(entry);
            }

            const body = {
                iup_id: form.iupId,
                iup_name: form.iupName,
                contractor_id: form.contractorId,
                contractor_name: form.contractorName,
                periode_harga: form.periodeHarga,
                effective_date: form.effectiveDate ? format(form.effectiveDate, 'yyyy-MM-dd') : '',
                shift_per_hari: parseDecimalVal(form.shift_per_hari),
                ritase_per_shift: parseDecimalVal(form.ritase_per_shift),
                fuel_consumption_l_km: parseDecimalVal(form.fuel_consumption),
                idle_factor_persen: parseDecimalVal(form.idle_factor),
                tonase_per_unit: parseRibuan(form.tonasePerRitase),
                jarak_haul_km: parseRibuan(form.jarakHaul),
                harga_hauling_lama: parseRibuan(form.hargaHaulingLama),
                harga_solar_lama: parseRibuan(form.hargaSolarLama),
                harga_solar_baru: parseRibuan(form.hargaSolarBaru),
                adjustment_tambahan: parseRibuan(form.adjustment),
                porsi_biaya_bbm_persen: parseDecimalVal(form.porsiBiayaBBM),
                notes_khusus: form.notesKhusus,
                catatan: form.catatan,
                ...(hasilHitung.length > 0 && { hasil_hitung: hasilHitung }),
            };

            if (haulingPriceId) {
                await CalculatorService.updateHaulingPrice(haulingPriceId, body);
                toast.success('Data berhasil diperbarui.');
            } else {
                await CalculatorService.createHaulingPrice(body);
                toast.success('Data berhasil disimpan.');
            }

            return true;
        } catch {
            toast.error('Gagal menyimpan data. Silakan coba lagi.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    return { isLoading, submit };
}
