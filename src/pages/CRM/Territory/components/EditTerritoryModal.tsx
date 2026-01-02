import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { UpdateTerritoryRequest } from '../types/territory';
import { ExpandableRowData } from './TerritoryTable';
import CustomSelect from '@/components/form/select/CustomSelect';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

interface EditTerritoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string, data: UpdateTerritoryRequest) => void;
    territoryData?: ExpandableRowData;
    loading?: boolean;
}

const EditTerritoryModal: React.FC<EditTerritoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    territoryData,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        type: 'island' as 'island' | 'group' | 'area' | 'iup_zone' | 'iup',
        name: '',
        code: '',
        status: 'aktif' as 'aktif' | 'non aktif'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const STATUS_OPTIONS = [
        { value: 'aktif', label: 'Active' },
        { value: 'non aktif', label: 'Inactive' }
    ];

    // Reset dan populate form ketika modal dibuka atau territory data berubah
    useEffect(() => {
        if (isOpen && territoryData) {
            // Map status dari display ke form value
            const mappedStatus = territoryData.status;
                              
            setFormData({
                type: territoryData.type as 'island' | 'group' | 'area' | 'iup_zone' | 'iup',
                name: territoryData.name,
                code: territoryData.code,
                status: mappedStatus as 'aktif' | 'non aktif'
            });
            setErrors({});
        }
    }, [isOpen, territoryData]);

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
        
        if (!validate() || !territoryData) {
            return;
        }

        const updateData: UpdateTerritoryRequest = {
            type: formData.type,
            name: formData.name,
            code: formData.code,
            status: formData.status
        };

        onSubmit(territoryData.id, updateData);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            case 'iup': return 'IUP';
            default: return type;
        }
    };

    if (!territoryData) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit ${getTypeLabel(territoryData.type)}`}
            description={`Update the details of ${territoryData.name}`}
            className="max-w-xl"
        >
            <div className="p-6">
                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Type Field (Read-only) */}
                        <div>
                            <Label>
                                Territory Type
                            </Label>
                            <Input
                                type="text"
                                value={getTypeLabel(territoryData.type)}
                                className="bg-gray-100 cursor-not-allowed"
                                readonly={true}
                            />
                            <p className="mt-1 text-xs text-gray-500">Territory type cannot be changed</p>
                        </div>

                        {/* Name Field */}
                        <div>
                            <Label>
                                {getTypeLabel(territoryData.type)} Name *
                            </Label>
                            <Input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${getTypeLabel(territoryData.type).toLowerCase()} name`}
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Code Field */}
                        <div>
                            <Label>
                                {getTypeLabel(territoryData.type)} Code *
                            </Label>
                            <Input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.code ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={`Enter ${getTypeLabel(territoryData.type).toLowerCase()} code`}
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
                            {loading ? 'Updating...' : `Update ${getTypeLabel(territoryData.type)}`}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditTerritoryModal;