import React from 'react';
import { useHasPermission } from '@/hooks/usePermissions';
import Button from '../ui/button/Button';

interface PermissionGateProps {
    permission: 'create' | 'read' | 'update' | 'delete';
    routeName?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Component wrapper untuk menampilkan/hide element berdasarkan permission
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    routeName,
    fallback = null,
    children
}) => {
    const hasPermission = useHasPermission(permission, routeName);
    
    return hasPermission ? <>{children}</> : <>{fallback}</>;
};

interface PermissionButtonProps {
    permission: 'create' | 'read' | 'update' | 'delete';
    routeName?: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    title?: string;
    type?: "button" | "submit" | "reset";
}

/**
 * Button component yang otomatis disabled berdasarkan permission
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
    permission,
    routeName,
    children,
    className = '',
    disabled,
    onClick,
    title,
    type = "button"
}) => {
    const hasPermission = useHasPermission(permission, routeName);
    return (
        <div title={title}>
            <Button
                size="sm"
                variant="outline"
                disabled={disabled || !hasPermission}
                className={`${className} ${!hasPermission ? 'p-2 rounded-md text-sm font-medium transition-colors' : ''}`}
                onClick={onClick}
                type={type}
            >
                {children}
            </Button>
        </div>
    );
};

interface ConditionalRenderProps {
    condition: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete';
    routeName?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Component untuk conditional rendering berdasarkan permission condition
 */
export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
    condition,
    routeName,
    fallback = null,
    children
}) => {
    const permissionMap = {
        canCreate: 'create' as const,
        canRead: 'read' as const,
        canUpdate: 'update' as const,
        canDelete: 'delete' as const,
    };
    
    const hasPermission = useHasPermission(permissionMap[condition], routeName);
    
    return hasPermission ? <>{children}</> : <>{fallback}</>;
};