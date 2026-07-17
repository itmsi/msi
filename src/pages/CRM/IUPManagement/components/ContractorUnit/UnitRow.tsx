import { BrandUnitForm, BrandUnitErrors } from '../../types/iupmanagement';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { handleKeyPress } from '@/helpers/generalHelper';
import { LuTrash2 } from 'react-icons/lu';

interface UnitRowProps {
    index: number;
    item: BrandUnitForm;
    error?: BrandUnitErrors;
    disableRemove: boolean;
    onChange: (index: number, field: keyof BrandUnitForm, value: string | number) => void;
    onRemove: (index: number) => void;
}

export default function UnitRow({
    index,
    item,
    error,
    disableRemove,
    onChange,
    onRemove,
}: UnitRowProps) {
    return (
        <div className={`relative px-5 py-4 transition-all duration-200 ${
            error ? 'border-red-300 bg-red-50' : 'hover:bg-[#dfe8f2]/20'
        }`}>
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
            <div className="flex gap-4 items-end">
                <div className="flex-1 min-h-[90px]">
                    <Label htmlFor={`name-${index}`} className="block text-sm mb-1">Brand Unit</Label>
                    <Input
                        type="text"
                        value={item.name}
                        onChange={(e) => onChange(index, 'name', e.target.value)}
                        className={`input input-bordered w-full ${error?.name ? 'border-red-500' : ''}`}
                    />
                    {error?.name && (
                        <p className="text-red-500 text-xs mt-1">{error.name}</p>
                    )}
                </div>
                <div className="w-82 min-h-[90px]">
                    <Label htmlFor={`qty-${index}`} className="block text-sm mb-1">Qty</Label>
                    <Input
                        value={item.qty}
                        onChange={(e) => onChange(index, 'qty', Number(e.target.value))}
                        onKeyPress={handleKeyPress}
                        className={`input input-bordered w-full ${error?.qty ? 'border-red-500' : ''}`}
                    />
                    {error?.qty && (
                        <p className="text-red-500 text-xs mt-1">{error.qty}</p>
                    )}
                </div>
            </div>
        </div>
    );
}