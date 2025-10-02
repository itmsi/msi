import React, { useState } from 'react';
import { MdExpandMore, MdChevronRight, MdSearch, MdClear } from 'react-icons/md';
import { useMenu } from '@/hooks/useCatalog';
import { TreeNode } from '@/types/ecatalog';
import Input from '@/components/form/input/InputField';

interface TreeMenuProps {
    onItemSelect?: (item: any) => void;
    className?: string;
}

const TreeMenu: React.FC<TreeMenuProps> = ({ onItemSelect, className }) => {
    const {
        treeNodes,
        loading,
        error,
        selectedItem,
        expandedNodes,
        searchQuery,
        searchMenu,
        selectItemById,
        setExpandedNodes,
        setSearchQuery,
        clearError
    } = useMenu();

    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    // Handle search
    const handleSearch = async () => {
        if (localSearchQuery !== searchQuery) {
            await searchMenu(localSearchQuery);
        }
    };

    // Handle clear search
    const handleClearSearch = async () => {
        setLocalSearchQuery('');
        setSearchQuery('');
        await searchMenu('');
    };

    // Handle tree node selection
    const handleNodeSelect = (nodeId: string) => {
        selectItemById(nodeId);
        if (onItemSelect && selectedItem) {
            onItemSelect(selectedItem);
        }
    };

    // Handle tree node expansion
    const toggleNodeExpansion = (nodeId: string) => {
        const isExpanded = expandedNodes.includes(nodeId);
        if (isExpanded) {
            setExpandedNodes(expandedNodes.filter(id => id !== nodeId));
        } else {
            setExpandedNodes([...expandedNodes, nodeId]);
        }
    };

    // Render tree items recursively
    const renderTreeItems = (nodes: TreeNode[], level: number = 0): React.ReactNode => {
        return nodes.map((node) => {
            const isExpanded = expandedNodes.includes(node.id);
            const isSelected = selectedItem?.id === node.id;
            const hasChildren = node.children && node.children.length > 0;

            return (
                <div key={node.id} className="tree-item">
                    <div 
                        className={`tree-item-content flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded transition-colors ${
                            isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                        }`}
                        style={{ paddingLeft: `${level * 20 + 8}px` }}
                        onClick={() => handleNodeSelect(node.id)}
                    >
                        {/* Expansion toggle */}
                        {hasChildren && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNodeExpansion(node.id);
                                }}
                                className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded"
                            >
                                {isExpanded ? (
                                    <MdExpandMore size={16} />
                                ) : (
                                    <MdChevronRight size={16} />
                                )}
                            </button>
                        )}
                        {!hasChildren && <div className="w-6" />}

                        {/* Node label */}
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                                {node.label}
                            </span>
                            {node.softtype && (
                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                                    {node.softtype}
                                </span>
                            )}
                            {node.epcType && (
                                <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">
                                    {node.epcType}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                        <div className="tree-children">
                            {renderTreeItems(node.children!, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className={`h-full flex flex-col ${className || ''}`}>
            {/* Header */}
            <h3 className="text-lg font-primary-bold text-gray-900 mb-4">Parts Catalog</h3>

            {/* Search and Filters */}
            <div className="space-y-4 mb-4">
                {/* Search */}
                <div className="relative">
                    <Input
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search parts..."
                        className="w-full pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <button
                            onClick={handleSearch}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Search"
                        >
                            <MdSearch size={16} className="text-gray-500" />
                        </button>
                        {localSearchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Clear"
                            >
                                <MdClear size={16} className="text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Item Breadcrumb */}
            {selectedItem && (
                <div className="mb-4 p-3 bg-blue-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">Selected:</p>
                    <div className="flex flex-wrap items-center gap-1 text-sm text-blue-700">
                        {selectedItem.path.map((pathItem, index) => (
                            <React.Fragment key={index}>
                                <span className={index === selectedItem.path.length - 1 ? 'font-semibold' : ''}>
                                    {pathItem}
                                </span>
                                {index < selectedItem.path.length - 1 && (
                                    <MdChevronRight size={14} className="text-blue-500" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    {selectedItem.partNumber && (
                        <p className="text-xs text-gray-600 mt-1">
                            Part Number: {selectedItem.partNumber}
                        </p>
                    )}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700"
                        >
                            <MdClear size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            )}

            {/* Tree View */}
            {!loading && treeNodes.length > 0 && (
                <div className="flex-1 overflow-auto">
                    <div className="tree-view">
                        {renderTreeItems(treeNodes)}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && treeNodes.length === 0 && !error && (
                <div className="flex-1 flex flex-col justify-center items-center text-gray-500">
                    <MdSearch size={48} className="mb-2" />
                    <p className="text-sm">No parts found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

export default TreeMenu;
