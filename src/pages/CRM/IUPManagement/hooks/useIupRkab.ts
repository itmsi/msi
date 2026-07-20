import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreateIupRkabPayload, IupRkab, Pagination } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';

export interface RkabFormState {
    iup_rkab_id?: string;
    year: string;
    current: string | number;
    target: string | number;
}

export interface RkabFormErrors {
    year?: string;
    current?: string | number;
    target?: string | number;
}

const emptyForm = (): RkabFormState => ({
    year: "",
    current: "",
    target: "",
});

const validateRkabForm = (form: RkabFormState): RkabFormErrors => {
    const errors: RkabFormErrors = {};

    if (!form.year.trim()) {
        errors.year = "Tahun wajib diisi";
    }

    return errors;
};

const hasFormErrors = (errors: RkabFormErrors): boolean => Object.values(errors).some(Boolean);

export const useIupRkab = () => {
    const { id } = useParams<{ id: string }>();
    const [dataRkab, setDataRkab] = useState<IupRkab[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<RkabFormState>(emptyForm());
    const [errors, setErrors] = useState<RkabFormErrors>({});
    
    const fetchRkabData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await IupService.getIupRkab({
                iup_id: id,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            setDataRkab(response.data);
            setPagination(response.pagination);
        } catch (error: any) {
            console.error('Error loading RKAB data:', error);
            toast.error('Failed to load RKAB data');
        } finally {
            setLoading(false);
        }
    }, [id]);
    
    useEffect(() => {
        fetchRkabData();
    }, [fetchRkabData]);

    const deleteRkab = useCallback(
        async (id: string): Promise<boolean> => {
            setDeletingId(id);
            try {
                await IupService.deleteIupRkab(id);
                toast.success("RKAB berhasil dihapus.");
                if (dataRkab.length === 1 && page > 1) {
                    setPage((p) => p - 1);
                } else {
                    await fetchRkabData();
                }
                return true;
            } catch (err) {
                console.error(err);
                toast.error("Gagal menghapus RKAB.");
                return false;
            } finally {
                setDeletingId(null);
            }
        },[dataRkab.length, page, fetchRkabData]
    );
    

    // ---- form helpers ----
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setShowForm(true);
    };
        
    const openEditForm = (visit: IupRkab) => {
        setEditingId(visit.iup_rkab_id);
        setForm({
            year: visit.iup_rkab_year,
            current: Number(visit.iup_rkab_current_production),
            target: Number(visit.iup_rkab_target_production),
        });
        setErrors({});
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
    };
        
    const updateField = <K extends keyof RkabFormState>(
        field: K,
        value: RkabFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field as keyof RkabFormErrors] ? { ...prev, [field]: undefined } : prev));
    };
        
    const toPayload = (): Omit<CreateIupRkabPayload, "iup_rkab_id"> => ({
        iup_id: id ? id : '',
        iup_rkab_year: form.year,
        iup_rkab_current_production: Number(form.current),
        iup_rkab_target_production: Number(form.target)
    });

    /** Validasi form, lalu kirim create/update ke API. Return true kalau sukses. */
    const submitForm = async (): Promise<boolean> => {
        const validationResult = validateRkabForm(form);
        setErrors(validationResult);
        if (hasFormErrors(validationResult)) {
            toast.error("Please check the form, there are invalid fields.");
            return false;
        }

        const payload = toPayload();
        const isEdit = !!editingId;
        setSubmitting(true);
        try {
            if (editingId) {
                await IupService.updateIupRkab(editingId, { ...payload, iup_rkab_id: editingId });
            } else {
                await IupService.createIupRkab(payload);
            }
            toast.success(isEdit ? "RKAB berhasil diperbarui." : "RKAB berhasil ditambahkan.");
            await fetchRkabData();
            closeForm();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Gagal menyimpan unit. Coba lagi.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };


    return {
        dataRkab,
        pagination,
        page,
        setPage,
        loading,
        submitting,
        deletingId,
        refetch: fetchRkabData,
        deleteRkab,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,

        submitForm,
    };
}
