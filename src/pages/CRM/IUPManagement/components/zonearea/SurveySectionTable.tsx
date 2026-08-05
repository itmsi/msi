import React from "react";
import { SurveySection, SurveyValues } from "../../types/iupSurvey";

export interface SurveySectionTableProps {
    section: SurveySection;
    values: SurveyValues;
    onChangeField: (key: string, value: string) => void;
}

const SurveySectionTable: React.FC<SurveySectionTableProps> = ({ section, values, onChangeField }) => {
    return (
        <table className="w-full border-collapse text-sm border border-slate-300 rounded-lg overflow-hidden">
            <tbody>
                {section.fields.map((field) => (
                <tr key={field.key} className="border-b border-slate-300 last:border-b-0">
                    <td className="border-r border-slate-300 bg-slate-50 px-3 py-2 w-2/5 align-top">
                    <span className="text-xs text-slate-700 font-medium">
                        {field.label}
                        {field.unit && <span className="text-slate-400 font-normal"> ({field.unit})</span>}
                    </span>
                    </td>
                    <td className="px-2 py-1 bg-white">
                    {field.type === "textarea" ? (
                        <textarea
                        rows={2}
                        className="w-full bg-transparent outline-none focus:bg-slate-50 rounded px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 resize-none"
                        placeholder={field.placeholder}
                        value={values[field.key] ?? ""}
                        onChange={(e) => onChangeField(field.key, e.target.value)}
                        />
                    ) : field.type === "select" ? (
                        <select
                        className="w-full bg-transparent outline-none focus:bg-slate-50 rounded px-2 py-1.5 text-sm text-slate-800"
                        value={values[field.key] ?? ""}
                        onChange={(e) => onChangeField(field.key, e.target.value)}
                        >
                        <option value="">— pilih —</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                            {opt.label}
                            </option>
                        ))}
                        </select>
                    ) : (
                        <input
                        type={field.type === "number" ? "number" : "text"}
                        className="w-full bg-transparent outline-none focus:bg-slate-50 rounded px-2 py-1.5 text-sm text-slate-800 placeholder:text-slate-400"
                        placeholder={field.placeholder}
                        value={values[field.key] ?? ""}
                        onChange={(e) => onChangeField(field.key, e.target.value)}
                        />
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SurveySectionTable;