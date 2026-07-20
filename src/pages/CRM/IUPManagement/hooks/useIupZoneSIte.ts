import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IupZonaSiteItem, Pagination, ZonaSitePayload } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
import moment from 'moment';


export interface ZoneFormState {
    title: string;
    date: string;
    description: string;
    fileLink: string[];
}

export interface ZoneFormErrors {
    title?: string;
    date?: string;
    description?: string;
    fileLink?: string;
}

const emptyForm = (): ZoneFormState => ({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    fileLink: [""],
});

// const isValidUrl = (value: string): boolean => {
//     try {
//         new URL(value);
//         return true;
//     } catch {
//         return false;
//     }
// };

const validateZoneForm = (form: ZoneFormState): ZoneFormErrors => {
    const errors: ZoneFormErrors = {};

    const title = form.title.trim();
    if (!title) {
        errors.title = "Judul wajib diisi";
    } else if (title.length < 3) {
        errors.title = "Judul minimal 3 karakter";
    }

    if (!form.date) {
        errors.date = "Tanggal wajib diisi";
    } else if (Number.isNaN(new Date(form.date).getTime())) {
        errors.date = "Format tanggal tidak valid";
    }

    // const filledLinks = form.fileLink.map((l) => l.trim()).filter(Boolean);
    // const invalidLink = filledLinks.find((link) => !isValidUrl(link));
    // if (invalidLink) {
    //     errors.fileLink = "Salah satu link file tidak valid, pastikan berupa URL lengkap (https://...)";
    // }

    return errors;
};

const hasFormErrors = (errors: ZoneFormErrors): boolean => Object.values(errors).some(Boolean);

export const useIupZoneSIte = () => {
    const { id } = useParams<{ id: string }>();

    const [zones, setZones] = useState<IupZonaSiteItem[]>([]);
    const [pagination] = useState<Pagination | null>(null);
    // const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; iup_zona_site_id?: string; name?: string }>({ show: false });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ZoneFormState>(emptyForm());
    const [errors, setErrors] = useState<ZoneFormErrors>({});

    const fetchZoneSiteData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await IupService.getIupZonaSite({
                iup_id: id,
                sort_by: 'updated_at',
                sort_order: 'desc'
            });

            // if (response.success && response.data?.length) {
            setZones(response.data);
            // }
        } catch (error: any) {
            console.error('Error loading zone site:', error);
            toast.error('Failed to load zone site data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchZoneSiteData();
    }, [fetchZoneSiteData]);

    const deleteZone = useCallback(
        async (id: string): Promise<boolean> => {
            
            // if (!confirmDelete.iup_zona_site_id) {
            //     toast.error('Zona Area not found');
            //     return;
            // }
            try {
                setDeletingId(id);
                await IupService.deleteIupZonaSite(id);
                toast.success("Zone site has been deleted successfully.");
                if (zones.length === 1 && page > 1) {
                    setPage((p) => p - 1);
                } else {
                    await fetchZoneSiteData();
                }
                return true;
            } catch (err) {
                console.error(err);
                toast.error("Failed to delete zone site.");
                return false;
            } finally {
                setDeletingId(null);
            }
        },[zones.length, page, fetchZoneSiteData]
    );

    // ---- form helpers ----
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setShowForm(true);
    };
    
    const openEditForm = (zone: IupZonaSiteItem) => {
        setEditingId(zone.iup_zona_site_id);
        setForm({
            title: zone.iup_zona_site_name ?? "",
            description: zone.iup_zona_site_description ?? "",
            date: zone.iup_zona_site_date_last_survey ?? "",
            fileLink: zone.iup_zona_site_file.length ? zone.iup_zona_site_file.map((i) => i.file_link) : [""],
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
    
    const updateField = <K extends keyof Omit<ZoneFormState, "imageLinks">>(
        field: K,
        value: ZoneFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field as keyof ZoneFormErrors] ? { ...prev, [field]: undefined } : prev));
    };

    const updateFileLink = (idx: number, value: string) => {
        setForm((prev) => {
            const links = [...prev.fileLink];
            links[idx] = value;
            return { ...prev, fileLink: links };
        });
        setErrors((prev) => (prev.fileLink ? { ...prev, fileLink: undefined } : prev));
    };
    
    const addFileLinkRow = () => {
        setForm((prev) => ({ ...prev, fileLink: [...prev.fileLink, ""] }));
    };

    const removeFileLinkRow = (idx: number) => {
        setForm((prev) => {
            const links = prev.fileLink.filter((_, i) => i !== idx);
            return { ...prev, fileLink: links.length ? links : [""] };
        });
    };
    
    const toPayload = (): Omit<ZonaSitePayload, "iup_zona_site_id"> => ({
        iup_id: id ? id : '',
        iup_zona_site_name: form.title.trim(),
        iup_zona_site_date_last_survey: moment(form.date).format("YYYY-MM-DD"),
        iup_zona_site_description: form.description,
        iup_zona_site_file: form.fileLink
            .map((l) => l.trim())
            .filter(Boolean)
            .map((file_link) => ({ file_link })),
    });

    /** Validasi form, lalu kirim create/update ke API. Return true kalau sukses. */
    const submitForm = async (): Promise<boolean> => {
        const validationResult = validateZoneForm(form);
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
                await IupService.updateIupZonaSite(editingId, { ...payload, iup_zona_site_id: editingId });
            } else {
                await IupService.createIupZonaSite(payload);
            }
            toast.success(isEdit ? "Zone site has been updated." : "Zone site has been created.");
            await fetchZoneSiteData();
            closeForm();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to save zone site. Please try again.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };


    // const removeZone = useCallback((zone: any) => {
    //     setConfirmDelete({ show: true, iup_zona_site_id: zone.id, name: zone.name });
    // },[]);

    // const handleConfirmDeleted = useCallback(async () => {
    //     if (!confirmDelete.iup_zona_site_id) {
    //         toast.error('Zona Area not found');
    //         return;
    //     }
    //     try {
    //         setIsSubmitting(true);

    //         const response = await IupService.deleteIupZonaSite(confirmDelete.iup_zona_site_id);
            
    //         if (response.status === 200) {
    //             toast.success('Zona berhasil dihapus');
    //             setConfirmDelete({show: false});
    //             updateZones(zones.filter((z) => z.id !== confirmDelete.iup_zona_site_id));
    //             return response;
    //         } else {
    //             toast.error(response.message || 'Failed to update quotation');
    //             throw new Error(response.message || 'Failed to update quotation');
    //         }
            
    //     } catch (error: any) {
    //         console.error('Error deleting zone:', error);
    //         toast.error(`Gagal menghapus zona`);
    //         setConfirmDelete({show: false});
    //     } finally {
    //         setConfirmDelete({show: false});
    //         setIsSubmitting(false);
    //     }
    // }, [setIsSubmitting, confirmDelete, zones]);

    return {
        zones,
        pagination,
        page,
        setPage,
        loading,
        submitting,
        deletingId,
        refetch: fetchZoneSiteData,
        deleteZone,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        updateFileLink,
        addFileLinkRow,
        removeFileLinkRow,

        submitForm,
    };
}
