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
        switch (status) {
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
        switch (category) {
            case 'Sales Report':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Customer Analytics':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Financial Report':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'HR Report':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Inventory Report':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Quality Control':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'Marketing Report':
                return 'bg-pink-100 text-pink-800 border-pink-200';
            case 'Operations Report':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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
            {showText ? category : ''}
        </span>
    );
};

export default ActiveStatusBadge;