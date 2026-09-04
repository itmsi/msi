import { apiPost } from '@/helpers/apiHelper';
import { ItemsListResponse, ItemsRequest } from '../types/items';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const DEFAULT_ITEM_TYPE = ['Non-inventory Item', 'Inventory Item'];
export const DEFAULT_ITEM_TYPE_ID = ['InvtPart', 'NonInvtPart'];

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
}
