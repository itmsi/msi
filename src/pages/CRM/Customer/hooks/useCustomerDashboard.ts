import { useState, useEffect, useCallback } from 'react';
import { getProfile } from '@/helpers/generalHelper';
import { CustomerInformation, CustomerData } from '../types/customerDashboard';

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
                "job_title": "DEV",
                "contact_persons": [
                    {
                        "contact_person_name": " Pak Yovandha Hidayat",
                        "contact_person_email": "yovandha1995@gmail.com",
                        "contact_person_phone": "085232636481",
                    },
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
            "units": [
                {
                    "brand_id": "040d979a-1b71-4562-a4a8-dbc1ff967b82",
                    "brand_name": "Motorsights",
                    "type": "Dump Truck : 46  Unit\nWater Truck : 01  unit",
                    "specification": "MS 600 6x4\nMS 600 8x4\nMS 700 6x4\nMS 700 8x4",
                    "physical_availability": null,
                    "quantity": 47,
                    "engine": 'WEICHAI'
                },
                {
                    "brand_id": "1a9e8949-2f5e-48be-98d0-2fc123302bc1",
                    "brand_name": "Howo",
                    "type": "Dump Truck",
                    "specification": "40 Hz 6x4, 28 DT\n(6x4 and 8x4)",
                    "physical_availability": null,
                    "quantity": 1,
                    "engine": null
                },
                {
                    "brand_id": "e0338e5d-676f-4281-a502-4e00b3501525",
                    "brand_name": "Mercedes",
                    "type": "Dump Truck",
                    "specification": "40 Hz 6x4, 28 DT\n(6x4 and 8x4)",
                    "physical_availability": null,
                    "quantity": 67,
                    "engine": null
                }
            ],
            "data_rkab": [
                {
                    "nama_iup": "KAHALA MINERA",
                    "tahun": 2024,
                    "rkab": 5,
                    "target_production": 900000,
                    "current_production": 720000
                },
                {
                    "nama_iup": "TEST IUP Segmentasi Nikel",
                    "tahun": 2021,
                    "rkab": 5,
                    "target_production": 50000,
                    "current_production": 35000
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
                    "manage_quotation_no": "054/IEC-MSI/II/2026",
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
                    "manage_sales_order_no": "SO-2026-0001",
                    "manage_sales_order_date": "2026-02-10T00:00:00.000Z",
                    "manage_sales_order_valid_date": "2026-02-17T00:00:00.000Z",
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
