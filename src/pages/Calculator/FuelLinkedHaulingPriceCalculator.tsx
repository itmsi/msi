import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Calendar } from 'react-date-range';
import { format } from 'date-fns';
import { MdCalendarToday, MdCalculate, MdRefresh } from 'react-icons/md';
import { toast } from 'react-hot-toast';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import { handleDecimalInput, parseDecimalInput } from '@/helpers/generalHelper';
import IupContractorSelect from '@/components/form/select/IupContractorSelect';
import Alert from '@/components/ui/alert/Alert';
import Tooltip from '@/components/ui/tooltip/Tooltip';

type MetodeAdjustment = 'share' | 'consumption';

interface FormState {
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

interface HasilKalkulasi {
    selisihSolar: number;
    persenPerubahanSolar: number;
    adjustmentHarga: number;
    hargaHaulingBaru: number;
    // breakdown share method
    komponenNonBBM?: number;
    komponenBBMLama?: number;
    komponenBBMBaru?: number;
}

const PERIODE_OPTIONS = [
    { value: 'Tanggal 1 - 15', label: 'Tanggal 1 - 15' },
    { value: 'Tanggal 16 - Akhir Bulan', label: 'Tanggal 16 - Akhir Bulan' }
];

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

function parseRibuan(val: string): number {
    // format ribuan pakai titik, desimal pakai koma → parse ke float
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

function formatRp(val: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(val);
}

function formatPersen(val: number): string {
    return `${val.toFixed(2)}%`;
}

export default function FuelLinkedHaulingPriceCalculator() {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [showCalendar, setShowCalendar] = useState(false);
    const [hasil, setHasil] = useState<HasilKalkulasi | null>(null);

    const calendarRef = useRef<HTMLDivElement>(null);

    // IUP value untuk IupContractorSelect
    const iupValue = useMemo(() => {
        return form.iupId && form.iupName
            ? { value: form.iupId, label: form.iupName }
            : null;
    }, [form.iupId, form.iupName]);

    // Contractor value untuk IupContractorSelect
    const contractorValue = useMemo(() => {
        return form.contractorId && form.contractorName
            ? { value: form.contractorId, label: form.contractorName }
            : null;
    }, [form.contractorId, form.contractorName]);

    const handleIupChange = useCallback((iup: { value: string; label: string } | null) => {
        setForm(prev => ({
            ...prev,
            iupId: iup?.value ?? '',
            iupName: iup?.label ?? '',
            // reset contractor saat IUP berubah
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


    // Tutup kalender saat klik di luar
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
                setShowCalendar(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    function handleChange(field: keyof FormState, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleNumberInput(field: keyof FormState, e: React.ChangeEvent<HTMLInputElement>) {
        // Boleh angka, titik (ribuan), koma (desimal)
        const raw = e.target.value.replace(/[^0-9.,]/g, '');
        setForm(prev => ({ ...prev, [field]: raw }));
    }

    function handleDateSelect(date: Date) {
        setForm(prev => ({ ...prev, effectiveDate: date }));
        setShowCalendar(false);
    }

    function hitungHarga(silent = false, metodeOverride?: MetodeAdjustment) {
        const haulingLama = parseRibuan(form.hargaHaulingLama);
        const solarLama = parseRibuan(form.hargaSolarLama);
        const solarBaru = parseRibuan(form.hargaSolarBaru);

        if (!haulingLama || !solarLama || !solarBaru) {
            if (!silent) toast.error('Harga hauling lama, harga solar lama, dan harga solar baru wajib diisi.');
            return;
        }

        if (solarLama === solarBaru) {
            if (!silent) toast.error('Harga solar lama dan baru tidak boleh sama.');
            return;
        }

        const selisihSolar = solarBaru - solarLama;
        const persenPerubahanSolar = (selisihSolar / solarLama) * 100;

        let adjustmentHarga = 0;
        let hargaHaulingBaru = 0;
        let komponenNonBBM: number | undefined;
        let komponenBBMLama: number | undefined;
        let komponenBBMBaru: number | undefined;

        const metode = metodeOverride ?? form.metode;
        if (metode === 'share') {
            const porsi = parseDecimalInput(form.porsiBiayaBBM.replace(',', '.'));
            if (!porsi) {
                if (!silent) toast.error('Porsi biaya BBM wajib diisi untuk metode ini.');
                return;
            }

            const adjustment = parseRibuan(form.adjustment); // opsional, default 0
            const porsiFraction = porsi / 100;

            komponenNonBBM = haulingLama * (1 - porsiFraction);
            komponenBBMLama = haulingLama * porsiFraction;
            komponenBBMBaru = komponenBBMLama * (solarBaru / solarLama);
            hargaHaulingBaru = komponenNonBBM + komponenBBMBaru + adjustment;
            adjustmentHarga = hargaHaulingBaru - haulingLama;
            
        } else {
            const fuelLKm = parseDecimalInput(form.fuel_consumption.replace(',', '.'));
            const payload = parseRibuan(form.tonasePerRitase);
            if (!fuelLKm || !payload) {
                if (!silent) toast.error('Fuel L/km dan Tonase per Unit wajib diisi untuk metode Consumption.');
                return;
            }

            const adjustment = parseRibuan(form.adjustment);
            komponenBBMLama = (fuelLKm * solarLama) / payload;
            komponenBBMBaru = (fuelLKm * solarBaru) / payload;
            const kenaikanBiayaBBM = komponenBBMBaru - komponenBBMLama;
            hargaHaulingBaru = haulingLama + kenaikanBiayaBBM + adjustment;
            adjustmentHarga = hargaHaulingBaru - haulingLama;
        }
        setHasil({ selisihSolar, persenPerubahanSolar, adjustmentHarga, hargaHaulingBaru, komponenNonBBM, komponenBBMLama, komponenBBMBaru });
        toast.success('Kalkulasi berhasil!');
    }

    function resetForm() {
        setForm(INITIAL_FORM);
        setHasil(null);
    }


    const tanggalLabel = form.effectiveDate
        ? format(form.effectiveDate, 'dd/MM/yyyy')
        : 'Pilih tanggal...';

    return (
        <>
            <PageMeta
                title="Fuel-Linked Hauling Price Calculator"
                description="Kalkulasi penyesuaian harga hauling berbasis perubahan harga solar"
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 min-h-screen">
                <div className="mx-auto px-4 sm:px-3">
                {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <div className='ms-2'>
                                <h1 className="font-primary-bold font-normal text-xl">
                                    Hauling Cost Calculator Based on Diesel Price
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Estimate hauling costs based on diesel prices for better cost planning.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3 space-y-6">

                            {/* Informasi Periode */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-medium text-gray-800">Basic Informations</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Nama Customer */}
                                        {/* IUP & Contractor Selection */}
                                        <IupContractorSelect
                                            className="md:col-span-2"
                                            layout="horizontal"
                                            gridCols="grid-cols-1 md:grid-cols-2"
                                            iupValue={iupValue}
                                            iupLabel="IUP Selection"
                                            iupRequired={true}
                                            contractorValue={contractorValue}
                                            contractorLabel="Contractor"
                                            contractorRequired={true}
                                            onIupChange={handleIupChange}
                                            onContractorChange={handleContractorChange}
                                        />

                                    {/* Periode Harga */}
                                    <div>
                                        <Label>Periode Harga</Label>
                                        <CustomSelect
                                            placeholder="Pilih periode..."
                                            value={
                                                PERIODE_OPTIONS.find(o => o.value === form.periodeHarga) ?? null
                                            }
                                            options={PERIODE_OPTIONS}
                                            isClearable={false}
                                            isSearchable={false}
                                            onChange={opt => handleChange('periodeHarga', opt?.value ?? '')}
                                        />
                                    </div>

                                    {/* Tanggal Efektif – react-date-range Calendar */}
                                    <div>
                                        <Label>Tanggal Efektif</Label>
                                        <div className="relative" ref={calendarRef}>
                                            <button
                                                type="button"
                                                className="font-secondary h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-left text-sm shadow-theme-xs hover:border-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 flex items-center justify-between"
                                                onClick={() => setShowCalendar(v => !v)}
                                            >
                                                <span className={form.effectiveDate ? 'text-gray-800' : 'text-gray-400'}>
                                                    {tanggalLabel}
                                                </span>
                                                <MdCalendarToday className="h-4 w-4 text-gray-400 shrink-0" />
                                            </button>

                                            {showCalendar && (
                                                <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
                                                    <Calendar
                                                        date={form.effectiveDate ?? new Date()}
                                                        onChange={handleDateSelect}
                                                        color="#0253a5"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Tonase per Ritase */}
                                    <div>
                                        <Label htmlFor="tonasePerRitase">Tonase per Unit (ton)</Label>
                                        <Input
                                            id="tonasePerRitase"
                                            type="text"
                                            placeholder=""
                                            value={form.tonasePerRitase}
                                            onChange={e => handleNumberInput('tonasePerRitase', e)}
                                        />
                                    </div>
                                    {/* Jarak Haul */}
                                    <div>
                                        <Label htmlFor="jarakHaul">Jarak Haul (km PP)</Label>
                                        <Input
                                            id="jarakHaul"
                                            type="text"
                                            placeholder=""
                                            value={form.jarakHaul}
                                            onChange={e => handleNumberInput('jarakHaul', e)}
                                        />
                                    </div>
                                    {/* Shift per Hari */}
                                    <div>
                                        <Label htmlFor="shift_per_hari">Shift per Hari</Label>
                                        <Input
                                            id="shift_per_hari"
                                            type="text"
                                            placeholder=""
                                            value={form.shift_per_hari}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;
                                                handleDecimalInput(
                                                    rawValue,
                                                    (validValue) => setForm(prev => ({ ...prev, shift_per_hari: validValue })),
                                                    () => setForm(prev => ({ ...prev, shift_per_hari: '' })),
                                                    true,
                                                    7,
                                                    4
                                                );
                                            }}
                                        />
                                    </div>
                                    {/* Ritase */}
                                    <div>
                                        <Label htmlFor="ritase_per_shift">Ritase per Shift</Label>
                                        <Input
                                            id="ritase_per_shift"
                                            type="text"
                                            placeholder=""
                                            value={form.ritase_per_shift}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;
                                                handleDecimalInput(
                                                    rawValue,
                                                    (validValue) => setForm(prev => ({ ...prev, ritase_per_shift: validValue })),
                                                    () => setForm(prev => ({ ...prev, ritase_per_shift: '' })),
                                                    true,
                                                    7,
                                                    4
                                                );
                                            }}
                                        />
                                    </div>
                                    {/* Fuel Consumption */}
                                    <div>
                                        <Label htmlFor="fuel_consumption">Fuel L/km</Label>
                                        <Input
                                            id="fuel_consumption"
                                            type="text"
                                            placeholder=""
                                            value={form.fuel_consumption}
                                            onChange={(e) => {
                                                const rawValue = e.target.value;
                                                handleDecimalInput(
                                                    rawValue,
                                                    (validValue) => setForm(prev => ({ ...prev, fuel_consumption: validValue })),
                                                    () => setForm(prev => ({ ...prev, fuel_consumption: '' })),
                                                    true,
                                                    9,
                                                    4
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="idle_factor">Idle Factor (%)</Label>
                                        <div className="space-y-2">
                                            <Input
                                                id="idle_factor"
                                                value={form.idle_factor}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    handleDecimalInput(
                                                        rawValue,
                                                        (validValue) => setForm(prev => ({ ...prev, idle_factor: validValue })),
                                                        () => setForm(prev => ({ ...prev, idle_factor: '' })),
                                                        true,
                                                        9,
                                                        4
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Harga Hauling & Solar */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-medium text-gray-800">Data Harga</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Harga Hauling Lama */}
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="hargaHaulingLama">
                                            Harga Hauling Lama <span className="text-xs text-gray-500 mt-1 inline-flex">(IDR / ton / km)</span> <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            {/* <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">
                                                Rp
                                            </span> */}
                                            <Input
                                                id="hargaHaulingLama"
                                                type="text"
                                                placeholder="0"
                                                className=""
                                                value={form.hargaHaulingLama}
                                                onChange={e => handleNumberInput('hargaHaulingLama', e)}
                                            />
                                        </div>
                                    </div>

                                    {/* Harga Solar Lama */}
                                    <div>
                                        <Label htmlFor="hargaSolarLama">
                                            Harga Solar Lama <span className="text-xs text-gray-500 mt-1 inline-flex">(IDR / liter)</span> <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            {/* <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">
                                                Rp
                                            </span> */}
                                            <Input
                                                id="hargaSolarLama"
                                                type="text"
                                                placeholder="0"
                                                className=""
                                                value={form.hargaSolarLama}
                                                onChange={e => handleNumberInput('hargaSolarLama', e)}
                                            />
                                        </div>
                                    </div>

                                    {/* Harga Solar Baru */}
                                    <div>
                                        <Label htmlFor="hargaSolarBaru">
                                            Harga Solar Baru <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            {/* <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">
                                                Rp
                                            </span> */}
                                            <Input
                                                id="hargaSolarBaru"
                                                type="text"
                                                placeholder="0"
                                                className=""
                                                value={form.hargaSolarBaru}
                                                onChange={e => handleNumberInput('hargaSolarBaru', e)}
                                            />
                                        </div>
                                    </div>

                                    {/* Adjustment */}
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="adjustment">Adjustment Tambahan</Label>
                                        <Input
                                            id="adjustment"
                                            type="text"
                                            placeholder=""
                                            value={form.adjustment}
                                            onChange={e => handleNumberInput('adjustment', e)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Metode Penyesuaian */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-medium text-gray-800">Metode Penyesuaian</h2>

                                {/* Toggle metode */}
                                <div className="mb-4 flex gap-3">
                                    {(['share', 'consumption'] as MetodeAdjustment[]).map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={
                                                () => {
                                                    setForm(p => ({ ...p, metode: m }));
                                                    hitungHarga(true, m);
                                                }
                                            }
                                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition
                                                ${form.metode === m
                                                    ? 'border-[#0253a5] bg-[#0253a5] text-white'
                                                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            {m === 'share' ? 'Berdasarakan Porsi Biaya BBM' : 'Berdasarkan Konsumsi liter/km & Tonase'}
                                        </button>
                                    ))}
                                </div>

                                {/* Conditional input */}
                                {form.metode === 'share' ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Alert variant='warning' title='Fuel Portion Method (Metode Porsi BBM)'>
                                                <div className="space-y-4">
                                                    <p className="text-sm text-gray-500">
                                                        Metode ini menghitung kenaikan biaya hauling dengan melihat berapa besar porsi biaya BBM dalam total biaya, lalu menyesuaikan kenaikan harga berdasarkan persentase kenaikan BBM.
                                                    </p>
                                                </div>
                                            </Alert>
                                        </div>
                                        {/* Porsi Biaya BBM dalam Harga Lama */}
                                        <div>
                                            <Label htmlFor="porsiBiayaBBM">Porsi Biaya BBM dalam Harga Lama (%)</Label>
                                            <Input
                                                id="porsiBiayaBBM"
                                                type="text"
                                                placeholder=""
                                                value={form.porsiBiayaBBM}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    handleDecimalInput(
                                                        rawValue,
                                                        (validValue) => setForm(prev => ({ ...prev, porsiBiayaBBM: validValue })),
                                                        () => setForm(prev => ({ ...prev, porsiBiayaBBM: '' })),
                                                        true,
                                                        3,
                                                        2
                                                    );
                                                }}
                                            />
                                        </div>


                                        {/* <div>
                                            <Label htmlFor="persentaseBiayaSolar">
                                                Persentase Biaya Solar terhadap Harga Hauling (%)
                                                <span className="text-red-500"> *</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="persentaseBiayaSolar"
                                                    type="text"
                                                    placeholder=""
                                                    value={form.persentaseBiayaSolar}
                                                    onChange={e => handleNumberInput('persentaseBiayaSolar', e)}
                                                />
                                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
                                                    %
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-400">
                                                Adjustment = Harga Hauling Lama × (% Solar) × (% Perubahan Solar)
                                            </p>
                                        </div> */}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        
                                        <div className="sm:col-span-2">
                                            <Alert variant='warning' title='Distance-Based Fuel Costing (Metode Konsumsi Aktual per Jarak)'>
                                                <div className="space-y-4">
                                                    <p className="text-sm text-gray-500">
                                                        Metode ini menghitung biaya hauling berdasarkan konsumsi BBM aktual unit (liter/km), kemudian dikalikan dengan jarak hauling dan dibagi dengan tonase unit, sehingga diperoleh biaya BBM per ton secara nyata.
                                                    </p>
                                                </div>
                                            </Alert>
                                        </div>

                                        {/* <div>
                                            <Label htmlFor="konsumsiSolarPerHm">
                                                Konsumsi Solar per HM (liter)
                                                <span className="text-red-500"> *</span>
                                            </Label>
                                            <Input
                                                id="konsumsiSolarPerHm"
                                                type="text"
                                                placeholder=""
                                                value={form.konsumsiSolarPerHm}
                                                onChange={e => handleNumberInput('konsumsiSolarPerHm', e)}
                                            />
                                        </div> */}
                                        
                                        {/* <div>
                                            <Label htmlFor="jarakAngkutKm">
                                                Jarak Angkut (km)
                                                <span className="text-red-500"> *</span>
                                            </Label>
                                            <Input
                                                id="jarakAngkutKm"
                                                type="text"
                                                placeholder=""
                                                value={form.jarakAngkutKm}
                                                onChange={e => handleNumberInput('jarakAngkutKm', e)}
                                            />
                                        </div> */}

                                        
                                        <div>
                                            <Label htmlFor="fuel_consumption">Fuel L/km</Label>
                                            <Input
                                                id="fuel_consumption"
                                                type="text"
                                                placeholder=""
                                                value={form.fuel_consumption}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value;
                                                    handleDecimalInput(
                                                        rawValue,
                                                        (validValue) => setForm(prev => ({ ...prev, fuel_consumption: validValue })),
                                                        () => setForm(prev => ({ ...prev, fuel_consumption: '' })),
                                                        true,
                                                        9,
                                                        4
                                                    );
                                                }}
                                            />
                                        </div>
                                        {/* Jarak Haul */}
                                        <div>
                                            <Label htmlFor="jarakHaul">Jarak Haul (km PP)</Label>
                                            <Input
                                                id="jarakHaul"
                                                type="text"
                                                placeholder=""
                                                value={form.jarakHaul}
                                                onChange={e => handleNumberInput('jarakHaul', e)}
                                            />
                                        </div>
                                        <p className="sm:col-span-2 mt-0 text-xs text-gray-400">
                                            Biaya BBM/ton-km = (Fuel L/km × Harga Solar) / Tonase per Unit · H.Baru = H.Lama + ΔBiaya BBM + Adj
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Data Opsional */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm hidden">
                                <h2 className="mb-4 text-base font-medium text-gray-800">
                                    Data Opsional
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="notesKhusus">Notes Khusus Kontrak</Label>
                                        <Input
                                            id="notesKhusus"
                                            type="text"
                                            placeholder="Misal: berlaku mulai invoice berikutnya"
                                            value={form.notesKhusus}
                                            onChange={e => handleChange('notesKhusus', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="catatan">Catatan Tambahan</Label>
                                        <textarea
                                            id="catatan"
                                            rows={3}
                                            placeholder="Keterangan lain jika diperlukan..."
                                            value={form.catatan}
                                            onChange={e => handleChange('catatan', e.target.value)}
                                            className="font-secondary w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="primary"
                                    startIcon={<MdCalculate className="h-4 w-4" />}
                                    onClick={() => hitungHarga()}
                                >
                                    Hitung Harga
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    startIcon={<MdRefresh className="h-4 w-4" />}
                                    onClick={resetForm}
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* ── RESULT PANEL (2/5) ── */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-6 space-y-4">
                                {/* Ringkasan Input */}
                                {(form.iupName || form.contractorName || form.effectiveDate) && (
                                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                                        <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
                                            Ringkasan
                                        </h3>
                                        <dl className="space-y-2 text-sm">
                                            {form.iupName && (
                                                <InfoRow label="IUP" value={form.iupName} />
                                            )}
                                            {form.contractorName && (
                                                <InfoRow label="Contractor" value={form.contractorName} />
                                            )}
                                            {form.periodeHarga && (
                                                <InfoRow
                                                    label="Periode"
                                                    value={PERIODE_OPTIONS.find(o => o.value === form.periodeHarga)?.label ?? ''}
                                                />
                                            )}
                                            {form.effectiveDate && (
                                                <InfoRow
                                                    label="Efektif"
                                                    value={format(form.effectiveDate, 'dd/MM/yyyy')}
                                                />
                                            )}
                                        </dl>
                                    </div>
                                )}

                                {/* Hasil Kalkulasi */}
                                <div className="rounded-2xl bg-white p-5 shadow-sm">
                                    <h3 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Hasil Kalkulasi
                                    </h3>

                                    {hasil ? (
                                        <div className="space-y-4">
                                            {/* <ResultRow
                                                label="Selisih Harga Solar"
                                                value={formatRp(hasil.selisihSolar)}
                                                valueClass={hasil.selisihSolar >= 0 ? 'text-green-600' : 'text-red-500'}
                                            /> */}
                                            {/* <ResultRow
                                                label="Perubahan Solar (%)"
                                                value={formatPersen(hasil.persenPerubahanSolar)}
                                                valueClass={hasil.persenPerubahanSolar >= 0 ? 'text-green-600' : 'text-red-500'}
                                            /> */}

                                            {/* Breakdown komponen – share method */}
                                            {form.metode === 'share' && (
                                                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">Breakdown Komponen</p>
                                                    <ResultRow 
                                                        label="Komponen Non-BBM" 
                                                        value={formatRp(hasil.komponenNonBBM!)} 
                                                        rumus="Komponen Non-BBM = H.Lama × (1 − porsi)"
                                                        showRumus={true}
                                                    />
                                                    <ResultRow 
                                                        label="Komponen BBM Lama" 
                                                        value={formatRp(hasil.komponenBBMLama!)} 
                                                        rumus="Komponen BBM Lama = H.Lama × porsi"
                                                        showRumus={true}
                                                    />
                                                    <ResultRow 
                                                        label="Komponen BBM Baru" 
                                                        value={formatRp(hasil.komponenBBMBaru!)} 
                                                        rumus="Komponen BBM Baru = H. lama × (Solar baru / Solar lama)"
                                                        showRumus={true}
                                                    />
                                                    {parseRibuan(form.adjustment) !== 0 && (
                                                        <ResultRow
                                                            label="Adjustment Tambahan"
                                                            value={formatRp(parseRibuan(form.adjustment))}
                                                            valueClass="text-orange-500"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Breakdown komponen – consumption method */}
                                            {form.metode === 'consumption' && hasil.komponenBBMLama !== undefined && (
                                                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">Breakdown Biaya BBM / ton/km</p>
                                                    <ResultRow
                                                        label="Biaya BBM Lama"
                                                        value={formatRp(hasil.komponenBBMLama!)}
                                                        rumus="(L/km × Solar Lama) / Tonase per Unit"
                                                        showRumus={true}
                                                    />
                                                    <ResultRow
                                                        label="Biaya BBM Baru"
                                                        value={formatRp(hasil.komponenBBMBaru!)}
                                                        rumus="(L/km × Solar Baru) / Tonase per Unit"
                                                        showRumus={true}
                                                    />
                                                    {parseRibuan(form.adjustment) !== 0 && (
                                                        <ResultRow
                                                            label="Adjustment Tambahan"
                                                            value={formatRp(parseRibuan(form.adjustment))}
                                                            valueClass="text-orange-500"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* <ResultRow
                                                label="Net Adjustment"
                                                value={formatRp(hasil.adjustmentHarga)}
                                                valueClass={hasil.adjustmentHarga >= 0 ? 'text-green-600' : 'text-red-500'}
                                            /> */}

                                            {/* <div className="rounded-xl bg-[#0253a5]/5 p-4 border border-[#0253a5]/20"> */}
                                            <div className="rounded-xl">
                                                <p className="text-xs text-gray-500 mb-1">Harga Hauling Baru</p>
                                                <p className="text-2xl font-semibold text-[#0253a5]">
                                                    {formatRp(hasil.hargaHaulingBaru)}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Metode: {form.metode === 'share' ? 'Porsi Biaya BBM' : 'Konsumsi liter/km'}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {form.metode === 'share' ? 'Harga baru = Komponen non-BBM + Komponen BBM baru + adjustment' : 'Harga baru = Harga lama + Kenaikan biaya BBM (Biaya BBM baru - Biaya BBM lama) + adjustment'}
                                                </p>
                                            </div>

                                            {form.notesKhusus && (
                                                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                                                    <p className="text-xs font-medium text-yellow-700 mb-0.5">Notes</p>
                                                    <p className="text-sm text-yellow-800">{form.notesKhusus}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <MdCalculate className="h-12 w-12 text-gray-200 mb-3" />
                                            <p className="text-sm text-gray-400">
                                                Isi form dan klik <strong>Hitung Harga</strong> untuk melihat hasil.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Summary compare */}
                                {hasil && (() => {
                                    const solarLama = parseRibuan(form.hargaSolarLama);
                                    const solarBaru = parseRibuan(form.hargaSolarBaru);
                                    const haulingLama = parseRibuan(form.hargaHaulingLama);
                                    const haulingBaru = hasil.hargaHaulingBaru;
                                    const pctHauling = haulingLama ? ((haulingBaru - haulingLama) / haulingLama) * 100 : 0;

                                    const shift = parseDecimalInput(form.shift_per_hari.replace(',', '.'));
                                    const ritase = parseDecimalInput(form.ritase_per_shift.replace(',', '.'));
                                    const tonase = parseRibuan(form.tonasePerRitase);
                                    const jarak = parseRibuan(form.jarakHaul);
                                    const hasRevData = shift && ritase && tonase && jarak;
                                    const revLama = hasRevData ? shift * ritase * tonase * haulingLama * jarak : 0;
                                    const revBaru = hasRevData ? shift * ritase * tonase * haulingBaru * jarak : 0;
                                    const pctRev = revLama ? ((revBaru - revLama) / revLama) * 100 : 0;

                                    return (
                                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                                            <h3 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide">Summary Compare</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* BBM */}
                                                <div className="md:col-span-2 bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                                                    <p className="text-xs text-gray-500 mb-1">BBM (Solar)</p>
                                                    <p className={`text-lg font-bold mb-2 ${hasil.persenPerubahanSolar >= 0 ? 'text-orange-600' : 'text-red-500'}`}>
                                                        {formatPersen(hasil.persenPerubahanSolar)}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <Tooltip content="Harga Solar Baru" position="top">
                                                            <div>
                                                                <p className="text-gray-400">Baru</p>
                                                                <p className="font-semibold text-orange-700">{formatRp(solarBaru)}</p>
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip content="Harga Solar Lama" position="top">
                                                            <div>
                                                                <p className="text-gray-400">Lama</p>
                                                                <p className="font-semibold text-gray-600">{formatRp(solarLama)}</p>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                    <div className="bg-white/60 p-2 rounded border border-orange-100">
                                                        <p className="text-xs text-gray-400 mb-1">formula</p>
                                                        <p className="text-xs font-mono text-orange-800">
                                                            ({formatRp(solarBaru)} - {formatRp(solarLama)}) / {formatRp(solarLama)} × 100
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Hauling */}
                                                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                                                    <p className="text-xs text-gray-500 mb-1">Harga Hauling</p>
                                                    <p className={`text-lg font-bold mb-2 ${pctHauling >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                                        {formatPersen(pctHauling)}
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <Tooltip content="Harga Hauling Baru" position="top">
                                                            <div>
                                                                <p className="text-gray-400">Baru</p>
                                                                <p className="font-semibold text-blue-700">{formatRp(haulingBaru)}</p>
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip content="Harga Hauling Lama" position="top">
                                                            <div>
                                                                <p className="text-gray-400">Lama</p>
                                                                <p className="font-semibold text-gray-600">{formatRp(haulingLama)}</p>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                    <div className="bg-white/60 p-2 rounded border border-blue-100">
                                                        <p className="text-xs text-gray-400 mb-1">formula</p>
                                                        <p className="text-xs font-mono text-blue-800">
                                                            ({formatRp(haulingBaru)} - {formatRp(haulingLama)}) / {formatRp(haulingLama)} × 100
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Revenue */}
                                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 md:col-span-2 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Revenue Estimasi / Hari</p>
                                                            {hasRevData ? (
                                                                <p className={`text-lg font-bold ${pctRev >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                    {formatPersen(pctRev)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-gray-400 italic">Isi Shift, Ritase, Tonase & Jarak Haul untuk kalkulasi revenue</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {hasRevData && (
                                                        <>
                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <Tooltip content="Revenue Baru per hari" position="top">
                                                                    <div>
                                                                        <p className="text-gray-400">Baru</p>
                                                                        <p className="font-semibold text-emerald-700">{formatRp(revBaru)}</p>
                                                                    </div>
                                                                </Tooltip>
                                                                <Tooltip content="Revenue Lama per hari" position="top">
                                                                    <div>
                                                                        <p className="text-gray-400">Lama</p>
                                                                        <p className="font-semibold text-gray-600">{formatRp(revLama)}</p>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                            <div className="bg-white/60 p-2 rounded border border-emerald-100">
                                                                <p className="text-xs text-gray-400 mb-1">formula</p>
                                                                <p className="text-xs font-mono text-emerald-800">
                                                                    ({formatRp(revBaru)} - {formatRp(revLama)}) / {formatRp(revLama)} × 100
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Formula Info */}
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 hidden">
                                    <h3 className="mb-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Referensi Formula
                                    </h3>
                                    <div className="space-y-2 text-xs text-gray-500">
                                        <p><strong className="text-gray-600">Porsi Biaya BBM:</strong></p>
                                        <code className="block bg-white rounded px-2 py-1 border border-gray-200">
                                            Non-BBM = H.Lama × (1 − porsi)
                                        </code>
                                        <code className="block bg-white rounded px-2 py-1 border border-gray-200">
                                            BBM Baru = BBM Lama × (Solar Baru / Solar Lama)
                                        </code>
                                        <code className="block bg-white rounded px-2 py-1 border border-gray-200">
                                            H.Baru = Non-BBM + BBM Baru + Adj
                                        </code>
                                        <p className="mt-2"><strong className="text-gray-600">Konsumsi BBM Aktual:</strong></p>
                                        <code className="block bg-white rounded px-2 py-1 border border-gray-200">
                                            BBM Lama = (L/km × Solar Lama) / Tonase per Unit
                                        </code>
                                        <code className="block bg-white rounded px-2 py-1 border border-gray-200">
                                            BBM Baru = (L/km × Solar Baru) / Tonase per Unit
                                        </code>
                                        <code className="block bg-white rounded px-2 py-1 border border-gray-200">
                                            H.Baru = H.Lama + (BBM Baru − BBM Lama) + Adj
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-2">
            <dt className="text-gray-400 shrink-0">{label}</dt>
            <dd className="text-gray-700 text-right font-medium">{value}</dd>
        </div>
    );
}

function ResultRow({
    label,
    value,
    showRumus = false,
    rumus,
    valueClass = 'text-gray-800',
}: {
    label: string;
    value: string;
    rumus?: string;
    showRumus?: boolean;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0">
            <span className="text-sm text-gray-500">
                {label}
                {showRumus && <span className={`text-xs text-gray-500 mt-1 flex`}>{rumus}</span>}
            </span>
            <span className={`text-sm font-primary-bold ${valueClass}`}>{value}</span>
        </div>
    );
}
