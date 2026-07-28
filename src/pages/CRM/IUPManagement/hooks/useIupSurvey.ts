import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IupSurveyItem, IupSurveyPayload, Pagination } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
import moment from 'moment';


export interface SurveyFormState {
    iupId: string;
    userPhone: string;
    userName: string;

    chatDate: string;

    sourceType: string;
    sourceLink?: string;

    fileName?: string;
    description?: string;
}

export interface SurveyFormErrors {
    userPhone?: string;
    userName?: string;
    chatDate?: string;
    sourceType?: string;
    sourceLink?: string;
    fileName?: string;
    description?: string;
}

const emptyForm = (): SurveyFormState => ({
    iupId: "",
    userPhone: "",
    userName: "",
    chatDate: "",
    sourceType: "",
    sourceLink: "",
    fileName: "",
    description: "",
});

const validateSurveyForm = (form: SurveyFormState): SurveyFormErrors => {
    const errors: SurveyFormErrors = {};

    const userPhone = form.userPhone.trim();
    if (!userPhone) {
        errors.userPhone = "Nomor telepon wajib diisi";
    }

    const userName = form.userName.trim();
    if (!userName) {
        errors.userName = "Nama wajib diisi";
    }

    if (!form.chatDate) {
        errors.chatDate = "Tanggal chat wajib diisi";
    }
    return errors;
};

const hasFormErrors = (errors: SurveyFormErrors): boolean => Object.values(errors).some(Boolean);

export const useIupSurvey = () => {
    const { id } = useParams<{ id: string }>();

    const [surveys, setSurveys] = useState<IupSurveyItem[]>([]);
    const [pagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ 
        show: boolean; 
        iup_survey_id?: string; 
        name?: string }>({ show: false });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<SurveyFormState>(emptyForm());
    const [errors, setErrors] = useState<SurveyFormErrors>({});

    const fetchSurveyData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await IupService.getIupSurvey({
                iup_id: id,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            // if (response.success && response.data?.length) {
            setSurveys(response.data ?? []);
            // }
        } catch (error: any) {
            console.error('Error loading survey data:', error);
            toast.error('Failed to load survey data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSurveyData();
    }, [fetchSurveyData]);

    const handleConfirmDeleted = async (): Promise<void> => {
        if (!confirmDelete.iup_survey_id) {
            toast.error('Survey not found');
            return;
        }
        try {
            setDeletingId(confirmDelete.iup_survey_id);
            await IupService.deleteIupSurvey(confirmDelete.iup_survey_id);
            toast.success("Survey has been deleted successfully.");
            if (surveys.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                await fetchSurveyData();
            }
            setConfirmDelete({show: false});
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete survey.");
            setConfirmDelete({show: false});
        } finally {
            setConfirmDelete({show: false});
            setDeletingId(null);
        }
    };

    // ---- form helpers ----
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setShowForm(true);
    };
    
    const openEditForm = (surveyItem: IupSurveyItem) => {
        setEditingId(surveyItem.iup_survey_id);
        setForm({
            userName: surveyItem.user_name ?? "",
            userPhone: surveyItem.user_phone ?? "",
            chatDate: surveyItem.chat_date ? moment(surveyItem.chat_date).format("YYYY-MM-DD") : "",
            sourceType: surveyItem.source_type ?? "",
            sourceLink: surveyItem.source_link ?? "",
            description: surveyItem.description ?? "",
            fileName: surveyItem.file_name ?? "",
            iupId: id ? id : "",
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
    
    const updateField = <K extends keyof Omit<SurveyFormState, "fileLink">>(
        field: K,
        value: SurveyFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (prev[field as keyof SurveyFormErrors] ? { ...prev, [field]: undefined } : prev));
    };

    // const updateFileLink = (idx: number, value: string) => {
    //     setForm((prev) => {
    //         const links = [...prev.fileLink];
    //         links[idx] = value;
    //         return { ...prev, fileLink: links };
    //     });
    //     setErrors((prev) => (prev.fileLink ? { ...prev, fileLink: undefined } : prev));
    // };
    
    // const addFileLinkRow = () => {
    //     setForm((prev) => ({ ...prev, fileLink: [...prev.fileLink, ""] }));
    // };

    // const removeFileLinkRow = (idx: number) => {
    // //     setForm((prev) => {
    // //         const links = prev.fileLink.filter((_, i) => i !== idx);
    // //         return { ...prev, fileLink: links.length ? links : [""] };
    // //     });
    // };
    
    const toPayload = (): Omit<IupSurveyPayload, "iup_survey_id"> => ({
        iup_id: id ? id : '',
        user_name: form.userName.trim(),
        user_phone: form.userPhone.trim(),
        chat_date: moment(form.chatDate).format("YYYY-MM-DD"),
        source_type: form.sourceType,
        source_link: form.sourceLink?.trim() || '',
        file_name: form.fileName?.trim() || '',
        description: form.description?.trim() || '',
    });

    /** Validasi form, lalu kirim create/update ke API. Return true kalau sukses. */
    const submitForm = async (): Promise<boolean> => {
        const validationResult = validateSurveyForm(form);
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
                await IupService.updateIupSurvey(editingId, { ...payload, iup_survey_id: editingId });
            } else {
                await IupService.createIupSurvey(payload);
            }
            toast.success(isEdit ? "Survey has been updated." : "Survey has been created.");
            await fetchSurveyData();
            closeForm();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to save survey. Please try again.");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteSurvey = useCallback((survey: IupSurveyItem) => {
        console.log('handleConfirmDeleted', survey)
        setConfirmDelete({ show: true, iup_survey_id: survey.iup_survey_id, name: survey.user_name });
    },[confirmDelete]);

    // const handleConfirmDeleted = useCallback(async () => {
    //     if (!confirmDelete.iup_survey_id) {
    //         toast.error('Survey not found');
    //         return;
    //     }
    //     try {
    //         setIsSubmitting(true);

    //         const response = await IupService.deleteIupSurvey(confirmDelete.iup_survey_id);
            
    //         if (response.status === 200) {
    //             toast.success('Zona berhasil dihapus');
    //             setConfirmDelete({show: false});
    //             updateZones(zones.filter((z) => z.id !== confirmDelete.iup_survey_id));
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
        surveys,
        pagination,
        page,
        setPage,
        loading,
        submitting,
        deletingId,
        refetch: fetchSurveyData,
        deleteSurvey,
        handleConfirmDeleted,
        confirmDelete,
        setConfirmDelete,

        showForm,
        editingId,
        form,
        errors,
        openCreateForm,
        openEditForm,
        closeForm,
        updateField,
        // updateFileLink,
        // addFileLinkRow,
        // removeFileLinkRow,

        submitForm,
    };
}
