import type { InterviewFormItem, InterviewSchedule } from '../../Candidate/services/interviewService';

export const CATEGORY_ORDER = ['SIAH', '7 Values', 'CSE', 'SDT', 'EXPERIENCE'];

export const sortByCategoryOrder = (forms: InterviewFormItem[]): InterviewFormItem[] =>
    [...forms].sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.company_value);
        const bi = CATEGORY_ORDER.indexOf(b.company_value);
        return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi);
    });
export const dedupeFormsByCategory = (forms: InterviewFormItem[]): InterviewFormItem[] => {
    const latestByCategory = new Map<string, InterviewFormItem>();
    forms.forEach((form) => {
        const existing = latestByCategory.get(form.company_value);
        if (!existing || new Date(form.created_at).getTime() > new Date(existing.created_at).getTime()) {
            latestByCategory.set(form.company_value, form);
        }
    });
    return Array.from(latestByCategory.values());
};
export const getLatestInterviewerForms = (forms: InterviewFormItem[]): InterviewFormItem[] => {
    const byInterviewer = new Map<string, InterviewFormItem[]>();
    forms.forEach((form) => {
        const interviewer = form.created_by_name || 'Unknown';
        const list = byInterviewer.get(interviewer) || [];
        list.push(form);
        byInterviewer.set(interviewer, list);
    });

    let latestForms: InterviewFormItem[] = [];
    let latestTime = -Infinity;
    byInterviewer.forEach((list) => {
        const maxCreatedAt = Math.max(...list.map((f) => new Date(f.created_at).getTime()));
        if (maxCreatedAt > latestTime) {
            latestTime = maxCreatedAt;
            latestForms = list;
        }
    });

    return dedupeFormsByCategory(latestForms);
};

// Accepts every shape assign_role shows up in across the app: a comma-joined
// string ("HR, BOD"), an array of those, or the schedule API's { role } wrapper.
type AssignRoleSource = { assign_role?: string[] | string | { role?: string } | null };

export const getAssignRoleArr = (s: AssignRoleSource | InterviewSchedule | null | undefined): string[] => {
    if (!s || !s.assign_role) return [];
    const value = s.assign_role;
    const parts = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? [value]
            : [value.role || ''];
    return parts.flatMap((part) => part.split(',').map((r) => r.trim())).filter(Boolean);
};

export const formatDecimal = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;

    return Number(Number(value).toFixed(1));
};