import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { SalesOrderFormData, SalesOrderFormItem } from '../types/salesOrder';
import { SalesOrderService } from '../services/salesOrderService';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

const DEFAULT_FORM: SalesOrderFormData = {
    customform: 104,
    subsidiary: null,
    subsidiary_name: '',
    entity: null,
    entity_name: '',
    trandate: '',
    startdate: null,
    enddate: null,
    orderstatus: 'A',
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
    custbody_msi_bank_payment_so: null,
    custbody_msi_bank_payment_so_name: [],
    custbody_cseg_cn_cfi: null,
    custbody_msi_createdby_api: 'T',
    // custbody_me_approval_status: 1,
    total_amount: 0,
    items: [],
    files: [],
};

export const useSalesOrderCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const profileSSO = getProfile() as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [formData, setFormData] = useState<SalesOrderFormData>(() => {
        if (location.state?.formData) {
            return {
                ...location.state.formData,
                orderstatus: 'A', // Reset to default status
                custbody_msi_createdby_api: profileSSO?.email || 'T',
            };
        }
        return {
            ...DEFAULT_FORM,
            custbody_msi_createdby_api: profileSSO?.email || 'T',
        };
    });

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
                toast.error('Error loading master data');
            } finally {
                setLoadingMasterData(false);
            }
        };

        loadMasterData();
    }, []);

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

    // Items management
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
            taxcode: 0,
            taxcode_name: '',
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
                // Auto-calc amount when qty or rate changes
                if (field === 'qty' || field === 'rate') {
                    item.amount = Number(item.qty) * Number(item.rate);
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
        if (!formData.subsidiary) newErrors.subsidiary = 'Subsidiary wajib dipilih';
        if (!formData.currency) newErrors.currency = 'Currency wajib dipilih';
        if (!formData.location) newErrors.location = 'Location wajib dipilih';
        if (!formData.department) newErrors.department = 'Department wajib dipilih';
        if (!formData.class) newErrors.class = 'Class wajib dipilih';
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
        setIsSubmitting(true);
        try {
            const payload = {
                customform: formData.customform,
                subsidiary: formData.subsidiary,
                subsidiary_name: formData.subsidiary_name || '',
                entity: Number(formData.entity),
                customer_name: formData.entity_name || '',
                trandate: formData.trandate || null,
                startdate: formData.startdate ? formData.startdate : null,
                enddate: formData.enddate ? formData.enddate : null,
                orderstatus: formData.orderstatus,
                otherrefnum: formData.otherrefnum || '',
                memo: formData.memo || '',
                currency: formData.currency,
                currency_name: formData.currency_name || '',
                terms: formData.terms || undefined,
                terms_name: formData.terms_name || '',
                department: formData.department || undefined,
                department_name: formData.department_name || '',
                class: formData.class || undefined,
                class_name: formData.class_name || '',
                location: formData.location || undefined,
                location_name: formData.location_name || '',
                custbody_msi_quotation_no_iec: formData.custbody_msi_quotation_no_iec || '',
                custbody_msi_bank_payment_so: formData.custbody_msi_bank_payment_so || [],
                custbody_msi_bank_payment_so_name: formData.custbody_msi_bank_payment_so_name || [],
                custbody_cseg_cn_cfi: formData.custbody_cseg_cn_cfi || undefined,
                custbody_msi_createdby_api: formData.custbody_msi_createdby_api || 'T',
                items: formData.items.map(item => ({
                    itemId: item.itemId,
                    qty: Number(item.qty),
                    rate: Number(item.rate),
                    amount: Number(item.amount),
                    description: item.description || '',
                    department: item.department || undefined,
                    class: item.class || undefined,
                    location: item.location || undefined,
                    taxcode: item.taxcode || undefined,
                })),
                files: formData.files || [],
            };
            const response = await SalesOrderService.createSalesOrder(payload as any);
            if (response.success) {
                toast.success('Sales Order berhasil dibuat');
                const newId = response.data?.data?.soId || response.data?.soId || response.data?.id || (response.data?.items && response.data.items[0]?.id);
                if (newId) {
                    navigate(`/netsuite/sales-orders/edit/${newId}`);
                } else {
                    navigate('/netsuite/sales-orders');
                }
            } else {
                toast.error(response.message || 'Sales Order tidak berhasil dibuat');
            }
        } catch (error: any) {
            console.error('Error creating sales order:', error);
            toast.error(error.message || 'Gagal membuat sales order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleDateChange,
        handleAddItem,
        handleRemoveItem,
        handleUpdateItem,
        handleSubmit,
        masterData,
        loadingMasterData,
    };
};
