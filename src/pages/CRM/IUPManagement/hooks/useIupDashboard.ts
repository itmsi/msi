import { useCallback, useEffect, useState } from "react";
import { IupDetail } from "../../IUPTerritory/types/iupterritory";
import { IupService } from "../services/iupManagementService";

interface UseIupDetailResult {
    data: IupDetail | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useIupDashboard(iupId: string | undefined): UseIupDetailResult {
    const [data, setData] = useState<IupDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!iupId) {
            setIsLoading(false);
            setError("ID IUP tidak ditemukan pada URL.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await IupService.getDashboardIup(iupId);
            console.log(res);
            if (res.data.success) {
                setData(res?.data);
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
    }, [iupId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { data, isLoading, error, refetch: fetchDetail };
}
