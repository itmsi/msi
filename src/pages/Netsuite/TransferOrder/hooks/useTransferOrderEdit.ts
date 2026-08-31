import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { AttachFileItem, TransferOrderFormData, TransferOrderFormItem } from '../types/transferOrder';
import { TransferOrderService } from '../services/transferOrderService';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

const safeNumber = (val: any): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
};

export const useTransferOrderEdit = (id: string | undefined) => {
    const navigate = useNavigate();
    const { paramId } = useParams<{ paramId: string }>();
    const profileSSO = getProfile() as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toInternalId, setToInternalId] = useState<string | number | null>(null);
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [formData, setFormData] = useState<TransferOrderFormData>({
        customform: null,
        subsidiary: null,
        subsidiary_name: '',
        location: null,
        location_name: '',
        transferlocation: null,
        transferlocation_name: '',
        trandate: '',
        memo: '',
        department: null,
        department_name: '',
        class: null,
        class_name: '',
        status: 'A',
        status_name: '',
        incoterm: null,
        employee: null,
        employee_name: '',
        firmed: false,
        use_item_cost_as_transfer_cost: false,
        logistic_vendor: null,
        logistic_vendor_name: '',
        customer: null,
        customer_name: '',
        total: 0,
        custbody_msi_createdby_api: '',
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
            const response = await TransferOrderService.getTransferOrderById(id);
            if (response.success && response.data && response.data.length > 0) {
                const to = response.data[0] as any;

                setToInternalId(to.netsuite_id || to.id || paramId);
                setTranid(to.tranid || '');
                setStatusName(to.status_proccess || '');
                setMessageError(to.status_proccess_message || '');

                setFormData(prev => ({
                    ...prev,
                    customform: safeNumber(to.customform),
                    subsidiary: safeNumber(to.subsidiary_id),
                    subsidiary_name: to.subsidiary_name || '',
                    location: safeNumber(to.from_location_id),
                    location_name: to.from_location_name || '',
                    transferlocation: safeNumber(to.to_location_id),
                    transferlocation_name: to.to_location_name || '',
                    trandate: to.tran_date || '',
                    status: to.status_code || prev.status,
                    status_name: to.status_name || '',
                    memo: to.memo || '',
                    department: safeNumber(to.department_id),
                    department_name: to.department_name || '',
                    class: safeNumber(to.class_id),
                    class_name: to.class_name || '',
                    incoterm: safeNumber(to.incoterm_id),
                    employee: safeNumber(to.employee_id),
                    employee_name: to.employee_name || '',
                    firmed: Boolean(to.firmed),
                    use_item_cost_as_transfer_cost: Boolean(to.use_item_cost_as_transfer_cost),
                    logistic_vendor: safeNumber(to.logistic_vendor_id),
                    logistic_vendor_name: to.logistic_vendor_name || '',
                    customer: safeNumber(to.customer_id),
                    customer_name: to.customer_name || '',
                    total: safeNumber(to.total) || 0,
                    custbody_msi_createdby_api: to.custbody_msi_createdby_api || '',
                    items: (to.items || []).map((item: any, idx: number) => ({
                        id: `${item.item_id || 'item'}-${idx}-${Date.now()}`,
                        itemId: safeNumber(item.item_id) || 0,
                        item_name: item.item_name || '',
                        item_displayname: item.item_displayname || item.item_name || '',
                        quantity: safeNumber(item.quantity) || 0,
                        description: item.description || '',
                        expectedreceiptdate: item.expected_receipt_date || null,
                        rate: item.transfer_price ?? null,
                        packed: item.packed,
                        picked: item.picked,
                        shipped: item.shipped,
                        received: item.received,
                        backorder: item.backorder,
                        committed: item.committed,
                        fulfilled: item.fulfilled,
                        units: item.units ?? null,
                        amount: item.amount ?? null,
                        order_priority: item.order_priority ?? null,
                        commitment_confirmed: Boolean(item.commitment_confirmed),
                        closed: Boolean(item.closed),
                    })),
                    files: (to.files || []).map((file: any) => ({
                        id: file.id ?? '',
                        fileName: file.fileName || file.file_name || '',
                        fileUrl: file.fileUrl || file.file_url || '',
                    })),
                }));
            } else {
                toast.error('Transfer Order tidak ditemukan');
                navigate('/netsuite/transfer-orders');
            }
        } catch (err: any) {
            console.error('Error loading TO detail:', err);
            toast.error('Gagal memuat data Transfer Order');
        } finally {
            setLoadingDetail(false);
        }
    };

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
            } finally {
                setLoadingMasterData(false);
            }
        };

        loadMasterData();
    }, []);

    useEffect(() => {
        loadDetail();
    }, [id]);

    const handleAddFiles = (files: AttachFileItem[]) => {
        setFormData(prev => ({
            ...prev,
            files
        }));
    };

    const handleSyncById = async (toId: string) => {
        if (isSyncing || !toId) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi TO: ${toId}...`);
        try {
            await TransferOrderService.syncTransferOrderById(toId);
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
        const newItem: TransferOrderFormItem = {
            id: `${selectedItem.value}-${Date.now()}`,
            itemId: Number(selectedItem.value),
            item_name: selectedItem.data?.itemId || selectedItem.label,
            item_displayname: selectedItem.data?.displayName || selectedItem.label,
            quantity: 1,
            description: '',
            expectedreceiptdate: null,
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
                updated[index] = { ...updated[index], [field]: value };
            }
            return { ...prev, items: updated };
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.trandate) newErrors.trandate = 'Transaction Date wajib diisi';
        if (!formData.subsidiary) newErrors.subsidiary = 'Subsidiary wajib dipilih';
        if (!formData.location) newErrors.location = 'Location wajib dipilih';
        if (!formData.transferlocation) newErrors.transferlocation = 'Transfer To Location wajib dipilih';
        if (formData.location && formData.transferlocation && formData.location === formData.transferlocation) {
            newErrors.transferlocation = 'Transfer To Location tidak boleh sama dengan Location';
        }
        if (!formData.department) newErrors.department = 'Department wajib dipilih';
        if (!formData.class) newErrors.class = 'Class wajib dipilih';
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
        if (!toInternalId) {
            toast.error('ID Transfer Order tidak ditemukan');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                id: toInternalId,
                customform: formData.customform,
                subsidiary: formData.subsidiary,
                location: formData.location,
                transferlocation: formData.transferlocation,
                trandate: formData.trandate || null,
                memo: formData.memo || '',
                department: formData.department || undefined,
                class: formData.class || undefined,
                incoterm: formData.incoterm || undefined,
                employee: formData.employee || undefined,
                firmed: formData.firmed,
                useitemcostastransfercost: formData.use_item_cost_as_transfer_cost,
                custbody_me_logistic_vendor: formData.logistic_vendor || undefined,
                custbody_me_inv_customer: formData.customer || undefined,
                custbody_msi_createdby_api: profileSSO?.email || undefined,
                items: formData.items.map(item => ({
                    item: item.itemId,
                    quantity: Number(item.quantity) || 0,
                    description: item.description || '',
                    expectedreceiptdate: item.expectedreceiptdate || undefined,
                    rate: item.rate ?? undefined,
                })),
                files: (formData.files || []).map(f => ({ file_name: f.fileName, file_url: f.fileUrl })),
            };
            const response = await TransferOrderService.updateTransferOrder(payload as any);
            if (response.success) {
                toast.success('Transfer Order berhasil diperbarui');
                navigate(`/netsuite/transfer-orders/edit/${id}`, { replace: true });
                await loadDetail();
            } else {
                toast.error(response.message || 'Transfer Order tidak berhasil diperbarui');
            }
        } catch (error: any) {
            console.error('Error updating transfer order:', error);
            toast.error(error.message || 'Gagal memperbarui transfer order');
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
        navigate('/netsuite/transfer-orders/create', { state: { formData: copiedData } });
    };

    return {
        isSubmitting,
        loadingDetail,
        formData,
        errors,
        toInternalId,
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
        tranid,
        statusName,
        messageError,
        masterData,
        loadingMasterData,
        handleAddFiles
    };
};
