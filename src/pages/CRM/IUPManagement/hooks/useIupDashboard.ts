import { useCallback, useEffect, useState } from "react";
import { IupService } from "../services/iupManagementService";
import { useParams } from "react-router-dom";
import { IupDashboard } from "../types/iupDashboard";

interface UseIupDetailResult {
    data: IupDashboard | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useIupDashboard(): UseIupDetailResult {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<IupDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) {
            setIsLoading(false);
            setError("ID IUP tidak ditemukan pada URL.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const res = await IupService.getDashboardIup(id);
            if (res.data.success) {
                setData(res?.data.data);
            } else {
                setError(res.data.message || "Gagal memuat data IUP. Silakan coba lagi.");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat memuat data IUP."
            );
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { data, isLoading, error, refetch: fetchDetail };
}
