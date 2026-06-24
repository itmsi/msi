export type WorkOrderStatus =
  | "open"
  | "review"
  | "waiting_sparepart"
  | "onprogress"
  | "repair_process"
  | "quality_check"
  | "ready_pickup"
  | "complete"
  | "cancelled";

interface StatusConfig {
    color: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "light" | "indigo" | "dark";
    label: string;
}

const statusConfigMap: Record<WorkOrderStatus, StatusConfig> = {
    open: {
        color: "light",
        // label: "Menunggu customer WO approval",
        label: "Open",
    },
    review: {
        color: "warning",
        label: "Menunggu pemeriksaan",
    },
    waiting_sparepart: {
        color: "warning",
        label: "Menunggu spare part",
    },
    onprogress: {
        color: "info",
        label: "On Progress",
    },
    repair_process: {
        color: "info",
        label: "Sedang perbaikan",
    },
    quality_check: {
        color: "indigo",
        label: "Quality check",
    },
    ready_pickup: {
        color: "success",
        label: "Siap diambil",
    },
    complete: {
        color: "success",
        label: "Completed",
    },
    cancelled: {
        color: "error",
        label: "Cancelled",
    },
};

export const getStatusBadgeConfig = (status: string): StatusConfig => {
    const normalizedStatus = status?.toLowerCase() as WorkOrderStatus;
    return statusConfigMap[normalizedStatus] || {
        color: "light",
        label: status || "Unknown",
    };
};
