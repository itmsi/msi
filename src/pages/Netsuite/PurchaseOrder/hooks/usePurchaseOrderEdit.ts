import { useState, useEffect, useCallback } from 'react';
import { PurchaseOrderForm, PurchaseOrderValidationErrors, MasterDataFormFieldItems, TablePOItem, PODetailData, PurchaseOrderFormUpdate, AttachFileItem, DataPOIDItems, PODetailLine, Pagination } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';

// Helper kalkulasi tax — sama dengan logika di component
const calcLineAmounts = (line: PODetailLine) => {
    const fob = line.custcol_msi_fob != null ? Number(line.custcol_msi_fob) : 0;
    const landedCost = line.custcol_me_landed_cost != null ? Number(line.custcol_me_landed_cost) : 0;
    const qty = line.quantity ?? line.qty ?? 0;
    const rate = line.rate ?? (fob + landedCost);

    // Jika netamount null, kalkulasi dari rate * qty
    const amount = line.netamount != null ? line.netamount : rate * qty;

    const taxRate = line.taxrate1 != null ? Number(line.taxrate1) : (() => {
        // Fallback: ekstrak persentase dari string taxcode_display (e.g. "VAT 11%")
        if (line.taxcode_display) {
            const match = line.taxcode_display.match(/([\d.]+)/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    })();
    // Recalculate jika tax1amt null atau 0 padahal taxrate ada (netamount null case)
    const needsCalcTax = (line.tax1amt == null || line.tax1amt === 0) && taxRate > 0;
    const taxAmount = needsCalcTax ? Math.round((amount * taxRate) / 100) : (line.tax1amt ?? 0);
    // Recalculate grossamt jika null atau tidak konsisten dengan amount + taxAmount
    const needsCalcGross = line.grossamt == null || line.grossamt === 0;
    const grossAmount = needsCalcGross ? Math.round(amount + taxAmount) : (line.grossamt ?? 0);

    return { qty, rate, amount, taxAmount, grossAmount };
};

// Mapping PODetailLine[] → TablePOItem[] untuk keperluan tabel display
const mapLinesToTableItems = (lines: PODetailLine[]): TablePOItem[] => {
    const productLines = lines.filter(line => line.itemtype !== 'TaxItem');
    return productLines.map((line, idx) => {
        const { qty, rate, amount, taxAmount, grossAmount } = calcLineAmounts(line);
        return {
            id: `${line.item}-${idx}`,
            product_id: String(line.item),
            product_name: line.item_display || '',
            itemId: line.item,
            qty,
            rate,
            amount,
            total: grossAmount,
            department: line.department ?? 0,
            department_name: line.department_display || '',
            class: line.class ?? 0,
            class_name: line.class_display || '',
            location: line.location ?? 0,
            location_name: line.location_display || '',
            taxcode: line.taxcode ?? 0,
            taxcode_name: line.taxcode_display || '',
            tax_rate: line.taxrate1 != null ? String(line.taxrate1) : String(line.taxcode_display) || '',
            gross_amount: grossAmount,
            tax_amount: taxAmount,
            custcol_me_landed_cost: line.custcol_me_landed_cost != null ? Number(line.custcol_me_landed_cost) : 0,
            custcol_msi_fob: line.custcol_msi_fob != null ? Number(line.custcol_msi_fob) : 0,
            description: line.description || ''
        };
    });
};

// Mapping response API (PODetailData) ke format form (PurchaseOrderForm)
const mapPODetailToForm = (detail: PODetailData): PurchaseOrderForm => {
    const firstLine = detail.lines?.[0];

    // Filter hanya item bukan TaxItem
    const productLines = (detail.lines || []).filter(line => line.itemtype !== 'TaxItem');
    const fileLines = (detail.files || []);

    const files: AttachFileItem[] = fileLines.map((line) => ({
        fileUrl: line.fileUrl ?? '',
        fileName: line.fileName,
        created_by_api: line.created_by_api
    }));

    const items: TablePOItem[] = productLines.map((line, idx) => {
        const { qty, rate, amount, taxAmount, grossAmount } = calcLineAmounts(line);
        return {
            id: `${line.item}-${idx}`,
            product_id: String(line.item),
            product_name: line.item_display || '',
            itemId: line.item,
            qty,
            rate,
            amount,
            total: grossAmount,
            department: line.department ?? 0,
            department_name: line.department_display || '',
            class: line.class ?? 0,
            class_name: line.class_display || '',
            location: line.location ?? 0,
            location_name: line.location_display || '',
            taxcode: line.taxcode ?? 0,
            taxcode_name: line.taxcode_display || '',
            tax_rate: line.taxrate1 != null ? String(line.taxrate1) || '' : String(line.taxcode_display) || '',
            gross_amount: grossAmount,
            tax_amount: taxAmount,
            custcol_me_landed_cost: line.custcol_me_landed_cost != null ? Number(line.custcol_me_landed_cost) : 0,
            custcol_msi_fob: line.custcol_msi_fob != null ? Number(line.custcol_msi_fob) : 0,
            description: line.description || ''
        };
    });

    return {
        customform: detail.customform,
        customform_display: detail.customform_display || '',
        vendorid: detail.vendor_id,
        vendor_name: detail.vendor_name || '',
        purchasedate: detail.po_date,
        subsidiary: detail.subsidiary ?? 0,
        subsidiary_display: detail.subsidiary_display || '',
        location: Number(detail.location) ?? null,
        memo: detail.memo || '',
        currency: detail.currency_id,
        currency_symbol: detail.currency_symbol || '',
        terms: Number(detail.terms) || null,
        terms_display: detail.terms_display || null,
        custbody_me_pr_date: detail.custbody_me_pr_date || null,
        custbody_me_project_location: detail.custbody_me_project_location ?? null,
        custbody_me_pr_type: detail.custbody_me_pr_type ?? null,
        custbody_me_saving_type: detail.custbody_me_saving_type ?? null,
        custbody_me_pr_number: detail.custbody_me_pr_number || '',
        class: Number(detail.class) ?? null,
        class_name: detail.class_display || '',
        department: Number(detail.department) ?? null,
        department_name: detail.department_display || '',
        approvalstatus: detail.approvalstatus,
        po_status_label: detail.po_status_label || '',
        nextapprover: detail.nextapprover || null,
        custbody_msi_createdby_api: detail.custbody_msi_createdby_api,
        custbody_me_validity_date: detail.custbody_me_validity_date || null,
        // description: detail.custbody_me_description || null,
        items, // semua items dari detail.lines, untuk keperluan submit & InvoiceSummary
        files
    };
};

export const usePurchaseOrderEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<PurchaseOrderValidationErrors>({});

    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    // Detail data dari API (untuk info read-only seperti status, po_number)
    const [poDetail, setPODetail] = useState<PODetailData | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [itemData, setItemData] = useState<DataPOIDItems | null>(null);
    const [itemTableData, setItemTableData] = useState<TablePOItem[]>([]);
    const [itemPagination, setItemPagination] = useState<Pagination | null>(null);
    const [loadingItemData, setLoadingItemData] = useState(true);

    // Item yang baru ditambah user (lokal, tidak hilang saat pindah halaman server)
    const [localAddedItems, setLocalAddedItems] = useState<TablePOItem[]>([]);

    const [formData, setFormData] = useState<PurchaseOrderForm>({
        customform: null,
        vendorid: null,
        vendor_name: null,
        purchasedate: null,
        subsidiary: null,
        location: null,
        memo: '',
        currency: null,
        currency_symbol: null,
        terms: null,
        terms_display: null,
        custbody_me_pr_date: null,
        custbody_me_project_location: null,
        custbody_me_pr_type: null,
        custbody_me_saving_type: null,
        custbody_me_pr_number: '',
        class: null,
        // description: null,
        department: null,
        items: [],
        files: [],
    });

    // Load master data + detail PO secara paralel
    const loadData = useCallback(async () => {
        if (!id) {
            toast.error('Purchase Order ID tidak ditemukan');
            navigate('/netsuite/purchase-order');
            return;
        }

        try {
            setIsLoading(true);
            setLoadingMasterData(true);

            // Fetch master data + detail secara paralel
            const [masterRes, detailRes] = await Promise.all([
                PurchaseOrderService.getFieldComponentById(),
                PurchaseOrderService.getPOById(id),
            ]);

            // Set master data
            if (masterRes.data.success) {
                setMasterData(masterRes.data.data);
            } else {
                toast.error('Gagal memuat master data');
            }

            // Set detail PO
            if (detailRes.success && detailRes.data?.length > 0) {

                const detail = detailRes.data[0];
                setPODetail(detail);
                setFormData(mapPODetailToForm(detail));

                // Gunakan po_id dari detail (bukan dari URL param yang bisa berisi po_id atau internal_id)
                const itemsRes = await PurchaseOrderService.getPOIDItems({
                    internal_id: String(detail.id),
                    po_id: String(detail?.po_id || ''),
                });

                setLoadingItemData(true);

                if (itemsRes.success) {
                    setItemData(itemsRes.data);
                    setItemTableData(mapLinesToTableItems(itemsRes.data.items || []));
                    setItemPagination(itemsRes.data.pagination);
                    setLoadingItemData(false);
                } else {
                    toast.error(itemsRes.message || 'Data Items tidak ditemukan');
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
                setLoadingMasterData(false);
            }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (fieldName: string, value: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }

        if (fieldName === 'currency' && masterData) {
            const currencySymbol = masterData.currencys.find(c => String(c.id) === String(value))?.name || '';
            setFormData(prev => ({
                ...prev,
                currency: value ? Number(value) : null,
                currency_symbol: currencySymbol
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleDateChange = (fieldName: string, value: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.customform) newErrors.customform = 'Custom Form wajib dipilih';
        if (!formData.purchasedate) newErrors.purchasedate = 'Purchase Date wajib diisi';
        if (!formData.vendorid) newErrors.vendorid = 'Vendor wajib dipilih';
        if (!formData.terms) newErrors.terms = 'Terms wajib dipilih';
        if (!formData.currency) newErrors.currency = 'Currency wajib dipilih';
        if (!formData.subsidiary) newErrors.subsidiary = 'Subsidiary wajib dipilih';
        if (!formData.location) newErrors.location = 'Location wajib dipilih';
        if (!formData.class) newErrors.class = 'Class wajib dipilih';
        if (!formData.department) newErrors.department = 'Department wajib dipilih';
        // if (!formData.description) newErrors.description = 'Description wajib diisi';
        if (!formData.items || formData.items.length === 0) {
            newErrors.items = 'Minimal 1 item harus ditambahkan';
        } else {
            const itemsWithoutLocation = formData.items.some(item => !item.location);
            if (itemsWithoutLocation) {
                newErrors.items_location = 'Location wajib dipilih untuk setiap item';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Lengkapi field yang wajib diisi');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Perbaiki error validasi terlebih dahulu');
            return;
        }

        setIsSubmitting(true);
        try {
            const requestData: PurchaseOrderFormUpdate = {
                id: Number(poDetail?.po_id || id),
                customform: formData.customform || undefined,
                vendorid: formData.vendorid || undefined,
                purchasedate: formData.purchasedate ? formData.purchasedate : undefined,
                subsidiary: formData.subsidiary || undefined,
                location: formData.location || undefined,
                memo: formData.memo || undefined,
                currency: formData.currency || undefined,
                terms: formData.terms || undefined,
                terms_display: formData.terms_display || undefined,
                custbody_me_pr_date: formData.custbody_me_pr_date ? formData.custbody_me_pr_date : undefined,
                custbody_me_project_location: formData.custbody_me_project_location || undefined,
                custbody_me_pr_type: formData.custbody_me_pr_type || undefined,
                custbody_me_saving_type: formData.custbody_me_saving_type || undefined,
                custbody_me_pr_number: formData.custbody_me_pr_number || undefined,
                custbody_msi_createdby_api: formData.custbody_msi_createdby_api || undefined,
                class: formData.class || undefined,
                department: formData.department || undefined,
                grossamt: Number(formData.grossamt) || undefined,
                custbody_me_validity_date: formData.custbody_me_validity_date ? formData.custbody_me_validity_date : undefined,
                items: (formData.items || []).map(item => ({
                    itemId: Number(item.itemId),
                    qty: Number(item.qty),
                    rate: Number(item.rate || 0),
                    department: Number(item.department || 0),
                    class: Number(item.class || 0),
                    location: Number(item.location || 0),
                    taxcode: Number(item.taxcode || 0),
                    custcol_msi_fob: Number(item.custcol_msi_fob || 0),
                    custcol_me_landed_cost: Number(item.custcol_me_landed_cost || 0),
                    amount: Number(item.amount || 0),
                    total: Number(item.total || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    gross_amount: Number(item.gross_amount || 0),
                    description: item.description || ''
                })),
                files: formData.files || []
            };

            const response = await PurchaseOrderService.updatePurchaseOrder(requestData);
            if (response.success) {
                toast.success('Purchase Order berhasil diupdate');
                // loadData();
                window.location.href = '/netsuite/purchase-order/edit/' + id;
                // navigate('/netsuite/purchase-order/edit/' + id);
            } else {
                toast.error(response.message || 'Gagal mengupdate Purchase Order');
            }
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            console.error('Error updating purchase order:', error);
            toast.error(error.message || 'Gagal mengupdate purchase order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddProductItem = (selectedProduct: any) => {
        if (!selectedProduct) return;

        const refItem = localAddedItems[0] || formData?.items?.[0];
        const newItem: TablePOItem = {
            id: `${selectedProduct.value}-${Date.now()}`,
            product_id: selectedProduct.value,
            product_name: selectedProduct.data?.displayName || selectedProduct.label,
            itemId: parseInt(selectedProduct.data?.itemId) || parseInt(selectedProduct.value),
            qty: 1,
            rate: 0,
            amount: 0,
            total: 0,
            department: refItem?.department || 0,
            department_name: refItem?.department_name || '',
            class: refItem?.class || 0,
            class_name: refItem?.class_name || '',
            location: refItem?.location || 0,
            location_name: refItem?.location_name || '',
            taxcode: 5,
            taxcode_name: '',
            tax_rate: '',
            gross_amount: 0,
            tax_amount: 0
        };

        setLocalAddedItems(prev => [...prev, newItem]);
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    // Hapus item lokal (baru ditambah)
    const handleDeleteLocalItem = (itemId: string) => {
        setLocalAddedItems(prev => prev.filter(item => item.id !== itemId));
        setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
    };

    // Update item lokal berdasarkan index di localAddedItems
    const handleUpdateLocalItem = (index: number, field: string, value: any) => {
        setLocalAddedItems(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
        // Sync ke formData.items berdasarkan id
        setFormData(prev => {
            const itemId = localAddedItems[index]?.id;
            if (!itemId) return prev;
            return {
                ...prev,
                items: prev.items.map(item =>
                    item.id === itemId ? { ...item, [field]: value } : item
                )
            };
        });
    };

    const handleProductDelete = (productId: string) => {
        // Hapus dari formData.items (untuk submit)
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== productId)
        }));
        // Hapus dari itemTableData jika ada (server item)
        setItemTableData(prev => prev.filter(item => item.id !== productId));
    };

    const handleUpdateProductItem = (index: number, field: string, value: any) => {
        // Update itemTableData (server items, current page)
        setItemTableData(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
        // Sync ke formData.items berdasarkan id
        setFormData(prev => {
            const itemId = itemTableData[index]?.id;
            if (!itemId) return prev;
            return {
                ...prev,
                items: prev.items.map(item =>
                    item.id === itemId ? { ...item, [field]: value } : item
                )
            };
        });
    };

    const handleAddFiles = (files: AttachFileItem[]) => {
        setFormData(prev => ({
            ...prev,
            files
        }));
    };

    const handleItemsPageChange = useCallback(async (page: number, limit: number) => {
        if (!poDetail) return;
        setLoadingItemData(true);
        try {
            const itemsRes = await PurchaseOrderService.getPOIDItems({
                internal_id: String(poDetail.id),
                po_id: String(poDetail.po_id),
                page,
                limit,
            });
            if (itemsRes.success) {
                setItemData(itemsRes.data);
                setItemTableData(mapLinesToTableItems(itemsRes.data.items || []));
                setItemPagination(itemsRes.data.pagination);
            }
        } catch (err) {
            console.error('Error loading items page:', err);
        } finally {
            setLoadingItemData(false);
        }
    }, [poDetail]);

    const handleSyncById = useCallback(async (poID: string | undefined) => {
        if (isSyncing) return;
        if (!poID) return;
        setIsSyncing(true);
        const toastId = toast.loading(`Sinkronisasi PO: ${poID}...`);
        try {
            await PurchaseOrderService.syncPOById(String(poID));
            toast.success('Sinkronisasi berhasil', { id: toastId });
            loadData();
        } catch (err: any) {
            toast.error(err?.message || 'Gagal melakukan sinkronisasi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, loadData]);

    return {
        isSubmitting,
        isLoading,
        formData,
        errors,
        masterData,
        loadingMasterData,
        poDetail,
        isSyncing,
        handleSyncById,
        itemData,
        loadingItemData,
        itemTableData,
        itemPagination,
        handleItemsPageChange,
        localAddedItems,

        // Handlers
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleSubmit,
        // Product handlers
        handleAddProductItem,
        handleProductDelete,
        handleUpdateProductItem,
        handleDeleteLocalItem,
        handleUpdateLocalItem,
        // File handlers
        handleAddFiles,
        loadData
    };
};
