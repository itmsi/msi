import { apiPost, ApiResponse } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type SyncMasterDataKey = 'department' | 'location' | 'term' | 'class' | 'item' | 'vendor' | 'invoice_sales_orders' | 'purchasing_orders' | 'sales_orders';

// ─── Sync List Types ──────────────────────────────────────────────────────────

export interface SyncListItem {
    sync_id: number;
    sync_module: string;
    sync_status: 'success' | 'processing' | 'failed';
    created_at: string;
    created_by: string;
    created_by_name: string;
    updated_at: string;
    updated_by: string;
    is_delete: boolean;
}

export interface SyncListResponse {
    items: SyncListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Maps sync_module value from API to the SyncMasterDataKey used by UI cards.
 * Add more entries as new modules are introduced.
 */
export const SYNC_MODULE_KEY_MAP: Record<string, SyncMasterDataKey> = {
    department:         'department',
    departments:        'department',
    location:           'location',
    locations:          'location',
    term:               'term',
    terms:              'term',
    class:              'class',
    classes:            'class',
    item:               'item',
    items:              'item',
    vendor:             'vendor',
    vendors:            'vendor',
    'invoice-sales-order':  'invoice_sales_orders',
    'invoice-sales-orders': 'invoice_sales_orders',
    'purchasing-order':     'purchasing_orders',
    'purchasing-orders':    'purchasing_orders',
    'sales-order':          'sales_orders',
    'sales-orders':         'sales_orders',
};

const SYNC_BODY = {
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
    search: '',
};

export class NetSuiteSyncService {
    static async syncDepartment(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/departments/sync`, SYNC_BODY);
    }

    static async syncLocation(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/locations/sync`, SYNC_BODY);
    }

    static async syncTerm(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/terms/sync`, SYNC_BODY);
    }

    static async syncClass(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/classes/sync`, SYNC_BODY);
    }

    static async syncItem(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/items/sync`, SYNC_BODY);
    }

    static async syncVendor(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/vendor/sync`, SYNC_BODY);
    }

    static async syncInvoiceSalesOrder(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/invoice-sales-orders/sync`, SYNC_BODY);
    }

    static async syncPurchasingOrder(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/purchasing-orders/sync`, SYNC_BODY);
    }

    static async syncSalesOrder(): Promise<void> {
        await apiPost(`${API_BASE_URL}/netsuite/sales-orders/sync`, SYNC_BODY);
    }

    /**
     * Dispatcher: success = no error thrown, failed = error thrown
     */
    static async sync(key: SyncMasterDataKey): Promise<void> {
        switch (key) {
            case 'department': return this.syncDepartment();
            case 'location':   return this.syncLocation();
            case 'term':       return this.syncTerm();
            case 'class':      return this.syncClass();
            case 'item':       return this.syncItem();
            case 'vendor':     return this.syncVendor();
            case 'invoice_sales_orders': return this.syncInvoiceSalesOrder();
            case 'purchasing_orders':    return this.syncPurchasingOrder();
            case 'sales_orders':         return this.syncSalesOrder();
            default:
                throw new Error(`Unknown sync key: ${key}`);
        }
    }

    /**
     * Fetch all sync records from POST /sync/get.
     * Returns all pages by fetching with a high limit so every module's
     * latest record is captured in one request.
     */
    static async getSyncList(): Promise<SyncListResponse> {
        const response: ApiResponse<SyncListResponse> = await apiPost<SyncListResponse>(`${API_BASE_URL}/netsuite/sync/get`, {
            page: 1,
            limit: 100,
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        return response.data;
    }
}
