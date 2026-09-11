import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProfile } from '@/helpers/generalHelper';
import { InventoryAdjustmentService } from '../services/inventoryAdjustmentService';
import { InventoryAdjustmentFormData, InventoryAdjustmentFormLine, CreateInventoryAdjustmentRequest } from '../types/inventoryAdjustment';

const buildDefaultForm = (): InventoryAdjustmentFormData => ({
    customform: null,
    subsidiary: null,
    subsidiary_name: '',
    account: null,
    adjlocation: null,
    adjlocation_name: '',
    department: null,
    department_name: '',
    class: null,
    class_name: '',
    memo: '',
    customer: null,
    customer_name: '',
    custbody_me_description: '',
    custbody_me_inv_customer: null,
    custbody_me_purchase_order_number: '',
    custbody_msi_cycle_count_cumber: '',
    lines: [],
});

export const useInventoryAdjustmentCreate = () => {
    const navigate = useNavigate();
    const profileSSO = getProfile() as any;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<InventoryAdjustmentFormData>(buildDefaultForm());

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const { [field]: _removed, ...rest } = prev;
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

    const handleAddLine = (selectedItem: any) => {
        if (!selectedItem) return;
        const newLine: InventoryAdjustmentFormLine = {
            id: `${selectedItem.value}-${Date.now()}`,
            item: Number(selectedItem.value),
            item_name: selectedItem.data?.itemId || selectedItem.label,
            item_displayname: selectedItem.data?.displayName || selectedItem.label,
            location: formData.adjlocation,
            location_name: formData.adjlocation_name || '',
            quantity: '',
            unit_cost: '',
            department: formData.department,
            department_name: formData.department_name || '',
            class: formData.class,
            class_name: formData.class_name || '',
            custcol_me_purchase_number_line: '',
            memo: '',
            serials: '',
        };
        setFormData(prev => ({ ...prev, lines: [...prev.lines, newLine] }));
        clearError('lines');
    };

    const handleRemoveLine = (lineId: string) => {
        setFormData(prev => ({ ...prev, lines: prev.lines.filter(l => l.id !== lineId) }));
    };

    const handleUpdateLine = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const updated = [...prev.lines];
            if (updated[index]) {
                updated[index] = { ...updated[index], [field]: value };
            }
            return { ...prev, lines: updated };
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.subsidiary) newErrors.subsidiary = 'Subsidiary wajib dipilih';
        if (!formData.account) newErrors.account = 'Adjustment Account wajib diisi';
        if (!formData.adjlocation) newErrors.adjlocation = 'Adjustment Location wajib dipilih';
        if (!formData.department) newErrors.department = 'Department wajib dipilih';
        if (!formData.class) newErrors.class = 'Class wajib dipilih';
        if (!formData.lines || formData.lines.length === 0) {
            newErrors.lines = 'Minimal 1 item harus ditambahkan';
        } else {
            const invalidLine = formData.lines.find(l => !l.item || !l.location || l.quantity === '' || l.quantity === null || l.quantity === undefined);
            if (invalidLine) {
                newErrors.lines = 'Setiap baris item wajib memiliki Item, Location, dan Quantity';
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
        setIsSubmitting(true);
        try {
            const payload: CreateInventoryAdjustmentRequest = {
                customform: formData.customform ?? undefined,
                subsidiary: Number(formData.subsidiary),
                account: Number(formData.account),
                department: Number(formData.department),
                class: Number(formData.class),
                adjlocation: Number(formData.adjlocation),
                memo: formData.memo || undefined,
                customer: formData.customer ?? undefined,
                created_by: profileSSO?.user_id || undefined,
                custbody_me_description: formData.custbody_me_description || undefined,
                custbody_me_inv_customer: formData.custbody_me_inv_customer ?? undefined,
                custbody_me_purchase_order_number: formData.custbody_me_purchase_order_number || undefined,
                custbody_msi_cycle_count_cumber: formData.custbody_msi_cycle_count_cumber || undefined,
                lines: formData.lines.map(line => ({
                    item: Number(line.item),
                    location: Number(line.location),
                    quantity: Number(line.quantity),
                    unit_cost: line.unit_cost !== '' ? Number(line.unit_cost) : undefined,
                    department: line.department ?? undefined,
                    class: line.class ?? undefined,
                    custcol_me_purchase_number_line: line.custcol_me_purchase_number_line || undefined,
                    memo: line.memo || undefined,
                    serials: line.serials
                        ? line.serials.split(',').map(s => s.trim()).filter(Boolean)
                        : undefined,
                })),
            };

            const response = await InventoryAdjustmentService.createInventoryAdjustment(payload);
            const isSuccess = response.success !== false && response.status !== 'error';
            if (isSuccess) {
                toast.success(response.message || 'Inventory Adjustment berhasil dibuat');
                const newId = response.inventory_adjustment_id || response.netsuite_id || response.id || response.data?.netsuite_id || response.data?.id;
                if (newId) {
                    navigate(`/netsuite/inventory-adjustments/view/${newId}`);
                } else {
                    navigate('/netsuite/inventory-adjustments');
                }
            } else {
                toast.error(response.message || 'Inventory Adjustment tidak berhasil dibuat');
            }
        } catch (error: any) {
            console.error('Error creating inventory adjustment:', error);
            toast.error(error.message || 'Gagal membuat Inventory Adjustment');
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
        handleAddLine,
        handleRemoveLine,
        handleUpdateLine,
        handleSubmit,
    };
};
