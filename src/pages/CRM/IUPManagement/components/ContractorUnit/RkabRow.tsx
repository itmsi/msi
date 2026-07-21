import { RkabErrors, RkabForm } from "../../types/iupmanagement";
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { handleDecimalInput, handleKeyPress } from "@/helpers/generalHelper";
import { LuTrash2 } from "react-icons/lu";

interface RkabRowProps {
    index: number;
    item: RkabForm;
    error?: RkabErrors;
    disableRemove: boolean;
    onChange: (index: number, field: keyof RkabForm, value: string | number) => void;
    onRemove: (index: number) => void;
}

export default function RkabRow({
    index,
    item,
    error,
    disableRemove,
    onChange,
    onRemove,
}: RkabRowProps) {
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
                    <Label htmlFor={`year-${index}`} className="block text-sm mb-1">Year</Label>
                    <Input
                        id={`year-${index}`}
                        placeholder="YYYY"
                        maxLength={4}
                        value={item.year}
                        onChange={(e) => onChange(index, 'year', Number(e.target.value))}
                        onKeyPress={handleKeyPress}
                        className={`input input-bordered w-full ${error?.year ? 'border-red-500' : ''}`}
                    />
                    {error?.year && (
                        <p className="text-red-500 text-xs mt-1">{error.year}</p>
                    )}
                </div>
                <div className="flex-1 min-h-[90px]">
                    <Label htmlFor={`currentProduction-${index}`} className="block text-sm mb-1">Current Production</Label>
                    <Input
                        id={`currentProduction-${index}`}
                        placeholder="0"
                        value={item.currentProduction}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            
                            handleDecimalInput(
                                rawValue,
                                (validValue) => onChange(index, 'currentProduction', validValue),
                                () => onChange(index, 'currentProduction', 0),
                                true,
                                9, // maxIntegerDigits
                                4 // maxDecimalDigits
                            );
                        }}
                        className={`input input-bordered w-full ${error?.currentProduction ? 'border-red-500' : ''}`}
                    />
                    {error?.currentProduction && (
                        <p className="text-red-500 text-xs mt-1">{error.currentProduction}</p>
                    )}
                </div>
                <div className="flex-1 min-h-[90px]">
                    <Label htmlFor={`targetProduction-${index}`} className="block text-sm mb-1">Production Target</Label>
                    <Input
                        id={`targetProduction-${index}`}
                        placeholder="0"
                        value={item.targetProduction}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            
                            handleDecimalInput(
                                rawValue,
                                (validValue) => onChange(index, 'targetProduction', validValue),
                                () => onChange(index, 'targetProduction', 0),
                                true,
                                9, // maxIntegerDigits
                                4 // maxDecimalDigits
                            );
                        }}
                        className={`input input-bordered w-full ${error?.targetProduction ? 'border-red-500' : ''}`}
                    />
                    {error?.targetProduction && (
                        <p className="text-red-500 text-xs mt-1">{error.targetProduction}</p>
                    )}
                </div>
            </div>
        </div>
    );
}