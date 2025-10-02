// E-Catalog Types
export interface MenuItem {
    id: string;
    masterId: string;
    partNumber: string | null;
    partName: string;
    softtype: 'EngineProduct' | 'ServicePart' | 'WXBPart';
    epcType: 'ORDER_NUMBER' | 'PART' | 'REPAIR_KIT';
    children: MenuItem[];
}

export interface MenuResponse {
    code: number;
    data: MenuItem[];
    msg: string;
}

export interface MenuRequest {
    search?: string;
    category?: string;
    softtype?: string;
    epcType?: string;
}

// Tree Node interface for MUI TreeView
export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    partNumber?: string | null;
    softtype?: string;
    epcType?: string;
    masterId?: string;
}

// Selected item interface
export interface SelectedMenuItem {
    id: string;
    masterId: string;
    partNumber: string | null;
    partName: string;
    softtype: string;
    epcType: string;
    path: string[]; // Breadcrumb path
}
