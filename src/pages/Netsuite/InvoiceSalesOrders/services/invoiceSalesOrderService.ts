import { apiPost } from '@/helpers/apiHelper';
import { InvoiceSalesOrderRequest, InvoiceSalesOrderResponse } from '../types/invoiceSalesOrder';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class InvoiceSalesOrderService {
    static async getInvoiceSalesOrders(params: Partial<InvoiceSalesOrderRequest> = {}): Promise<InvoiceSalesOrderResponse> {
        const requestData: InvoiceSalesOrderRequest = {
            page: 1,
            page_size: 20,
            sort_by: 'trandate',
            sort_order: 'DESC',
            filters: {},
            ...params
        };

        const response = await apiPost<{ data: InvoiceSalesOrderResponse }>(
            `${API_BASE_URL}/netsuite/invoice-sales-orders/get`, 
            requestData as Record<string, any>
        );
        
        // The API returns { success, data: { items, pagination }, message }
        return response.data as unknown as InvoiceSalesOrderResponse;
    }
}
