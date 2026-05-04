import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdCalculate, MdRefresh, MdSave, MdArrowBack } from 'react-icons/md';
import { toast } from 'react-hot-toast';

import Button from '@/components/ui/button/Button';
import PageMeta from '@/components/common/PageMeta';
import { LoadingOverlay } from '@/components/common/Loading';
import { FormState, HasilKalkulasi, MetodeAdjustment } from './types/calculator';
import { useCalculatorTransaction } from './hooks/useCalculatorTransaction';
import { useCalculatorEdit } from './hooks/useCalculatorEdit';
import { calcForMethod, parseRibuan } from './utils/kalkulasiHelper';
import SeksiInfoDasar from './components/SeksiInfoDasar';
import SeksiDataHarga from './components/SeksiDataHarga';
import SeksiMetodePenyesuaian from './components/SeksiMetodePenyesuaian';
import PanelRingkasan from './components/PanelRingkasan';
import PanelHasilKalkulasi from './components/PanelHasilKalkulasi';
import PanelSummaryCompare from './components/PanelSummaryCompare';

export default function HaulingPriceCalculatorEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const transaction = useCalculatorTransaction();

    const { form: initialForm, loading, error } = useCalculatorEdit(id ?? '');
    const [form, setForm] = useState<FormState | null>(null);
    const [hasil, setHasil] = useState<HasilKalkulasi | null>(null);

    // Sync form dari hook hanya sekali saat data pertama kali tersedia
    const resolvedForm = form ?? initialForm;

    const iupValue = useMemo(() => (
        resolvedForm?.iupId && resolvedForm?.iupName
            ? { value: resolvedForm.iupId, label: resolvedForm.iupName }
            : null
    ), [resolvedForm?.iupId, resolvedForm?.iupName]);

    const contractorValue = useMemo(() => (
        resolvedForm?.contractorId && resolvedForm?.contractorName
            ? { value: resolvedForm.contractorId, label: resolvedForm.contractorName }
            : null
    ), [resolvedForm?.contractorId, resolvedForm?.contractorName]);

    const handleUpdate = useCallback((partial: Partial<FormState>) => {
        setForm(prev => ({ ...(prev ?? initialForm!), ...partial }));
    }, [initialForm]);

    const handleIupChange = useCallback((iup: { value: string; label: string } | null) => {
        setForm(prev => ({
            ...(prev ?? initialForm!),
            iupId: iup?.value ?? '',
            iupName: iup?.label ?? '',
            contractorId: '',
            contractorName: '',
        }));
    }, [initialForm]);

    const handleContractorChange = useCallback((contractor: { value: string; label: string; customer_name?: string } | null) => {
        setForm(prev => ({
            ...(prev ?? initialForm!),
            contractorId: contractor?.value ?? '',
            contractorName: contractor?.customer_name || contractor?.label || '',
        }));
    }, [initialForm]);

    const hitungHarga = (silent = false, metodeOverride?: MetodeAdjustment) => {
        if (!resolvedForm) return;
        const metode = metodeOverride ?? resolvedForm.metode;
        const hasilBaru = calcForMethod(resolvedForm, metode);

        if (!hasilBaru) {
            if (!silent) {
                const haulingLama = parseRibuan(resolvedForm.hargaHaulingLama);
                const solarLama = parseRibuan(resolvedForm.hargaSolarLama);
                const solarBaru = parseRibuan(resolvedForm.hargaSolarBaru);

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
    };

    const handleMetodeChange = (metode: MetodeAdjustment) => {
        setForm(prev => ({ ...(prev ?? initialForm!), metode }));
        hitungHarga(true, metode);
    };

    const handleSimpan = async () => {
        if (!resolvedForm) return;
        if (!resolvedForm.iupId || !resolvedForm.contractorId) {
            toast.error('IUP dan Contractor wajib diisi.');
            return;
        }

        const hasilMetode1 = calcForMethod(resolvedForm, 'share');
        const hasilMetode2 = calcForMethod(resolvedForm, 'consumption');

        if (!hasilMetode1 && !hasilMetode2) {
            toast.error('Data harga tidak valid. Pastikan harga hauling dan harga solar sudah diisi.');
            return;
        }

        const berhasil = await transaction.submit(resolvedForm, {
            hasilMetode1: hasilMetode1 ?? undefined,
            hasilMetode2: hasilMetode2 ?? undefined,
            haulingPriceId: id,
        });

        if (berhasil) navigate('/hauling-calculator');
    };

    const handleReset = () => {
        setForm(null); // kembali ke initialForm dari API
        setHasil(null);
    };

    // Auto-hitung saat data dari API pertama kali tersedia
    useEffect(() => {
        if (!initialForm) return;
        const hasilBaru = calcForMethod(initialForm, initialForm.metode);
        if (hasilBaru) setHasil(hasilBaru);
    }, [initialForm]);

    if (loading) return <LoadingOverlay message="Memuat data..." />;

    if (error || !resolvedForm) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">{error ?? 'Data tidak ditemukan.'}</p>
                <Button onClick={() => navigate('/hauling-calculator')} className="mt-4">
                    Kembali
                </Button>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Edit Hauling Price - Motor Sights International"
                description="Edit kalkulasi penyesuaian harga hauling berbasis perubahan harga solar"
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-3">
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/hauling-calculator')}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <MdArrowBack size={20} />
                            </button>
                            <div>
                                <h1 className="font-primary-bold font-normal text-xl">
                                    Edit Hauling Cost Calculator
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Perbarui data kalkulasi harga hauling
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3 space-y-6">
                            <SeksiInfoDasar
                                form={resolvedForm}
                                iupValue={iupValue}
                                contractorValue={contractorValue}
                                onIupChange={handleIupChange}
                                onContractorChange={handleContractorChange}
                                onUpdate={handleUpdate}
                            />
                            <SeksiDataHarga form={resolvedForm} onUpdate={handleUpdate} />
                            <SeksiMetodePenyesuaian
                                form={resolvedForm}
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
                                    {transaction.isLoading ? 'Menyimpan...' : 'Update'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    startIcon={<MdRefresh className="h-4 w-4" />}
                                    onClick={handleReset}
                                    className="px-6 rounded-full"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="sticky top-6 space-y-4">
                                <PanelRingkasan form={resolvedForm} />
                                <PanelHasilKalkulasi form={resolvedForm} hasil={hasil} />
                                {hasil && <PanelSummaryCompare form={resolvedForm} hasil={hasil} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
