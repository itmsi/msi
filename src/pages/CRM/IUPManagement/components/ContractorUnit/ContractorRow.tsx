import { ContractorForm, ContractorErrors } from '@/pages/CRM/IUPManagement/types/iupmanagement';
import IupContractorSelect from '@/components/form/select/IupContractorSelect';
import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@/components/ui/button/Button';
import { LuTrash2 } from 'react-icons/lu';

interface ContractorRowProps {
    index: number;
    item: ContractorForm;
    error?: ContractorErrors;
    disableRemove: boolean;
    onChange: (index: number, field: keyof ContractorForm, value: string) => void;
    onRemove: (index: number) => void;
}
interface ContractorSelectOption {
    value: string;
    label: string;
    customer_name?: string;
}
export default function ContractorRow({
    index,
    item,
    error,
    disableRemove,
    onChange,
    onRemove,
}: ContractorRowProps) {

    const { id } = useParams<{ id: string }>();
    // Memoized values to prevent unnecessary re-renders

    const iupValue = useMemo(() => {
        return id ? {
            value: id,
            label: ''
        } : null;
    }, [id, index]);
    const contractorValue = useMemo(() => {
        return item.id && item.name ? {
            value: item.id,
            label: item.name
        } : null;
    }, [item.id, item.name]);


    const handleContractorChange = useCallback((contractor: ContractorSelectOption | null) => {
        if (contractor) {
            onChange(index, 'id', contractor.value);
            onChange(index, 'name', contractor.customer_name || contractor.label || '');
        } else {
            onChange(index, 'id', '');
            onChange(index, 'name', '');
        }
    }, [onChange]);
    return (
        <div className="px-5 py-4">
            
            <div className="flex justify-between items-center mb-4">
                <span className="flex items-center justify-center w-6 h-6 text-xs font-primary-bold text-gray-600">
                    #{index + 1}
                </span>
                <Button
                    variant="transparent"
                    size="sm"
                    onClick={() => onRemove(index)}
                    disabled={disableRemove}
                    className="text-gray-400 hover:text-red-500 p-1 h-auto"
                >
                    <LuTrash2 size={18} />
                </Button>
            </div>
            <div className="flex gap-2 items-start mb-2 ">
                <div className="flex-1">
                {/* IUP Selection and Contractor - Reusable Component */}
                    <IupContractorSelect
                        iupValue={iupValue}
                        contractorValue={contractorValue}
                        iupLabel="IUP Selection"
                        iupRequired={true}
                        contractorLabel="Contractor"
                        contractorRequired={true}
                        contractorError={error?.name}
                        onContractorChange={handleContractorChange}
                        layout="horizontal"
                        gridCols="grid-cols-1 md:grid-cols-1"
                        className="md:col-span-1"
                        hideIup={true}
                    />
                </div>
                {/* <div className="flex-1">
                    <label className="block text-sm mb-1">Nama Kontraktor</label>
                    <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onChange(index, 'name', e.target.value)}
                        className={`input input-bordered w-full ${error?.name ? 'border-red-500' : ''}`}
                    />
                    {error?.name && (
                        <p className="text-red-500 text-xs mt-1">{error.name}</p>
                    )}
                </div> */}
                {/* <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={disableRemove}
                    className="btn btn-sm btn-error mt-6"
                >
                    Hapus
                </button> */}
            </div>
        </div>
    );
}