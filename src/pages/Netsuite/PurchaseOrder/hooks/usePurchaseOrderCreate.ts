import { useState, useEffect } from 'react';
import { PurchaseOrderForm, PurchaseOrderValidationErrors, MasterDataFormFieldItems, TablePOItem } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';

export const usePurchaseOrderCreate = () => {
    const navigate = useNavigate();
    
    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.email || null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<PurchaseOrderValidationErrors>({});
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    const [formData, setFormData] = useState<PurchaseOrderForm>({
        customform: 102,
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
        custbody_msi_createdby_api: profileSSOId,
        custbody_me_validity_date: null,
        class: null,
        class_name: '',
        // description: null,
        department: null,
        department_name: '',
        items: []
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
            [name]: name === 'area_size_ha' ? value : value
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

    // Validasi field yang required sebelum submit
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
            toast.error('Please fix the validation errors');
            return;
        }
        setIsSubmitting(true);
        try {
            // Create JSON request body instead of FormData
            const requestData = {
                customform: Number(formData.customform) || null,
                vendorid: Number(formData.vendorid) || null,
                purchasedate: formData.purchasedate ? formData.purchasedate : null,
                subsidiary: Number(formData.subsidiary) || null,
                location: Number(formData.location) || null,
                memo: formData.memo || '',
                currency: Number(formData.currency) || null,
                terms: Number(formData.terms) || null,
                custbody_me_pr_date: formData.custbody_me_pr_date ? formData.custbody_me_pr_date : null,
                custbody_me_project_location: Number(formData.custbody_me_project_location) || null,
                custbody_me_pr_type: Number(formData.custbody_me_pr_type) || null,
                custbody_me_saving_type: formData.custbody_me_saving_type || null,
                custbody_me_pr_number: formData.custbody_me_pr_number || '',
                custbody_msi_createdby_api: profileSSOId || '',
                custbody_me_validity_date: formData?.custbody_me_validity_date || null,
                class: Number(formData.class) || null,
                department: Number(formData.department) || null,
                // description: formData.description || null,
                items: (formData.items || []).map(item => ({
                    itemId: Number(item.itemId || 0),
                    qty: Number(item.qty || 0),
                    rate: item.rate,
                    department: Number(item.department) || null,
                    class: Number(item.class) || null,
                    location: Number(item.location) || 0,
                    taxcode: Number(item.taxcode) || null,
                    custcol_me_landed_cost: Number(item.custcol_me_landed_cost) || null,
                    custcol_msi_fob: Number(item.custcol_msi_fob) || null,
                }))
            };

            const response = await PurchaseOrderService.createPurchaseOrder(requestData);
            if (response.success) {
                toast.success('Purchase Order berhasil dibuat');
                navigate('/netsuite/purchase-order');
            } else {
                toast.error(response.message || 'Purchase Order tidak berhasil dibuat');
            }
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setValidationErrors(error.errors);
            }
            console.error('Error creating purchase order:', error);
            toast.error(error.message || 'Gagal membuat purchase order');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Product handlers - now handled by usePOItemsSelect hook
    const handleAddProductItem = (selectedProduct: any) => {
        if (!selectedProduct) {
            return;
        }
        
        const deptName = formData?.department_name
            || masterData?.departments?.find(d => d.id === formData?.department)?.name
            || '';
        const className = formData?.class_name
            || masterData?.class?.find(c => c.id === formData?.class)?.name
            || '';

        const newItem: TablePOItem = {
            id: `${selectedProduct.value}-${Date.now()}`,
            product_id: selectedProduct.value,
            product_name: selectedProduct.data?.displayName || selectedProduct.label,
            itemId: Number(selectedProduct.data?.itemId) || Number(selectedProduct.value),
            qty: 1,
            rate: 0,
            amount: 0,
            total: 0,
            department: formData?.department || 0,
            department_name: deptName,
            class: formData?.class || 0,
            class_name: className,
            location:  Number(formData.location) || 0,
            location_name: formData?.location_name || '',
            taxcode: masterData?.taxcodes?.[0]?.id || 0,
            taxcode_name: masterData?.taxcodes?.[0]?.name || '',
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
        formData,
        errors,
        masterData,
        loadingMasterData,
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
