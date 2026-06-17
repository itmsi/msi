import { useState, useEffect, useCallback, useMemo } from 'react';
import { getProfile } from '@/helpers/generalHelper';
import { CustomerInformation, TerritoryInformation, CustomerData } from '../types/customerDashboard';

export interface ChartDataPoint {
    name: string;
    value: number;
}

const sampleData = {
    "success": true,
    "data": [
        {
            "data_customer": {
                "customer_name": "PT ALAM LESTARI BARATAMAINDO",
                "customer_id": "9eda31ae-f7f5-4041-a82c-5ec2fa80acdf",
                "customer_email": "lintangacc555@gmail.com",
                "customer_phone": "085795585792",
                "customer_address": "Jl. A. Yani, Sebamban 2 Blok E, RT 3 RW 1, Desa Mekar Jaya, Kec. Angsana, Kabupaten Tanah Bumbu Kalimantan Selatan",
                "customer_city": "",
                "customer_state": "KALIMANTAN",
                "customer_zip": "",
                "customer_country": "INDONESIA",
                "contact_person": "Ibu Lintang",
                "customer_code": "ALB",
                "contact_persons": [
                    {
                        "contact_person_name": " Pak Yovandha Hidayat",
                        "contact_person_email": "yovandha1995@gmail.com",
                        "contact_person_phone": "085232636481",
                    }
                ]
            },
            "data_teritory": [
                {
                    "island_name": "KALIMANTAN",
                    "group_name": "G1",
                    "area_name": "3",
                    "iup_zone_name": "BARITO UTARA",
                    "iup_segmentation_name": "NIKEL",
                    "iup_name": "PAGUN TAKA",
                },
                {
                    "island_name": "SULAWESI",
                    "group_name": "G3",
                    "area_name": "7",
                    "iup_zone_name": "BOMBANA",
                    "iup_segmentation_name": "NIKEL",
                    "iup_name": "TONIA MITRA SEJAHTERA",
                },
                {
                    "island_name": "SULAWESI",
                    "group_name": "G1",
                    "area_name": "1",
                    "iup_zone_name": "BANGGAI",
                    "iup_segmentation_name": "NIKEL",
                    "iup_name": "KONINIS FAJAR MINERAL",
                },
                {
                    "island_name": "SUMATERA",
                    "group_name": "G3",
                    "area_name": "8",
                    "iup_zone_name": "LAHAT",
                    "iup_segmentation_name": "BATUBARA",
                    "iup_name": "MUSTIKA INDAH PERMAI",
                }
            ],
            "data_iup_per_segmentasi": {
                "nikel": 2,
                "batubara": 3
            },
            "data_unit_per_segmentasi_iup_aktif": {
                "nikel": 5,
                "batubara": 10
            },
            "data_unit_per_segmentasi_iup_non_aktif": {
                "nikel": 1,
                "batubara": 2
            },
            "data_unit_per_brand_iup_aktif": {
                "motorsights": 5,
                "hino": 5,
                "sany": 10
            },
            "data_unit_per_brand_iup_non_aktif": {
                "motorsights": 1,
                "hino": 1,
                "sany": 2
            },
            "data_rkab": [
                {
                    "nama_iup": "KAHALA MINERA",
                    "tahun": 2024,
                    "rkab": 5,
                    "target_production": 900000,
                    "current_production": 920000
                },
                {
                    "nama_iup": "TEST IUP Segmentasi Nikel",
                    "tahun": 2021,
                    "rkab": 5,
                    "target_production": 50000,
                    "current_production": 95000
                },
                {
                    "nama_iup": "Test IUP Segmentasi baru",
                    "tahun": 2026,
                    "rkab": 5,
                    "target_production": 55000,
                    "current_production": 80000
                }
            ],
            "total_rkab_iup_aktif": 1,
            "total_rkab_iup_non_aktif": 0,
            "data_quotations": [
                {
                    "customer_id": "86fb7e4d-c11d-4a9b-aadf-a4d5aa911883",
                    "componen_product_name": "Mesin Genset",
                    "msi_product": "Harlo",
                    "msi_model": "Harlo 150 KVA",
                    "code_unique": "1234567890",
                    "quantity": 2,
                    "min_price": 1000000,
                    "max_price": 2000000
                }
            ],
            "data_sales_order": [
                {
                    "customer_id": "e0d19e7b-cf12-4c44-8b77-8aeeb6fe89b8",
                    "componen_product_name": "POLYAMIDE TUBE PA14",
                    "msi_product": "POLYAMIDE TUBE PA14",
                    "msi_model": "04.35160.9714",
                    "code_unique": "19593",
                    "quantity": 5,
                    "min_price": 1500000,
                    "max_price": 1500000
                }
            ]
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
    }
    }
export const useCustomerDashboard = () => {
    // Data untuk tabel (paginated)
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
            const data = sampleData.data[0];
            setCustomerInformation(data.data_customer || null);
            setCustomerData(data);
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
