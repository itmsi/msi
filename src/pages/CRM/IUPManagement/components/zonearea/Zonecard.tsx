import React, { useState } from "react";
import { LuLink2, LuLoaderCircle, LuChevronDown, LuChevronRight, } from "react-icons/lu";
import Button from "@/components/ui/button/Button";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { IupZonaSiteItem } from "../../types/iupmanagement";

export interface ZonecardProps {
    zone: IupZonaSiteItem;
    onEdit: (zone: IupZonaSiteItem) => void;
    onDelete: (zone: IupZonaSiteItem) => void;
    isDeleting?: boolean;
}

const Zonecard: React.FC<ZonecardProps> = ({ 
    zone, 
    onEdit, 
    onDelete, 
    isDeleting = false
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const toggleZone = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const isOpen = !!expanded[zone.iup_zona_site_id];
    return (
        <div className={`${
            isDeleting ? 'border-red-300 bg-red-50' : ''
        }`}>
            <div
                onClick={() => toggleZone(zone.iup_zona_site_id)}
                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} group hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                        <LuChevronDown size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    ) : (
                        <LuChevronRight size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`}  />
                    )}
                    <div className={`min-w-0 group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'}`}>
                        <p className="flex-1 text-sm font-primary-bold">{zone.iup_zona_site_name}</p>
                        <p className="flex-1 text-xs font-secondary">{moment(zone.iup_zona_site_date_last_survey).format("DD MMMM YYYY")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onEdit(zone);
                        }}
                        className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                    >
                        <MdEdit size={15} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (!isDeleting) onDelete(zone);
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
                        {(zone.iup_zona_site_name || '-') && (
                            <span className="flex items-center gap-1 text-gray-800 font-primary-bold text-md">
                                {zone.iup_zona_site_name || '-'}
                            </span>
                        )}
                    </div>
                    <div className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none text-gray-700 reset-content">
                        {zone.iup_zona_site_description && <div dangerouslySetInnerHTML={{ __html: zone.iup_zona_site_description }}></div>}
                    </div>
                    {zone.iup_zona_site_file?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {zone.iup_zona_site_file.map((img, i) => (
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

export default Zonecard;