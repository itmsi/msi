import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreateIupRkabPayload, IupRkabFormItem } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';

export const useIupContactorUnit = () => {
    const { id } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataRkab, setDataRkab] = useState<IupRkabFormItem[]>([]);
    const [rkabErrors, setRkabErrors] = useState<Record<number, Record<string, string>>>({});
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; iup_rkab_id?: string }>({ show: false });

    useEffect(() => {
        if (id) {
            loadRkabData(id);
        }
    }, [id]);

    const loadRkabData = async (iupId: string) => {
        try {
            setIsLoading(true);
            const response = await IupService.getIupRkab({
                iup_id: iupId,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            if (response.success && response.data) {
                setDataRkab(
                    response.data.map((item: IupRkabFormItem) => ({
                        iup_rkab_id: item.iup_rkab_id,
                        iup_rkab_year: item.iup_rkab_year,
                        iup_rkab_current_production: item.iup_rkab_current_production,
                        iup_rkab_target_production: item.iup_rkab_target_production,
                    }))
                );
            }
        } catch (error: any) {
            console.error('Error loading RKAB data:', error);
            toast.error('Failed to load RKAB data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRkab = () => {
        setDataRkab(prev => [...prev, {
            iup_rkab_year: '',
            iup_rkab_current_production: '',
            iup_rkab_target_production: '',
        }]);
    };

    const handleRkabFieldChange = (index: number, field: keyof IupRkabFormItem, value: string) => {
        setDataRkab(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
        if (rkabErrors[index]?.[String(field)]) {
            setRkabErrors(prev => ({ ...prev, [index]: { ...prev[index], [String(field)]: '' } }));
        }
    };

    const handleSubmitRkab = async (item: IupRkabFormItem, index: number) => {
        if (!id) { toast.error('IUP ID not found'); return; }

        const fieldErrors: Record<string, string> = {};
        if (!item.iup_rkab_year) fieldErrors.iup_rkab_year = 'Year wajib diisi';
        if (!item.iup_rkab_current_production) fieldErrors.iup_rkab_current_production = 'Current production wajib diisi';
        if (!item.iup_rkab_target_production) fieldErrors.iup_rkab_target_production = 'Target production wajib diisi';

        if (Object.keys(fieldErrors).length > 0) {
            setRkabErrors(prev => ({ ...prev, [index]: fieldErrors }));
            toast.error('Lengkapi field yang wajib diisi');
            return;
        }
        setRkabErrors(prev => ({ ...prev, [index]: {} }));

        try {
            setIsSubmitting(true);

            const payload: CreateIupRkabPayload = {
                iup_id: id,
                iup_rkab_year: item.iup_rkab_year,
                iup_rkab_current_production: item.iup_rkab_current_production,
                iup_rkab_target_production: item.iup_rkab_target_production,
            };

            if (item.iup_rkab_id) {
                await IupService.updateIupRkab(item.iup_rkab_id, payload);
            } else {
                const response = await IupService.createIupRkab(payload);
                if (response?.data?.iup_rkab_id) {
                    setDataRkab(prev => prev.map((r, i) =>
                        i === index ? { ...r, iup_rkab_id: response.data.iup_rkab_id } : r
                    ));
                }
            }

            toast.success('RKAB berhasil disimpan');
        } catch (error: any) {
            console.error('Error saving RKAB:', error);
            toast.error('Gagal menyimpan RKAB');
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeRkab = useCallback((item: IupRkabFormItem, index: number) => {
        if (!item.iup_rkab_id) {
            setDataRkab(prev => prev.filter((_, i) => i !== index));
            return;
        }
        setConfirmDelete({ show: true, iup_rkab_id: item.iup_rkab_id });
    }, []);

    const handleConfirmDeleted = useCallback(async () => {
        if (!confirmDelete.iup_rkab_id) return;
        try {
            setIsSubmitting(true);
            const response = await IupService.deleteIupRkab(confirmDelete.iup_rkab_id);
            if (response.status === 200) {
                toast.success('RKAB berhasil dihapus');
                setDataRkab(prev => prev.filter(r => r.iup_rkab_id !== confirmDelete.iup_rkab_id));
            } else {
                toast.error(response.message || 'Gagal menghapus RKAB');
            }
        } catch (error: any) {
            console.error('Error deleting RKAB:', error);
            toast.error('Gagal menghapus RKAB');
        } finally {
            setConfirmDelete({ show: false });
            setIsSubmitting(false);
        }
    }, [confirmDelete]);

    return {
        id,
        isLoading,
        isSubmitting,
        dataRkab,
        rkabErrors,
        handleAddRkab,
        handleRkabFieldChange,
        handleSubmitRkab,
        removeRkab,
        handleConfirmDeleted,
        setConfirmDelete,
        confirmDelete,
    };
}
