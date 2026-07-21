import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IupBrandUnitPayload, Pagination, IupBrandUnitItem } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';


export interface BrandUnitFormState {
    name: string;
    qty: number;
}

export interface BrandUnitFormErrors {
    name?: string;
    qty?: string;
}

const emptyForm = (): BrandUnitFormState => ({
    name: '',
    qty: 0,
});

const validateBrandForm = (form: BrandUnitFormState): BrandUnitFormErrors => {
    const errors: BrandUnitFormErrors = {};

    const name = form.name.trim();
    if (!name) {
        errors.name = "Judul wajib diisi";
    } else if (name.length < 3) {
        errors.name = "Judul minimal 3 karakter";
    }

    if (form.qty <= 0) {
        errors.qty = "Kuantitas wajib diisi dan lebih besar dari 0";
    }
    return errors;
};

const hasFormErrors = (errors: BrandUnitFormErrors): boolean => Object.values(errors).some(Boolean);

export const useIupBrandUnit = () => {
    const { id } = useParams<{ id: string }>();

    const [dataUnit, setDataUnit] = useState<IupBrandUnitItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BrandUnitFormState>(emptyForm());
    const [errors, setErrors] = useState<BrandUnitFormErrors>({});

    const fetchUnitData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await IupService.getIupUnit({
                iup_id: id,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            setDataUnit(response.data);
            setPagination(response.pagination);
        } catch (error: any) {
            console.error('Error loading Unit data:', error);
            toast.error('Failed to load Unit data');
        } finally {
            setLoading(false);
        }
    }, [id]);
    
    useEffect(() => {
        fetchUnitData();
    }, [fetchUnitData]);

    const deleteBrandUnit = useCallback(
        async (id: string): Promise<boolean> => {
            setDeletingId(id);
            try {
                await IupService.deleteIupUnit(id);
                toast.success("Unit berhasil dihapus.");
                if (dataUnit.length === 1 && page > 1) {
                    setPage((p) => p - 1);
                } else {
                    await fetchUnitData();
                }
                return true;
            } catch (err) {
                console.error(err);
                toast.error("Gagal menghapus unit.");
                return false;
            } finally {
                setDeletingId(null);
            }
        },[dataUnit.length, page, fetchUnitData]
    );

    // ---- form helpers ----
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setShowForm(true);
    };
    
    const openEditForm = (visit: IupBrandUnitItem) => {
        setEditingId(visit.iup_brand_unit_id);
        setForm({
            name: visit.iup_brand_unit_name,
            qty: Number(visit.iup_brand_unit_qty),
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
    
    const updateField = <K extends keyof Omit<BrandUnitFormState, "imageLinks">>(
        field: K,
        value: BrandUnitFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field as keyof BrandUnitFormErrors] ? { ...prev, [field]: undefined } : prev));
    };
    
    const toPayload = (): Omit<IupBrandUnitPayload, "iup_visit_history_id"> => ({
        iup_id: id ? id : '',
        iup_brand_unit_name: form.name,
        iup_brand_unit_qty: Number(form.qty)
    });

    /** Validasi form, lalu kirim create/update ke API. Return true kalau sukses. */
    const submitForm = async (): Promise<boolean> => {
        const validationResult = validateBrandForm(form);
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
                await IupService.updateIupUnit(editingId, { ...payload, iup_brand_unit_id: editingId });
            } else {
                await IupService.createIupUnit(payload);
            }
            toast.success(isEdit ? "Unit berhasil diperbarui." : "Unit berhasil ditambahkan.");
            await fetchUnitData();
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
        dataUnit,
        pagination,
        page,
        setPage,
        loading,
        submitting,
        deletingId,
        refetch: fetchUnitData,
        deleteBrandUnit,

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
