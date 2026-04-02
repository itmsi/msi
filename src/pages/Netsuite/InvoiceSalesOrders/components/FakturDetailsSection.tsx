import Button from '@/components/ui/button/Button';
import { MdAdd } from 'react-icons/md';
import { FakturDetail } from '../types/faktur';
import FakturDetailsCard from './FakturDetailsCard';
import { useFakturReferenceSelect } from '../hooks/useFakturReferenceSelect';

interface FakturDetailsSectionProps {
    details: FakturDetail[];
    errors: Record<string, string>;
    onAddDetail: () => void;
    onRemoveDetail: (index: number) => void;
    onChangeDetail: (index: number, field: keyof FakturDetail, value: string | number | null) => void;
    barangJasaSelect: ReturnType<typeof useFakturReferenceSelect>; 
    satuanUkurSelect: ReturnType<typeof useFakturReferenceSelect>;
}

export default function FakturDetailsSection({ 
    details, 
    errors, 
    onAddDetail, 
    onRemoveDetail, 
    onChangeDetail,
    barangJasaSelect,
    satuanUkurSelect
}: FakturDetailsSectionProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                    <h2 className="text-lg font-primary-bold font-medium text-gray-900">
                        Details
                    </h2>
                    <p className="text-sm text-gray-500">Daftar detail untuk faktur ini</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddDetail}
                    className="flex items-center justify-center gap-2"
                    size="sm"
                >
                    <MdAdd className="w-5 h-5" />
                    Tambah Baris Detail
                </Button>
            </div>

            {details.length === 0 ? (
                <div className="text-gray-500 text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
                    Belum ada baris detail. Silahkan klik tombol "Tambah Baris Detail".
                </div>
            ) : (
                <div className="space-y-4">
                    {details.map((detail, index) => (
                        <FakturDetailsCard
                            key={`detail-${index}`}
                            detail={detail}
                            index={index}
                            errors={errors}
                            onChange={(field, value) => onChangeDetail(index, field, value)}
                            onRemove={() => onRemoveDetail(index)}
                            barangJasaSelect={barangJasaSelect}
                            satuanUkurSelect={satuanUkurSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
