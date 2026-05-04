import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Alert from '@/components/ui/alert/Alert';
import { handleDecimalInput } from '@/helpers/generalHelper';
import { FormState, MetodeAdjustment } from '../types/calculator';

interface Props {
    form: FormState;
    onUpdate: (partial: Partial<FormState>) => void;
    onMetodeChange: (metode: MetodeAdjustment) => void;
}

export default function SeksiMetodePenyesuaian({ form, onUpdate, onMetodeChange }: Props) {
    function handleNumericInput(field: keyof FormState, e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/[^0-9.,]/g, '');
        onUpdate({ [field]: raw });
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-medium text-gray-800">Metode Penyesuaian</h2>

            <div className="mb-4 flex gap-3">
                {(['share', 'consumption'] as MetodeAdjustment[]).map(m => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => onMetodeChange(m)}
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

            {form.metode === 'share' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Alert variant="warning" title="Fuel Portion Method (Metode Porsi BBM)">
                            <p className="text-sm text-gray-500">
                                Metode ini menghitung kenaikan biaya hauling dengan melihat berapa besar porsi biaya BBM
                                dalam total biaya, lalu menyesuaikan kenaikan harga berdasarkan persentase kenaikan BBM.
                            </p>
                        </Alert>
                    </div>
                    <div>
                        <Label htmlFor="porsiBiayaBBM">Porsi Biaya BBM dalam Harga Lama (%)</Label>
                        <Input
                            id="porsiBiayaBBM"
                            type="text"
                            placeholder=""
                            value={form.porsiBiayaBBM}
                            onChange={e => handleDecimalInput(
                                e.target.value,
                                (val) => onUpdate({ porsiBiayaBBM: val }),
                                () => onUpdate({ porsiBiayaBBM: '' }),
                                true, 3, 2
                            )}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Alert variant="warning" title="Distance-Based Fuel Costing (Metode Konsumsi Aktual per Jarak)">
                            <p className="text-sm text-gray-500">
                                Metode ini menghitung biaya hauling berdasarkan konsumsi BBM aktual unit (liter/km),
                                kemudian dikalikan dengan jarak hauling dan dibagi dengan tonase unit, sehingga diperoleh
                                biaya BBM per ton secara nyata.
                            </p>
                        </Alert>
                    </div>
                    <div>
                        <Label htmlFor="fuel_consumption_metode">Fuel L/km</Label>
                        <Input
                            id="fuel_consumption_metode"
                            type="text"
                            placeholder=""
                            value={form.fuel_consumption}
                            onChange={e => handleDecimalInput(
                                e.target.value,
                                (val) => onUpdate({ fuel_consumption: val }),
                                () => onUpdate({ fuel_consumption: '' }),
                                true, 9, 4
                            )}
                        />
                    </div>
                    <div>
                        <Label htmlFor="jarakHaulMetode">Jarak Haul (km PP)</Label>
                        <Input
                            id="jarakHaulMetode"
                            type="text"
                            placeholder=""
                            value={form.jarakHaul}
                            onChange={e => handleNumericInput('jarakHaul', e)}
                        />
                    </div>
                    <p className="sm:col-span-2 mt-0 text-xs text-gray-400">
                        Biaya BBM/ton-km = (Fuel L/km × Harga Solar) / Tonase per Unit · H.Baru = H.Lama + ΔBiaya BBM + Adj
                    </p>
                </div>
            )}
        </div>
    );
}
