import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IupService } from "../services/iupManagementService";
import type {
    VisitHistoryItem,
    VisitPayload,
    Pagination,
    VisitHistoryResponse
} from "../types/iupmanagement";
import { useParams } from "react-router-dom";

export interface VisitFormState {
    title: string;
    date: string;
    employeeId: string;
    employeeName?: string;
    phoneNumber: string;
    latitude: string;
    longitude: string;
    description: string;
    imageLinks: string[];
}

export interface VisitFormErrors {
    title?: string;
    date?: string;
    employeeId?: string;
    phoneNumber?: string;
    latitude?: string;
    longitude?: string;
    imageLinks?: string;
    description?: string;
}

const emptyForm = (): VisitFormState => ({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    employeeId: "",
    employeeName: "",
    phoneNumber: "",
    latitude: "",
    longitude: "",
    description: "",
    imageLinks: [""],
});

const isValidUrl = (value: string): boolean => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

// Menerima format 08xxxxxxxxxx, 628xxxxxxxxxx, atau +628xxxxxxxxxx
// const isValidIndonesianPhone = (value: string): boolean =>
//   /^(\+62|62|0)8[0-9]{8,12}$/.test(value.replace(/[\s-]/g, ""));

const validateVisitForm = (form: VisitFormState): VisitFormErrors => {
    const errors: VisitFormErrors = {};

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

    if (!form.employeeId.trim()) {
        errors.employeeId = "Employee ID wajib diisi";
    }

    // const phone = form.phoneNumber.trim();
    // if (!phone) {
    //     errors.phoneNumber = "No. telepon wajib diisi";
    // } else if (!isValidIndonesianPhone(phone)) {
    //     errors.phoneNumber = "Format no. telepon tidak valid (contoh: 081234567890)";
    // }

    // if (form.latitude.trim()) {
    //     const lat = Number(form.latitude);
    //     if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    //     errors.latitude = "Latitude harus angka antara -90 dan 90";
    //     }
    // }

    // if (form.longitude.trim()) {
    //     const long = Number(form.longitude);
    //     if (Number.isNaN(long) || long < -180 || long > 180) {
    //     errors.longitude = "Longitude harus angka antara -180 dan 180";
    //     }
    // }

    const filledLinks = form.imageLinks.map((l) => l.trim()).filter(Boolean);
    const invalidLink = filledLinks.find((link) => !isValidUrl(link));
    if (invalidLink) {
        errors.imageLinks = "Salah satu link file tidak valid, pastikan berupa URL lengkap (https://...)";
    }

    return errors;
};

const hasFormErrors = (errors: VisitFormErrors): boolean => Object.values(errors).some(Boolean);

// ---------------------------------------------------------------------------
// Hook result type
// ---------------------------------------------------------------------------
export interface UseIupVisitResult {
    visits: VisitHistoryItem[];
    pagination: Pagination | null;
    page: number;
    setPage: (page: number) => void;
    loading: boolean;
    submitting: boolean;
    deletingId: string | null;
    refetch: () => Promise<void>;
    deleteVisit: (id: string) => Promise<boolean>;

    showForm: boolean;
    editingId: string | null;
    form: VisitFormState;
    errors: VisitFormErrors;
    openCreateForm: () => void;
    openEditForm: (visit: VisitHistoryItem) => void;
    closeForm: () => void;
    updateField: <K extends keyof Omit<VisitFormState, "imageLinks">>(
        field: K,
        value: VisitFormState[K]
    ) => void;
    updateImageLink: (idx: number, value: string) => void;
    addImageLinkRow: () => void;
    removeImageLinkRow: (idx: number) => void;

    submitForm: () => Promise<boolean>;
}

