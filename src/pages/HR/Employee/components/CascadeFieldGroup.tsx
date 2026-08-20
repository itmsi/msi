import type { ReactNode } from 'react';

interface CascadeFieldGroupProps {
    label?: string;
    children: ReactNode;
}

// Groups dependent dropdowns (Group -> Company -> Department -> Position) so the
// user reads them as one sequential flow instead of 4 independent fields.
export default function CascadeFieldGroup({ children }: CascadeFieldGroupProps) {
    return (
        <div className="rounded-xl border border-brand-100 bg-brand-25 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {children}
            </div>
        </div>
    );
}
