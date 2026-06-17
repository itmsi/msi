import React from 'react';

// Hapus bagian interface ini jika kamu menggunakan JavaScript (.jsx)
interface StatCardProps {
    title: string;
    value: string | number;
    description?: React.ReactNode;
    Icon?: React.ElementType; // Menerima komponen icon
}

export const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    description, 
    Icon 
}) => {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-2">
                <p className="text-muted-foreground">{title}</p>
                <p className="text-3xl text-slate-800">
                    {value}
                </p>
            </div>
            
            {/* Bagian bawah hanya akan dirender jika ada description atau Icon */}
            {(description || Icon) && (
                <div className="px-6 [&:last-child]:pb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{description}</span>
                    </div>
                </div>
            )}
        </div>
    );
};