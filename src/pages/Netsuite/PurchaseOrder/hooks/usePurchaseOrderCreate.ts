import { useState, useEffect } from 'react';
import { PurchaseOrderForm, PurchaseOrderValidationErrors, MasterDataFormFieldItems, TablePOItem } from '../types/purchaseorder';
import { PurchaseOrderService } from '../services/purchaseOrderService';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { formatDateToDMYmiring } from '@/helpers/generalHelper';

export const usePurchaseOrderCreate = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<PurchaseOrderValidationErrors>({});
    const [masterData, setMasterData] = useState<MasterDataFormFieldItems | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

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

        const newItem: TablePOItem = {
            id: `${selectedProduct.value}-${Date.now()}`, // Generate a temporary ID for the frontend
            product_id: selectedProduct.value,
            product_name: selectedProduct.data?.displayName || selectedProduct.label,
            itemId: parseInt(selectedProduct.data?.itemId) || parseInt(selectedProduct.value),
            qty: 1,
            rate: 0,
            amount: 0,
            total: 0,
            department: masterData?.departments?.[0]?.id || 0,
            department_name: masterData?.departments?.[0]?.name || '',
            class: formData?.class || 0,
            class_name: formData?.class ? masterData?.class?.find(cls => cls.id === formData.class)?.name || '' : '',
            location: formData?.location || 0,
            location_name: formData?.location ? masterData?.subsidiarys?.find(sub => sub.id === formData.location)?.name || '' : '',
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
