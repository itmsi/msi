import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave } from 'react-icons/fa';
import { useEmployeeSelect } from '@/hooks/useEmployeeSelect';
import { useTerritory } from '@/pages/CRM/Territory/hooks/useTerritory';
import { UsermanagementServices, TerritoryAccess } from './services/usermanagementServices';
import TerritorySelectionTable, { ExpandableRowData } from './components/TerritorySelectionTable';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import PageMeta from '@/components/common/PageMeta';
import { PermissionGate } from '@/components/common/PermissionComponents';
import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import Label from '@/components/form/Label';

interface CreateFormData {
    employee_id: string;
    selectedTerritories: Map<string, { access_level: string; ref_id: string; name: string; type: string; ui_only?: boolean }>;
}

interface ValidationErrors {
    employee_id?: string;
    territories?: string;
}

const CreateUserAccess: React.FC = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<CreateFormData>({
        employee_id: '',
        selectedTerritories: new Map()
    });
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Territory data
    const {
        territories,
        loading: territoriesLoading,
        fetchTerritories
    } = useTerritory();

    // Employee select hook
    const { 
        employeeOptions, 
        pagination: employeePagination, 
        inputValue: employeeInputValue,
        handleInputChange: handleEmployeeInputChange,
        handleMenuScrollToBottom: handleEmployeeMenuScrollToBottom,
        initializeOptions: initializeEmployeeOptions
    } = useEmployeeSelect(); 
    

    useEffect(() => {
        initializeEmployeeOptions();
        fetchTerritories({
            status: 'aktif'
        });
    }, []);

    // Handle input changes
    const handleInputChange = (field: keyof CreateFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear validation error for this field
        if (validationErrors[field as keyof ValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Helper function to get all descendants of a territory (recursive)
    const getAllChildren = (parentId: string, parentType: string): string[] => {
        const children: string[] = [];
        
        const collectDescendants = (currentId: string, currentType: string) => {
            territories.forEach(island => {
                if (currentType === 'island' && island.id === currentId && island.children) {
                    island.children.forEach((group: any) => {
                        children.push(group.id);
                        collectDescendants(group.id, 'group');
                    });
                }
                
                if (currentType === 'group' && island.children) {
                    island.children.forEach((group: any) => {
                        if (group.id === currentId && group.children) {
                            group.children.forEach((area: any) => {
                                children.push(area.id);
                                collectDescendants(area.id, 'area');
                            });
                        }
                    });
                }
                
                if (currentType === 'area' && island.children) {
                    island.children.forEach((group: any) => {
                        if (group.children) {
                            group.children.forEach((area: any) => {
                                if (area.id === currentId && area.children) {
                                    area.children.forEach((iupZone: any) => {
                                        children.push(iupZone.id);
                                        collectDescendants(iupZone.id, 'iup_zone');
                                    });
                                }
                            });
                        }
                    });
                }
                
                if (currentType === 'iup_zone' && island.children) {
                    island.children.forEach((group: any) => {
                        if (group.children) {
                            group.children.forEach((area: any) => {
                                if (area.children) {
                                    area.children.forEach((iupZone: any) => {
                                        if (iupZone.id === currentId && iupZone.children) {
                                            iupZone.children.forEach((iupSegmentation: any) => {
                                                children.push(iupSegmentation.id);
                                                collectDescendants(iupSegmentation.id, 'iup_segmentation');
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                if (currentType === 'iup_segmentation' && island.children) {
                    island.children.forEach((group: any) => {
                        if (group.children) {
                            group.children.forEach((area: any) => {
                                if (area.children) {
                                    area.children.forEach((iupSegmentation: any) => {
                                        if (iupSegmentation.id === currentId && iupSegmentation.children) {
                                            iupSegmentation.children.forEach((iup: any) => {
                                                children.push(iup.id);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        };

        collectDescendants(parentId, parentType);
        return children;
    };

    // Helper function to find territory by ID
    const findTerritoryById = (id: string): any => {
        for (const island of territories) {
            if (island.id === id) return island;
            
            if (island.children) {
                for (const group of island.children) {
                    if (group.id === id) return group;
                    
                    if (group.children) {
                        for (const area of group.children) {
                            if (area.id === id) return area;
                            
                            if (area.children) {
                                for (const iupZone of area.children) {
                                    if (iupZone.id === id) return iupZone;
                                    
                                    if (iupZone.children) {
                                        for (const iup of iupZone.children) {
                                            if (iup.id === id) return iup;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    };

    // Helper function to get disabled territories (children of selected parents)
    const getDisabledTerritories = (): Set<string> => {
        const disabled = new Set<string>();
        
        formData.selectedTerritories.forEach((territory, territoryId) => {
            if (!territory.ui_only) { // Only for explicitly selected territories
                const childrenIds = getAllChildren(territoryId, territory.type);
                childrenIds.forEach(childId => disabled.add(childId));
            }
        });
        
        return disabled;
    };

    // Handle territory selection  
    const handleTerritoryToggle = (territoryId: string, territoryData: ExpandableRowData) => {
        setFormData(prev => {
            const newSelected = new Map(prev.selectedTerritories);
            
            if (newSelected.has(territoryId)) {
                // Uncheck: remove territory and all its children
                newSelected.delete(territoryId);
                const childrenIds = getAllChildren(territoryId, territoryData.type);
                childrenIds.forEach(childId => newSelected.delete(childId));
            } else {
                // Check: add territory and all its children
                newSelected.set(territoryId, {
                    access_level: territoryData.type.toUpperCase(),
                    ref_id: territoryId,
                    name: territoryData.name,
                    type: territoryData.type
                });
                
                // Add children with ui_only flag
                const childrenIds = getAllChildren(territoryId, territoryData.type);
                childrenIds.forEach(childId => {
                    const childTerritory = findTerritoryById(childId);
                    if (childTerritory) {
                        newSelected.set(childId, {
                            access_level: childTerritory.type.toUpperCase(),
                            ref_id: childId,
                            name: childTerritory.name,
                            type: childTerritory.type,
                            ui_only: true
                        });
                    }
                });
            }
            
            return {
                ...prev,
                selectedTerritories: newSelected
            };
        });

        // Clear validation error
        if (validationErrors.territories) {
            setValidationErrors(prev => ({
                ...prev,
                territories: undefined
            }));
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.employee_id) {
            errors.employee_id = 'Employee is required';
        }

        if (formData.selectedTerritories.size === 0) {
            errors.territories = 'At least one territory must be selected';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create handler
    const handleCreate = async () => {
        if (!validateForm()) {
            console.error('Please fix validation errors');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Filter out UI-only territories (children), send only parents
            const territoryData: TerritoryAccess[] = Array.from(formData.selectedTerritories.values())
                .filter(territory => !territory.ui_only);
            
            await UsermanagementServices.createUserAccess({
                employee_id: formData.employee_id,
                data_territory: territoryData
            });
            
            navigate('/crm/user-management');
        } catch (error: any) {
            console.error('Error creating user access:', error);
            console.error(error?.message || 'Failed to create user access');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageMeta 
                title="Create User Access - CRM" 
                description="Grant employee access to specific territories"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto px-4 sm:px-3">

                    {/* Header */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/crm/user-management')}
                                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                            >
                                <MdKeyboardArrowLeft size={20} />
                            </Button>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create User Access</h1>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
                        </div>
                        <div>
                            <Label>
                                Select Employee *
                            </Label>
                            <CustomAsyncSelect
                                placeholder="Select employee..."
                                value={selectedEmployee}
                                error={validationErrors.employee_id}
                                defaultOptions={employeeOptions}
                                loadOptions={handleEmployeeInputChange}
                                onMenuScrollToBottom={handleEmployeeMenuScrollToBottom}
                                isLoading={employeePagination.loading}
                                noOptionsMessage={() => "No employees found"}
                                loadingMessage={() => "Loading employees..."}
                                isSearchable={true}
                                inputValue={employeeInputValue}
                                onInputChange={(inputValue) => {
                                    handleEmployeeInputChange(inputValue);
                                }}
                                onChange={(option: any) => {
                                    setSelectedEmployee(option);
                                    handleInputChange('employee_id', option?.value || '');
                                }}
                            />
                            {validationErrors.employee_id && (
                                <p className="text-sm text-red-600">{validationErrors.employee_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 font-secondary my-5">
                        <TerritorySelectionTable
                            territories={territories}
                            loading={territoriesLoading}
                            selectedTerritories={new Set(formData.selectedTerritories.keys())}
                            disabledTerritories={getDisabledTerritories()}
                            onTerritoryToggle={handleTerritoryToggle}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm my-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/crm/user-management')}
                            className="px-6 rounded-full"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleCreate}
                                className="px-6 flex items-center gap-2 rounded-full"
                                disabled={isSubmitting}
                            >
                                <FaSave className={`mr-2 h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                                {isSubmitting ? 'Creating...' : 'Create Access'}
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateUserAccess;