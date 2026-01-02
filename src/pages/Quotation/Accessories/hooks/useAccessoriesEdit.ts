import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AccessoriesValidationErrors, AccessoryIslandDetail } from '../types/accessories';
import { AccessoriesService } from '../services/accessoriesService';
import toast from 'react-hot-toast';
import { IslandSelectOption, useIslandSelect } from '@/hooks/useIslandSelect';

interface FormData {
    accessory_part_number: string;
    accessory_part_name: string;
    accessory_specification: string;
    accessory_brand: string;
    accessory_remark: string;
    accessory_region: string;
    accessory_description: string;
    accessories_island_detail: AccessoryIslandDetail[];
}

export const useAccessoriesEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState<AccessoriesValidationErrors>({});
    
    // Island Account states
    const [selectedIsland, setSelectedIsland] = useState<IslandSelectOption | null>(null);
    
    // Use reusable island select hook
    const {
        islandOptions,
        pagination: islandPagination, 
        inputValue: islandInputValue,
        handleInputChange: handleIslandInputChange,
        handleMenuScrollToBottom: handleIslandMenuScrollToBottom,
        initializeOptions: initializeIslandOptions
    } = useIslandSelect();
    
    const [form, setForm] = useState<FormData>({
        accessory_part_number: '',
        accessory_part_name: '',
        accessory_specification: '',
        accessory_brand: '',
        accessory_remark: '',
        accessory_region: '',
        accessory_description: '',
        accessories_island_detail: []
    });

    // Load data saat komponen mount
    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    // Initialize island options
    useEffect(() => {
        initializeIslandOptions();
    }, [initializeIslandOptions]);


    const loadData = async () => {
        setFetching(true);
        try {
            const response = await AccessoriesService.getAccessoriesById(id!);
            
            if (response.data?.data) {
                const data = response.data.data;
                setForm({
                    accessory_part_number: data.accessory_part_number || '',
                    accessory_part_name: data.accessory_part_name || '',
                    accessory_specification: data.accessory_specification || '',
                    accessory_brand: data.accessory_brand || '',
                    accessory_remark: data.accessory_remark || '',
                    accessory_region: data.accessory_region || '',
                    accessory_description: data.accessory_description || '',
                    accessories_island_detail: data.accessories_island_detail || []
                });
            }
            
        } catch (error) {
            console.error('Error loading accessory:', error);
            toast.error('Gagal memuat data accessory');
            navigate('/quotations/accessories');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        // Clear error ketika user edit field
        if (errors[field as keyof AccessoriesValidationErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<AccessoriesValidationErrors> = {};

        if (!form.accessory_part_number.trim()) {
            newErrors.accessory_part_number = 'Part number wajib diisi';
        }

        if (!form.accessory_part_name.trim()) {
            newErrors.accessory_part_name = 'Part name wajib diisi';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setLoading(true);

        try {
            await AccessoriesService.updateAccessories(id!, form);
            toast.success('Accessory berhasil diupdate');
            navigate('/quotations/accessories');
        } catch (error: any) {
            if (error.errors && typeof error.errors === 'object') {
                setErrors(error.errors);
            }
            console.error('Error updating accessory:', error);
            toast.error('Gagal update accessory');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/quotations/accessories');
    };

    // Island management functions
    const handleAddIsland = () => {
        if (!selectedIsland) {
            toast.error('Pilih island terlebih dahulu');
            return;
        }

        // Check if island already exists
        const existingIsland = form.accessories_island_detail.find(
            item => item.island_id === selectedIsland.value
        );

        if (existingIsland) {
            toast.error('Island sudah ditambahkan');
            return;
        }

        const newIslandDetail: AccessoryIslandDetail = {
            accessories_island_detail_id: '',
            island_id: selectedIsland.value,
            island_name: selectedIsland.label,
            accessories_id: id || '',
            accessories_island_detail_quantity: 1,
            accessories_island_detail_description: ''
        };

        setForm(prev => ({
            ...prev,
            accessories_island_detail: [...prev.accessories_island_detail, newIslandDetail]
        }));

        // Clear selected island after adding
        setSelectedIsland(null);
        toast.success('Island berhasil ditambahkan');
    };

    const handleUpdateQuantity = (islandId: string, quantity: number) => {
        setForm(prev => ({
            ...prev,
            accessories_island_detail: prev.accessories_island_detail.map(item =>
                item.island_id === islandId
                    ? { ...item, accessories_island_detail_quantity: quantity }
                    : item
            )
        }));
    };

    const handleRemoveIsland = (islandIdOrObject: string | AccessoryIslandDetail) => {
        const islandId = typeof islandIdOrObject === 'string' 
            ? islandIdOrObject 
            : islandIdOrObject.island_id;
        
        setForm(prev => ({
            ...prev,
            accessories_island_detail: prev.accessories_island_detail.filter(item => 
                item.island_id !== islandId
            )
        }));
        
        toast.success('Island berhasil dihapus');
    };

    const handleIslandChange = (selectedOption: IslandSelectOption | null) => {
        setSelectedIsland(selectedOption);
    };

    return {
        form,
        errors,
        loading,
        fetching,
        selectedIsland,
        islandOptions,
        islandInputValue,
        islandPagination,
        handleChange,
        handleSubmit,
        handleBack,
        handleIslandChange,
        handleAddIsland,
        handleUpdateQuantity,
        handleRemoveIsland,
        handleIslandInputChange,
        handleIslandMenuScrollToBottom
    };
}