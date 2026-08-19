import type { ReactNode } from 'react';

interface FormSectionProps {
    title: string;
    children: ReactNode;
    className?: string;
}

// Section heading + thin divider. Always visible — not an accordion.
export default function FormSection({ title, children, className = '' }: FormSectionProps) {
    return (
        <section className={className}>
            <div className="mb-4">
                <h3 className="text-lg font-primary-bold text-gray-900">
                    {title}
                </h3>
                <div className="mt-2 h-px bg-gray-200" />
            </div>
            {children}
        </section>
    );
}
