import { useState, useEffect, useCallback } from 'react';
import { getProfile } from '@/helpers/generalHelper';
import { CustomerInformation, CustomerData } from '../types/customerDashboard';
import { CustomerService } from '../services/customerDashboardService';
import { useParams } from 'react-router-dom';

export interface ChartDataPoint {
    name: string;
    value: number;
}

export const useCustomerDashboard = () => {
    // Data untuk tabel (paginated
    const { id } = useParams<{ id: string }>();
    const [customerInformation, setCustomerInformation] = useState<CustomerInformation | null>(null);
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const profileSSO = getProfile() as any;
    const profileSSOId = profileSSO?.classes_id_netsuite || null;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // const data = sampleData.data[0];
            const params = {
                customer_id: id,
            };
            const response = await CustomerService.getDashboards(params);
            console.log('Customer Dashboard Response:', response);
            setCustomerInformation(response.data[0]?.data_customer || null);
            setCustomerData(response.data[0] || null);
        } catch (err: any) {
            setError(err?.message || 'Gagal memuat data customer');
        } finally {
            setLoading(false);
        }
    }, [profileSSOId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        loading,
        error,
        customerInformation,
        customerData,
    };
};
