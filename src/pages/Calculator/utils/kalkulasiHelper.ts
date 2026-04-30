import { parseDecimalInput } from '@/helpers/generalHelper';
import { FormState, HasilKalkulasi, MetodeAdjustment } from '../types/calculator';

export const PERIODE_OPTIONS = [
    { value: 'Tanggal 1 - 15', label: 'Tanggal 1 - 15' },
    { value: 'Tanggal 16 - Akhir Bulan', label: 'Tanggal 16 - Akhir Bulan' },
];

export function parseRibuan(val: string): number {
    return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
}

export function formatPersen(val: number): string {
    return `${val.toFixed(2)}%`;
}

// Hitung kalkulasi untuk satu metode secara pure (tanpa side effect)
export function calcForMethod(form: FormState, metode: MetodeAdjustment): HasilKalkulasi | null {
    const haulingLama = parseRibuan(form.hargaHaulingLama);
    const solarLama = parseRibuan(form.hargaSolarLama);
    const solarBaru = parseRibuan(form.hargaSolarBaru);

    if (!haulingLama || !solarLama || !solarBaru || solarLama === solarBaru) return null;

    const selisihSolar = solarBaru - solarLama;
    const persenPerubahanSolar = (selisihSolar / solarLama) * 100;

    let adjustmentHarga = 0;
    let hargaHaulingBaru = 0;
    let komponenNonBBM: number | undefined;
    let komponenBBMLama: number | undefined;
    let komponenBBMBaru: number | undefined;

    if (metode === 'share') {
        const porsi = parseDecimalInput(form.porsiBiayaBBM.replace(',', '.'));
        if (!porsi) return null;
        const adjustment = parseRibuan(form.adjustment);
        const porsiFraction = porsi / 100;
        komponenNonBBM = haulingLama * (1 - porsiFraction);
        komponenBBMLama = haulingLama * porsiFraction;
        komponenBBMBaru = komponenBBMLama * (solarBaru / solarLama);
        hargaHaulingBaru = komponenNonBBM + komponenBBMBaru + adjustment;
        adjustmentHarga = hargaHaulingBaru - haulingLama;
    } else {
        const fuelLKm = parseDecimalInput(form.fuel_consumption.replace(',', '.'));
        const tonase = parseRibuan(form.tonasePerRitase);
        if (!fuelLKm || !tonase) return null;
        const adjustment = parseRibuan(form.adjustment);
        komponenBBMLama = (fuelLKm * solarLama) / tonase;
        komponenBBMBaru = (fuelLKm * solarBaru) / tonase;
        hargaHaulingBaru = haulingLama + (komponenBBMBaru - komponenBBMLama) + adjustment;
        adjustmentHarga = hargaHaulingBaru - haulingLama;
    }

    // Revenue estimasi — 0 jika data operasional tidak lengkap
    const shift = parseDecimalInput(form.shift_per_hari.replace(',', '.'));
    const ritase = parseDecimalInput(form.ritase_per_shift.replace(',', '.'));
    const tonase = parseRibuan(form.tonasePerRitase);
    const jarak = parseRibuan(form.jarakHaul);
    const adaDataRevenue = !!(shift && ritase && tonase && jarak);

    const revenueEstimasiLama = adaDataRevenue ? shift! * ritase! * tonase * haulingLama * jarak : 0;
    const revenueEstimasiBaru = adaDataRevenue ? shift! * ritase! * tonase * hargaHaulingBaru * jarak : 0;
    const persenPerubahanHauling = haulingLama ? ((hargaHaulingBaru - haulingLama) / haulingLama) * 100 : 0;
    const persenPerubahanRevenue = revenueEstimasiLama
        ? ((revenueEstimasiBaru - revenueEstimasiLama) / revenueEstimasiLama) * 100
        : 0;

    return {
        selisihSolar,
        persenPerubahanSolar,
        adjustmentHarga,
        hargaHaulingBaru,
        komponenNonBBM,
        komponenBBMLama,
        komponenBBMBaru,
        persenPerubahanHauling,
        revenueEstimasiLama,
        revenueEstimasiBaru,
        persenPerubahanRevenue,
    };
}
