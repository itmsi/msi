import React from 'react';
import { TableColumn } from 'react-data-table-component';
import { PermissionButton } from '@/components/common/PermissionComponents';
import { Tooltip } from '../tooltip';

// Common column configurations with React components
export const createSerialNumberColumn = (pagination?: { current_page: number; per_page: number }): TableColumn<any> => ({
    name: 'No',
    selector: (_row: any, index?: number) => 
        ((pagination?.current_page || 1) - 1) * (pagination?.per_page || 10) + (index || 0) + 1,
    width: '60px',
    center: true, // This handles both header and cell centering
});

export const createStatusColumn = (
    statusField = 'is_active', 
    activeText = 'Active', 
    inactiveText = 'Inactive'
): TableColumn<any> => ({
    name: 'Status',
    cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row[statusField] 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
        }`}>
            {row[statusField] ? activeText : inactiveText}
        </span>
    ),
    width: '100px',
    center: true, // This handles both header and cell centering
});

export const createStatusToggleColumn = (
    statusField = 'is_active',
    onToggle: (row: any, newStatus: boolean) => void | Promise<void>,
    activeText = 'Active',
    inactiveText = 'Inactive',
    disabled?: (row: any) => boolean
): TableColumn<any> => ({
    name: 'Status',
    cell: (row: any) => {
        const isActive = row[statusField];
        const isDisabled = disabled ? disabled(row) : false;
        
        return (
            <div className="flex items-center gap-2">
                {/* Toggle Switch */}
                <button
                    onClick={() => !isDisabled && onToggle(row, !isActive)}
                    disabled={isDisabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isDisabled 
                            ? 'cursor-not-allowed opacity-50 bg-gray-200' 
                            : isActive 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={isDisabled ? 'Cannot change status' : `Click to ${isActive ? 'deactivate' : 'activate'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
                
                {/* Status Text */}
                <span className={`text-xs font-medium ${
                    isActive ? 'text-green-700' : 'text-gray-600'
                }`}>
                    {isActive ? activeText : inactiveText}
                </span>
            </div>
        );
    },
    width: '120px',
    center: true, // This handles both header and cell centering
    ignoreRowClick: true,
    // allowOverflow: true, // Removed to prevent styled-components warning
    // button: true,
});

export const createDateColumn = (
    name: string,
    dateField: string,
    formatOptions?: Intl.DateTimeFormatOptions
): TableColumn<any> => ({
    name,
    selector: (row: any) => row[dateField],
    format: (row: any) => {
        const date = new Date(row[dateField]);
        return formatOptions 
            ? date.toLocaleDateString(undefined, formatOptions)
            : date.toLocaleDateString();
    },
    center: true,
    wrap: true,
    width: '150px',
});

