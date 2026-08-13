import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IupZonaSiteItem, Pagination, ZonaSitePayload } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
import moment from 'moment';
import { MasterZoneSiteSection, SurveyValues } from '../types/iupSurvey';
import { parseSurveyTableFromHtml } from '../components/zonearea/data/Parsesurveytablefromhtml';

export interface ZoneFormState {
    title: string;
    date: string;
    description: string;
    fileLink: string[];
    summaryPrompt?: string;
    summaryResponse?: string;
    sessionId?: string;
    surveyValues: SurveyValues;
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
    surveyValues: {},
});

const validateZoneForm = (
    form: ZoneFormState,
    zones: IupZonaSiteItem[],
    excludeId?: string | null
): ZoneFormErrors => {
    const errors: ZoneFormErrors = {};

    const title = form.title.trim();
    if (!title) {
        errors.title = "Zone name is required";
    } else if (title.length < 3) {
        errors.title = "Title must be at least 3 characters";
    } else if (zones.some((z) => z.iup_zona_site_id !== excludeId && z.iup_zona_site_name.trim().toLowerCase() === title.toLowerCase())) {
        errors.title = `${form.title.trim()} Already exists, It must not be exactly the same.
`;
    }

    if (!form.date) {
        errors.date = "Date is required";
    } else if (Number.isNaN(new Date(form.date).getTime())) {
        errors.date = "Invalid date format";
    }

    return errors;
};

const hasFormErrors = (errors: ZoneFormErrors): boolean => Object.values(errors).some(Boolean);

