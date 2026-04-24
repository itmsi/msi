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
    'invoice_sales_orders':  'invoice_sales_orders',
    'invoice-sales-order':  'invoice_sales_orders',
    'invoice-sales-orders': 'invoice_sales_orders',
    'purchasing_orders':     'purchasing_orders',
    'purchasing-order':     'purchasing_orders',
    'purchasing-orders':    'purchasing_orders',
    'sales_orders':          'sales_orders',
    'sales-order':          'sales_orders',
    'sales-orders':         'sales_orders',
};

export class NetSuiteSyncService {
    /**
     * Dispatcher: trigger sync via unified endpoint berdasarkan key module.
     */
    static async sync(key: SyncMasterDataKey): Promise<void> {
        await this.getSyncModule(key);
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

    static async getSyncModule(modulename: string): Promise<SyncListResponse> {
        const response: ApiResponse<SyncListResponse> = await apiPost<SyncListResponse>(`${API_BASE_URL}/netsuite/sync/modules`, {
            module: modulename,
        });
        return response.data;
    }
}
