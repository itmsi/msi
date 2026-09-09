import { apiGet, apiPost } from '@/helpers/apiHelper';
import {
    ItemDetailResponse,
    ItemLocationsResponse,
    ItemRelationRequest,
    ItemSerialNumbersResponse,
    ItemTierPricesResponse,
    ItemsListResponse,
    ItemsRequest,
    ValidateItemNamesRequest,
    ValidateItemNamesResponse
} from '../types/items';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const DEFAULT_ITEM_TYPE = ['Non-inventory Item', 'Inventory Item'];
export const DEFAULT_ITEM_TYPE_ID = ['InvtPart', 'NonInvtPart'];

const buildRelationRequest = (params: Partial<ItemRelationRequest> = {}): ItemRelationRequest => ({
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
    search: '',
    netsuite_item_id: '',
    ...params
});

export class ItemsService {
    static async getItems(params: Partial<ItemsRequest> = {}): Promise<ItemsListResponse> {
        const requestData: ItemsRequest = {
            page: 1,
            limit: 10,
            search: '',
            sort_by: 'lastModifiedDate',
            sort_order: 'desc',
            ...params
        };

        const response = await apiPost(`${API_BASE_URL}/netsuite/items/get-list`, requestData as Record<string, unknown>);
        return response.data as ItemsListResponse;
    }

    static async validateItemNames(params: ValidateItemNamesRequest): Promise<ValidateItemNamesResponse> {
        const response = await apiPost(
            `${API_BASE_URL}/netsuite/items/validate-names`,
            params as Record<string, unknown>
        );
        return response.data as ValidateItemNamesResponse;
    }

    static async getItemById(internalId: string): Promise<ItemDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/netsuite/items/${internalId}`);
        return response.data as ItemDetailResponse;
    }

    static async getItemLocations(params: Partial<ItemRelationRequest> = {}): Promise<ItemLocationsResponse> {
        const response = await apiPost(
            `${API_BASE_URL}/netsuite/items/item_locations`,
            buildRelationRequest(params) as Record<string, unknown>
        );
        return response.data as ItemLocationsResponse;
    }

    static async getItemSerialNumbers(params: Partial<ItemRelationRequest> = {}): Promise<ItemSerialNumbersResponse> {
        const response = await apiPost(
            `${API_BASE_URL}/netsuite/items/item_serial_numbers`,
            buildRelationRequest(params) as Record<string, unknown>
        );
        return response.data as ItemSerialNumbersResponse;
    }

    static async getItemTierPrices(params: Partial<ItemRelationRequest> = {}): Promise<ItemTierPricesResponse> {
        const response = await apiPost(
            `${API_BASE_URL}/netsuite/items/item_tier_prices`,
            buildRelationRequest(params) as Record<string, unknown>
        );
        return response.data as ItemTierPricesResponse;
    }

    static async syncItemsById(id: string): Promise<{ success: boolean; message: string; data?: any }> {
        const response = await apiPost<{ success: boolean; message: string; data?: any }>(
            `${API_BASE_URL}/netsuite/items/sync/${id}`
        );
        return response.data;
    }
}
