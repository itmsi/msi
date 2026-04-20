import { useState, useEffect, useCallback } from 'react';
import { MasterDataFormFieldItems, PODetailData, ItemReceiptPayload, ItemReceiptItem, ReceiptItem, Pagination, SyncInfo, ReceiptValidationErrors } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import flatpickr from 'flatpickr';

// Mapping PODetailData → ItemReceiptPayload untuk form receive
const mapPODetailToForm = (detail: PODetailData): ItemReceiptPayload => {
    const items: ItemReceiptItem[] = (detail.lines || []).map((line) => ({
        item: line.item,
        item_display: line.item_display || '',
        quantity: line.quantity ?? 0,
        on_hand: line.on_hand ?? 0,
        location: line.location ?? 0,
        location_display: line.location_display || '',
        department: line.department ?? 0,
        department_display: line.department_display || '',
        class: line.class ?? 0,
        class_display: line.class_display || '',
        rate: line.rate ?? 0,
        amount: line.netamount ?? 0,
    }));

    return {
        customform: detail.customform ?? null,
        customform_display: detail.customform_display || '',
        po_id: detail.po_id ? Number(detail.po_id) : null,
        vendorid: detail.vendor_id ?? null,
        vendor_name: detail.vendor_name || null,
        memo: detail.memo || '',
        subsidiary: detail.subsidiary ?? 0,
        subsidiary_display: detail.subsidiary_display || '',
        trandate: flatpickr.formatDate(new Date(), "d/m/Y"), // Set default receive date ke sekarang, bisa diubah sesuai kebutuhan
        location: detail.location !== undefined ? Number(detail.location) : 0,
        location_display: detail.location_display || '',
        department: detail.department !== undefined ? Number(detail.department) : 0,
        department_display: detail.department_display || '',
        class: detail.class !== undefined ? Number(detail.class) : 0,
        class_display: detail.class_display || '',
        items,
    };
};

// Mapping ReceiptItem (view) → ItemReceiptPayload untuk tampil di form
const mapReceiptItemToForm = (receipt: ReceiptItem): ItemReceiptPayload => {
    const items = (receipt.lines || []).map((line) => ({
        item: Number(line.item),
        item_display: line.item_display || '',
        quantity: Number(line.quantity) || 0,
        location: Number(line.location) || 0,
        location_display: line.location_display || '',
        department: Number(line.department) || 0,
        department_display: line.department_display || '',
        class: Number(line.class) || 0,
        class_display: line.class_display || '',
        rate: Number(line.rate) || 0,
        amount: Number(line.amount) || 0,
    }));

    return {
        customform: receipt.customform ?? null,
        customform_display: receipt.customform_display || '',
        po_id: Number(receipt.createdfrom) || null,
        memo: receipt.memo || '',
        vendorid: Number(receipt.vendor_id) || null,
        vendor_name: receipt.vendor_name || null,
        trandate: flatpickr.formatDate(new Date(), "d/m/Y"),
        subsidiary: Number(receipt.subsidiary) || 0,
        subsidiary_display: receipt.subsidiary_display || '',
        location: Number(receipt.location) || 0,
        location_display: receipt.location_display || '',
        department: Number(receipt.department) || 0,
        department_display: receipt.department_display || '',
        class: Number(receipt.class) || 0,
        class_display: receipt.class_display || '',
        items,
    };
};

