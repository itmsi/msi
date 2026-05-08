import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { SalesOrderFormData, SalesOrderFormItem } from '../types/salesOrder';
import { SalesOrderService } from '../services/salesOrderService';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const toInputDate = (isoOrDate: string | null | undefined): string => {
    if (!isoOrDate) return '';
    const match = isoOrDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    return '';
};

// Helper untuk konversi angka yang aman
const safeNumber = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
};

export const useSalesOrderEdit = (id: string | undefined) => {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [soInternalId, setSoInternalId] = useState<string | number | null>(null);
    const [syncInfo, setSyncInfo] = useState<any>(null);
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [formData, setFormData] = useState<SalesOrderFormData>({
        customform: 104,
        subsidiary: null,
        entity: null,
        entity_name: '',
        trandate: '',
        startdate: '',
        enddate: '',
        orderstatus: 'A',
        otherrefnum: '',
        memo: '',
        currency: 1,
        terms: null,
        department: null,
        department_name: '',
        class: null,
        class_name: '',
        location: null,
        location_name: '',
        custbody_msi_quotation_no_iec: '',
        custbody_msi_bank_payment_so: null,
        custbody_cseg_cn_cfi: null,
        custbody_msi_createdby_api: profileSSO?.email || 'T',
        items: [],
    });
    const [tranid, setTranid] = useState<string>('');
    const [statusName, setStatusName] = useState<string>('');
    const [messageError, setMessageError] = useState<string>('');

    const loadDetail = async () => {
        if (!id) return;
        try {
            setLoadingDetail(true);
            const response = await SalesOrderService.getSalesOrderById(id);
            if (response.success && response.data?.items && response.data.items.length > 0) {
                if (response.sync_info) {
                    setSyncInfo(response.sync_info);
                }
                const so = response.data.items[0] as any;
                
                // Utamakan netsuite_id, jika kosong pakai id (UUID)
                setSoInternalId(so.netsuite_id || so.id);
                setTranid(so.tranid || '');
                setStatusName(so.status_name || '');

                // Extract message_error
                const errorObj = so.message_error?.response?.error;
                if (typeof errorObj === 'string') {
                    setMessageError(errorObj);
                } else if (errorObj && typeof errorObj === 'object' && errorObj.message) {
                    setMessageError(errorObj.message);
                } else {
                    setMessageError('');
                }

                setFormData(prev => ({
                    ...prev,
                    subsidiary: safeNumber(so.subsidiary) || prev.subsidiary,
                    entity: safeNumber(so.customer_id),
                    entity_name: so.customer_name || '',
                    trandate: toInputDate(so.tran_date),
                    orderstatus: so.status_code || 'A',
                    memo: so.memo || '',
                    currency: safeNumber(so.currency) || prev.currency,
                    department: safeNumber(so.department),
                    department_name: so.department_name || '',
                    class: safeNumber(so.class),
                    class_name: so.class_name || '',
                    location: safeNumber(so.location),
                    location_name: so.location_name || '',
                    custbody_msi_quotation_no_iec: so.custbody_msi_quotation_no_iec || '',
                    custbody_msi_bank_payment_so: safeNumber(so.custbody_msi_bank_payment_so),
                    custbody_cseg_cn_cfi: safeNumber(so.custbody_cseg_cn_cfi),
                    items: (so.items || []).map((item: any, idx: number) => ({
                        id: `${item.item_id || 'item'}-${idx}-${Date.now()}`,
                        itemId: safeNumber(item.item_id) || 0,
                        item_name: item.item_name || '',
                        qty: safeNumber(item.quantity) || 0,
                        rate: safeNumber(item.rate) || 0,
                        amount: safeNumber(item.amount) || 0,
                        description: item.description || '',
                        department: safeNumber(item.department),
                        department_name: item.department_name || '',
                        class: safeNumber(item.class),
                        class_name: item.class_name || '',
                        location: safeNumber(item.location),
                        location_name: item.location_name || '',
                        taxcode: safeNumber(item.taxcode),
                    })),
                }));
            } else {
                toast.error('Sales Order tidak ditemukan');
                navigate('/netsuite/sales-orders');
            }
        } catch (err: any) {
            console.error('Error loading SO detail:', err);
            toast.error('Gagal memuat data Sales Order');
        } finally {
            setLoadingDetail(false);
        }
    };

    // Load Master Data saat component mount
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                setLoadingMasterData(true);
                const response = await PurchaseOrderService.getFieldComponentById();
                if (response.data.success) {
                    setMasterData(response.data.data);
                } else {
                    toast.error('Failed to load master data');
                }
            } catch (error) {
                console.error('Error loading master data:', error);
                // toast.error('Error loading master data');
            } finally {
                setLoadingMasterData(false);
            }
        };

        loadMasterData();
    }, []);

    // Load SO detail
    useEffect(() => {
        loadDetail();
    }, [id]);

    const handleSyncById = async (soId: string) => {
        if (isSyncing || !soId) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi SO: ${soId}...`);
        try {
            await SalesOrderService.syncSalesOrderById(soId);
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
        const newItem: SalesOrderFormItem = {
            id: `${selectedItem.value}-${Date.now()}`,
            itemId: Number(selectedItem.value),
            item_name: selectedItem.label,
            qty: 1,
            rate: 0,
            amount: 0,
            description: '',
            department: formData.department,
            department_name: formData.department_name,
            class: formData.class,
            class_name: formData.class_name,
            location: formData.location,
            location_name: formData.location_name,
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
        if (!soInternalId) {
            toast.error('ID Sales Order tidak ditemukan');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                id: soInternalId,
                customform: formData.customform,
                subsidiary: formData.subsidiary,
                entity: Number(formData.entity),
                trandate: formatDateForAPI(formData.trandate),
                startdate: formData.startdate ? formatDateForAPI(formData.startdate) : undefined,
                enddate: formData.enddate ? formatDateForAPI(formData.enddate) : undefined,
                orderstatus: formData.orderstatus,
                otherrefnum: formData.otherrefnum || '',
                memo: formData.memo || '',
                currency: formData.currency,
                terms: formData.terms || undefined,
                department: formData.department || undefined,
                class: formData.class || undefined,
                location: formData.location || undefined,
                custbody_msi_quotation_no_iec: formData.custbody_msi_quotation_no_iec || '',
                custbody_msi_bank_payment_so: formData.custbody_msi_bank_payment_so || undefined,
                custbody_cseg_cn_cfi: formData.custbody_cseg_cn_cfi || undefined,
                custbody_msi_createdby_api: formData.custbody_msi_createdby_api || 'T',
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
                })),
            };
            const response = await SalesOrderService.updateSalesOrder(payload as any);
            if (response.success) {
                toast.success('Sales Order berhasil diperbarui');
                navigate(`/netsuite/sales-orders/edit/${id}`, { replace: true });
                await loadDetail();
            } else {
                toast.error(response.message || 'Sales Order tidak berhasil diperbarui');
            }
        } catch (error: any) {
            console.error('Error updating sales order:', error);
            toast.error(error.message || 'Gagal memperbarui sales order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMakeCopy = () => {
        const copiedData = {
            ...formData,
            items: formData.items.map(item => ({
                ...item,
                id: `copy-${item.itemId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
            }))
        };
        navigate('/netsuite/sales-orders/create', { state: { formData: copiedData } });
    };

    return {
        isSubmitting,
        loadingDetail,
        formData,
        errors,
        soInternalId,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleSubmit,
        handleSyncById,
        handleMakeCopy,
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
