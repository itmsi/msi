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
    disabled = false
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(preExpandedTerritories));
    
    // Update expanded rows when preExpandedTerritories changes
    useEffect(() => {
        setExpandedRows(new Set(preExpandedTerritories));
    }, [loading]);
    
    const flatData = flattenTerritoryData(territories);
    
    // Filter data berdasarkan expanded state
    const getVisibleData = () => {
        const visible: ExpandableRowData[] = [];
        
        flatData.forEach(row => {
            if (row.level === 0) {
                // Island selalu visible
                visible.push(row);
            } else if (row.parent_id && expandedRows.has(row.parent_id)) {
                // Child visible jika parent di-expand
                visible.push(row);
            }
        });
        
        return visible;
    };

    const toggleExpanded = (rowId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            // Ketika collapse, hapus item ini dan semua descendants-nya
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
        if (!disabled) {
            onTerritoryToggle(row.id, row);
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
            // minWidth: '200px'
        },
        // {
        //     name: 'Code',
        //     selector: (row) => row.code,
        //     cell: (row) => (
        //         <Badge 
        //             variant='solid'
        //             color='info'
        //             size='sm'
        //         >
        //             {row.code}
        //         </Badge>
        //     ),
        //     width: '120px'
        // },
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
        // {
        //     name: 'Status',
        //     selector: (row) => row.status,
        //     cell: (row) => (
        //         <ActiveStatusBadge
        //             status={row.status === 'aktif' ? 'active' : 'inactive'} 
        //             size="sm"
        //         />
        //     ),
        //     width: '100px'
        // },
        {
            name: 'Select',
            cell: (row) => {
                const isDisabled = disabled || disabledTerritories.has(row.id);
                const isSelected = selectedTerritories.has(row.id);
                const hasChildrenRow = hasChildren(row);
                
                // For parent territories with children
                if (hasChildrenRow) {
                    if (isSelected) {
                        return (
                            <Button
                                variant='transparent'
                                disabled={true}
                                className="p-2 rounded-md text-sm font-medium cursor-not-allowed opacity-75"
                            >
                                <MdCheckBox className="text-xl text-blue-600" />
                            </Button>
                        );
                    }
                    return null;
                }
                
                return (
                    <Button
                        onClick={() => handleTerritoryClick(row)}
                        variant='transparent'
                        disabled={isDisabled}
                        className={`p-2 rounded-md text-sm font-medium transition-colors ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
                        }`}
                    >
                        {isSelected ? (
                            <MdCheckBox className={`text-xl ${isDisabled ? 'text-gray-400' : 'text-blue-600'}`} />
                        ) : (
                            <MdCheckBoxOutlineBlank className="text-gray-400 text-xl hover:text-gray-600" />
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