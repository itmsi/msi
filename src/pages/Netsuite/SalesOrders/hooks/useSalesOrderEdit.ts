import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { AttachFileItem, SalesOrderFormData, SalesOrderFormItem, SalesOrderItem } from '../types/salesOrder';
import { SalesOrderService } from '../services/salesOrderService';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

// Helper untuk konversi angka yang aman
const safeNumber = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
};

const calcLineAmounts = (line: SalesOrderItem) => {
    const val_rate = line.rate != null ? Number(line.rate) : 0;
    const quantity = line.quantity ?? line.quantity ?? 0;
    const rate = line.rate ?? val_rate;

    // Jika netamount null, kalkulasi dari rate * quantity
    const amount = line.amount != null ? Number(line.amount) : rate * quantity;

    const taxRate = line.tax_rate != null ? Number(line.tax_rate) : (() => {
        // Fallback: ekstrak persentase dari string taxcode_name (e.g. "VAT 11%")
        if (line.taxcode_name) {
            const match = line.taxcode_name.match(/([\d.]+)/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    })();
    // Recalculate jika tax_amount null atau 0 padahal taxrate ada (netamount null case)
    const needsCalcTax = (line.tax_amount == null || line.tax_amount === 0) && taxRate > 0;
    const tax_amount = needsCalcTax ? Math.round((amount * taxRate) / 100) : (line.tax_amount ?? 0);
    // Recalculate grossamt jika null atau tidak konsisten dengan amount + taxAmount
    const needsCalcGross = line.gross_amount == null || line.gross_amount === 0;
    const gross_amount = needsCalcGross ? Math.round(amount + tax_amount) : (line.gross_amount ?? 0);

    return { quantity, rate, amount, tax_amount, gross_amount };
};
export const useSalesOrderEdit = (id: string | undefined) => {
    const navigate = useNavigate();
    const { paramId } = useParams<{ paramId: string }>();
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
        subsidiary_name: '',
        entity: null,
        entity_name: '',
        trandate: '',
        startdate: null,
        enddate: null,
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
        custbody_msi_quotation_no_iec: '',
        custbody_msi_bank_payment_so: [],
        custbody_msi_bank_payment_so_name: [],
        custbody_cseg_cn_cfi: null,
        custbody_msi_createdby_api: '',
        custbody_me_approval_status: 0,
        total_amount: 0,
        items: [],
        files: [],
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
                setSoInternalId(so.netsuite_id || so.id || paramId);
                setTranid(so.tranid || '');
                setStatusName(so.status_proccess || '');
                setMessageError(so.status_proccess_message || '');

                setFormData(prev => ({
                    ...prev,
                    subsidiary: safeNumber(so.subsidiary) || prev.subsidiary,
                    subsidiary_name: so.subsidiary_name || '',
                    entity: safeNumber(so.customer_id),
                    entity_name: so.customer_name || '',
                    trandate: so?.tran_date || '',
                    orderstatus: so.status_code || 'A',
                    status_name: so.status_name || '',
                    otherrefnum: so.otherrefnum || '',
                    memo: so.memo || '',
                    currency: safeNumber(so.currency) || prev.currency,
                    currency_name: so.currency_name || '',
                    terms: Number(so.terms) || null,
                    terms_name: so.terms_name || '',
                    department: safeNumber(so.department),
                    department_name: so.department_name || '',
                    class: safeNumber(so.class),
                    class_name: so.class_name || '',
                    location: safeNumber(so.location),
                    location_name: so.location_name || '',
                    custbody_me_approval_status: safeNumber(so?.custbody_me_approval_status) || 0,
                    custbody_msi_quotation_no_iec: so.custbody_msi_quotation_no_iec || '',
                    custbody_msi_bank_payment_so: Array.isArray(so.custbody_msi_bank_payment_so) ? so.custbody_msi_bank_payment_so : [],
                    custbody_msi_bank_payment_so_name: Array.isArray(so.custbody_msi_bank_payment_so_name) ? so.custbody_msi_bank_payment_so_name : [],
                    custbody_cseg_cn_cfi: safeNumber(so.custbody_cseg_cn_cfi),
                    startdate: so.startdate || '',
                    enddate: so.enddate || '',
                    total_amount: so.total_amount || 0,
                    custbody_msi_createdby_api: so.custbody_msi_createdby_api || '',
                    nextapprover: so.nextapprover || null,
                    user_notes: so.user_notes || [],
                    items: (so.items || []).map((item: any, idx: number) => ({
                        id: `${item.item_id || 'item'}-${idx}-${Date.now()}`,
                        itemId: safeNumber(item.item_id) || 0,
                        item_name: item.item_name || '',
                        ...calcLineAmounts(item),
                        qty: calcLineAmounts(item).quantity || 0,
                        // qty: safeNumber(item.quantity) || 0,
                        // rate: safeNumber(item.rate) || 0,
                        // amount: safeNumber(item.amount) || 0,
                        description: item.description || '',
                        department: safeNumber(item.department),
                        department_name: item.department_name || '',
                        class: safeNumber(item.class),
                        class_name: item.class_name || '',
                        location: safeNumber(item.location),
                        location_name: item.location_name || '',
                        taxcode: item.taxcode,
                        taxcode_name: item.taxcode_name || '',
                        // tax_amount: item.tax_amount || 0,
                    })),
                    files: (so.files || []).map((file: any) => ({
                        id: file.file_id ?? '',
                        fileName: file.fileName || '',
                        fileUrl: file.fileUrl || '',
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

    
    
    const handleAddFiles = (files: AttachFileItem[]) => {
        setFormData(prev => ({
            ...prev,
            files
        }));
    };
    
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
                trandate: formData.trandate || null,
                startdate: formData.startdate || null,
                enddate: formData.enddate || null,
                orderstatus: formData.orderstatus || '',
                otherrefnum: formData.otherrefnum || '',
                memo: formData.memo || '',
                currency: formData.currency,
                terms: formData.terms || undefined,
                terms_name: formData.terms_name || '',
                department: formData.department || undefined,
                class: formData.class || undefined,
                location: formData.location || undefined,
                custbody_msi_quotation_no_iec: formData.custbody_msi_quotation_no_iec || '',
                custbody_msi_bank_payment_so: formData.custbody_msi_bank_payment_so || [],
                custbody_msi_bank_payment_so_name: formData.custbody_msi_bank_payment_so_name || [],
                custbody_cseg_cn_cfi: formData.custbody_cseg_cn_cfi || undefined,
                custbody_msi_createdby_api: profileSSO?.email || undefined,
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
                files: formData.files || [],
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
        handleAddFiles
    };
};
