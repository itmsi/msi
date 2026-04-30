import { format } from 'date-fns';
import { FormState } from '../types/calculator';
import { PERIODE_OPTIONS } from '../utils/kalkulasiHelper';

interface Props {
    form: FormState;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-2">
        <dt className="text-gray-400 shrink-0">{label}</dt>
        <dd className="text-gray-700 text-right font-medium">{value}</dd>
    </div>
);

export default function PanelRingkasan({ form }: Props) {
    const adaRingkasan = form.iupName || form.contractorName || form.effectiveDate;
    if (!adaRingkasan) return null;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">Ringkasan</h3>
            <dl className="space-y-2 text-sm">
                {form.iupName && <InfoRow label="IUP" value={form.iupName} />}
                {form.contractorName && <InfoRow label="Contractor" value={form.contractorName} />}
                {form.periodeHarga && (
                    <InfoRow
                        label="Periode"
                        value={PERIODE_OPTIONS.find(o => o.value === form.periodeHarga)?.label ?? ''}
                    />
                )}
                {form.effectiveDate && (
                    <InfoRow label="Efektif" value={format(form.effectiveDate, 'dd/MM/yyyy')} />
                )}
            </dl>
        </div>
    );
}
