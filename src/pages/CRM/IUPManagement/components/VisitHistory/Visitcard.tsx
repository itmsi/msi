import React from "react";
import { LuUser, LuPhone, LuMapPin, LuLink2, LuLoaderCircle } from "react-icons/lu";
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
    return (
        <div className={`relative px-5 py-4 transition-all duration-200 ${
            isDeleting ? 'border-red-300 bg-red-50' : 'hover:bg-[#dfe8f2]/20'
        }`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-primary">{visit.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(visit.date)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onEdit(visit)}
                        className="p-2 rounded-md text-sm font-medium transition-colors text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <MdEdit size={13} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onDelete(visit.iup_visit_history_id)}
                        disabled={isDeleting}
                        className="p-2 rounded-md text-sm font-medium transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        {isDeleting ? <LuLoaderCircle size={13} className="animate-spin" /> : <MdDeleteOutline size={13} />}
                    </Button>
                </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {(visit.employee_name || visit.employee_id) && (
                    <span className="flex items-center gap-1 text-gray-800">
                        <LuUser size={12}  />
                        {visit.employee_name || visit.employee_id}
                    </span>
                )}
                {visit.phone_number && (
                    <span className="flex items-center gap-1 text-gray-800">
                        <LuPhone size={12} />
                        {visit.phone_number}
                    </span>
                )}
                {(visit.latitude || visit.longitude) && (
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${visit.latitude},${visit.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800`}
                    >
                        <LuMapPin /> View Location
                    </a>
                )}
            </div>

            {visit.description && <div className="truncate text-sm text-gray-800 block w-full font-primary [&_*]:inline" dangerouslySetInnerHTML={{ __html: visit.description }}></div>}

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
    );
};

export default VisitCard;