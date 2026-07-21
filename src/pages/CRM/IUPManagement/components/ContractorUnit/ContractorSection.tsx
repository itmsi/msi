import { LuPlus } from 'react-icons/lu';
import ContractorRow from './ContractorRow';
import { ContractorErrors, ContractorForm } from '../../types/iupmanagement';

interface ContractorSectionProps {
    contractors: ContractorForm[];
    contractorErrors: Record<number, ContractorErrors>;
    addContractor: () => void;
    removeContractor: (index: number) => void;
    updateContractor: (index: number, field: keyof ContractorForm, value: string) => void;
}

export default function ContractorSection({
    contractors,
    contractorErrors,
    addContractor,
    removeContractor,
    updateContractor,
}: ContractorSectionProps) {
    return (
        <div className="w-full rounded-2xl border border-slate-300 bg-white">
            <div className="px-5 py-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-primary-bold text-md tracking-wide">Contractor</h2>
                    </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 leading-relaxed">
                    Daftar kontraktor yang terlibat. Setiap kontraktor harus memiliki nama yang valid.
                </p>
            </div>

            {(!contractors || contractors.length === 0) ? (
                <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    No contractor data available. Click &ldquo;Add Contractor&rdquo; to add.
                </div>
            ) : (
                <div className="divide-slate-300 divide-y">
                    {contractors.map((item, index) => (
                        <ContractorRow
                            key={index}
                            index={index}
                            item={item}
                            error={contractorErrors[index]}
                            disableRemove={contractors.length === 1}
                            onChange={updateContractor}
                            onRemove={removeContractor}
                        />
                    ))}
                </div>
            )}

            <div className="px-5 py-4 border-t bg-green-100 rounded-b-2xl">
                <button
                    type="button"
                    onClick={addContractor}
                    className="flex items-center gap-1.5 text-sm font-medium"
                >
                    <LuPlus size={16} className="text-primary" />
                    Tambah Kontraktor
                </button>
            </div>
        </div>
    );
}