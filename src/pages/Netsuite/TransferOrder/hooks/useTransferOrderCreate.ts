import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { TransferOrderFormData, TransferOrderFormItem } from '../types/transferOrder';
import { TransferOrderService } from '../services/transferOrderService';
import { PurchaseOrderService } from '@/pages/Netsuite/PurchaseOrder/services/purchaseOrderService';
import { MasterDataFormFieldItems } from '@/pages/Netsuite/PurchaseOrder/types/purchaseorder';

const DEFAULT_FORM: TransferOrderFormData = {
    customform: 135,
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
    custbody_msi_createdby_api: 'T',
    items: [],
    files: [],
};

export const useTransferOrderCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const profileSSO = getProfile() as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [formData, setFormData] = useState<TransferOrderFormData>(() => {
        if (location.state?.formData) {
            return {
                ...location.state.formData,
                status: 'A',
                custbody_msi_createdby_api: profileSSO?.email || 'T',
            };
        }
        return {
            ...DEFAULT_FORM,
            custbody_msi_createdby_api: profileSSO?.email || 'T',
        };
    });

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
        if (!formData.employee) newErrors.employee = 'Employee wajib dipilih';
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
                custbody_msi_createdby_api: formData.custbody_msi_createdby_api || 'T',
                items: formData.items.map(item => ({
                    item: item.itemId,
                    quantity: Number(item.quantity),
                    description: item.description || '',
                    expectedreceiptdate: item.expectedreceiptdate || undefined,
                    rate: item.rate ?? undefined,
                })),
                files: (formData.files || []).map(f => ({ file_name: f.fileName, file_url: f.fileUrl })),
            };
            const response = await TransferOrderService.createTransferOrder(payload as any);
            if (response.success) {
                toast.success('Transfer Order berhasil dibuat');
                const newId = response.data?.localId || response.data?.id;
                if (newId) {
                    navigate(`/netsuite/transfer-orders/edit/${newId}`);
                } else {
                    navigate('/netsuite/transfer-orders');
                }
            } else {
                toast.error(response.message || 'Transfer Order tidak berhasil dibuat');
            }
        } catch (error: any) {
            console.error('Error creating transfer order:', error);
            toast.error(error.message || 'Gagal membuat transfer order');
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
