import React from 'react';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

interface ActiveStatusBadgeProps {
    status: 'active' | 'inactive';
    variant?: 'default' | 'with-icon' | 'icon-only';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ActiveStatusBadge: React.FC<ActiveStatusBadgeProps> = ({ 
    status, 
    variant = 'default',
    size = 'md',
    className = '' 
}) => {
    const getStatusStyles = () => {
        const getStatus = status.toLocaleLowerCase();
        switch (getStatus) {
            case 'active':
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200',
                    icon: <MdCheckCircle className={getSizeClasses().iconSize} />
                };
            case 'inactive':
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200',
                    icon: <MdCancel className={getSizeClasses().iconSize} />
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                    icon: <MdCancel className={getSizeClasses().iconSize} />
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: 'px-2 py-0.5',
                    textSize: 'text-xs',
                    iconSize: 'w-3 h-3'
                };
            case 'lg':
                return {
                    padding: 'px-4 py-2',
                    textSize: 'text-sm',
                    iconSize: 'w-5 h-5'
                };
            default: // md
                return {
                    padding: 'px-3 py-1',
                    textSize: 'text-xs',
                    iconSize: 'w-4 h-4'
                };
        }
    };

    const statusStyles = getStatusStyles();
    const sizeClasses = getSizeClasses();
    
    const getDisplayText = () => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const renderContent = () => {
        switch (variant) {
            case 'with-icon':
                return (
                    <>
                        {statusStyles.icon}
                        <span>{getDisplayText()}</span>
                    </>
                );
            case 'icon-only':
                return statusStyles.icon;
            default:
                return <span>{getDisplayText()}</span>;
        }
    };

    return (
        <span 
            className={`
                inline-flex items-center justify-center gap-1 
                ${sizeClasses.padding} 
                ${sizeClasses.textSize} 
                ${statusStyles.bgColor} 
                ${statusStyles.textColor} 
                ${statusStyles.borderColor} 
                border rounded-full font-medium
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {renderContent()}
        </span>
    );
};

// Category Badge Component
interface CategoryBadgeProps {
    category: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
    category, 
    showText = true,
    size = 'md',
    className = '' 
}) => {
    const getCategoryStyle = (category: string) => {
        const lowerCategory = category.toLowerCase();
        
        // IUP Categories
        if (lowerCategory === 'island') return 'bg-blue-100 text-blue-800 border border-blue-200';
        if (lowerCategory === 'group') return 'bg-green-100 text-green-800 border border-green-200';
        if (lowerCategory === 'area') return 'bg-orange-100 text-orange-800 border border-orange-200';
        if (lowerCategory === 'iup_zone') return 'bg-purple-100 text-purple-800 border border-purple-200';
        if (lowerCategory === 'iup_segmentation') return 'bg-slate-100 text-slate-800 border border-slate-200';
        if (lowerCategory === 'iup') return 'bg-gray-100 text-gray-800 border border-gray-200';
        
        // PowerBI Categories
        if (lowerCategory === 'service') return 'bg-green-100 text-green-800 border border-green-200';
        if (lowerCategory === 'order management') return 'bg-blue-100 text-blue-800 border border-blue-200';
        if (lowerCategory.includes('customs') || lowerCategory.includes('supply chain')) return 'bg-purple-100 text-purple-800 border border-purple-200';
        if (lowerCategory.includes('sales')) return 'bg-orange-100 text-orange-800 border border-orange-200';
        if (lowerCategory.includes('finance') || lowerCategory.includes('accounting')) return 'bg-teal-100 text-teal-800 border border-teal-200';
        
        // Default - use primary color
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    };
    
    const getCategoryText = (category: string) => {
        // For IUP categories, provide formatted names
        const lowerCategory = category.toLowerCase();
        if (lowerCategory === 'island') return 'Island';
        if (lowerCategory === 'group') return 'Group';
        if (lowerCategory === 'area') return 'Area';
        if (lowerCategory === 'iup_zone') return 'IUP Zone';
        if (lowerCategory === 'iup_segmentation') return 'Segmentation';
        if (lowerCategory === 'iup') return 'IUP';
        
        // For PowerBI and other categories, return the original category name as-is
        return category;
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return showText ? 'px-2 py-0.5 text-xs' : 'p-1 text-xs';
            case 'lg':
                return showText ? 'px-4 py-2 text-sm' : 'p-2 text-sm';
            default: // md
                return showText ? 'px-3 py-1 text-xs' : 'p-1.5 text-xs';
        }
    };

    const categoryStyle = getCategoryStyle(category);
    const sizeClasses = getSizeClasses();

    return (
        <span 
            className={`
                inline-flex items-center justify-center
                ${sizeClasses} 
                ${categoryStyle}
                border rounded-md font-medium
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {showText ? getCategoryText(category) : ''}
        </span>
    );
};
interface StatusTypeBadgeProps {
    type: 1 | 2 | 3;
    label?: string;
    variant?: 'default' | 'with-icon' | 'icon-only';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export const StatusTypeBadge: React.FC<StatusTypeBadgeProps> = ({ 
    type,
    label,
    variant = 'default',
    size = 'md',
    className = '' 
}) => {
    const getStatusStyles = (type: 1 | 2 | 3) => {
        switch (type) {
            case 2:
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200',
                    icon: <MdCheckCircle className={getSizeClasses().iconSize} />,
                    label: label || 'Approved' 
                };
            case 1:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                    icon: <MdCancel className={getSizeClasses().iconSize} />,
                    label: label || 'Pending Approval'
                };
            case 3:
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200',
                    icon: <MdCancel className={getSizeClasses().iconSize} />,
                    label: label || 'Rejected'
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                    icon: <MdCancel className={getSizeClasses().iconSize} />
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: 'px-2 py-0.5',
                    textSize: 'text-xs',
                    iconSize: 'w-3 h-3'
                };
            case 'lg':
                return {
                    padding: 'px-4 py-2',
                    textSize: 'text-sm',
                    iconSize: 'w-5 h-5'
                };
            default: // md
                return {
                    padding: 'px-3 py-1',
                    textSize: 'text-xs',
                    iconSize: 'w-4 h-4'
                };
        }
    };

    const statusStyles = getStatusStyles(type);
    const sizeClasses = getSizeClasses();
    
    const getDisplayText = () => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const renderContent = () => {
        switch (variant) {
            case 'with-icon':
                return (
                    <>
                        {statusStyles.icon}
                        <span>{getDisplayText()}</span>
                    </>
                );
            case 'icon-only':
                return statusStyles.icon;
            default:
                return <span>{statusStyles.label}</span>;
        }
    };

    return (
        <span 
            className={`
                inline-flex items-center justify-center gap-1 
                ${sizeClasses.padding} 
                ${sizeClasses.textSize} 
                ${statusStyles.bgColor} 
                ${statusStyles.textColor} 
                ${statusStyles.borderColor} 
                border rounded-full font-medium
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {renderContent()}
        </span>
    );
};
// SALES ORDER APPROVAL STATUS BADGE
interface StatusTypeBadgeSOProps {
    type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
    label?: string;
    variant?: 'default' | 'with-icon' | 'icon-only';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export const StatusTypeBadgeSO: React.FC<StatusTypeBadgeSOProps> = ({ 
    type,
    label,
    size = 'md',
    className = '' 
}) => {
    const getStatusStyles = (type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H') => {
        switch (type) {
            case 'A': // Pending Approval
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                    label: label || 'Pending Approval'
                };

            case 'B': // Pending Fulfillment
                return {
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-200',
                    label: label || 'Pending Fulfillment'
                };

            case 'C': // Cancelled
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200',
                    label: label || 'Cancelled'
                };

            case 'D': // Partially Fulfilled
                return {
                    bgColor: 'bg-orange-100',
                    textColor: 'text-orange-800',
                    borderColor: 'border-orange-200',
                    label: label || 'Partially Fulfilled'
                };

            case 'E': // Pending Billing / Part Fulfilled
                return {
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    borderColor: 'border-purple-200',
                    label: label || 'Pending Billing/Part Fulfilled'
                };

            case 'F': // Pending Billing
                return {
                    bgColor: 'bg-indigo-100',
                    textColor: 'text-indigo-800',
                    borderColor: 'border-indigo-200',
                    label: label || 'Pending Billing'
                };

            case 'G': // Fully Billed
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-200',
                    label: label || 'Fully Billed'
                };

            case 'H': // Closed
                return {
                    bgColor: 'bg-gray-200',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-300',
                    label: label || 'Closed'
                };

            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200',
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: 'px-2 py-0.5',
                    textSize: 'text-xs',
                    iconSize: 'w-3 h-3'
                };
            case 'lg':
                return {
                    padding: 'px-4 py-2',
                    textSize: 'text-sm',
                    iconSize: 'w-5 h-5'
                };
            default: // md
                return {
                    padding: 'px-3 py-1',
                    textSize: 'text-xs',
                    iconSize: 'w-4 h-4'
                };
        }
    };

    const statusStyles = getStatusStyles(type);
    const sizeClasses = getSizeClasses();

    return (
        <span 
            className={`
                inline-flex items-center justify-center gap-1 
                ${sizeClasses.padding} 
                ${sizeClasses.textSize} 
                ${statusStyles.bgColor} 
                ${statusStyles.textColor} 
                ${statusStyles.borderColor} 
                border rounded-full font-medium
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            <span>{statusStyles.label}</span>
        </span>
    );
};
// WORK ORDER STATUS BADGE
interface StatusTypeBadgeWOProps {
    type: "open" | "review" | "waiting_sparepart" | "onprogress" | "repair_process" | "quality_check" | "ready_pickup" | "complete" | "cancelled";
    label?: string;
    variant?: 'default' | 'with-icon' | 'icon-only';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export const StatusTypeBadgeWO: React.FC<StatusTypeBadgeWOProps> = ({ 
    type,
    label,
    size = 'md',
    className = '' 
}) => {
    const getStatusStyles = (type: "open" | "review" | "waiting_sparepart" | "onprogress" | "repair_process" | "quality_check" | "ready_pickup" | "complete" | "cancelled") => {
        switch (type) {
            case 'open':
                return { bgColor: 'bg-gray-100',   textColor: 'text-gray-800',   borderColor: 'border-gray-200',   label: label || 'Open' };
            case 'review':
                return { bgColor: 'bg-blue-100',   textColor: 'text-blue-800',   borderColor: 'border-blue-200',   label: label || 'Pending Fulfillment' };
            case 'waiting_sparepart':
                return { bgColor: 'bg-amber-100',  textColor: 'text-amber-900',  borderColor: 'border-amber-200',  label: label || 'Partially Fulfilled' };
            case 'onprogress':
                return { bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200', label: label || 'On Progress' };
            case 'repair_process':
                return { bgColor: 'bg-teal-100',   textColor: 'text-teal-800',   borderColor: 'border-teal-200',   label: label || 'In Repair' };
            case 'quality_check':
                return { bgColor: 'bg-pink-100',   textColor: 'text-pink-800',   borderColor: 'border-pink-200',   label: label || 'Quality Check' };
            case 'ready_pickup':
                return { bgColor: 'bg-green-100',  textColor: 'text-green-800',  borderColor: 'border-green-200',  label: label || 'Ready for Pickup' };
            case 'complete':
                return { bgColor: 'bg-green-100', textColor: 'text-green-800',  borderColor: 'border-green-200',  label: label || 'Completed' };
            case 'cancelled':
                return { bgColor: 'bg-red-100',    textColor: 'text-red-800',    borderColor: 'border-red-200',    label: label || 'Cancelled' };
            default:
                return { bgColor: 'bg-gray-100',   textColor: 'text-gray-800',   borderColor: 'border-gray-200',   label: label || 'Unknown' };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    padding: 'px-2 py-0.5',
                    textSize: 'text-xs',
                    iconSize: 'w-3 h-3'
                };
            case 'lg':
                return {
                    padding: 'px-4 py-2',
                    textSize: 'text-sm',
                    iconSize: 'w-5 h-5'
                };
            default: // md
                return {
                    padding: 'px-3 py-1',
                    textSize: 'text-xs',
                    iconSize: 'w-4 h-4'
                };
        }
    };

    const statusStyles = getStatusStyles(type);
    const sizeClasses = getSizeClasses();

    return (
        <span 
            className={`
                inline-flex items-center justify-center gap-1 
                ${sizeClasses.padding} 
                ${sizeClasses.textSize} 
                ${statusStyles.bgColor} 
                ${statusStyles.textColor} 
                ${statusStyles.borderColor} 
                border rounded-full font-medium
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            <span>{statusStyles.label}</span>
        </span>
    );
};
export default ActiveStatusBadge;