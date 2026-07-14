import { useEffect, useState } from 'react';
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
                            keterangan: '',
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

        try {
            setIsSubmitting(true);

            const payload: ZonaSitePayload = {
                iup_id: id,
                iup_zona_site_name: zone.name,
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

    return {
        id,
        isLoading,
        isSubmitting,
        zones,
        handleZonesChange,
        handleSubmitZone
    };
}
