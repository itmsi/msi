import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { CreateTerritoryRequest } from '../types/territory';
import { ExpandableRowData } from './TerritoryTable';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';

interface AddTerritoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTerritoryRequest) => void;
    parentRow?: ExpandableRowData;
    childType: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
    loading?: boolean;
}

const AddTerritoryModal: React.FC<AddTerritoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    parentRow,
    childType,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        status: 'aktif' as 'aktif' | 'non aktif'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form ketika modal dibuka atau childType berubah
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                code: '',
                status: 'aktif'
            });
            setErrors({});
        }
    }, [isOpen, childType, parentRow?.id]);

    // Helper function untuk build payload berdasarkan hierarchy
    const buildCreatePayload = (): CreateTerritoryRequest => {
        const basePayload: CreateTerritoryRequest = {
            type: childType,
            name: formData.name,
            code: formData.code,
            status: formData.status
        };

        if (!parentRow) {
            // Jika tidak ada parent, berarti create island
            return basePayload;
        }

        // Build parent IDs berdasarkan type hierarchy
        switch (childType) {
            case 'group':
                // Parent = island
                basePayload.island_id = parentRow.id;
                break;
            case 'area':
                // Parent = group, need island_id from parent
                basePayload.island_id = (parentRow as any).island_id;
                basePayload.group_id = parentRow.id;
                break;
            case 'iup_zone':
                // Parent = area, need island_id & group_id from parent
                basePayload.island_id = (parentRow as any).island_id;
                basePayload.group_id = (parentRow as any).group_id;
                basePayload.area_id = parentRow.id;
                break;
            case 'iup_segmentation':
                // Parent = iup_zone, need all parent IDs
                basePayload.island_id = (parentRow as any).island_id;
                basePayload.group_id = (parentRow as any).group_id;
                basePayload.area_id = (parentRow as any).area_id;
                basePayload.iup_zone_id = parentRow.id;
                break;
            case 'iup':
                // Parent = iup_segmentation, need all parent IDs
                basePayload.island_id = (parentRow as any).island_id;
                basePayload.group_id = (parentRow as any).group_id;
                basePayload.area_id = (parentRow as any).area_id;
                basePayload.iup_zone_id = (parentRow as any).iup_zone_id;
                basePayload.iup_segmentation_id = parentRow.id;
                break;
        }

        return basePayload;
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Territory name is required';
        }

        if (!formData.code.trim()) {
            newErrors.code = 'Territory code is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        const payload = buildCreatePayload();
        onSubmit(payload);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error saat user mulai mengetik
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error saat user mulai mengetik
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'island': return 'Island';
            case 'group': return 'Group';
            case 'area': return 'Area';
            case 'iup_zone': return 'IUP Zone';
            case 'iup_segmentation': return 'Segmentation';
            case 'iup': return 'IUP';
            default: return type;
        }
    };
    const STATUS_OPTIONS = [
        { value: 'aktif', label: 'Active' },
        { value: 'nonaktif', label: 'Inactive' }
    ];
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add New ${getTypeLabel(childType)} ${parentRow ? `under ${parentRow.name}` : ''}`}
            description={`Fill in the details to create a new ${getTypeLabel(childType).toLowerCase()}`}
            className="max-w-xl"
        >
            {/* Parent Info */}
            {/* {parentRow && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 mb-4">
                    <p className="text-sm text-gray-600">
                        Parent: <span className="font-medium">{parentRow.name}</span>
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                            {getTypeLabel(parentRow.type)}
                        </span>
                    </p>
                </div>
            )} */}

            <div className="p-6">
                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <Label>
                                {getTypeLabel(childType)} Name *
                            </Label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${getTypeLabel(childType).toLowerCase()} name`}
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Code Field */}
                        <div>
                            <Label>
                                {getTypeLabel(childType)} Code *
                            </Label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.code ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${getTypeLabel(childType).toLowerCase()} code`}
                                disabled={loading}
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                            )}
                        </div>

                        {/* Status Field */}
                        <div>
                            <Label>
                                Status
                            </Label>
                            <CustomSelect
                                id="status"
                                value={STATUS_OPTIONS.find(option => option.value === formData.status) || null}
                                onChange={(option) => handleSelectChange('status', option?.value || 'aktif')}
                                options={STATUS_OPTIONS}
                                className="w-full"
                                placeholder="Select status"
                                isClearable={false}
                                isSearchable={false}
                                error={errors.status}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center"
                        >
                            {loading ? 'Creating...' : `Create ${getTypeLabel(childType)}`}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddTerritoryModal;