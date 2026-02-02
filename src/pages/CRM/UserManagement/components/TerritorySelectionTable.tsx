import React, { useEffect, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { MdExpandMore, MdExpandLess, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { FaMapMarkerAlt, FaLayerGroup, FaMapPin, FaIndustry } from 'react-icons/fa';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { Island, BaseEntity } from '@/pages/CRM/Territory/types/territory';
import { CategoryBadge } from '@/components/ui/badge';
import Button from '@/components/ui/button/Button';

export interface ExpandableRowData extends BaseEntity {
    type: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
    level: number;
    parent_id?: string;
    children?: any[];
}

interface TerritorySelectionTableProps {
    territories: Island[];
    loading: boolean;
    selectedTerritories: Set<string>;
    disabledTerritories?: Set<string>;
    preExpandedTerritories?: Set<string>;
    onTerritoryToggle: (territoryId: string, territoryData: ExpandableRowData) => void;
    disabled?: boolean;
    userRole?: 'master' | 'super_admin' | 'admin' | 'user';
    userTerritories?: Set<string>;
    allowMultipleSelection?: boolean;
}

// Flatten territory hierarchy untuk display
const flattenTerritoryData = (territories: Island[]): ExpandableRowData[] => {
    const result: ExpandableRowData[] = [];
    
    territories.forEach(island => {
        result.push({
            ...island,
            level: 0,
            type: 'island'
        });
        
        if (island.children && island.children.length > 0) {
            island.children.forEach(group => {
                result.push({
                    ...group,
                    level: 1,
                    parent_id: island.id,
                    type: 'group'
                });
                
                if (group.children && group.children.length > 0) {
                    group.children.forEach(area => {
                        result.push({
                            ...area,
                            level: 2,
                            parent_id: group.id,
                            type: 'area'
                        });
                        
                        if (area.children && area.children.length > 0) {
                            area.children.forEach(iupZone => {
                                result.push({
                                    ...iupZone,
                                    level: 3,
                                    parent_id: area.id,
                                    type: 'iup_zone'
                                });
                                
                                if (iupZone.children && iupZone.children.length > 0) {
                                    iupZone.children.forEach(iup => {
                                        result.push({
                                            ...iup,
                                            level: 4,
                                            parent_id: iupZone.id,
                                            type: 'iup',
                                            children: undefined
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    
    return result;
};

// Icon component untuk setiap type
const TypeIcon: React.FC<{ type: string; level: number }> = ({ type }) => {
    const iconProps = { className: "text-sm mr-2" };
    
    switch (type) {
        case 'island':
            return <FaMapMarkerAlt {...iconProps} className="text-blue-600 text-sm mr-2" />;
        case 'group':
            return <FaLayerGroup {...iconProps} className="text-green-600 text-sm mr-2" />;
        case 'area':
            return <FaMapPin {...iconProps} className="text-orange-600 text-sm mr-2" />;
        case 'iup_zone':
            return <FaIndustry {...iconProps} className="text-purple-600 text-sm mr-2" />;
        case 'iup':
            return <FaIndustry {...iconProps} className="text-gray-600 text-sm mr-2" />;
        default:
            return null;
    }
};

const TerritorySelectionTable: React.FC<TerritorySelectionTableProps> = ({ 
    territories, 
    loading,
    selectedTerritories,
    disabledTerritories = new Set(),
    preExpandedTerritories = new Set(),
    onTerritoryToggle,
    disabled = false,
    userRole = 'admin',
    userTerritories = new Set(),
    allowMultipleSelection = true
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(preExpandedTerritories));
    
    useEffect(() => {
        setExpandedRows(new Set(preExpandedTerritories));
    }, [loading]);
    
    const flatData = flattenTerritoryData(territories);
    
    // Helper functions untuk role-based access control
    const canAccessTerritory = (row: ExpandableRowData): boolean => {
        if (userRole === 'master' || userRole === 'super_admin') {
            return true;
        }
        
        if (!userTerritories || userTerritories.size === 0) {
            return true;
        }
        
        return isChildOfUserTerritories(row) || userTerritories.has(row.id);
    };
    
    const isChildOfUserTerritories = (row: ExpandableRowData): boolean => {
        if (!userTerritories || userTerritories.size === 0) return true;
        if (userTerritories.has(row.id)) return true;
        
        const allAncestors = getAllAncestors(row);
        return allAncestors.some(ancestorId => userTerritories.has(ancestorId));
    };
    
    const getAllAncestors = (row: ExpandableRowData): string[] => {
        const ancestors: string[] = [];
        let currentRow = row;
        
        while (currentRow.parent_id) {
            ancestors.push(currentRow.parent_id);
            const parentRow = flatData.find(item => item.id === currentRow.parent_id);
            if (!parentRow) break;
            currentRow = parentRow;
        }
        
        return ancestors;
    };
    
    const hasConflictingSelection = (row: ExpandableRowData): boolean => {
        if (allowMultipleSelection) return false;
        
        const currentSelections = Array.from(selectedTerritories);
        if (currentSelections.length === 0) return false;
        
        for (const selectedId of currentSelections) {
            const selectedRow = flatData.find(item => item.id === selectedId);
            if (!selectedRow) continue;
            
            const selectedAncestors = getAllAncestors(selectedRow);
            const rowAncestors = getAllAncestors(row);
            
            if (selectedAncestors.includes(row.id) || 
                rowAncestors.includes(selectedId) ||
                selectedId === row.id) {
                return true;
            }
        }
        
        return false;
    };
    
    // Filter data berdasarkan expanded state
    const getVisibleData = () => {
        const visible: ExpandableRowData[] = [];
        
        flatData.forEach(row => {
            if (row.level === 0) {
                visible.push(row);
            } else if (row.parent_id && expandedRows.has(row.parent_id)) {
                visible.push(row);
            }
        });
        
        return visible;
    };

    const toggleExpanded = (rowId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
            const descendants = getAllDescendants(rowId);
            descendants.forEach(descendantId => {
                newExpanded.delete(descendantId);
            });
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    const getAllDescendants = (parentId: string): string[] => {
        const descendants: string[] = [];
        const directChildren = flatData.filter(item => item.parent_id === parentId);
        
        directChildren.forEach(child => {
            descendants.push(child.id);
            descendants.push(...getAllDescendants(child.id));
        });
        
        return descendants;
    };

    const hasChildren = (row: ExpandableRowData) => {
        return flatData.some(item => item.parent_id === row.id);
    };

    const handleTerritoryClick = (row: ExpandableRowData) => {
        if (disabled) return;
        if (!canAccessTerritory(row)) return;
        
        const isCurrentlySelected = selectedTerritories.has(row.id);
        
        if (isCurrentlySelected) {
            onTerritoryToggle(row.id, row);
        } else {
            if (!hasConflictingSelection(row)) {
                onTerritoryToggle(row.id, row);
            }
        }
    };
    
    const columns: TableColumn<ExpandableRowData>[] = [
        {
            name: 'Territory Name',
            selector: (row) => row.name,
            cell: (row) => (
                <div 
                    className="flex items-center cursor-pointer hover:text-blue-600"
                    style={{ paddingLeft: `${row.level * 20}px` }}
                    onClick={() => hasChildren(row) && toggleExpanded(row.id)}
                >
                    {hasChildren(row) && (
                        <span className="mr-2">
                            {expandedRows.has(row.id) ? (
                                <MdExpandLess className="text-lg" />
                            ) : (
                                <MdExpandMore className="text-lg" />
                            )}
                        </span>
                    )}
                    {!hasChildren(row) && <span className="mr-2 w-6"></span>}
                    <TypeIcon type={row.type} level={row.level} />
                    <span className="font-medium">{row.name}</span>
                </div>
            ),
        },
        {
            name: 'Type',
            selector: (row) => row.type,
            cell: (row) => (
                <div className="flex items-center">
                    <CategoryBadge 
                        showText={true} 
                        category={row.type} 
                        size='sm'
                    />
                </div>
            ),
            width: '120px'
        },
        {
            name: 'Select',
            cell: (row) => {
                const isDisabled = disabled || disabledTerritories.has(row.id);
                const isSelected = selectedTerritories.has(row.id);
                const canAccess = canAccessTerritory(row);
                const hasConflict = hasConflictingSelection(row);
                
                // Don't show checkbox if user doesn't have access
                if (!canAccess) {
                    return (
                        <div className="p-2 text-gray-300" title="No access to this territory">
                            <MdCheckBoxOutlineBlank className="text-xl" />
                        </div>
                    );
                }
                
                // Disable if has conflict and not currently selected
                const finalDisabled = isDisabled || (!isSelected && hasConflict);
                
                return (
                    <Button
                        onClick={() => handleTerritoryClick(row)}
                        variant='transparent'
                        disabled={finalDisabled}
                        className={`p-2 rounded-md text-sm font-medium transition-colors ${
                            finalDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
                        }`}
                    >
                        {isSelected ? (
                            <MdCheckBox className={`text-xl ${finalDisabled ? 'text-gray-400' : 'text-blue-600'}`} />
                        ) : (
                            <MdCheckBoxOutlineBlank className={`text-xl ${finalDisabled ? 'text-gray-400' : 'text-gray-400 hover:text-gray-600'}`} />
                        )}
                    </Button>
                );
            },
            ignoreRowClick: true,
            allowOverflow: true,
            // button: true,
            width: '80px'
        }
    ];

    return (
        <CustomDataTable
            columns={columns}
            data={getVisibleData()}
            loading={loading}
            pagination={false}
            noDataComponent={
                <div className="py-8 text-center text-gray-500">
                    <FaMapMarkerAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                    <p>No territory data available</p>
                </div>
            }
            responsive
            highlightOnHover
            striped={false}
            persistTableHead
            headerBackground="rgba(2, 83, 165, 0.1)"
            hoverBackground="rgba(223, 232, 242, 0.3)"
            borderRadius="8px"
        />
    );
};

export default TerritorySelectionTable;