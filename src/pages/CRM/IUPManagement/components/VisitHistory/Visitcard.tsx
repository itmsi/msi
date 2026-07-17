import React, { useState } from "react";
import { LuUser, LuPhone, LuMapPin, LuLink2, LuLoaderCircle, LuChevronDown, LuChevronRight, } from "react-icons/lu";
import { VisitHistoryItem } from "../../types/iupmanagement";
import Button from "@/components/ui/button/Button";
import { MdEdit, MdDeleteOutline } from "react-icons/md";

const formatDate = (iso: string): string => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

export interface VisitCardProps {
    visit: VisitHistoryItem;
    onEdit: (visit: VisitHistoryItem) => void;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

const VisitCard: React.FC<VisitCardProps> = ({ 
    visit, 
    onEdit, 
    onDelete, 
    isDeleting = false
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const toggleZone = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const isOpen = !!expanded[visit.iup_visit_history_id];
    return (
        <div className={`${
            isDeleting ? 'border-red-300 bg-red-50' : ''
        }`}>
            {/* Header — judul sebagai toggle accordion */}
            <div
                onClick={() => toggleZone(visit.iup_visit_history_id)}
                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} group hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                        <LuChevronDown size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    ) : (
                        <LuChevronRight size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`}  />
                    )}
                    <div className={`min-w-0 group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'}`}>
                        <p className="flex-1 text-sm font-primary-bold">{visit.title}</p>
                        <p className="flex-1 text-xs font-secondary">{formatDate(visit.date)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onEdit(visit);
                        }}
                        className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                    >
                        <MdEdit size={15} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (!isDeleting) onDelete(visit.iup_visit_history_id);
                        }}
                        className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-red-500/10 text-slate-500 hover:text-red-400 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                    >
                        {isDeleting ? <LuLoaderCircle size={15} className="animate-spin" /> : <MdDeleteOutline size={15} />}
                    </Button>
                </div>
            </div>
            {/* Detail — hanya tampil saat accordion terbuka */}
            {isOpen && (
                <div className="px-10 py-4 space-y-3">
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-md text-slate-600">
                        {(visit.employee_name || visit.employee_id) && (
                            <span className="flex items-center gap-1 text-gray-800 font-primary-bold text-md">
                                <LuUser size={15}  />
                                {visit.employee_name || visit.employee_id}
                            </span>
                        )}
                        {visit.phone_number && (
                            <span className="flex items-center gap-1 text-slate-800 font-primary-bold text-md">
                                <LuPhone size={15} />
                                {visit.phone_number}
                            </span>
                        )}
                        {(visit.latitude || visit.longitude) && (
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${visit.latitude},${visit.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-1 px-3 py-1 text-md text-gray-800`}
                            >
                                <LuMapPin /> View Location
                            </a>
                        )}
                    </div>
                    <div className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none text-gray-700 reset-content">
                        {visit.description && <div dangerouslySetInnerHTML={{ __html: visit.description }}></div>}
                    </div>
                    {visit.image.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {visit.image.map((img, i) => (
                                <a
                                    key={i}
                                    href={img.file_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-blue-200 border rounded-md font-medium "
                                >
                                    <LuLink2 size={11} />
                                    File {i + 1}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VisitCard;