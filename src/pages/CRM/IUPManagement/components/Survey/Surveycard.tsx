import React, { useState } from "react";
import { LuLink2, LuLoaderCircle, LuChevronDown, LuChevronRight } from "react-icons/lu";
import Button from "@/components/ui/button/Button";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { IupSurveyItem } from "../../types/iupmanagement";

export interface SurveyCardProps {
    survey: IupSurveyItem;
    onEdit: (survey: IupSurveyItem) => void;
    onDelete: (survey: IupSurveyItem) => void;
    isDeleting?: boolean;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ 
    survey, 
    onEdit, 
    onDelete, 
    isDeleting = false
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const toggleSurvey = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const isOpen = !!expanded[survey.iup_survey_id];
    return (
        <div className={`${
            isDeleting ? 'border-red-300 bg-red-50' : ''
        }`}>
            <div
                onClick={() => toggleSurvey(survey.iup_survey_id)}
                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} group hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                        <LuChevronDown size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    ) : (
                        <LuChevronRight size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`}  />
                    )}
                    <div className={`min-w-0 group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'}`}>
                        <p className="flex-1 text-sm font-primary-bold">{survey.user_name}</p>
                        <p className="flex-1 text-xs font-secondary">{moment(survey.chat_date).format("DD MMMM YYYY")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onEdit(survey);
                        }}
                        className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                    >
                        <MdEdit size={15} />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (!isDeleting) onDelete(survey);
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
                        {(survey.user_name || '-') && (
                            <span className="flex items-center gap-1 text-gray-800 font-primary-bold text-md">
                                {survey.user_name || '-'}
                            </span>
                        )}
                    </div>
                    <div className="w-full min-h-25 p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none text-gray-700 reset-content">
                        {survey.description && <div dangerouslySetInnerHTML={{ __html: survey.description }}></div>}
                    </div>
                    {survey.source_link && (
                        <a
                            href={survey.source_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-blue-200 border rounded-md font-medium "
                        >
                            <LuLink2 size={11} /> Link File
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

export default SurveyCard;