import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { QuotationFormData, QuotationFormItem, QuotationItem, MasterDataFormFieldItems } from '../types/quotation';
import { QuotationService } from '../services/quotationService';

import { convertDateToTanggal } from '@/helpers/generalHelper';

const safeNumber = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
};

const calcLineAmounts = (line: QuotationItem) => {
    const val_rate = line.rate != null ? Number(line.rate) : 0;
    const quantity = line.quantity ?? line.quantity ?? 0;
    const rate = line.rate ?? val_rate;

    const amount = line.amount != null ? Number(line.amount) : rate * quantity;

    const taxRate = line.taxrate != null ? Number(line.taxrate) : (() => {
        if (line.taxcode_name) {
            const match = line.taxcode_name.match(/([\d.]+)/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    })();
    const needsCalcTax = (line.taxamount == null || line.taxamount === 0) && taxRate > 0;
    const tax_amount = needsCalcTax ? Math.round((amount * taxRate) / 100) : (line.taxamount ?? 0);
    const needsCalcGross = line.grossamt == null || line.grossamt === 0;
    const gross_amount = needsCalcGross ? Math.round(amount + tax_amount) : (line.grossamt ?? 0);

    return { quantity, rate, amount, tax_amount, gross_amount };
};

export const useQuotationEdit = (id: string | undefined) => {
    const navigate = useNavigate();
    const { paramId } = useParams<{ paramId: string }>();
    const profileSSO = getProfile() as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [quoInternalId, setQuoInternalId] = useState<string | number | null>(null);
    const [syncInfo, setSyncInfo] = useState<any>(null);
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [formData, setFormData] = useState<QuotationFormData>({
        customform: 104,
        title: '',
        subsidiary: null,
        subsidiary_name: '',
        entity: null,
        entity_name: '',
        trandate: '',
        duedate: null,
        expectedclosedate: null,
        orderstatus: 'A',
        status_name: '',
        otherrefnum: '',
        memo: '',
        currency: 1,
        currency_name: '',
        terms: null,
        terms_name: '',
        department: null,
        department_name: '',
        class: null,
        class_name: '',
        location: null,
        location_name: '',
        probability: null,
        forecasttype: null,
        salesrep: '',
        salesrep_name: '',
        opportunity: '',
        opportunity_name: '',
        partner: '',
        partner_name: '',
        custbody_msi_bank_payment_so: [],
        custbody_msi_bank_payment_so_name: [],
        custbody_cseg_cn_cfi: null,
        custbody_me_approval_status: 0,
        custbody_msi_createdby_api: '',
        custbody_msi_quotation_no_iec: '',
        total_amount: 0,
        items: [],
    });
    const [tranid, setTranid] = useState<string>('');
    const [statusName, setStatusName] = useState<string>('');
    const [messageError, setMessageError] = useState<string>('');

    const loadDetail = async () => {
        if (!id) return;
        try {
            setLoadingDetail(true);
            const response = await QuotationService.getQuotationById(id);
            if (response.success && response.data) {
                if (response.sync_info) {
                    setSyncInfo(response.sync_info);
                }
                const quo = response.data as any;

                setQuoInternalId(quo.netsuite_id || quo.id || paramId);
                setTranid(quo.tranid || '');
                setStatusName(quo.status_proccess || '');
                setMessageError(quo.status_proccess_message || '');

                const formatApiDate = (dateStr: string | null | undefined) => {
                    if (!dateStr) return null;
                    if (dateStr.includes('/')) return dateStr;
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) return convertDateToTanggal(date);
                    return dateStr;
                };

                setFormData(prev => ({
                    ...prev,
                    title: quo.title || '',
                    subsidiary: safeNumber(quo.subsidiary) || prev.subsidiary,
                    subsidiary_name: quo.subsidiary_name || '',
                    entity: safeNumber(quo.customer_id),
                    entity_name: quo.customer_name || '',
                    trandate: formatApiDate(quo?.tran_date) || '',
                    duedate: formatApiDate(quo.duedate) || null,
                    orderstatus: quo.entitystatus || 'A',
                    status_name: quo.entitystatus_name || '',
                    otherrefnum: quo.otherrefnum || '',
                    memo: quo.memo || '',
                    currency: safeNumber(quo.currency) || prev.currency,
                    currency_name: quo.currency_name || '',
                    terms: Number(quo.terms) || null,
                    terms_name: quo.terms_name || '',
                    department: safeNumber(quo.department),
                    department_name: quo.department_name || '',
                    class: safeNumber(quo.class_id),
                    class_name: quo.class_name || '',
                    location: safeNumber(quo.location),
                    location_name: quo.location_name || '',
                    probability: safeNumber(quo.probability),
                    forecasttype: safeNumber(quo.forecasttype),
                    salesrep: quo.salesrep || '',
                    salesrep_name: quo.salesrep_name || '',
                    opportunity: quo.opportunity || '',
                    opportunity_name: quo.opportunity_name || '',
                    partner: quo.partner || '',
                    partner_name: quo.partner_name || '',
                    custbody_me_approval_status: safeNumber(quo?.custbody_me_approval_status) || 0,
                    custbody_msi_bank_payment_so: Array.isArray(quo.custbody_msi_bank_payment_so) ? quo.custbody_msi_bank_payment_so : [],
                    custbody_msi_bank_payment_so_name: Array.isArray(quo.custbody_msi_bank_payment_so_name) ? quo.custbody_msi_bank_payment_so_name : [],
                    custbody_cseg_cn_cfi: safeNumber(quo.custbody_cseg_cn_cfi),
                    expectedclosedate: formatApiDate(quo.expectedclosedate) || null,
                    custbody_msi_quotation_no_iec: quo.custbody_msi_quotation_no_iec || '',
                    total_amount: quo.total_amount || 0,
                    custbody_msi_createdby_api: quo.custbody_msi_createdby_api || '',
                    nextapprover: quo.nextapprover || null,
                    items: (quo.items || []).map((item: any, idx: number) => ({
                        id: `${item.item_id || 'item'}-${idx}-${Date.now()}`,
                        itemId: safeNumber(item.item_id) || 0,
                        item_name: item.item_name || '',
                        ...calcLineAmounts(item),
                        qty: calcLineAmounts(item).quantity || 0,
                        description: item.description || '',
                        department: safeNumber(item.department),
                        department_name: item.department_name || '',
                        class: safeNumber(item.class),
                        class_name: item.class_name || '',
                        location: safeNumber(item.location),
                        location_name: item.location_name || '',
                        taxcode: item.taxcode,
                        taxcode_name: item.taxcode_name || '',
                        pricelevel: safeNumber(item.pricelevel),
                        pricelevel_name: item.pricelevel_name || '',
                        unit: item.unit || null,
                    })),
                }));
            } else {
                toast.error('Quotation tidak ditemukan');
                navigate('/netsuite/quotation');
            }
        } catch (err: any) {
            console.error('Error loading Quotation detail:', err);
            toast.error('Gagal memuat data Quotation');
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                setLoadingMasterData(true);
                const response = await QuotationService.getFieldComponentById();
                if (response.data.success) {
                    setMasterData(response.data.data);
                } else {
                    toast.error('Failed to load master data');
                }
            } catch (error) {
                console.error('Error loading master data:', error);
            } finally {
                setLoadingMasterData(false);
            }
        };

        loadMasterData();
    }, []);

    useEffect(() => {
        loadDetail();
    }, [id]);

    const handleSyncById = async (quoId: string) => {
        if (isSyncing || !quoId) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi Quotation: ${quoId}...`);
        try {
            await QuotationService.syncQuotationById(quoId);
            toast.success('Sinkronisasi berhasil', { id: toastId });
            await loadDetail();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        clearError(name);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: any) => {
        clearError(field);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (field: string, value: string) => {
        clearError(field);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddItem = (selectedItem: any) => {
        if (!selectedItem) return;
        const newItem: QuotationFormItem = {
            id: `${selectedItem.value}-${Date.now()}`,
            itemId: Number(selectedItem.value),
            item_name: selectedItem.label,
            qty: 1,
            rate: 0,
            amount: 0,
            description: '',
            department: formData.department,
            department_name: formData.department_name || '',
            class: formData.class,
            class_name: formData.class_name || '',
            location: formData.location,
            location_name: formData.location_name || '',
            taxcode: null,
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (itemId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId),
        }));
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const updated = [...prev.items];
            if (updated[index]) {
                const item = { ...updated[index], [field]: value };
                if (field === 'qty' || field === 'rate') {
                    item.amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                }
                updated[index] = item;
            }
            return { ...prev, items: updated };
        });
    };

    const handleAddFiles = (files: any[]) => {
        setFormData(prev => ({ ...prev, files }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.entity) newErrors.entity = 'Customer wajib dipilih';
        if (!formData.trandate) newErrors.trandate = 'Transaction Date wajib diisi';
        if (!formData.items || formData.items.length === 0) {
            newErrors.items = 'Minimal 1 item harus ditambahkan';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Lengkapi field yang wajib diisi');
            return;
        }
        if (!quoInternalId) {
            toast.error('ID Quotation tidak ditemukan');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                id: quoInternalId,
                customform: formData.customform,
                title: formData.title || '',
                subsidiary: formData.subsidiary,
                entity: Number(formData.entity),
                trandate: formData.trandate || null,
                duedate: formData.duedate || null,
                expectedclosedate: formData.expectedclosedate || null,
                orderstatus: formData.orderstatus || '',
                otherrefnum: formData.otherrefnum || '',
                memo: formData.memo || '',
                currency: formData.currency,
                terms: formData.terms || undefined,
                department: formData.department || undefined,
                class: formData.class || undefined,
                location: formData.location || undefined,
                probability: formData.probability || undefined,
                forecasttype: formData.forecasttype || undefined,
                salesrep: formData.salesrep || '',
                opportunity: formData.opportunity || '',
                partner: formData.partner || '',
                custbody_msi_bank_payment_so: formData.custbody_msi_bank_payment_so || [],
                custbody_cseg_cn_cfi: formData.custbody_cseg_cn_cfi || undefined,
                custbody_me_approval_status: formData.custbody_me_approval_status ?? undefined,
                custbody_msi_createdby_api: profileSSO?.email || undefined,
                custbody_msi_quotation_no_iec: formData.custbody_msi_quotation_no_iec || '',
                items: formData.items.map(item => ({
                    itemId: item.itemId,
                    qty: Number(item.qty) || 0,
                    rate: Number(item.rate) || 0,
                    amount: Number(item.amount) || 0,
                    description: item.description || '',
                    department: item.department || undefined,
                    class: item.class || undefined,
                    location: item.location || undefined,
                    taxcode: item.taxcode || undefined,
                    pricelevel: item.pricelevel || undefined,
                    unit: item.unit || undefined,
                })),
            };
            const response = await QuotationService.updateQuotation(payload as any);
            if (response.success) {
                toast.success('Quotation berhasil diperbarui');
                navigate(`/netsuite/quotation/edit/${id}`, { replace: true });
                await loadDetail();
            } else {
                toast.error(response.message || 'Quotation tidak berhasil diperbarui');
            }
        } catch (error: any) {
            console.error('Error updating quotation:', error);
            toast.error(error.message || 'Gagal memperbarui quotation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        loadingDetail,
        formData,
        errors,
        quoInternalId,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleAddFiles,
        handleSubmit,
        handleSyncById,
        isSyncing,
        loadData: loadDetail,
        syncInfo,
        tranid,
        statusName,
        messageError,
        masterData,
        loadingMasterData,
    };
};