export const useIupVisit = () => {
    const { id } = useParams<{ id: string }>();
    const [visits, setVisits] = useState<VisitHistoryItem[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<VisitFormState>(emptyForm());
    const [errors, setErrors] = useState<VisitFormErrors>({});

    const fetchVisits = useCallback(async () => {
        setLoading(true);
        try {
            const res: VisitHistoryResponse = await IupService.getIupVisit({
                iup_id: id,
                sort_by: 'updated_at',
                sort_order: 'desc'
            });
            setVisits(res.data);
            setPagination(res.pagination);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load visit history.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

    const deleteVisit = useCallback(
        async (id: string): Promise<boolean> => {
            setDeletingId(id);
            try {
                await IupService.deleteIupVisit(id);
                toast.success("Kunjungan berhasil dihapus.");
                if (visits.length === 1 && page > 1) {
                    setPage((p) => p - 1);
                } else {
                    await fetchVisits();
                }
                return true;
            } catch (err) {
                console.error(err);
                toast.error("Gagal menghapus kunjungan.");
                return false;
            } finally {
                setDeletingId(null);
            }
        },[visits.length, page, fetchVisits]
    );
    
    const fillCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation tidak didukung oleh browser ini.");
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            setForm((prev) => ({
                ...prev,
                latitude: pos.coords.latitude.toFixed(6),
                longitude: pos.coords.longitude.toFixed(6),
            }));
            setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
        },
        (err) => {
            console.error(err);
            toast.error("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.");
        },{ enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);
    // ---- form helpers ----
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setShowForm(true);
        fillCurrentLocation();
    };

    const openEditForm = (visit: VisitHistoryItem) => {
        setEditingId(visit.iup_visit_history_id);
        setForm({
            title: visit.title,
            date: visit.date ? visit.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            employeeId: visit.employee_id ?? "",
            employeeName: visit.employee_name ?? "",
            phoneNumber: visit.phone_number ?? "",
            latitude: visit.latitude ?? "",
            longitude: visit.longitude ?? "",
            description: visit.description ?? "",
            imageLinks: visit.image.length ? visit.image.map((i) => i.file_link) : [""],
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

    const updateField = <K extends keyof Omit<VisitFormState, "imageLinks">>(
        field: K,
        value: VisitFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field as keyof VisitFormErrors] ? { ...prev, [field]: undefined } : prev));
    };

    const updateImageLink = (idx: number, value: string) => {
        setForm((prev) => {
            const links = [...prev.imageLinks];
            links[idx] = value;
            return { ...prev, imageLinks: links };
        });
        setErrors((prev) => (prev.imageLinks ? { ...prev, imageLinks: undefined } : prev));
    };

    const addImageLinkRow = () => {
        setForm((prev) => ({ ...prev, imageLinks: [...prev.imageLinks, ""] }));
    };

    const removeImageLinkRow = (idx: number) => {
        setForm((prev) => {
            const links = prev.imageLinks.filter((_, i) => i !== idx);
            return { ...prev, imageLinks: links.length ? links : [""] };
        });
    };

    const toPayload = (): Omit<VisitPayload, "iup_visit_history_id"> => ({
        iup_id: id ? id : '',
        title: form.title.trim(),
        date: form.date,
        employee_id: form.employeeId,
        phone_number: form.phoneNumber,
        latitude: form.latitude,
        longitude: form.longitude,
        description: form.description,
        image: form.imageLinks
        .map((l) => l.trim())
        .filter(Boolean)
        .map((file_link) => ({ file_link })),
    });

    /** Validasi form, lalu kirim create/update ke API. Return true kalau sukses. */
    const submitForm = async (): Promise<boolean> => {
        const validationResult = validateVisitForm(form);
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
                await IupService.updateIupVisit(editingId, { ...payload, iup_visit_history_id: editingId });
            } else {
                await IupService.createIupVisit(payload);
            }
            toast.success(isEdit ? "Kunjungan berhasil diperbarui." : "Kunjungan berhasil ditambahkan.");
            await fetchVisits();
            closeForm();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Gagal menyimpan kunjungan. Coba lagi.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        visits,
        pagination,
        page,
        setPage,
        loading,
        submitting,
        deletingId,
        refetch: fetchVisits,
        deleteVisit,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        updateImageLink,
        addImageLinkRow,
        removeImageLinkRow,
        fillCurrentLocation,

        submitForm,
    };
}