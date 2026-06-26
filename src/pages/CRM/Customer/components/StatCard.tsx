import React from 'react';

// Hapus bagian interface ini jika kamu menggunakan JavaScript (.jsx)
interface StatCardProps {
    title: string;
    value: string | number;
    description?: React.ReactNode;
    Icon?: React.ElementType;
    className?: string;
    iconClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    description, 
    Icon,
    className = '',
    iconClassName = ""
}) => {
    return (
        <div className={`overflow-hidden shadow-sm rounded-2xl relative hover:shadow-md transition-shadow ${className}`}>
            <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-2 text-end">
                <p className="text-xs text-gray-500 mb-1">{title}</p>
                <p className="text-6xl font-primary-bold text-gray-800">
                    {value}
                </p>
            </div>
            
            {/* Bagian bawah hanya akan dirender jika ada description atau Icon */}
            {(description || Icon) && (
                <div className="px-6 [&:last-child]:pb-6">
                    <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
                        {Icon && <Icon className={`h-4 w-4 absolute top-0 bottom-0 m-auto left-5 opacity-20 ${iconClassName}`} style={{transform: 'scale(10)'}} />}
                        <span>{description}</span>
                    </div>
                </div>
            )}
        </div>
    );
};