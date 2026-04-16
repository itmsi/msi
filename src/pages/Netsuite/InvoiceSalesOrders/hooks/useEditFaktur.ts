import { useState, useCallback, useEffect } from 'react';
import { Faktur, FakturDetail } from '../types/faktur';
import { FakturService } from '../services/fakturService';
import { useFakturReferenceSelect } from './useFakturReferenceSelect';
import toast from 'react-hot-toast';

export const useEditFaktur = (id?: string) => {
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState<Faktur>({
        details: [],
        jenis_faktur: 'Normal'
    });

    const kodeTransaksiSelect = useFakturReferenceSelect('Kode Transaksi', { 
        labelFormat: (opt) => `${opt.code} - ${opt.description}` 
    });
    const jenisIdPembeliSelect = useFakturReferenceSelect('Jenis ID Pembeli');
    const kodeNegaraSelect = useFakturReferenceSelect('Negara', { 
        labelFormat: (opt) => `${opt.code} - ${opt.description}` 
    });
    const barangJasaSelect = useFakturReferenceSelect('Barang/Jasa');
    const satuanUkurSelect = useFakturReferenceSelect('Satuan Ukur');

    const fetchFaktur = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await FakturService.getFakturById(id);
            const fetchedData = res.data;
                
            if (fetchedData) {
                // Format tanggal_faktur agar sesuai dengan <input type="date"> (YYYY-MM-DD)
                let formattedTanggal = fetchedData.tanggal_faktur;
                if (formattedTanggal && formattedTanggal.includes('T')) {
                    formattedTanggal = formattedTanggal.split('T')[0];
                }

                setFormData({
                    ...fetchedData,
                    tanggal_faktur: formattedTanggal,
                    details: Array.isArray(fetchedData.details) 
                        ? fetchedData.details.map((item: FakturDetail) => ({
                            ...item,
                            harga_satuan: item.harga_satuan ? Number(item.harga_satuan) : 0,
                            jumlah_barang_jasa: item.jumlah_barang_jasa ? Number(item.jumlah_barang_jasa) : 0,
                            total_diskon: item.total_diskon ? Number(item.total_diskon) : 0,
                            dpp: item.dpp ? Number(item.dpp) : 0,
                            dpp_nilai_lain: item.dpp_nilai_lain ? Number(item.dpp_nilai_lain) : 0,
                            tarif_ppn: item.tarif_ppn ? Number(item.tarif_ppn) : 0,
                            ppn: item.ppn ? Number(item.ppn) : 0,
                            tarif_ppnnbm: item.tarif_ppnnbm ? Number(item.tarif_ppnnbm) : 0,
                            ppnbm: item.ppnbm ? Number(item.ppnbm) : 0,
                        })) 
                        : []
                });
            } else {
                toast.error('Gagal mengambil data Faktur dari server');
            }
        } catch (error) {
            toast.error('Failed to load Faktur');
            console.error('Fetch Faktur error:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFaktur();
        kodeTransaksiSelect.initializeOptions();
        jenisIdPembeliSelect.initializeOptions();
        kodeNegaraSelect.initializeOptions();
        barangJasaSelect.initializeOptions();
        satuanUkurSelect.initializeOptions();
    }, [fetchFaktur]);

    // Label recovery after data is loaded
    useEffect(() => {
        if (formData.faktur_id) {
            // Header fields
            if (formData.kode_transaksi) kodeTransaksiSelect.loadOptionsByValues([formData.kode_transaksi]);
            if (formData.jenis_id_pembeli) jenisIdPembeliSelect.loadOptionsByValues([formData.jenis_id_pembeli]);
            if (formData.negara_pembeli) kodeNegaraSelect.loadOptionsByValues([formData.negara_pembeli]);
            
            // Detail fields (collect unique ones)
            const detailBarangJasa = Array.from(new Set(formData.details.map(d => d.barang_or_jasa).filter(Boolean)));
            const detailSatuan = Array.from(new Set(formData.details.map(d => d.nama_satuan_ukur).filter(Boolean)));
            
            if (detailBarangJasa.length > 0) barangJasaSelect.loadOptionsByValues(detailBarangJasa as string[]);
            if (detailSatuan.length > 0) satuanUkurSelect.loadOptionsByValues(detailSatuan as string[]);
        }
    }, [formData.faktur_id]); // Trigger when faktur is fully loaded

    const handleFieldChange = (field: keyof Faktur, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field changes
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleDetailChange = (index: number, field: keyof FakturDetail, value: string | number | null) => {
        setFormData(prev => {
            const newDetails = prev.details.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };

                    // Logic: kode_barang_jasa ikuti kode dari pilihan barang_or_jasa
                    if (field === 'barang_or_jasa') {
                        const selectedOption = barangJasaSelect.referenceOptions.find(opt => opt.value === value);
                        if (selectedOption && selectedOption.data) {
                            updatedItem.kode_barang_jasa = selectedOption.data.code;
                            updatedItem.nama_barang_or_jasa = selectedOption.data.description;
                        }
                    }

                    // Auto-calculate DPP and PPN when related fields change
                    if (['harga_satuan', 'jumlah_barang_jasa', 'total_diskon', 'tarif_ppn'].includes(field)) {
                        const price    = Number(field === 'harga_satuan'       ? value : updatedItem.harga_satuan)       || 0;
                        const qty      = Number(field === 'jumlah_barang_jasa' ? value : updatedItem.jumlah_barang_jasa) || 0;
                        const discount = Number(field === 'total_diskon'       ? value : updatedItem.total_diskon)       || 0;
                        const rate     = Number(field === 'tarif_ppn'          ? value : updatedItem.tarif_ppn)          || 0;

                        const dpp = Math.max(0, (price * qty) - discount);
                        const ppn = Math.round(dpp * rate / 100);

                        updatedItem.dpp = dpp;
                        updatedItem.ppn = ppn;
                    }

                    return updatedItem;
                }
                return item;
            });
            return { ...prev, details: newDetails };
        });
    };

    const handleAddDetail = () => {
        setFormData(prev => ({
            ...prev,
            details: [
                ...prev.details,
                { 
                    barang_or_jasa: '', kode_barang_jasa: '', nama_barang_or_jasa: '',
                    nama_satuan_ukur: '', harga_satuan: 0, jumlah_barang_jasa: 0,
                    total_diskon: 0, dpp: 0, dpp_nilai_lain: 0, tarif_ppn: 0, ppn: 0,
                    tarif_ppnnbm: 0, ppnbm: 0
                }
            ]
        }));
    };

    const handleRemoveDetail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        formData.details.forEach((item, index) => {
            if (!item.nama_barang_or_jasa) {
                newErrors[`detail_${index}_nama_barang_or_jasa`] = 'Nama item wajib diisi';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id) {
            toast.error('Parameter ID Faktur tidak Valid');
            return false;
        }
        
        if (!validateForm()) {
            toast.error('Mohon lengkapi bagian Details (Nama Item wajib diisi)');
            return false;
        }

        setSubmitLoading(true);
        try {
            const payloadToUpdate = { ...formData };
            // Pastikan field nomor_id_penjual tidak dikirim ke backend
            // @ts-ignore
            delete payloadToUpdate.nomor_id_penjual;

            const res = await FakturService.updateFakturById(id, payloadToUpdate);
            if (res) {
                toast.success('Faktur berhasil diperbarui');
                return true;
            } else {
                toast.error('Gagal memperbarui faktur');
                return false;
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem ketika menyimpan form');
            return false;
        } finally {
            setSubmitLoading(false);
        }
    };

    return {
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
    };
};
