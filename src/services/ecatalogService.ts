// import { apiGet } from '@/helpers/apiHelper'; // Will be used when integrating with real API
import { MenuResponse } from '@/types/ecatalog';

// Mock data for development - replace with actual API calls later
const MOCK_DATA: MenuResponse = {
    "code": 200,
    "data": [
        {
            "id": "SIS-5255847923",
            "masterId": "SIS-2448820",
            "partNumber": null,
            "partName": "(WP10.340E32)卡车用柴油机",
            "softtype": "EngineProduct",
            "epcType": "ORDER_NUMBER",
            "children": [
                {
                    "id": "SIS-586217679",
                    "masterId": "SIS-1291953",
                    "partNumber": "GRP100010952",
                    "partName": "Engine Block Group",
                    "softtype": "ServicePart",
                    "epcType": "PART",
                    "children": [
                        {
                            "id": "SIS-1862437932",
                            "masterId": "SIS-586197491",
                            "partNumber": "612600900224",
                            "partName": "Engine Block Assembly",
                            "softtype": "ServicePart",
                            "epcType": "PART",
                            "children": [
                                {
                                    "id": "SIS-1573408059",
                                    "masterId": "SIS-1490965638",
                                    "partNumber": "1001980963",
                                    "partName": "Crankcase Pre-assembly",
                                    "softtype": "ServicePart",
                                    "epcType": "PART",
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "SIS-2593414066",
                    "masterId": "SIS-351806",
                    "partNumber": "GRP100020314",
                    "partName": "Crankshaft Group",
                    "softtype": "ServicePart",
                    "epcType": "PART",
                    "children": [
                        {
                            "id": "SIS-2587834790",
                            "masterId": "SIS-2583219075",
                            "partNumber": "1006466586",
                            "partName": "Crankshaft Assembly",
                            "softtype": "ServicePart",
                            "epcType": "PART",
                            "children": [
                                {
                                    "id": "SIS-273439436",
                                    "masterId": "SIS-268247441",
                                    "partNumber": "1000072539",
                                    "partName": "Crankshaft Subassembly",
                                    "softtype": "ServicePart",
                                    "epcType": "PART",
                                    "children": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "SIS-1035624510",
                    "masterId": "SIS-998066987",
                    "partNumber": "1000726728",
                    "partName": "Fuel Injector Group",
                    "softtype": "ServicePart",
                    "epcType": "PART",
                    "children": []
                }
            ]
        }
    ],
    "msg": ""
};

class MenuService {
    /**
     * Get menu tree data
     */
    async getMenuTree(): Promise<MenuResponse> {
        try {
            // For development, use mock data
            // In production, replace with actual API call:
            // const endpoint = `ecatalog/menu`;
            // const response = await apiGet<MenuResponse>(endpoint);
            // return response.data;

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return MOCK_DATA;
        } catch (error) {
            console.error('Error fetching menu tree:', error);
            throw error;
        }
    }

    /**
     * Get menu item by ID
     */
    async getMenuItemById(id: string): Promise<MenuResponse> {
        try {
            // For development, search in mock data
            // In production, replace with: 
            // const response = await apiGet<MenuResponse>(`ecatalog/menu/${id}`);
            // return response.data;
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const item = this.findItemById(MOCK_DATA.data, id);
            if (item) {
                return {
                    code: 200,
                    data: [item],
                    msg: ""
                };
            } else {
                return {
                    code: 404,
                    data: [],
                    msg: "Item not found"
                };
            }
        } catch (error) {
            console.error('Error fetching menu item:', error);
            throw error;
        }
    }

    /**
     * Search menu items
     */
    async searchMenuItems(query: string): Promise<MenuResponse> {
        try {
            // For development, search in mock data
            // In production, replace with:
            // const response = await apiGet<MenuResponse>(`ecatalog/menu/search?q=${encodeURIComponent(query)}`);
            // return response.data;
            
            await new Promise(resolve => setTimeout(resolve, 400));
            
            if (!query.trim()) {
                return MOCK_DATA;
            }
            
            const searchResults = this.searchInMockData(MOCK_DATA.data, query.toLowerCase());
            
            return {
                code: 200,
                data: searchResults,
                msg: ""
            };
        } catch (error) {
            console.error('Error searching menu items:', error);
            throw error;
        }
    }

    // Helper methods for mock data handling
    private findItemById(items: any[], id: string): any | null {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = this.findItemById(item.children, id);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    private searchInMockData(items: any[], query: string): any[] {
        const results: any[] = [];
        
        const searchRecursive = (items: any[]) => {
            for (const item of items) {
                const nameMatch = item.partName.toLowerCase().includes(query);
                const numberMatch = item.partNumber && item.partNumber.toLowerCase().includes(query);
                
                if (nameMatch || numberMatch) {
                    results.push({
                        ...item,
                        children: [] // Flatten for search results
                    });
                }
                
                if (item.children && item.children.length > 0) {
                    searchRecursive(item.children);
                }
            }
        };
        
        searchRecursive(items);
        return results;
    }
}

export const menuService = new MenuService();