export const useIupZoneSIte = ({ segmentasion }: { segmentasion: string }) => {
    const { id } = useParams<{ id: string }>();
    const [zones, setZones] = useState<IupZonaSiteItem[]>([]);
    const [pagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        iup_zona_site_id?: string;
        name?: string
    }>({ show: false });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ZoneFormState>(emptyForm());
    const [errors, setErrors] = useState<ZoneFormErrors>({});

    const [guideZone, setGuideZone] = useState<IupZonaSiteItem | null>(null);
    const [guideValue, setGuideValue] = useState('');
    const [guideSubmitting, setGuideSubmitting] = useState(false);

    const [initialShowGuide, setInitialShowGuide] = useState(false);

    const [zoneSiteTemplates, setZoneSiteTemplates] = useState<MasterZoneSiteSection[]>([]);

    const fetchZoneSiteData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await IupService.getIupZonaSite({
                iup_id: id,
                sort_by: 'created_at',
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

    const fetchZoneSiteTemplates = useCallback(async () => {
        try {
            const response = await IupService.getMasterZoneSite({ search: '', segmentasion: segmentasion });
            setZoneSiteTemplates(response.data.filter((s) => s.sectionKey !== 'default'));
        } catch (error) {
            console.error('Error loading zone site templates:', error);
        }
    }, [segmentasion]);

    useEffect(() => {
        fetchZoneSiteTemplates();
    }, [fetchZoneSiteTemplates]);

    const handleConfirmDeleted = async (): Promise<void> => {
        if (!confirmDelete.iup_zona_site_id) {
            toast.error('Zona Area not found');
            return;
        }
        try {
            setDeletingId(confirmDelete.iup_zona_site_id);
            await IupService.deleteIupZonaSite(confirmDelete.iup_zona_site_id);
            toast.success("Zone site has been deleted successfully.");
            if (zones.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                await fetchZoneSiteData();
            }
            setConfirmDelete({ show: false });
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete zone site.");
            setConfirmDelete({ show: false });
        } finally {
            setConfirmDelete({ show: false });
            setDeletingId(null);
        }
    };

    // ---- form helpers ----
    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setInitialShowGuide(false);
        setShowForm(true);
    };

    const openEditForm = (zone: IupZonaSiteItem, showGuideInitially: boolean = false) => {
        setEditingId(zone.iup_zona_site_id);
        setForm({
            title: zone.iup_zona_site_name ?? "",
            description: zone.iup_zona_site_description ?? "",
            date: zone.iup_zona_site_date_last_survey ?? null, //new Date().toISOString().slice(0, 10),
            fileLink: zone.iup_zona_site_file?.length ? zone.iup_zona_site_file.map((i) => i.file_link) : [""],
            summaryPrompt: zone.summary_prompt_ai ?? undefined,
            summaryResponse: zone.summary_response_ai ?? undefined,
            sessionId: zone.session_id ?? undefined,
            surveyValues: parseSurveyTableFromHtml(zone.iup_zona_site_description ?? ""),
        });
        setErrors({});
        setInitialShowGuide(showGuideInitially);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
    };

    const updateField = <K extends keyof Omit<ZoneFormState, "fileLink">>(
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

    const toPayload = (): Omit<ZonaSitePayload, "iup_zona_site_id"> => {
        return {
            iup_id: id ? id : '',
            iup_zona_site_name: form.title.trim(),
            iup_zona_site_date_last_survey: moment(form.date).format("YYYY-MM-DD"),
            iup_zona_site_description: form.description,
            iup_zona_site_file: form.fileLink
                .map((l) => l.trim())
                .filter(Boolean)
                .map((file_link) => ({ file_link })),
            summary_prompt_ai: form.summaryPrompt,
            summary_response_ai: form.summaryResponse,
            session_id: form.sessionId,
        };
    };

    /** Validasi form, lalu kirim create/update ke API. Return true kalau sukses. */
    const submitForm = async (): Promise<boolean> => {
        const validationResult = validateZoneForm(form, zones, editingId);
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

    const deleteZone = useCallback((zone: IupZonaSiteItem) => {
        console.log('handleConfirmDeleted', zone)
        setConfirmDelete({ show: true, iup_zona_site_id: zone.iup_zona_site_id, name: zone.iup_zona_site_name });
    }, [confirmDelete]);

    // ---- guide modal helpers ----
    const openGuideForm = useCallback((zone: IupZonaSiteItem) => {
        setGuideZone(zone);
        setGuideValue(zone.guide ?? "");
    }, []);

    const createZoneAndOpenGuide = async (): Promise<void> => {
        const titleError = validateZoneForm(form, zones, null).title;
        if (titleError) {
            setErrors((prev) => ({ ...prev, title: titleError }));
            return;
        }

        type QuickCreatePayload = Omit<ZonaSitePayload, "iup_zona_site_id" | "iup_zona_site_date_last_survey"> & {
            iup_zona_site_date_last_survey: string | null;
        };
        const payload: QuickCreatePayload = {
            ...toPayload(),
            iup_zona_site_date_last_survey: null,
        };

        setSubmitting(true);
        try {
            const createRes: any = await IupService.createIupZonaSite(payload as unknown as ZonaSitePayload);
            toast.success("Zone site has been created.");

            let createdZone: IupZonaSiteItem | undefined = createRes?.data?.iup_zona_site_id
                ? (createRes.data as IupZonaSiteItem)
                : undefined;

            if (!createdZone) {
                // Fallback kalau create endpoint tidak mengembalikan record barunya:
                // ambil ulang list, urutkan by created_at, dan pakai yang paling baru.
                const latest = await IupService.getIupZonaSite({
                    iup_id: id,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    limit: 1,
                });
                createdZone = latest.data?.[0];
            }

            await fetchZoneSiteData();

            if (createdZone) {
                // Buka lagi form ini dalam mode edit untuk zona yang baru
                // dibuat, supaya user bisa lanjut isi field lain (tanggal,
                // file, remarks) tanpa harus cari & klik Edit manual.
                openEditForm(createdZone);
                openGuideForm(createdZone);
            } else {
                console.error('[createZoneAndOpenGuide] createIupZonaSite response:', createRes);
                toast.error("Zone created, but couldn't open the guide editor automatically.");
                closeForm();
            }
        } catch (err) {
            console.error('[createZoneAndOpenGuide] failed:', err);
            toast.error("Failed to create zone. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const closeGuideForm = useCallback(() => {
        setGuideZone(null);
        setGuideValue("");
    }, []);

    const submitGuide = async (): Promise<boolean> => {
        if (!guideZone) return false;

        setGuideSubmitting(true);
        try {
            await IupService.updateGuideIupZonaSite(guideZone.iup_zona_site_id, guideValue);
            toast.success("Guide has been saved.");
            await fetchZoneSiteData();
            closeGuideForm();
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Failed to save guide. Please try again.");
            return false;
        } finally {
            setGuideSubmitting(false);
        }
    };

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
        updateFileLink,
        addFileLinkRow,
        removeFileLinkRow,

        submitForm,

        guideZone,
        guideValue,
        setGuideValue,
        guideSubmitting,
        openGuideForm,
        closeGuideForm,
        submitGuide,
        createZoneAndOpenGuide,

        zoneSiteTemplates,
        initialShowGuide,
    };
}