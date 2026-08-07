import { SurveyValues } from "../../../types/iupSurvey";

// ---------------------------------------------------------------------------
export function parseSurveyTableFromHtml(html: string): SurveyValues {
    if (!html || typeof window === "undefined" || typeof DOMParser === "undefined") return {};

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const cells = doc.querySelectorAll("td[data-field-key]");

    const values: SurveyValues = {};
    cells.forEach((cell) => {
        const key = cell.getAttribute("data-field-key");
        if (!key) return;
        const text = (cell.textContent || "").replace(/\u00a0/g, " ").trim(); // buang &nbsp;
        if (text) values[key] = text;
    });

    return values;
}