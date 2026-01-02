import { useState, useEffect } from "react";
import { TerritoryServices } from "../services/territoryServices";
import { Island, TerritoryRequest, CreateTerritoryRequest, UpdateTerritoryRequest, DeleteTerritoryRequest } from "../types/territory";

export const useTerritory = () => {
    const [territories, setTerritories] = useState<Island[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchTerritories = async (params?: Partial<TerritoryRequest>) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TerritoryServices.getTerritory(params);
            
            if (response.success) {
                setTerritories(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else {
                setError('Failed to fetch territory data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const searchTerritories = (searchTerm: string) => {
        fetchTerritories({
            search: searchTerm,
            page: 1
        });
    };

    const changePage = (page: number) => {
        fetchTerritories({
            page,
            limit: pagination.limit
        });
    };

    const changeLimit = (newLimit: number) => {
        fetchTerritories({
            page: 1,
            limit: newLimit
        });
    };

    useEffect(() => {
        fetchTerritories();
    }, []);

    const createTerritory = async (data: CreateTerritoryRequest) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TerritoryServices.createTerritory(data);
            
            if (response.success) {
                // Refresh data setelah create berhasil
                await fetchTerritories();
                return { success: true, data: response.data };
            } else {
                setError('Failed to create territory');
                return { success: false, error: 'Failed to create territory' };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateTerritory = async (id: string, data: UpdateTerritoryRequest) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TerritoryServices.updateTerritory(id, data);
            
            if (response.success) {
                // Refresh data setelah update berhasil
                await fetchTerritories();
                return { success: true, data: response.data };
            } else {
                setError('Failed to update territory');
                return { success: false, error: 'Failed to update territory' };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const deleteTerritory = async (params: DeleteTerritoryRequest) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TerritoryServices.deleteTerritory(params);
            
            if (response.success) {
                // Refresh data setelah delete berhasil
                await fetchTerritories();
                return { success: true, deletedType: params.type, deletedId: params.id };
            } else {
                setError(`Failed to delete ${params.type} territory`);
                return { success: false, error: `Failed to delete ${params.type} territory` };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        territories,
        loading,
        error,
        pagination,
        fetchTerritories,
        searchTerritories,
        changePage,
        changeLimit,
        createTerritory,
        updateTerritory,
        deleteTerritory
    };
};