// Sales Stage types — sesuai API response aktual

export interface SalesStageOpportunity {
    opportunity_id: string;
    iup_id: string;
    iup_name: string;
    province: string | null;
    commodity: string | null;
    iup_segmentation_name: string | null;
    employee_id: string;
    sales_name: string | null;
    sales_title: string | null;
    stage: 'pull' | 'survey' | 'pull' | 'deal' | 'hypercare';
    contractor: string | null;
    solution: string | null;
    value: string | null;
    actual_value: string | null;
    contact: string | null;
    created_at: string;
    created_by: string | null;
    created_by_name: string | null;
    updated_at: string;
    updated_by: string | null;
    updated_by_name: string | null;
    progress_pct: number | null;
    checklist_done: number;
    checklist_total: number;
    total_reviews: number;
}

// ─── SUB-TASK ───
export interface OpportunitySubTask {
    opportunity_sub_task_id: string;
    opportunity_id: string;
    opportunity_stage: string;
    opportunity_sub_task_title: string;
    opportunity_sub_task_status: string | null;
    opportunity_sub_task_file: any; // JSONB
    opportunity_sub_task_description: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    is_delete: boolean;
    is_custom: boolean;
}

export interface OpportunitySubTaskCreateRequest {
    opportunity_id: string;
    opportunity_stage: string;
    opportunity_sub_task_title: string;
    opportunity_sub_task_status?: string;
    opportunity_sub_task_file?: any;
    opportunity_sub_task_description?: string;
}

// ─── ASSIGNMENT SOLUTION ───
export interface OpportunityAssignmentSolution {
    opportunity_assignment_solution_id: string;
    opportunity_id: string;
    customer_id: string | null;
    employee_id: string | null;
    opportunity_assignment_solution: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    is_delete: boolean;
}

export interface AssignmentSolutionCreateRequest {
    opportunity_id: string;
    customer_id?: string;
    employee_id?: string;
    opportunity_assignment_solution?: string;
}

// ─── REVIEW HYPERCARE ───
export interface OpportunityReviewHypercare {
    opportunity_review_hypercare_id: string;
    opportunity_id: string;
    customer_id: string | null;
    employee_id: string | null;
    opportunity_review_hypercare_date: string | null;
    opportunity_review_hypercare_impact: string | null;
    opportunity_review_hypercare_description: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    is_delete: boolean;
}

export interface ReviewHypercareCreateRequest {
    opportunity_id: string;
    opportunity_review_hypercare_date?: string;
    opportunity_review_hypercare_impact?: string;
    opportunity_review_hypercare_description?: string;
}

// ─── DETAIL ───
export interface SalesStageDetailResponse {
    success: boolean;
    data: {
        opportunity: SalesStageOpportunity;
        opportunity_sub_tasks: OpportunitySubTask[];
        opportunity_assignment_solutions: OpportunityAssignmentSolution[];
        opportunity_review_hypercares: OpportunityReviewHypercare[];
    };
}

export interface SalesStageDetailRequest {
    opportunity_id: string;
    stage?: string;
    employee_id?: string;
}

export interface SalesStagePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SalesStageStats {
    total_iup: number;
    total_opportunity: number;
    total_value: number;
    deal_count: number;
    avg_progress: number;
}

export interface SalesStageGroup {
    code: string;
    label: string;
    items: SalesStageOpportunity[];
    avg_progress: number;
}


export interface SalesStageListRequest {
    page: number;
    limit: number;
    search?: string;
    iup_id?: string;
    contractor?: string;
    employee_id?: string;
    solution?: string;
    stage?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface SalesStageListResponse {
    success: boolean;
    stats: SalesStageStats;
    stages: {
        find: SalesStageGroup;
        survey: SalesStageGroup;
        pull: SalesStageGroup;
        deal: SalesStageGroup;
        hypercare: SalesStageGroup;
    };
    pagination: SalesStagePagination;
}

export interface SalesStageCreateRequest {
    iup_id: string;
    employee_id: string;
    stage?: string;
    contact?: string;
    value?: string;
}

export interface SalesStageCreateResponse {
    success: boolean;
    data: SalesStageOpportunity;
    message: string;
}

export interface SalesStageDeleteResponse {
    success: boolean;
    message: string;
}

// Stage column config for kanban
export const STAGE_STATUSES = [
    { id: 'find', title: 'Find',      color: 'bg-[#6B7280]', subtitle: 'STAGE 01' },
    { id: 'survey',    title: 'Survey',    color: 'bg-[#4F46E5]', subtitle: 'STAGE 02' },
    { id: 'pull',     title: 'Pull',      color: 'bg-[#F59E0B]', subtitle: 'STAGE 03' },
    { id: 'deal',      title: 'Deal',      color: 'bg-[#22C55E]', subtitle: 'STAGE 04' },
    { id: 'hypercare', title: 'Hypercare', color: 'bg-[#BE185D]', subtitle: 'STAGE 05' },
] as const;

export const SOLUTION_OPTIONS = [
    { value: '', label: 'All Solutions' },
    { value: 'VHS', label: 'VHS' },
    { value: 'Oil Drum', label: 'Oil Drum' },
    { value: 'KIT OH', label: 'KIT OH' },
    { value: 'KIT Repair', label: 'KIT Repair' },
    { value: 'KIT PM', label: 'KIT PM' },
    { value: 'Maintenance Parts', label: 'Maintenance Parts' },
    { value: 'Tyre Kontrak Service', label: 'Tyre Kontrak Service' },
    { value: 'Fleet Management System', label: 'Fleet Management System' },
];

export const SOLUTION_COLORS: Record<string, string> = {
    'VHS': 'warning',
    'Oil Drum': 'indigo',
    'KIT OH': 'primary',
    'KIT Repair': 'error',
    'KIT PM': 'success',
    'Maintenance Parts': 'indigo',
    'Tyre Kontrak Service': 'dark',
    'Fleet Management System': 'info',
};

// Default checklist sub-tasks per stage (dari prototipe)
export const DEFAULT_CHECKLISTS: Record<string, string[]> = {
    find: [
        'Data jumlah & kondisi unit existing',
        'Data brand unit yang terpasang',
        'Data RKAB tahun berjalan',
        'Problem statement dari IUP/kontraktor',
        'Kontak PIC (IUP & kontraktor)',
        'Estimasi kebutuhan unit baru',
    ],
    survey: [
        'Jadwal & kunjungan lapangan terkonfirmasi',
        'Kondisi jalan hauling & medan tambang',
        'Analisa revenue customer',
        'Analisa expense / cost structure',
        'Analisa utilisasi & downtime unit existing',
        'Draft rekomendasi solusi per kontraktor',
    ],
    pull: [
        'Proposal solusi tersusun',
        'Presentasi ke manajemen kontraktor',
        'Presentasi ke tim lapangan kontraktor',
        'Feedback & revisi proposal',
        'Approval internal kontraktor',
        'Negosiasi harga & termin pembayaran',
    ],
    deal: [
        'Quotation final terbit',
        'PJB (Perjanjian Jual Beli) ditandatangani',
        'Data leasing / pembiayaan lengkap',
        'Approval leasing / financing',
        'Jadwal delivery unit',
        'Serah terima & dokumentasi unit',
    ],
};


