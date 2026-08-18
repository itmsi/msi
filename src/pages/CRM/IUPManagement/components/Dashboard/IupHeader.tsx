import type { IconType } from "react-icons";
import {
    LuScrollText,
    LuUserCheck,
    LuCalendarCheck,
    LuClipboardList,
    LuUser,
} from "react-icons/lu";
import Badge from "@/components/ui/badge/Badge";

import type { IupDashboard } from "../../types/iupDashboard";
import { formatDate } from "./dashboardUtils";

interface IupHeaderProps {
    iup: IupDashboard;
}

const statusColor: Record<string, "success" | "error" | "light"> = {
    aktif: "success",
    nonaktif: "error",
};

function capitalize(value: string | null | undefined): string {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function IupHeader({ iup }: IupHeaderProps) {
    return (
        <div className="bg-white flex flex-col gap-6 rounded-xl border border-l-4 border-l-[#0253a5] shadow">
            <div className="p-6">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                        <div className="flex items-center flex-wrap gap-1.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <LuUser size={12} />
                                Sales PIC:
                            </span>

                            {iup.sales_pic.length > 0 ? (
                                iup.sales_pic.map((pic) => (
                                    <Badge key={pic.id} variant="light" color="light" size="sm">{pic.name}</Badge>
                                ))

                            ) : (
                                <span className="text-xs text-gray-500">-</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-gray-100 rounded-lg border border-gray-200 p-4">
                    <p className="text-[11px] font-primary-bold uppercase tracking-wide text-gray-500 mb-3">
                        Informasi Legal &amp; Perizinan
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoItem icon={LuScrollText} label="Nomor SK" value={iup.sk_number || "-"} />
                        {/* <InfoItem icon={LuUserCheck} label="Pejabat Berwenang" value={iup.authorized_officer || "-"} /> */}
                        <InfoItem icon={LuCalendarCheck} label="SK Berlaku Sejak" value={formatDate(iup.sk_effective_date)} />
                        <InfoItem icon={LuCalendarCheck} label="SK Berlaku s.d." value={formatDate(iup.sk_end_date)} />
                        <InfoItem icon={LuClipboardList} label="Referensi RKAB" value={iup.rkab || "-"} />
                    </div>
                </div>
            </div>
        </div>
    )
}
export function IupHeaderxx({ iup }: IupHeaderProps) {
    return (
        <div className="py-4">
            <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h1 className="text-xl font-primary-bold tracking-tight">{iup.iup_name}</h1>
                        <span className="text-md font-secondary font-bold px-2 py-0.5 ms-2 min-w-0 rounded bg-slate-200 text-slate-600">{iup.iup_code}</span>
                        <Badge variant="light" color={statusColor[iup.iup_status?.toLowerCase()] ?? "light"}>
                            {capitalize(iup.iup_status)}
                        </Badge>
                        {/* <Badge variant="light" color="secondary">{iup.permit_type}</Badge> */}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center justify-center border rounded-md font-medium px-2 bg-blue-100 text-blue-800 border-blue-200">{iup.island_name}</span>
                        <span className="inline-flex items-center justify-center border rounded-md font-medium px-2 bg-green-100 text-green-800 border-green-200">{iup.group_name}</span>
                        <span className="inline-flex items-center justify-center border rounded-md font-medium px-2 bg-orange-100 text-orange-800 border-orange-200">{iup.area_name}</span>
                        <span className="inline-flex items-center justify-center border rounded-md font-medium px-2 bg-purple-100 text-purple-800 border-purple-200">{iup.iup_zone_name}</span>
                        <span className="inline-flex items-center justify-center border rounded-md font-medium px-2 bg-pink-100 text-pink-800 border-pink-200">{iup.iup_segmentation_name}</span>
                    </div>
                    {iup.sales_pic.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1.5 mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <LuUser size={12} />
                                Sales PIC:
                            </span>
                            {iup.sales_pic.map((pic) => (
                                <Badge key={pic.id} variant="light" color="light" size="sm">{pic.name}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 bg-gray-100 rounded-lg border border-gray-200 p-4">
                <p className="text-[11px] font-primary-bold uppercase tracking-wide text-gray-500 mb-3">
                    Informasi Legal &amp; Perizinan
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoItem icon={LuScrollText} label="Nomor SK" value={iup.sk_number || "-"} />
                    <InfoItem icon={LuUserCheck} label="Pejabat Berwenang" value={iup.authorized_officer || "-"} />
                    <InfoItem icon={LuCalendarCheck} label="SK Berlaku Sejak" value={formatDate(iup.sk_effective_date)} />
                    <InfoItem icon={LuClipboardList} label="Referensi RKAB" value={iup.rkab || "-"} />
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2 min-w-0">
            <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-gray-800 font-medium truncate" title={value}>{value}</p>
            </div>
        </div>
    );
}
