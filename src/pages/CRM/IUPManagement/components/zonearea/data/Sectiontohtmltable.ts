import { MasterZoneSiteField, SurveyValues } from "../../../types/iupSurvey";
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function sectionToHtmlTable(
    title: string,
    sectionKey: string,
    fields: MasterZoneSiteField[],
    existingValues: SurveyValues = {}
): string {
    const rows = fields
        .map((field) => {
            const existing = existingValues[field.key]?.trim();
            const valueCell = existing ? escapeHtml(existing) : "&nbsp;";
            const unitLabel = field.unit
                ? ` <span style="color:#94a3b8;font-weight:400;">(${escapeHtml(field.unit)})</span>`
                : "";

        return `<tr>
            <td class="font-primary-bold" style="background:#f8fafc;border:1px solid #cbd5e1;padding:8px;width:40%;font-size:13px;font-weight:600;color:#334155;vertical-align:top;">${escapeHtml(
                field.label
                )}${unitLabel}</td>
            <td data-field-key="${field.key}" style="border:1px solid #cbd5e1;padding:8px;font-size:13px;color:#1e293b;">${valueCell}</td>
        </tr>`;
        })
        .join("");

    return `<p style="margin-top:0;"><strong>${escapeHtml(title)}</strong></p><table data-survey-section="${
        sectionKey
    }" style="width:100%;border-collapse:collapse;margin-bottom:12px;"><tbody>${rows}</tbody></table>`;
}
