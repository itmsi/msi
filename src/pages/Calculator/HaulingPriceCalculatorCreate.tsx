import { useState, useCallback, useMemo } from 'react';
import { MdCalculate, MdKeyboardArrowLeft, MdRefresh, MdSave } from 'react-icons/md';
import { toast } from 'react-hot-toast';

import Button from '@/components/ui/button/Button';
import PageMeta from '@/components/common/PageMeta';
import { FormState, HasilKalkulasi, MetodeAdjustment } from './types/calculator';
import { useCalculatorTransaction } from './hooks/useCalculatorTransaction';
import { calcForMethod, parseRibuan } from './utils/kalkulasiHelper';
import SeksiInfoDasar from './components/SeksiInfoDasar';
import SeksiDataHarga from './components/SeksiDataHarga';
import SeksiMetodePenyesuaian from './components/SeksiMetodePenyesuaian';
import PanelRingkasan from './components/PanelRingkasan';
import PanelHasilKalkulasi from './components/PanelHasilKalkulasi';
import PanelSummaryCompare from './components/PanelSummaryCompare';
import { useNavigate } from 'react-router-dom';

const INITIAL_FORM: FormState = {
    iupId: '',
    iupName: '',
    contractorId: '',
    contractorName: '',
    periodeHarga: '',
    effectiveDate: null,
    shift_per_hari: '',
    ritase_per_shift: '',
    fuel_consumption: '',
    idle_factor: '',
    hargaHaulingLama: '',
    hargaSolarLama: '',
    hargaSolarBaru: '',
    metode: 'share',
    persentaseBiayaSolar: '',
    konsumsiSolarPerHm: '',
    jarakAngkutKm: '',
    tonasePerRitase: '',
    jarakHaul: '',
    adjustment: '',
    porsiBiayaBBM: '',
    notesKhusus: '',
    catatan: '',
};

export default function HaulingPriceCalculatorCreate() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [hasil, setHasil] = useState<HasilKalkulasi | null>(null);
    const transaction = useCalculatorTransaction();

    const iupValue = useMemo(() => (
        form.iupId && form.iupName ? { value: form.iupId, label: form.iupName } : null
    ), [form.iupId, form.iupName]);

    const contractorValue = useMemo(() => (
        form.contractorId && form.contractorName ? { value: form.contractorId, label: form.contractorName } : null
    ), [form.contractorId, form.contractorName]);

    const handleUpdate = useCallback((partial: Partial<FormState>) => {
        setForm(prev => ({ ...prev, ...partial }));
    }, []);

    const handleIupChange = useCallback((iup: { value: string; label: string } | null) => {
        setForm(prev => ({
            ...prev,
            iupId: iup?.value ?? '',
            iupName: iup?.label ?? '',
            contractorId: '',
            contractorName: '',
        }));
    }, []);

    const handleContractorChange = useCallback((contractor: { value: string; label: string; customer_name?: string } | null) => {
        setForm(prev => ({
            ...prev,
            contractorId: contractor?.value ?? '',
            contractorName: contractor?.customer_name || contractor?.label || '',
        }));
    }, []);

    const hitungHarga = (silent = false, metodeOverride?: MetodeAdjustment) => {
        const metode = metodeOverride ?? form.metode;
        const hasilBaru = calcForMethod(form, metode);

        if (!hasilBaru) {
            if (!silent) {
                const haulingLama = parseRibuan(form.hargaHaulingLama);
                const solarLama = parseRibuan(form.hargaSolarLama);
                const solarBaru = parseRibuan(form.hargaSolarBaru);

                if (!haulingLama || !solarLama || !solarBaru) {
                    toast.error('Harga hauling lama, harga solar lama, dan harga solar baru wajib diisi.');
                } else if (solarLama === solarBaru) {
                    toast.error('Harga solar lama dan baru tidak boleh sama.');
                } else if (metode === 'share') {
                    toast.error('Porsi biaya BBM wajib diisi untuk metode ini.');
                } else {
                    toast.error('Fuel L/km dan Tonase per Unit wajib diisi untuk metode Consumption.');
                }
            }
            return;
        }

        setHasil(hasilBaru);
        if (!silent) toast.success('Kalkulasi berhasil!');
    }

    const handleMetodeChange = (metode: MetodeAdjustment) => {
        setForm(prev => ({ ...prev, metode }));
        hitungHarga(true, metode);
    }

    const handleSimpan = async () => {
        if (!form.iupId || !form.contractorId) {
            toast.error('IUP dan Contractor wajib diisi.');
            return;
        }

        // Hitung kedua metode sekaligus â€” keduanya disimpan ke API
        const hasilMetode1 = calcForMethod(form, 'share');
        const hasilMetode2 = calcForMethod(form, 'consumption');

        if (!hasilMetode1 && !hasilMetode2) {
            toast.error('Data harga tidak valid. Pastikan harga hauling dan harga solar sudah diisi.');
            return;
        }

        const berhasil = await transaction.submit(form, {
            hasilMetode1: hasilMetode1 ?? undefined,
            hasilMetode2: hasilMetode2 ?? undefined,
        });

        if (berhasil) resetForm();
    }

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setHasil(null);
    }

    return (
        <>
            <PageMeta
                title="Fuel-Linked Hauling Price Calculator"
                description="Kalkulasi penyesuaian harga hauling berbasis perubahan harga solar"
                image="/motor-sights-international.png"
            />
            <div className="mx-auto px-0">
                <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/hauling-calculator')}
                            className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                        >
                            <MdKeyboardArrowLeft size={20} />
                        </Button>
                        <div className="border-l border-gray-300 h-6 mx-3"></div>
                        <h1 className="font-primary-bold font-normal text-xl">
                            Create Hauling Cost Calculator Based on Diesel Price
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3 space-y-6">
                        <SeksiInfoDasar
                            form={form}
                            iupValue={iupValue}
                            contractorValue={contractorValue}
                            onIupChange={handleIupChange}
                            onContractorChange={handleContractorChange}
                            onUpdate={handleUpdate}
                        />
                        <SeksiDataHarga form={form} onUpdate={handleUpdate} />
                        <SeksiMetodePenyesuaian
                            form={form}
                            onUpdate={handleUpdate}
                            onMetodeChange={handleMetodeChange}
                        />

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="primary"
                                startIcon={<MdCalculate className="h-4 w-4" />}
                                onClick={() => hitungHarga()}
                                className="px-6 rounded-full"
                            >
                                Hitung Harga
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                startIcon={<MdSave className="h-4 w-4" />}
                                onClick={handleSimpan}
                                disabled={transaction.isLoading}
                                className="px-6 rounded-full"
                            >
                                {transaction.isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                startIcon={<MdRefresh className="h-4 w-4" />}
                                onClick={resetForm}
                                className="px-6 rounded-full"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="sticky top-6 space-y-4">
                            <PanelRingkasan form={form} />
                            <PanelHasilKalkulasi form={form} hasil={hasil} />
                            {hasil && <PanelSummaryCompare form={form} hasil={hasil} />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

