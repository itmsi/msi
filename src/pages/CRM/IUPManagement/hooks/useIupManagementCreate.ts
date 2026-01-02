import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Island, Group, Area, IUPZone, useTerritory } from '../../Territory';
import { IupManagementFormData } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';


export const useIupManagementCreate = () => {
    const navigate = useNavigate();

    const {
        territories,
        loading: territoriesLoading,
        fetchTerritories
    } = useTerritory();
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [selectedIupZone, setSelectedIupZone] = useState<IUPZone | null>(null);
    
    const [formData, setFormData] = useState<IupManagementFormData>({
        company_name: '',
        iup_zone_id: '',
        business_type: '',
        permit_type: '',
        segmentation_id: 'kosong',
        province_name: '',
        pic: '',
        mine_location: '',
        area_size_ha: '',
        regency_name: '',
        sk_number: '',
        authorized_officer: '',
        activity_stage: '',
        sk_end_date: '',
        sk_effective_date: '',
        company_full_name: '',
        rkab: '',
        status: 'aktif',
        island_id: '',
        island_name: '',
        group_id: '',
        group_name: '',
        area_id: '',
        area_name: '',
        iup_zone_name: ''
    });

    // Fetch territories on component mount
    useEffect(() => {
        fetchTerritories();
    }, []);

    // Get available groups based on selected island
    const getAvailableGroups = (): Group[] => {
        if (!selectedIsland) return [];
        return selectedIsland.children || [];
    };

    // Get available areas based on selected group
    const getAvailableAreas = (): Area[] => {
        if (!selectedGroup) return [];
        return selectedGroup.children || [];
    };

    // Get available IUP zones based on selected area
    const getAvailableIupZones = (): IUPZone[] => {
        if (!selectedArea) return [];
        return selectedArea.children || [];
    };

    const handleIslandChange = (option: { value: string; label: string; } | null) => {
        const island = territories.find(t => t.id === option?.value) || null;
        setSelectedIsland(island);
        setSelectedGroup(null);
        setSelectedArea(null);
        setSelectedIupZone(null);
        
        setFormData(prev => ({
            ...prev,
            island_id: island?.id || '',
            island_name: island?.name || '',
            group_id: '',
            group_name: '',
            area_id: '',
            area_name: '',
            iup_zone_id: '',
            iup_zone_name: ''
        }));
    };

    const handleGroupChange = (option: { value: string; label: string; } | null) => {
        const group = getAvailableGroups().find(g => g.id === option?.value) || null;
        setSelectedGroup(group);
        setSelectedArea(null);
        setSelectedIupZone(null);
        
        setFormData(prev => ({
            ...prev,
            group_id: group?.id || '',
            group_name: group?.name || '',
            area_id: '',
            area_name: '',
            iup_zone_id: '',
            iup_zone_name: ''
        }));
    };

    const handleAreaChange = (option: { value: string; label: string; } | null) => {
        const area = getAvailableAreas().find(a => a.id === option?.value) || null;
        setSelectedArea(area);
        setSelectedIupZone(null);
        
        setFormData(prev => ({
            ...prev,
            area_id: area?.id || '',
            area_name: area?.name || '',
            iup_zone_id: '',
            iup_zone_name: ''
        }));
    };

    const handleIupZoneChange = (option: { value: string; label: string; } | null) => {
        const iupZone = getAvailableIupZones().find(z => z.id === option?.value) || null;
        setSelectedIupZone(iupZone);
        
        setFormData(prev => ({
            ...prev,
            iup_zone_id: iupZone?.id || '',
            iup_zone_name: iupZone?.name || ''
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: name === 'area_size_ha' ? value : value
        }));
    };

    const handleSelectChange = (fieldName: string, value: string) => {
        // Clear error for this field when user changes value
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    // Add date change handler for calendar components
    const handleDateChange = (fieldName: string, value: string) => {
        // Clear error for this field when user changes value
        if (errors[fieldName]) {
            setErrors(prev => {
                const { [fieldName]: _, ...rest } = prev;
                return rest;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        
        // Basic validation
        const newErrors: Record<string, string> = {};
        
        if (!formData.company_name.trim()) {
            newErrors.company_name = 'IUP Name is required';
        }
        
        if (!formData.rkab.trim()) {
            newErrors.rkab = 'RKAB is required';
        }

        if (!formData.sk_number) {
            newErrors.sk_number = 'SK Number is required';
        }

        if (!formData.mine_location) {
            newErrors.mine_location = 'Mine Location is required';
        }

        if (!formData.area_size_ha) {
            newErrors.area_size_ha = 'Area Size (Ha) is required';
        }
        if (!formData.regency_name) {
            newErrors.regency_name = 'Regency Name is required';
        }
        
        // Territory validation
        if (!selectedIsland) {
            toast.error('Please select an Island');
            return;
        }
        
        if (!selectedGroup) {
            toast.error('Please select a Group');
            return;
        }
        
        if (!selectedArea) {
            toast.error('Please select an Area');
            return;
        }
        
        if (!selectedIupZone) {
            toast.error('Please select an IUP Zone');
            return;
        }

        // If there are field errors, show them and stop
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors below');
            return;
        }

        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        try {
            // Prepare payload with all required data
            const payload = {
                ...formData,
                // Ensure iup_zone_id is set from selected IUP Zone
                iup_zone_id: selectedIupZone.id,
                // Auto-fill some fields based on selections if needed
                province_name: formData.province_name || 'province name - kosong',
                mine_location: formData.mine_location || '',
                // Set default values for hidden required fields
                business_type: formData.business_type || '',
                permit_type: formData.permit_type || 'permit - kosong',
                authorized_officer: formData.authorized_officer || 'author - kosong',
                activity_stage: formData.activity_stage || 'activity - kosong',
                sk_effective_date: formData.sk_effective_date || '',
                sk_end_date: formData.sk_end_date || '',
                sk_number: formData.sk_number || '',
                pic: formData.pic || 'pic - kosong',
                regency_name: formData.regency_name || selectedArea.name || '',
                company_full_name: formData.company_full_name || formData.company_name,
                segmentation_id: formData.segmentation_id || selectedIupZone.id || 'segmentasi kosong',
                area_size_ha: formData.area_size_ha || '',
                rkab: formData.rkab || ''
            };

            await IupService.createIup(payload);
            toast.success('IUP created successfully!');
            navigate('/crm/iup-management');
        } catch (error: any) {
            console.error('Error creating IUP:', error);
            toast.error(error.response?.data?.message || 'Failed to create IUP');
        } finally {
            setIsSubmitting(false);
        }
    };


    return {
        selectedIsland,
        selectedGroup,
        selectedArea,
        selectedIupZone,
        handleIslandChange,
        handleGroupChange,
        handleAreaChange,
        handleIupZoneChange,
        getAvailableGroups,
        getAvailableAreas,
        getAvailableIupZones,
        territoriesLoading,
        territories,
        isSubmitting,
        formData,
        errors,
        handleInputChange,
        handleSelectChange,
        handleDateChange, // Add date change handler
        handleSubmit
    };
}