export const createActionsColumn = (actions: Array<{
    icon: React.ComponentType<any>;
    onClick: (row: any) => void;
    permission?: 'create' | 'read' | 'update' | 'delete';
    className?: string;
    tooltip?: string;
    condition?: (row: any) => boolean;
}>): TableColumn<any> => ({
    name: 'Actions',
    cell: (row: any) => (
        <div className="flex items-center gap-3">
            {actions
                .filter(action => !action.condition || action.condition(row))
                .map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Tooltip key={index} content={action.tooltip} position="top">
                            <PermissionButton
                                permission={action.permission || 'read'}
                                onClick={() => action.onClick(row)}
                                className={`p-2 rounded-md text-sm font-medium transition-colors relative ${
                                    action.className || 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                            </PermissionButton>
                        </Tooltip>
                    );
                })}
        </div>
    ),
    width: '200px',
    center: true, // This handles both header and cell centering
    ignoreRowClick: true,
    // allowOverflow: true, // Removed to prevent styled-components warning
    // button: true,
});
// export const createActionsColumn = (actions: Array<{
//     icon: React.ComponentType<any>;
//     onClick: (row: any) => void;
//     className?: string;
//     tooltip?: string;
//     condition?: (row: any) => boolean;
// }>): TableColumn<any> => ({
//     name: 'Actions',
//     cell: (row: any) => (
//         <div className="flex items-center gap-3">
//             {actions
//                 .filter(action => !action.condition || action.condition(row))
//                 .map((action, index) => {
//                     const Icon = action.icon;
//                     return (
//                         <Button
//                             key={index}
//                             size="sm"
//                             variant="outline"
//                             onClick={() => action.onClick(row)}
//                             className={`p-2 rounded-md text-sm font-medium transition-colors ${
//                                 action.className || 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                             }`}
//                         >
//                             <Icon className="w-4 h-4" />
//                         </Button>
//                     );
//                 })}
//         </div>
//     ),
//     width: '200px',
//     center: true, // This handles both header and cell centering
//     ignoreRowClick: true,
//     // allowOverflow: true, // Removed to prevent styled-components warning
//     // button: true,
// });

// Badge component for status display
export const StatusBadge: React.FC<{
    status: boolean;
    activeText?: string;
    inactiveText?: string;
    activeColor?: string;
    inactiveColor?: string;
}> = ({ 
    status, 
    activeText = 'Active', 
    inactiveText = 'Inactive',
    activeColor = 'bg-green-100 text-green-800',
    inactiveColor = 'bg-red-100 text-red-800'
}) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status ? activeColor : inactiveColor
    }`}>
        {status ? activeText : inactiveText}
    </span>
);

// Toggle switch component for status changes
export const StatusToggle: React.FC<{
    status: boolean;
    onToggle: (newStatus: boolean) => void | Promise<void>;
    activeText?: string;
    inactiveText?: string;
    disabled?: boolean;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
}> = ({ 
    status, 
    onToggle, 
    activeText = 'Active', 
    inactiveText = 'Inactive',
    disabled = false,
    showText = true,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: { toggle: 'h-5 w-9', thumb: 'h-3 w-3', activePos: 'translate-x-5', inactivePos: 'translate-x-1' },
        md: { toggle: 'h-6 w-11', thumb: 'h-4 w-4', activePos: 'translate-x-6', inactivePos: 'translate-x-1' },
        lg: { toggle: 'h-7 w-12', thumb: 'h-5 w-5', activePos: 'translate-x-6', inactivePos: 'translate-x-1' }
    };

    const currentSize = sizeClasses[size];

    return (
        <div className="flex items-center gap-2">
            {/* Toggle Switch */}
            <button
                onClick={() => !disabled && onToggle(!status)}
                disabled={disabled}
                className={`relative inline-flex ${currentSize.toggle} items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    disabled 
                        ? 'cursor-not-allowed opacity-50 bg-gray-200' 
                        : status 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={disabled ? 'Cannot change status' : `Click to ${status ? 'deactivate' : 'activate'}`}
            >
                <span
                    className={`inline-block ${currentSize.thumb} transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        status ? currentSize.activePos : currentSize.inactivePos
                    }`}
                />
            </button>
            
            {/* Status Text */}
            {showText && (
                <span className={`text-xs font-medium ${
                    status ? 'text-green-700' : 'text-gray-600'
                }`}>
                    {status ? activeText : inactiveText}
                </span>
            )}
        </div>
    );
};

// Action button component
export const ActionButton: React.FC<{
    icon: React.ComponentType<any>;
    onClick: () => void;
    variant?: 'primary' | 'danger' | 'success' | 'warning' | 'default';
    tooltip?: string;
    className?: string;
}> = ({ icon: Icon, onClick, variant = 'default', tooltip, className }) => {
    const variantClasses = {
        primary: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
        danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
        success: 'text-green-600 hover:text-green-700 hover:bg-green-50',
        warning: 'text-orange-600 hover:text-orange-700 hover:bg-orange-50',
        default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    };

    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
                className || variantClasses[variant]
            }`}
            title={tooltip}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};