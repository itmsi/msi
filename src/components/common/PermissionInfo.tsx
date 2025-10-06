import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionInfoProps {
    className?: string;
    showTitle?: boolean;
}

/**
 * Component untuk menampilkan informasi permission current page
 * Berguna untuk debugging atau admin interface
 */
export const PermissionInfo: React.FC<PermissionInfoProps> = ({ 
    className = '',
    showTitle = true 
}) => {
    const permissions = usePermissions();

    const permissionBadge = (label: string, hasPermission: boolean) => (
        <span
            className={`px-2 py-1 text-xs font-medium rounded-md ${
                hasPermission
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}
        >
            {label}: {hasPermission ? '✓' : '✗'}
        </span>
    );

    return (
        <div className={`p-4 bg-gray-50 rounded-lg border ${className}`}>
            {showTitle && (
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Page Permissions ({permissions.routeName})
                </h4>
            )}
            
            <div className="flex flex-wrap gap-2">
                {permissionBadge('Create', permissions.canCreate)}
                {permissionBadge('Read', permissions.canRead)}
                {permissionBadge('Update', permissions.canUpdate)}
                {permissionBadge('Delete', permissions.canDelete)}
            </div>
            
            {permissions.permissions.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                    Available: {permissions.permissions.join(', ')}
                </div>
            )}
        </div>
    );
};

/**
 * Component untuk menampilkan permission dalam bentuk icon/badge yang ringkas
 */
export const PermissionBadges: React.FC<{ className?: string }> = ({ className = '' }) => {
    const permissions = usePermissions();

    const badgeClasses = (hasPermission: boolean) =>
        `inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
            hasPermission
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-400'
        }`;

    return (
        <div className={`flex gap-1 ${className}`}>
            <span className={badgeClasses(permissions.canCreate)} title="Create Permission">C</span>
            <span className={badgeClasses(permissions.canRead)} title="Read Permission">R</span>
            <span className={badgeClasses(permissions.canUpdate)} title="Update Permission">U</span>
            <span className={badgeClasses(permissions.canDelete)} title="Delete Permission">D</span>
        </div>
    );
};