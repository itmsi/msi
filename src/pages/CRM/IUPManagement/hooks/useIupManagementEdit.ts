import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Island, Group, Area, IUPZone, useTerritory } from '../../Territory';
import { IupManagementFormData, CustomerInfo } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';

export const useIupManagementEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // Territory hook
    const {
        territories,
        loading: territoriesLoading,
        fetchTerritories
    } = useTerritory();
    
    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [customers, setCustomers] = useState<CustomerInfo[]>([]);
    
    // Territory selection states
    const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [selectedIupZone, setSelectedIupZone] = useState<IUPZone | null>(null);
    
    // Form data state
    const [formData, setFormData] = useState<IupManagementFormData>({
        company_name: '',
        iup_zone_id: '',
        business_type: '',
        permit_type: '',
        segmentation_id: '',
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

    // Load territories and IUP data when component mounts
    useEffect(() => {
        fetchTerritories();
        if (id) {
            loadIupData(id);
        }
    }, [id]);

    // Set territory selections when territories and formData are both available
    useEffect(() => {
        if (territories.length > 0 && formData.island_id && !selectedIsland) {
            const island = territories.find(t => t.id === formData.island_id);
            if (island) {
                setSelectedIsland(island);
                
                if (formData.group_id) {
                    const group = island.children?.find(g => g.id === formData.group_id);
                    if (group) {
                        setSelectedGroup(group);
                        
                        if (formData.area_id) {
                            const area = group.children?.find(a => a.id === formData.area_id);
                            if (area) {
                                setSelectedArea(area);
                                
                                if (formData.iup_zone_id) {
                                    const iupZone = area.children?.find(z => z.id === formData.iup_zone_id);
                                    if (iupZone) {
                                        setSelectedIupZone(iupZone);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, [territories, formData.island_id, formData.group_id, formData.area_id, formData.iup_zone_id, selectedIsland]);

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

    // Territory change handlers
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

    // Function to load IUP data by ID
    const loadIupData = async (iupId: string) => {
        try {
            setIsLoading(true);
            const response = await IupService.getIupById(iupId);

            if (response.data.success && response.data.data) {
                const iup = response.data.data;
                setCustomers(iup.customers || []);
                
                setFormData({
                    company_name: iup.iup_name || '',
                    iup_zone_id: iup.iup_zone_id || '',
                    business_type: iup.business_type || '',
                    permit_type: iup.permit_type || '',
                    segmentation_id: iup.segmentation_id || '',
                    province_name: iup.province_name || '',
                    pic: iup.pic || '',
                    mine_location: iup.mine_location || '',
                    area_size_ha: iup.area_size_ha || '',
                    regency_name: iup.regency_name || '',
                    sk_number: iup.sk_number || '',
                    authorized_officer: iup.authorized_officer || '',
                    activity_stage: iup.activity_stage || '',
                    sk_end_date: iup.sk_end_date ? iup.sk_end_date.split('T')[0] : '',
                    sk_effective_date: iup.sk_effective_date ? iup.sk_effective_date.split('T')[0] : '',
                    company_full_name: iup.company_full_name || '',
                    rkab: iup.rkab || '',
                    status: iup.iup_status || 'aktif',
                    island_id: iup.island_id || '',
                    island_name: iup.island_name || '',
                    group_id: iup.group_id || '',
                    group_name: iup.group_name || '',
                    area_id: iup.area_id || '',
                    area_name: iup.area_name || '',
                    iup_zone_name: iup.iup_zone_name || ''
                });
                
            } else {
                toast.error('IUP not found');
                navigate('/crm/iup-management');
            }
        } catch (error: any) {
            console.error('Error loading IUP:', error);
            toast.error('Failed to load IUP data');
            navigate('/crm/iup-management');
        } finally {
            setIsLoading(false);
        }
    };

    // Form input change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
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

    // Select change handler
    const handleSelectChange = (field: string, value: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (fieldName: string, value: string) => {
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

    // Form submission handler
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        if (!id) {
            toast.error('IUP ID not found');
            return;
        }

        // Basic validation
        const newErrors: Record<string, string> = {};
        
        if (!formData.company_name.trim()) {
            newErrors.company_name = 'IUP Name is required';
        }
        
        if (!formData.rkab.trim()) {
            newErrors.rkab = 'RKAB is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors below');
            return;
        }

        try {
            setIsSubmitting(true);
            setErrors({}); // Clear previous errors
            
            const updateData = {
                ...formData
            };

            const response = await IupService.updateIup(id, updateData);
            
            if (response.success) {
                toast.success('IUP updated successfully');
                navigate('/crm/iup-management');
            } else {
                toast.error('Failed to update IUP');
            }
        } catch (error: any) {
            console.error('Error updating IUP:', error);
            toast.error('Failed to update IUP');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        id,
        isLoading,
        isSubmitting,
        formData,
        errors,
        customers,
        // Territory states
        territories,
        territoriesLoading,
        selectedIsland,
        selectedGroup,
        selectedArea,
        selectedIupZone,
        // Territory handlers
        handleIslandChange,
        handleGroupChange,
        handleAreaChange,
        handleIupZoneChange,
        getAvailableGroups,
        getAvailableAreas,
        getAvailableIupZones,
        // Form handlers
        handleInputChange,
        handleSelectChange,
        handleDateChange, // Add date change handler
        handleSubmit,
        loadIupData
    };
}