import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSave, MdFileDownload } from 'react-icons/md';
import { generateFakturXML } from './utils/fakturExportUtils';
import Button from '@/components/ui/button/Button';
import PageMeta from '@/components/common/PageMeta';
import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import { useEditFaktur } from './hooks/useEditFaktur';
import FakturDetailsSection from './components/FakturDetailsSection';

export default function EditFaktur() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        formData,
        loading,
        submitLoading,
        errors,
        handleFieldChange,
        handleDetailChange,
        handleAddDetail,
        handleRemoveDetail,
        handleSubmit,
        kodeTransaksiSelect,
        jenisIdPembeliSelect,
        kodeNegaraSelect,
        barangJasaSelect,
        satuanUkurSelect
    } = useEditFaktur(id);

    const onSubmit = async (e: React.FormEvent) => {
        const success = await handleSubmit(e);
        if (success) {
            navigate('/netsuite/invoice-sales-order');
        }
    };

    const summaryTotalQty   = formData.details.reduce((s, d) => s + (Number(d.jumlah_barang_jasa) || 0), 0);
    const summarySubtotal   = formData.details.reduce((s, d) => s + (Number(d.dpp)               || 0), 0);
    const summaryTax        = formData.details.reduce((s, d) => s + (Number(d.ppn)               || 0), 0);
    const summaryGrandTotal = summarySubtotal + summaryTax;

    const handleExportXML = () => {
        try {
            const xmlContent = generateFakturXML([{ faktur: formData, row: {} }]);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `faktur_edit_${id || 'new'}.xml`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export XML failed:', error);
        }
    };

    const renderInput = (
        field: keyof import('./types/faktur').Faktur, 
        label: string, 
        type: string = 'text', 
        required: boolean = false,
        placeholder?: string
    ) => {
        return (
            <div>
                <Label htmlFor={`faktur-${field}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <InputField
                    id={`faktur-${String(field)}`}
                    type={type}
                    value={(formData[field] as string | number | null) || ''}
                    onChange={(e) => handleFieldChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                    className={errors[String(field)] ? 'border-red-500' : ''}
                    placeholder={placeholder}
                    disabled={loading || submitLoading}
                />
                {errors[String(field)] && <span className="text-red-500 text-xs mt-1 block">{errors[String(field)]}</span>}
            </div>
        );
    };

    return (
        <>
            <PageMeta
                title="Edit Faktur Pajak - Motor Sights International"
                description="Edit Faktur Pajak data"
                image="/motor-sights-international.png"
            />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/netsuite/invoice-sales-order')}
                                className="border-gray-200"
                            >
                                <MdArrowBack size={20} />
                            </Button>
                            <div>
                                <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                    Edit Faktur Pajak
                                </h3>
                            </div>
                        </div>

                        {!loading && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleExportXML}
                                className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                            >
                                <MdFileDownload size={20} />
                                Export XML
                            </Button>
                        )}
                    </div>
                </div>

                <form onSubmit={onSubmit}>
                    {/* Header Fields Section */}
                    <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                        <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-4 border-b border-gray-100 pb-3">Informasi Utama</h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {renderInput('tanggal_faktur', 'Tanggal Faktur', 'date', true)}
                                
                                <div>
                                    <Label>Jenis Faktur</Label>
                                    <InputField
                                        type="text"
                                        value="Normal"
                                        disabled={true}
                                        className="bg-gray-50 bg-opacity-50"
                                    />
                                </div>

                                <div>
                                    <Label>Kode Transaksi</Label>
                                    <CustomAsyncSelect
                                        defaultOptions={kodeTransaksiSelect.referenceOptions}
                                        value={kodeTransaksiSelect.referenceOptions.find(o => o.value === formData.kode_transaksi) || null}
                                        onChange={(val) => handleFieldChange('kode_transaksi', val?.value || '')}
                                        onInputChange={kodeTransaksiSelect.handleInputChange}
                                        onMenuScrollToBottom={kodeTransaksiSelect.handleMenuScrollToBottom}
                                        isLoading={kodeTransaksiSelect.pagination.loading}
                                        placeholder="Pilih Kode Transaksi"
                                        isSearchable={true}
                                    />
                                </div>

                                {renderInput('keterangan_tambahan', 'Keterangan Tambahan')}
                                {renderInput('dokumen_pendukung', 'Dokumen Pendukung')}
                                {renderInput('referensi', 'Referensi')}
                                {renderInput('cap_fasilitas', 'Cap Fasilitas')}
                            </div>
                        )}
                    </div>
                    
                    {/* Penjual & Pembeli Section */}
                    <div className="space-y-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-4 border-b border-gray-100 pb-3">Data Penjual</h2>
                            <div className="space-y-4">
                                {renderInput('id_tku_Penjual', 'ID TKU Penjual')}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-4 border-b border-gray-100 pb-3">Data Pembeli</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {renderInput('npwp_or_nik_pembeli', 'NPWP / NIK Pembeli')}
                                    <div>
                                        <Label>Jenis ID Pembeli</Label>
                                        <CustomAsyncSelect
                                            defaultOptions={jenisIdPembeliSelect.referenceOptions}
                                            value={jenisIdPembeliSelect.referenceOptions.find(o => o.value === formData.jenis_id_pembeli) || null}
                                            onChange={(val) => handleFieldChange('jenis_id_pembeli', val?.value || '')}
                                            onInputChange={jenisIdPembeliSelect.handleInputChange}
                                            onMenuScrollToBottom={jenisIdPembeliSelect.handleMenuScrollToBottom}
                                            isLoading={jenisIdPembeliSelect.pagination.loading}
                                            placeholder="Pilih Jenis ID"
                                        />
                                    </div>
                                </div>
                                {renderInput('nama_pembeli', 'Nama Pembeli')}
                                {renderInput('nomor_dokumen_pembeli', 'No. Dokumen Pembeli')}
                                {renderInput('alamat_pembeli', 'Alamat Pembeli')}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Negara</Label>
                                        <CustomAsyncSelect
                                            defaultOptions={kodeNegaraSelect.referenceOptions}
                                            value={kodeNegaraSelect.referenceOptions.find(o => o.value === formData.negara_pembeli) || null}
                                            onChange={(val) => handleFieldChange('negara_pembeli', val?.value || '')}
                                            onInputChange={kodeNegaraSelect.handleInputChange}
                                            onMenuScrollToBottom={kodeNegaraSelect.handleMenuScrollToBottom}
                                            isLoading={kodeNegaraSelect.pagination.loading}
                                            placeholder="Pilih Negara"
                                        />
                                    </div>
                                    {renderInput('email_pembeli', 'Email', 'email')}
                                </div>
                                {renderInput('id_tku_pembeli', 'ID TKU Pembeli')}
                            </div>
                        </div>
                    </div>

                    {/* Details Dynamic Array Section */}
                    <FakturDetailsSection
                        details={formData.details}
                        errors={errors}
                        onAddDetail={handleAddDetail}
                        onRemoveDetail={handleRemoveDetail}
                        onChangeDetail={handleDetailChange}
                        barangJasaSelect={barangJasaSelect}
                        satuanUkurSelect={satuanUkurSelect}
                        summaryTotalQty={summaryTotalQty}
                        summarySubtotal={summarySubtotal}
                        summaryTax={summaryTax}
                        summaryGrandTotal={summaryGrandTotal}
                    />

                    {/* Submit footer */}
                    <div className="bg-white rounded-lg shadow-sm p-6 flex justify-end gap-3 bottom-0 z-10 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/netsuite/invoice-sales-order')}
                            disabled={submitLoading || loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitLoading || loading}
                            className="w-32 flex items-center justify-center gap-2"
                        >
                            {submitLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <MdSave /> Simpan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
