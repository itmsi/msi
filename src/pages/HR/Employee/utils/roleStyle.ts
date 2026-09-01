// Same badge language as the rest of the app (e.g. /netsuite/sales-orders StatusTypeBadge):
// bg-X-100 / text-X-800 / border-X-200, rounded-full, bordered — no custom hex or shadows.
// Shared between DateInterviewTab (schedule table) and Candidatecard (Assigned chips)
// so the HR/GM/VP/BOD/PUB colors stay identical wherever an assigned role shows up.
export const ROLE_STYLE: Record<string, string> = {
    HR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    GM: 'bg-green-100 text-green-800 border-green-200',
    VP: 'bg-amber-100 text-amber-800 border-amber-200',
    BOD: 'bg-pink-100 text-pink-800 border-pink-200',
    PUB: 'bg-teal-100 text-teal-800 border-teal-200',
    USER: 'bg-teal-100 text-teal-800 border-teal-200',
};
export const DEFAULT_ROLE_STYLE = 'bg-gray-100 text-gray-800 border-gray-200';
// Stored role casing isn't consistent ("hr" vs "HR") — normalize before lookup/display.
export const getRoleStyle = (role: string) => ROLE_STYLE[role.toUpperCase()] || DEFAULT_ROLE_STYLE;

// Display-only rename — "PUB" is still the stored/submitted value everywhere
// (existing records, API payloads) so nothing but the on-screen label changes.
const ROLE_LABEL_OVERRIDES: Record<string, string> = {
    PUB: 'USER',
};
export const getRoleLabel = (role: string) => ROLE_LABEL_OVERRIDES[role.toUpperCase()] || role.toUpperCase();