export const useReceive = () => {
    const navigate = useNavigate();
    const { id, receipt_id } = useParams<{ id: string; receipt_id: string }>();
    const isViewMode = Boolean(receipt_id);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<ReceiptValidationErrors>({});
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loading, setLoading] = useState(true);

    const [poDetail, setPoDetail] = useState<PODetailData | null>(null);
    const [receiptDetail, setReceiptDetail] = useState<PODetailData | null>(null);
    const [receiptViewData, setReceiptViewData] = useState<ReceiptItem | null>(null);
    const [receiptList, setReceiptList] = useState<ReceiptItem[]>([]);
    const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const [formData, setFormData] = useState<ItemReceiptPayload>({
        po_id: null,
        memo: '',
        trandate: '',
        location: 0,
        location_display: '',
        department: 0,
        department_display: '',
        class: 0,
        class_display: '',
        items: []
    });

    const fetchReceiptList = useCallback(async () => {
        if (!id) return;
        try {
            const response = await PurchaseOrderService.getReceiptById({
                page: 1,
                page_size: 20,
                sort_by: 'last_modified',
                sort_order: 'desc',
                filters: {
                    createdfrom: Number(id)
                }
            });
            setReceiptList(response.data?.items || []);
            setPagination(response.data?.pagination || pagination);
            setSyncInfo(response.sync_info || null);
        } catch (err: any) {
            console.error('Error fetching receipts:', err);
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                toast.error('ID Purchase Order tidak ditemukan');
                navigate('/netsuite/purchase-order');
                return;
            }

            try {
                setIsLoading(true);
                setLoading(true);

                const [masterRes, detailRes] = await Promise.all([
                    PurchaseOrderService.getFieldComponentById(),
                    PurchaseOrderService.getPOById(id),
                ]);

                if (masterRes.data.success) {
                    setMasterData(masterRes.data.data);
                } else {
                    toast.error('Gagal memuat master data');
                }

                if (detailRes.success && detailRes.data?.length > 0) {
                    const detail = detailRes.data[0];
                    setPoDetail(detail);
                    setReceiptDetail(detail);

                    if (isViewMode && receipt_id) {
                        // Mode view: load data receipt yang sudah ada
                        const receiptRes = await PurchaseOrderService.syncPOByIdReceipt(receipt_id);
                        const receiptRaw = receiptRes.data?.items?.[0] ?? null;
                        // Inject customform dari PO detail karena tidak ada di response receipt
                        const receiptData = receiptRaw ? {
                            ...receiptRaw,
                            customform: Number(detail.customform) ?? null,
                            customform_display: detail.customform_display || '',
                        } : null;
                        if (receiptData) {
                            setReceiptViewData(receiptData);
                            setFormData(mapReceiptItemToForm(receiptData));
                        } else {
                            toast.error('Data receipt tidak ditemukan');
                            setFormData(mapPODetailToForm(detail));
                        }
                    } else {
                        // Mode create: prefill form dari PO detail
                        setFormData(mapPODetailToForm(detail));
                        await fetchReceiptList();
                    }
                } else {
                    toast.error(detailRes.message || 'Data Purchase Order tidak ditemukan');
                    navigate('/netsuite/purchase-order');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                navigate('/netsuite/purchase-order');
                toast.error('Gagal memuat data');
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (fieldName: string, value: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }

        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleDateChange = (fieldName: string, value: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }

        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleUpdateProductItem = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const updatedItems = [...prev.items];
            if (updatedItems[index]) {
                updatedItems[index] = { ...updatedItems[index], [field]: value };
            }
            return { ...prev, items: updatedItems };
        });
    };

    const validateReceiveForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.items || formData.items.length === 0) {
            newErrors.items = 'Minimal 1 item harus ditambahkan';
        } else {
            const itemsWithoutQty = formData.items.some((item: ItemReceiptItem) => !item.quantity || item.quantity <= 0);
            if (itemsWithoutQty) {
                newErrors.qty = 'Quantity wajib diisi untuk setiap item';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Lengkapi field yang wajib diisi');
            window.scrollTo({ top: 0 });
            return false;
        }

        return true;
    };

    const handleSubmitReceive = async () => {
        if (!validateReceiveForm()) return;

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Perbaiki error validasi terlebih dahulu');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData: ItemReceiptPayload = {
                po_id: Number(receiptDetail?.po_id || id),
                memo: formData.memo || '',
                // customform: Number(formData.customform) || null,
                customform: 118,
                trandate: formData.trandate || '',
                class: formData.class || 0,
                location: formData.location || 0,
                department: formData.department || 0,
                items: (formData.items || []).map((item: ItemReceiptItem) => ({
                    item: Number(item.item),
                    quantity: Number(item.quantity),
                    location: Number(item.location),
                    department: Number(item.department),
                    class: Number(item.class),
                    rate: Number(item.rate)
                }))
            };

            const response = await PurchaseOrderService.submitReceipt(requestData);
            if (response.success) {
                toast.success('Receive berhasil disubmit');
                await fetchReceiptList();
            } else {
                toast.error('Gagal mengsubmit receive');
            }
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            console.error('Error submitting receive:', error);
            toast.error(error.message || 'Gagal mengsubmit receive');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        isLoading,
        formData,
        errors,
        masterData,
        poDetail,
        loading,
        receiptDetail,
        receiptList,
        receiptViewData,
        syncInfo,
        pagination,
        isViewMode,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleUpdateProductItem,
        handleSubmitReceive
    };
};
