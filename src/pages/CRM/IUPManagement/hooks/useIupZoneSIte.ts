import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ZonaSitePayload } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
import { Zone, DEFAULT_ZONES } from '../components/zonearea/ZoneArea';

export const useIupZoneSIte = () => {
    const { id } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; iup_zona_site_id?: string; name?: string }>({ show: false });
    const updateZones = (next: Zone[]) => handleZonesChange(next);
    
    const [zoneErrors, setZoneErrors] = useState<Record<string, Record<string, string>>>();

    useEffect(() => {
        if (id) {
            loadZoneSiteData(id);
        }
    }, [id]);

    const loadZoneSiteData = async (iupId: string) => {
        try {
            setIsLoading(true);
            const response = await IupService.getIupZonaSite({
                iup_id: iupId,
                sort_by: 'updated_at',
                sort_order: 'desc'
            });

            if (response.success && response.data?.length) {
                setZones(
                    response.data.map(item => ({
                        id: item.iup_zona_site_id,
                        iup_zona_site_id: item.iup_zona_site_id,
                        name: item.iup_zona_site_name,
                        evidence: {
                            iup_zona_site_date_last_survey: item.iup_zona_site_date_last_survey?.slice(0, 10) ?? '',
                            iup_zona_site_name: item.iup_zona_site_name ?? '',
                            iup_zona_site_description: item.iup_zona_site_description ?? '',
                            fileLinks: item.iup_zona_site_file?.length
                                ? item.iup_zona_site_file.map(f => f.file_link)
                                : ['']
                        }
                    }))
                );
            }
            // Jika belum ada data, tetap pakai DEFAULT_ZONES
        } catch (error: any) {
            console.error('Error loading zone site:', error);
            toast.error('Failed to load zone site data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleZonesChange = (updatedZones: Zone[]) => {
        setZones(updatedZones);
    };

    const handleSubmitZone = async (zone: Zone) => {
        if (!id) {
            toast.error('IUP ID not found');
            return;
        }

        // Validasi field wajib
        const fieldErrors: Record<string, string> = {};
        if (!zone.evidence.iup_zona_site_date_last_survey) {
            fieldErrors.iup_zona_site_date_last_survey = 'Tanggal Kunjungan wajib diisi';
        }
        if (Object.keys(fieldErrors).length > 0) {
            setZoneErrors(prev => ({ ...prev, [zone.id]: fieldErrors }));
            toast.error('Lengkapi field yang wajib diisi');
            return;
        }
        // Reset error zona ini jika lolos validasi
        setZoneErrors(prev => ({ ...prev, [zone.id]: {} }));

        try {
            setIsSubmitting(true);

            const payload: ZonaSitePayload = {
                iup_id: id,
                iup_zona_site_name: zone?.evidence?.iup_zona_site_name || zone.name,
                iup_zona_site_description: zone.evidence.iup_zona_site_description,
                iup_zona_site_date_last_survey: zone.evidence.iup_zona_site_date_last_survey,
                iup_zona_site_file: zone.evidence.fileLinks
                    .filter(link => link.trim())
                    .map(link => ({ file_link: link }))
            };

            if (zone.iup_zona_site_id) {
                await IupService.updateIupZonaSite(zone.iup_zona_site_id, payload);
            } else {
                await IupService.createIupZonaSite(payload);
            }

            toast.success(`${zone.name} berhasil disimpan`);
        } catch (error: any) {
            console.error('Error saving zone:', error);
            toast.error(`Gagal menyimpan ${zone.name}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeZone = useCallback((zone: any) => {
        setConfirmDelete({ show: true, iup_zona_site_id: zone.id, name: zone.name });
    },[]);

    const handleConfirmDeleted = useCallback(async () => {
        console.log('Confirm delete zone:', confirmDelete);
        if (!confirmDelete.iup_zona_site_id) {
            toast.error('Zona Area not found');
            return;
        }
        try {
            setIsSubmitting(true);

            const response = await IupService.deleteIupZonaSite(confirmDelete.iup_zona_site_id);
            
            if (response.status === 200) {
                toast.success('Zona berhasil dihapus');
                setConfirmDelete({show: false});
                updateZones(zones.filter((z) => z.id !== confirmDelete.iup_zona_site_id));
                return response;
            } else {
                toast.error(response.message || 'Failed to update quotation');
                throw new Error(response.message || 'Failed to update quotation');
            }
            
        } catch (error: any) {
            console.error('Error deleting zone:', error);
            toast.error(`Gagal menghapus zona`);
            setConfirmDelete({show: false});
        } finally {
            setConfirmDelete({show: false});
            setIsSubmitting(false);
        }
    }, [setIsSubmitting, confirmDelete, zones]);

    return {
        id,
        isLoading,
        isSubmitting,
        zones,
        zoneErrors,
        updateZones,
        removeZone,
        handleSubmitZone,
        handleConfirmDeleted,
        setConfirmDelete,
        confirmDelete
    };
}
