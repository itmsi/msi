import type { InterviewFormItem } from '../../Candidate/services/interviewService';

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
