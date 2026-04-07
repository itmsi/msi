import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { MdDelete } from 'react-icons/md';
import { FakturDetail } from '../types/faktur';
import { useFakturReferenceSelect } from '../hooks/useFakturReferenceSelect';

interface FakturDetailsCardProps {
    detail: FakturDetail;
    index: number;
    errors: Record<string, string>;
    onChange: (field: keyof FakturDetail, value: string | number | null) => void;
    onRemove: () => void;
    barangJasaSelect: ReturnType<typeof useFakturReferenceSelect>;
    satuanUkurSelect: ReturnType<typeof useFakturReferenceSelect>;
}

export default function FakturDetailsCard({ 
    detail, 
    index, 
    errors, 
    onChange, 
    onRemove,   
    barangJasaSelect,
    satuanUkurSelect
}: FakturDetailsCardProps) {
    const errorPrefix = `detail_${index}_`;

    return (
        <div className="border border-gray-200 rounded-lg p-5 mb-4 shadow-sm bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Detail Item #{index + 1}</h4>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                    <MdDelete size={18} className="mr-1" /> Remove
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                    <Label htmlFor={`${errorPrefix}barang_or_jasa`}>Barang/Jasa</Label>
                    <CustomAsyncSelect
                        defaultOptions={barangJasaSelect.referenceOptions}
                        value={barangJasaSelect.referenceOptions.find(o => o.value === detail.barang_or_jasa) || null}
                        onChange={(val) => onChange('barang_or_jasa', val?.value || '')}
                        onInputChange={barangJasaSelect.handleInputChange}
                        onMenuScrollToBottom={barangJasaSelect.handleMenuScrollToBottom}
                        isLoading={barangJasaSelect.pagination.loading}
                        placeholder="Pilih Barang/Jasa"
                    />
                </div>
                <div>
                    <Label htmlFor={`${errorPrefix}kode_barang_jasa`}>Kode Produk</Label>
                    <InputField
                        id={`${errorPrefix}kode_barang_jasa`}
                        type="text"
                        value={detail.kode_barang_jasa || ''}
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor={`${errorPrefix}nama_barang_or_jasa`}>Nama Item <span className="text-red-500">*</span></Label>
                    <InputField
                        id={`${errorPrefix}nama_barang_or_jasa`}
                        type="text"
                        value={detail.nama_barang_or_jasa || ''}
                        onChange={(e) => onChange('nama_barang_or_jasa', e.target.value)}
                        className={errors[`${errorPrefix}nama_barang_or_jasa`] ? 'border-red-500' : ''}
                    />
                    {errors[`${errorPrefix}nama_barang_or_jasa`] && <span className="text-red-500 text-xs mt-1 block">{errors[`${errorPrefix}nama_barang_or_jasa`]}</span>}
                </div>

                <div>
                    <Label htmlFor={`${errorPrefix}nama_satuan_ukur`}>Satuan Ukur</Label>
                    <CustomAsyncSelect
                        defaultOptions={satuanUkurSelect.referenceOptions}
                        value={satuanUkurSelect.referenceOptions.find(o => o.value === detail.nama_satuan_ukur) || null}
                        onChange={(val) => onChange('nama_satuan_ukur', val?.value || '')}
                        onInputChange={satuanUkurSelect.handleInputChange}
                        onMenuScrollToBottom={satuanUkurSelect.handleMenuScrollToBottom}
                        isLoading={satuanUkurSelect.pagination.loading}
                        placeholder="Pilih Satuan"
                    />
                </div>
                <div>
                    <Label htmlFor={`${errorPrefix}jumlah_barang_jasa`}>Jumlah Qty</Label>
                    <InputField
                        id={`${errorPrefix}jumlah_barang_jasa`}
                        type="number"
                        value={detail.jumlah_barang_jasa || ''}
                        onChange={(e) => onChange('jumlah_barang_jasa', Number(e.target.value))}
                    />
                </div>
                <div>
                    <Label htmlFor={`${errorPrefix}harga_satuan`}>Harga Satuan</Label>
                    <InputField
                        id={`${errorPrefix}harga_satuan`}
                        type="number"
                        value={detail.harga_satuan || ''}
                        onChange={(e) => onChange('harga_satuan', Number(e.target.value))}
                    />
                </div>
                <div>
                    <Label htmlFor={`${errorPrefix}total_diskon`}>Total Diskon</Label>
                    <InputField
                        id={`${errorPrefix}total_diskon`}
                        type="number"
                        value={detail.total_diskon || ''}
                        onChange={(e) => onChange('total_diskon', Number(e.target.value))}
                    />
                </div>

                <div>
                    <Label htmlFor={`${errorPrefix}dpp`}>DPP</Label>
                    <InputField
                        id={`${errorPrefix}dpp`}
                        type="number"
                        value={detail.dpp || ''}
                        onChange={(e) => onChange('dpp', Number(e.target.value))}
                    />
                </div>
                <div>
                    <Label htmlFor={`${errorPrefix}tarif_ppn`}>Tarif PPN (%)</Label>
                    <InputField
                        id={`${errorPrefix}tarif_ppn`}
                        type="number"
                        value={detail.tarif_ppn || ''}
                        onChange={(e) => onChange('tarif_ppn', Number(e.target.value))}
                    />
                </div>
                <div>
                    <Label htmlFor={`${errorPrefix}ppn`}>Nilai PPN</Label>
                    <InputField
                        id={`${errorPrefix}ppn`}
                        type="number"
                        value={detail.ppn || ''}
                        onChange={(e) => onChange('ppn', Number(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}
