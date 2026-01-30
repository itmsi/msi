import React, { useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { MdExpandMore, MdExpandLess, MdAdd, MdEdit, MdDeleteOutline } from 'react-icons/md';
import { FaMapMarkerAlt, FaLayerGroup, FaMapPin, FaIndustry, FaCubes } from 'react-icons/fa';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { Island, BaseEntity } from '../types/territory';
import { ActiveStatusBadge, CategoryBadge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { PermissionButton } from '@/components/common/PermissionComponents';
import Badge from '@/components/ui/badge/Badge';

export interface ExpandableRowData extends BaseEntity {
    type: 'island' | 'group' | 'area' | 'iup_zone' | 'iup_segmentation' | 'iup';
    level: number;
    parent_id?: string;
    children?: any[];
}

interface TerritoryTableProps {
    territories: Island[];
    loading: boolean;
    onRowClick?: (row: ExpandableRowData) => void;
    onAddChild?: (parentRow: ExpandableRowData, childType: string) => void;
    onEdit?: (row: ExpandableRowData) => void;
    onDelete?: (row: ExpandableRowData) => void;
}

// Fungsi untuk flatten data hierarki menjadi flat array
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
                                    type: 'iup_zone',
                                });
                                
                                if (iupZone.children && iupZone.children.length > 0) {
                                    iupZone.children.forEach(iupSegmentation => {
                                        result.push({
                                            ...iupSegmentation,
                                            level: 4,
                                            parent_id: iupZone.id,
                                            type: 'iup_segmentation',
                                        });
                                        
                                        if (iupSegmentation.children && iupSegmentation.children.length > 0) {
                                            iupSegmentation.children.forEach(iup => {
                                                result.push({
                                                    ...iup,
                                                    level: 5,
                                                    parent_id: iupSegmentation.id,
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
        }
    });
    
    return result;
};

// Component untuk render icon berdasarkan type
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
        case 'iup_segmentation':
            return <FaCubes {...iconProps} className="text-slate-600 text-sm mr-2" />;
        case 'iup':
            return <FaIndustry {...iconProps} className="text-gray-600 text-sm mr-2" />;
        default:
            return null;
    }
};

const TerritoryTable: React.FC<TerritoryTableProps> = ({ 
    territories, 
    loading, 
    // onRowClick,
    onAddChild,
    onEdit,
    onDelete 
}) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    
    const flatData = flattenTerritoryData(territories);
    
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
    
    const hasChildren = (row: ExpandableRowData) => {
        return flatData.some(item => item.parent_id === row.id);
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

    // Fungsi untuk menentukan child type yang bisa ditambahkan
    const getChildType = (parentType: string): string | null => {
        switch (parentType) {
            case 'island': return 'group';
            case 'group': return 'area';
            case 'area': return 'iup_zone';
            case 'iup_zone': return 'iup_segmentation';
            case 'iup_segmentation': return 'iup';
            case 'iup': return null;
            default: return null;
        }
    };

    // Fungsi untuk mendapatkan label child type
    const getChildTypeLabel = (childType: string): string => {
        switch (childType) {
            case 'group': return 'Group';
            case 'area': return 'Area';
            case 'iup_zone': return 'IUP Zone';
            case 'iup_segmentation': return 'Segmentation';
            case 'iup': return 'IUP';
            default: return 'Item';
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
            minWidth: '200px'
        },
        {
            name: 'Code',
            selector: (row) => row.code,
            cell: (row) => (
                <Badge 
                    variant='solid'
                    color='info'
                    size='sm'
                >
                    {row.code}
                </Badge>
            ),
            width: '120px'
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
            width: '150px',
            center: true
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            cell: (row) => (
                <ActiveStatusBadge
                    status={row.status === 'aktif' ? 'active' : 'inactive'} 
                    variant='with-icon'
                    size="sm"
                />
            ),
            width: '130px'
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    {getChildType(row.type) && (
                        <Tooltip content={`Add ${getChildTypeLabel(getChildType(row.type)!)}`} position="top">
                            <PermissionButton
                                permission={'create'}
                                onClick={() => onAddChild && onAddChild(row, getChildType(row.type)!)}
                                className={`p-2 rounded-md text-sm font-medium transition-colors relative text-gray-600 hover:text-gray-900 hover:bg-gray-100`}
                            >
                                <MdAdd className="w-4 h-4" />
                            </PermissionButton>
                        </Tooltip>
                    )}
                    <Tooltip content={`Edit ${row.type.replace('_', ' ')}`} position="top">
                        <PermissionButton
                            permission={'create'}
                            onClick={() => onEdit && onEdit(row)}
                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
                        >
                            <MdEdit className="w-4 h-4" />
                        </PermissionButton>
                    </Tooltip>
                    <Tooltip content={`Delete ${row.type.replace('_', ' ')}`} position="top">
                        <PermissionButton
                            permission={'delete'}
                            onClick={() => onDelete && onDelete(row)}
                            className={`p-2 rounded-md text-sm font-medium transition-colors relative text-red-600 hover:text-red-700 hover:bg-red-50`}
                        >
                            <MdDeleteOutline className="w-4 h-4" />
                        </PermissionButton>
                    </Tooltip>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '220px'
        }
    ];
    
    return (
        <div className="p-6 font-secondary">
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
        </div>
    );
};

export default TerritoryTable;