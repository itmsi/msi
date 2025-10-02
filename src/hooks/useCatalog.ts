import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { menuService } from '@/services/ecatalogService';
import { MenuItem, TreeNode, SelectedMenuItem } from '@/types/ecatalog';

interface UseMenuReturn {
    menuItems: MenuItem[];
    treeNodes: TreeNode[];
    loading: boolean;
    error: string | null;
    selectedItem: SelectedMenuItem | null;
    expandedNodes: string[];
    searchQuery: string;
    
    // Actions
    fetchMenu: () => Promise<void>;
    searchMenu: (query: string) => Promise<void>;
    selectItem: (item: MenuItem, path: string[]) => void;
    selectItemById: (nodeId: string) => void;
    clearSelection: () => void;
    setExpandedNodes: (nodes: string[]) => void;
    setSearchQuery: (query: string) => void;
    clearError: () => void;
}

export const useMenu = (autoFetch = true): UseMenuReturn => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<SelectedMenuItem | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Convert MenuItem to TreeNode for MUI TreeView
    const convertToTreeNodes = useCallback((items: MenuItem[]): TreeNode[] => {
        return items.map(item => ({
            id: item.id,
            label: item.partNumber ? `${item.partNumber} - ${item.partName}` : item.partName,
            children: item.children && item.children.length > 0 ? convertToTreeNodes(item.children) : undefined,
            partNumber: item.partNumber,
            softtype: item.softtype,
            epcType: item.epcType,
            masterId: item.masterId
        }));
    }, []);

    const treeNodes = convertToTreeNodes(menuItems);

    // Fetch menu data
    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await menuService.getMenuTree();
            
            if (response.code === 200 && response.data) {
                setMenuItems(response.data);
            } else {
                const errorMessage = response.msg || 'Failed to fetch menu data';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menu data';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Search menu items
    const searchMenu = useCallback(async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            setSearchQuery(query);
            
            if (!query.trim()) {
                // If empty query, fetch all menu items
                await fetchMenu();
                return;
            }

            const response = await menuService.searchMenuItems(query);
            
            if (response.code === 200 && response.data) {
                setMenuItems(response.data);
            } else {
                const errorMessage = response.msg || 'No search results found';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Error searching menu:', error);
            const errorMessage = error instanceof Error ? error.message : 'Search failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchMenu]);

    // Find item path for breadcrumb
    const findItemPath = useCallback((items: MenuItem[], targetId: string, currentPath: string[] = []): string[] | null => {
        for (const item of items) {
            const newPath = [...currentPath, item.partName];
            
            if (item.id === targetId) {
                return newPath;
            }
            
            if (item.children && item.children.length > 0) {
                const foundPath = findItemPath(item.children, targetId, newPath);
                if (foundPath) {
                    return foundPath;
                }
            }
        }
        return null;
    }, []);

    // Find menu item by ID
    const findMenuItemById = useCallback((items: MenuItem[], id: string): MenuItem | null => {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findMenuItemById(item.children, id);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }, []);

    // Select menu item
    const selectItem = useCallback((item: MenuItem, path: string[]) => {
        setSelectedItem({
            id: item.id,
            masterId: item.masterId,
            partNumber: item.partNumber,
            partName: item.partName,
            softtype: item.softtype,
            epcType: item.epcType,
            path
        });
        
        toast.success(`Selected: ${item.partName}`);
    }, []);

    // Select item by ID (for TreeView onNodeSelect)
    const selectItemById = useCallback((nodeId: string) => {
        const item = findMenuItemById(menuItems, nodeId);
        if (item) {
            const path = findItemPath(menuItems, nodeId) || [item.partName];
            selectItem(item, path);
        }
    }, [menuItems, findMenuItemById, findItemPath, selectItem]);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedItem(null);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchMenu();
        }
    }, [fetchMenu, autoFetch]);

    return {
        menuItems,
        treeNodes,
        loading,
        error,
        selectedItem,
        expandedNodes,
        searchQuery,
        
        // Actions
        fetchMenu,
        searchMenu,
        selectItem,
        selectItemById,
        clearSelection,
        setExpandedNodes,
        setSearchQuery,
        clearError
    };
};