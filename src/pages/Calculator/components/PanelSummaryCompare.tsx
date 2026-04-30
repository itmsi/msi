import { formatCurrency, parseDecimalInput } from '@/helpers/generalHelper';
import Tooltip from '@/components/ui/tooltip/Tooltip';
import { FormState, HasilKalkulasi } from '../types/calculator';
import { parseRibuan, formatPersen } from '../utils/kalkulasiHelper';

interface Props {
    form: FormState;
    hasil: HasilKalkulasi;
}

export default function PanelSummaryCompare({ form, hasil }: Props) {
    const solarLama = parseRibuan(form.hargaSolarLama);
    const solarBaru = parseRibuan(form.hargaSolarBaru);
    const haulingLama = parseRibuan(form.hargaHaulingLama);
    const haulingBaru = hasil.hargaHaulingBaru;
    const pctHauling = haulingLama ? ((haulingBaru - haulingLama) / haulingLama) * 100 : 0;

    const shift = parseDecimalInput(form.shift_per_hari.replace(',', '.'));
    const ritase = parseDecimalInput(form.ritase_per_shift.replace(',', '.'));
    const tonase = parseRibuan(form.tonasePerRitase);
    const jarak = parseRibuan(form.jarakHaul);
    const adaDataRevenue = !!(shift && ritase && tonase && jarak);

    const revLama = adaDataRevenue ? shift! * ritase! * tonase * haulingLama * jarak : 0;
    const revBaru = adaDataRevenue ? shift! * ritase! * tonase * haulingBaru * jarak : 0;
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
                    <div className="flex justify-between gap-2 text-xs">
                        <Tooltip content="Harga Solar Baru" position="top">
                            <div>
                                <p className="text-gray-400">Baru</p>
                                <p className="font-semibold text-orange-700">{formatCurrency(solarBaru)}</p>
                            </div>
                        </Tooltip>
                        <Tooltip content="Harga Solar Lama" position="top">
                            <div>
                                <p className="text-gray-400">Lama</p>
                                <p className="font-semibold text-gray-600">{formatCurrency(solarLama)}</p>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="bg-white/60 p-2 rounded border border-orange-100">
                        <p className="text-xs text-gray-400 mb-1">formula</p>
                        <p className="text-xs font-mono text-orange-800">
                            ({formatCurrency(solarBaru)} - {formatCurrency(solarLama)}) / {formatCurrency(solarLama)} × 100
                        </p>
                    </div>
                </div>

                {/* Hauling */}
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                    <p className="text-xs text-gray-500 mb-1">Harga Hauling</p>
                    <p className={`text-lg font-bold mb-2 ${pctHauling >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                        {formatPersen(pctHauling)}
                    </p>
                    <div className="flex justify-between gap-2 text-xs">
                        <Tooltip content="Harga Hauling Baru" position="top">
                            <div>
                                <p className="text-gray-400">Baru</p>
                                <p className="font-semibold text-blue-700">{formatCurrency(haulingBaru)}</p>
                            </div>
                        </Tooltip>
                        <Tooltip content="Harga Hauling Lama" position="top">
                            <div>
                                <p className="text-gray-400">Lama</p>
                                <p className="font-semibold text-gray-600">{formatCurrency(haulingLama)}</p>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="bg-white/60 p-2 rounded border border-blue-100">
                        <p className="text-xs text-gray-400 mb-1">formula</p>
                        <p className="text-xs font-mono text-blue-800">
                            ({formatCurrency(haulingBaru)} - {formatCurrency(haulingLama)}) / {formatCurrency(haulingLama)} × 100
                        </p>
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 md:col-span-2 space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Revenue Estimasi / Hari</p>
                        {adaDataRevenue ? (
                            <p className={`text-lg font-bold ${pctRev >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {formatPersen(pctRev)}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 italic">
                                Isi Shift, Ritase, Tonase & Jarak Haul untuk kalkulasi revenue
                            </p>
                        )}
                    </div>
                    {adaDataRevenue && (
                        <>
                            <div className="flex justify-between gap-2 text-xs">
                                <Tooltip content="Revenue Baru per hari" position="top">
                                    <div>
                                        <p className="text-gray-400">Baru</p>
                                        <p className="font-semibold text-emerald-700">{formatCurrency(revBaru)}</p>
                                    </div>
                                </Tooltip>
                                <Tooltip content="Revenue Lama per hari" position="top">
                                    <div>
                                        <p className="text-gray-400">Lama</p>
                                        <p className="font-semibold text-gray-600">{formatCurrency(revLama)}</p>
                                    </div>
                                </Tooltip>
                            </div>
                            <div className="bg-white/60 p-2 rounded border border-emerald-100">
                                <p className="text-xs text-gray-400 mb-1">formula</p>
                                <p className="text-xs font-mono text-emerald-800">
                                    ({formatCurrency(revBaru)} - {formatCurrency(revLama)}) / {formatCurrency(revLama)} × 100
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
