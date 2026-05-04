import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalculator } from './useCalculator';
import toast from 'react-hot-toast';

export const useCalculatorManagement = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id?: string }>({ show: false });

    const { haulingPrices, pagination, loading, error, fetchHaulingPrices, deleteHaulingPrice } = useCalculator();

    // Fetch ulang saat applied search, sort, atau pagination berubah
    useEffect(() => {
        fetchHaulingPrices({
            page: currentPage,
            limit: itemsPerPage,
            sort_order: sortOrder,
            search: appliedSearch,
        });
    }, [appliedSearch, sortOrder, currentPage, itemsPerPage, fetchHaulingPrices]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleRowsPerPageChange = useCallback((newPerPage: number) => {
        setCurrentPage(1);
        setItemsPerPage(newPerPage);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setAppliedSearch('');
        setCurrentPage(1);
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order') {
            setSortOrder(value as 'asc' | 'desc');
            setCurrentPage(1);
        }
    }, []);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setAppliedSearch(searchTerm);
            setCurrentPage(1);
        }
    }, [searchTerm]);

    const handleEdit = useCallback((id: string) => {
        navigate(`/hauling-calculator/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback((id: string) => {
        setConfirmDelete({ show: true, id });
    }, []);

    const confirmDeleteItem = useCallback(async () => {
        if (!confirmDelete.id) return;
        try {
            await deleteHaulingPrice(confirmDelete.id);
            toast.success('Data berhasil dihapus.');
            setConfirmDelete({ show: false });
            fetchHaulingPrices({
                page: currentPage,
                limit: itemsPerPage,
                sort_order: sortOrder,
                search: appliedSearch,
            });
        } catch {
            toast.error('Gagal menghapus data.');
        }
    }, [confirmDelete.id, deleteHaulingPrice, fetchHaulingPrices, currentPage, itemsPerPage, sortOrder, appliedSearch]);

    const cancelDelete = useCallback(() => {
        setConfirmDelete({ show: false });
    }, []);

    return {
        haulingPrices,
        pagination,
        loading,
        error,
        searchTerm,
        sortOrder,
        confirmDelete,

        handlePageChange,
        handleRowsPerPageChange,
        handleSearchChange,
        handleClearSearch,
        handleFilterChange,
        handleKeyPress,
        handleEdit,
        handleDelete,
        confirmDeleteItem,
        cancelDelete,
    };
};
