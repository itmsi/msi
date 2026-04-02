import { useState, useEffect } from 'react';
import { PurchaseOrderForm, PurchaseOrderValidationErrors, MasterDataFormFieldItems, TablePOItem, PODetailData } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import { formatDateToDMYmiring } from '@/helpers/generalHelper';

// Mapping response API (PODetailData) ke format form (PurchaseOrderForm)
const mapPODetailToForm = (detail: PODetailData): PurchaseOrderForm => {
    const firstLine = detail.lines?.[0];

    // Filter hanya item bukan TaxItem
    const productLines = (detail.lines || []).filter(line => line.itemtype !== 'TaxItem');

    const items: TablePOItem[] = productLines.map((line, idx) => ({
        id: `${line.item}-${idx}`,
        product_id: String(line.item),
        product_name: line.item_display || '',
        itemId: line.item,
        qty: line.quantity ?? 0,
        rate: line.rate ?? 0,
        amount: line.netamount ?? 0,
        total: line.grossamt ?? 0,
        department: line.department ?? 0,
        department_name: line.department_display || '',
        class: line.class ?? 0,
        class_name: line.class_display || '',
        location: line.location ?? 0,
        location_name: line.location_display || '',
        taxcode: line.taxcode ?? 0,
        taxcode_name: line.taxcode_display || '',
        tax_rate: line.taxrate1 != null ? String(line.taxrate1) : '',
        gross_amount: line.grossamt ?? 0,
        tax_amount: line.tax1amt ?? 0,
    }));

    return {
        customform: null,
        vendorid: detail.vendor_id,
        purchasedate: detail.po_date,
        subsidiary: detail.subsidiary ?? 0,
        subsidiary_display: detail.subsidiary_display || '',
        location: firstLine?.location ?? null,
        memo: detail.memo || '',
        currency: detail.currency_id,
        terms: null,
        custbody_me_pr_date: detail.custbody_me_pr_date || null,
        custbody_me_project_location: detail.custbody_me_project_location ?? null,
        custbody_me_pr_type: detail.custbody_me_pr_type ?? null,
        custbody_me_saving_type: detail.custbody_me_saving_type ?? null,
        custbody_me_pr_number: detail.custbody_me_pr_number || '',
        class: firstLine?.class ?? null,
        department: firstLine?.department ?? null,
        approvalstatus: detail.approvalstatus,
        custbody_msi_createdby_api: detail.custbody_msi_createdby_api,
        // description: detail.custbody_me_description || null,
        items,
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

    const [formData, setFormData] = useState<PurchaseOrderForm>({
        customform: null,
        vendorid: null,
        purchasedate: null,
        subsidiary: null,
        location: null,
        memo: '',
        currency: null,
        terms: null,
        custbody_me_pr_date: null,
        custbody_me_project_location: null,
        custbody_me_pr_type: null,
        custbody_me_saving_type: null,
        custbody_me_pr_number: '',
        class: null,
        // description: null,
        department: null,
        items: []
    });

    // Load master data + detail PO secara paralel
    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                toast.error('Purchase Order ID tidak ditemukan');
                navigate('/netsuite/purchase-order');
                return;
            }

            try {
                setIsLoading(true);
                setLoadingMasterData(true);

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
                    console.log({
                        detail
                    });
                    
                    setFormData(mapPODetailToForm(detail));
                } else {
                    toast.error(detailRes.message || 'Data Purchase Order tidak ditemukan');
                    navigate('/netsuite/purchase-order');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Gagal memuat data');
            } finally {
                setIsLoading(false);
                setLoadingMasterData(false);
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
        if (!formData.currency) newErrors.currency = 'Currency wajib dipilih';
        if (!formData.subsidiary) newErrors.subsidiary = 'Subsidiary wajib dipilih';
        if (!formData.location) newErrors.location = 'Location wajib dipilih';
        if (!formData.class) newErrors.class = 'Class wajib dipilih';
        if (!formData.department) newErrors.department = 'Department wajib dipilih';
        // if (!formData.description) newErrors.description = 'Description wajib diisi';
        if (!formData.items || formData.items.length === 0) {
            newErrors.items = 'Minimal 1 item harus ditambahkan';
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
            const requestData = {
                // id: poDetail?.po_id || id,
                customform: formData.customform || null,
                vendorid: formData.vendorid || null,
                purchasedate: formData.purchasedate ? formatDateToDMYmiring(new Date(formData.purchasedate)) : null,
                subsidiary: formData.subsidiary || null,
                location: formData.location || null,
                memo: formData.memo || '',
                currency: formData.currency || null,
                terms: formData.terms || null,
                custbody_me_pr_date: formData.custbody_me_pr_date ? formatDateToDMYmiring(new Date(formData.custbody_me_pr_date)) : null,
                custbody_me_project_location: formData.custbody_me_project_location || null,
                custbody_me_pr_type: formData.custbody_me_pr_type || null,
                custbody_me_saving_type: formData.custbody_me_saving_type || null,
                custbody_me_pr_number: formData.custbody_me_pr_number || '',
                class: formData.class || null,
                department: formData.department || null,
                // description: formData.description || null,
                items: (formData.items || []).map(item => ({
                    itemId: item.itemId,
                    qty: item.qty,
                    rate: item.rate,
                    department: item.department,
                    class: item.class,
                    location: item.location,
                    taxcode: item.taxcode,
                }))
            };

            // TODO: ganti ke updatePurchaseOrder kalau endpoint sudah ada
            const response = await PurchaseOrderService.createPurchaseOrder(requestData);
            if (response.success) {
                toast.success('Purchase Order berhasil diupdate');
                navigate('/netsuite/purchase-order');
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

        const newItem: TablePOItem = {
            id: `${selectedProduct.value}-${Date.now()}`,
            product_id: selectedProduct.value,
            product_name: selectedProduct.data?.displayName || selectedProduct.label,
            itemId: parseInt(selectedProduct.data?.itemId) || parseInt(selectedProduct.value),
            qty: 1,
            rate: 0,
            amount: 0,
            total: 0,
            department: formData?.items?.[0]?.department || 0,
            department_name: formData?.items?.[0]?.department_name || '',
            class: formData?.items?.[0]?.class || 0,
            class_name: formData?.items?.[0]?.class_name || '',
            location: formData?.items?.[0]?.location || 0,
            location_name: formData?.items?.[0]?.location_name || '',
            taxcode: formData?.items?.[0]?.taxcode || 0,
            taxcode_name: formData?.items?.[0]?.taxcode_name || '',
            tax_rate: '',
            gross_amount: 0,
            tax_amount: 0
        };

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    const handleProductDelete = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== productId)
        }));
    };

    const handleUpdateProductItem = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const updatedItems = [...prev.items];
            if (updatedItems[index]) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    [field]: value
                };
            }
            return {
                ...prev,
                items: updatedItems
            };
        });
    };

    return {
        isSubmitting,
        isLoading,
        formData,
        errors,
        masterData,
        loadingMasterData,
        poDetail,
        // Handlers
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleSubmit,
        // Product handlers
        handleAddProductItem,
        handleProductDelete,
        handleUpdateProductItem,
    };
};
