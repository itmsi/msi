import { MdCalculate } from 'react-icons/md';
import { formatCurrency } from '@/helpers/generalHelper';
import { FormState, HasilKalkulasi } from '../types/calculator';
import { parseRibuan } from '../utils/kalkulasiHelper';

interface Props {
    form: FormState;
    hasil: HasilKalkulasi | null;
}

const ResultRow = ({
    label,
    value,
    rumus,
    showRumus = false,
    valueClass = 'text-gray-800',
}: {
    label: string;
    value: string;
    rumus?: string;
    showRumus?: boolean;
    valueClass?: string;
}) => {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0">
            <span className="text-sm text-gray-500">
                {label}
                {showRumus && <span className="text-xs text-gray-500 mt-1 flex">{rumus}</span>}
            </span>
            <span className={`text-sm font-primary-bold ${valueClass}`}>{value}</span>
        </div>
    );
};

export default function PanelHasilKalkulasi({ form, hasil }: Props) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide">Hasil Kalkulasi</h3>

            {hasil ? (
                <div className="space-y-4">
                    {form.metode === 'share' && (
                        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                            <p className="text-xs font-medium text-gray-500 mb-2">Breakdown Komponen</p>
                            <ResultRow
                                label="Komponen Non-BBM"
                                value={formatCurrency(hasil.komponenNonBBM!)}
                                rumus="Komponen Non-BBM = H.Lama × (1 − porsi)"
                                showRumus
                            />
                            <ResultRow
                                label="Komponen BBM Lama"
                                value={formatCurrency(hasil.komponenBBMLama!)}
                                rumus="Komponen BBM Lama = H.Lama × porsi"
                                showRumus
                            />
                            <ResultRow
                                label="Komponen BBM Baru"
                                value={formatCurrency(hasil.komponenBBMBaru!)}
                                rumus="Komponen BBM Baru = H.Lama × (Solar baru / Solar lama)"
                                showRumus
                            />
                            {parseRibuan(form.adjustment) !== 0 && (
                                <ResultRow
                                    label="Adjustment Tambahan"
                                    value={formatCurrency(parseRibuan(form.adjustment))}
                                    valueClass="text-orange-500"
                                />
                            )}
                        </div>
                    )}

                    {form.metode === 'consumption' && hasil.komponenBBMLama !== undefined && (
                        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                            <p className="text-xs font-medium text-gray-500 mb-2">Breakdown Biaya BBM / ton/km</p>
                            <ResultRow
                                label="Biaya BBM Lama"
                                value={formatCurrency(hasil.komponenBBMLama!)}
                                rumus="(L/km × Solar Lama) / Tonase per Unit"
                                showRumus
                            />
                            <ResultRow
                                label="Biaya BBM Baru"
                                value={formatCurrency(hasil.komponenBBMBaru!)}
                                rumus="(L/km × Solar Baru) / Tonase per Unit"
                                showRumus
                            />
                            {parseRibuan(form.adjustment) !== 0 && (
                                <ResultRow
                                    label="Adjustment Tambahan"
                                    value={formatCurrency(parseRibuan(form.adjustment))}
                                    valueClass="text-orange-500"
                                />
                            )}
                        </div>
                    )}

                    <div className="rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Harga Hauling Baru</p>
                        <p className="text-2xl font-semibold text-[#0253a5]">
                            {formatCurrency(hasil.hargaHaulingBaru)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            Metode: {form.metode === 'share' ? 'Porsi Biaya BBM' : 'Konsumsi liter/km'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {form.metode === 'share'
                                ? 'Harga baru = Komponen non-BBM + Komponen BBM baru + adjustment'
                                : 'Harga baru = Harga lama + Kenaikan biaya BBM (Biaya BBM baru - Biaya BBM lama) + adjustment'
                            }
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
    );
}
