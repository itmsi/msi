import type { InterviewFormItem } from '../../Candidate/services/interviewService';

export const CATEGORY_ORDER = ['SIAH', '7 Values', 'CSE', 'SDT', 'EXPERIENCE'];

export const sortByCategoryOrder = (forms: InterviewFormItem[]): InterviewFormItem[] =>
    [...forms].sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.company_value);
        const bi = CATEGORY_ORDER.indexOf(b.company_value);
        return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi);
    });

// A category can have more than one submission (interviewer redid that tab) —
// only the latest one should count, never both stacked.
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
