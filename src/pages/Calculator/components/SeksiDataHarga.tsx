import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { FormState } from '../types/calculator';

interface Props {
    form: FormState;
    onUpdate: (partial: Partial<FormState>) => void;
}

export default function SeksiDataHarga({ form, onUpdate }: Props) {
    function handleNumericInput(field: keyof FormState, e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/[^0-9.,]/g, '');
        onUpdate({ [field]: raw });
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-medium text-gray-800">Data Harga</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Label htmlFor="hargaHaulingLama">
                        Harga Hauling Lama{' '}
                        <span className="text-xs text-gray-500 mt-1 inline-flex">(IDR / ton / km)</span>{' '}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="hargaHaulingLama"
                        type="text"
                        placeholder="0"
                        value={form.hargaHaulingLama}
                        onChange={e => handleNumericInput('hargaHaulingLama', e)}
                    />
                </div>

                <div>
                    <Label htmlFor="hargaSolarLama">
                        Harga Solar Lama{' '}
                        <span className="text-xs text-gray-500 mt-1 inline-flex">(IDR / liter)</span>{' '}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="hargaSolarLama"
                        type="text"
                        placeholder="0"
                        value={form.hargaSolarLama}
                        onChange={e => handleNumericInput('hargaSolarLama', e)}
                    />
                </div>

                <div>
                    <Label htmlFor="hargaSolarBaru">
                        Harga Solar Baru <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="hargaSolarBaru"
                        type="text"
                        placeholder="0"
                        value={form.hargaSolarBaru}
                        onChange={e => handleNumericInput('hargaSolarBaru', e)}
                    />
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="adjustment">Adjustment Tambahan</Label>
                    <Input
                        id="adjustment"
                        type="text"
                        placeholder=""
                        value={form.adjustment}
                        onChange={e => handleNumericInput('adjustment', e)}
                    />
                </div>
            </div>
        </div>
    );
}
