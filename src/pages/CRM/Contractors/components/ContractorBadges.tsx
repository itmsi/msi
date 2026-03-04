import React from 'react';
import Badge from '@/components/ui/badge/Badge';

interface ContractorStatusBadgeProps {
    status: 'active' | 'inactive';
}

export const ContractorStatusBadge: React.FC<ContractorStatusBadgeProps> = ({ status }) => {
    const statusConfig = {
        active: { 
            variant: 'solid' as const, 
            color: 'success' as const, 
            label: 'Active' 
        },
        inactive: { 
            variant: 'light' as const, 
            color: 'light' as const, 
            label: 'Inactive' 
        },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} color={config.color}>
            {config.label}
        </Badge>
    );
};

interface MineTypeBadgeProps {
    type: 'batu bara' | 'nikel' | 'lainnya';
}

export const MineTypeBadge: React.FC<MineTypeBadgeProps> = ({ type }) => {
    const typeConfig = {
        'batu bara': { 
            variant: 'light' as const, 
            color: 'dark' as const, 
            label: 'Batu Bara' 
        },
        'nikel': { 
            variant: 'light' as const, 
            color: 'primary' as const, 
            label: 'Nikel' 
        },
        'lainnya': { 
            variant: 'light' as const, 
            color: 'light' as const, 
            label: 'Lainnya' 
        },
    };

    const config = typeConfig[type];

    return (
        <Badge variant={config.variant} color={config.color}>
            {config.label}
        </Badge>
    );
};

interface ActivityTypeBadgeProps {
    type: 'Not Started' | 'Find' | 'Pull' | 'Survey' | 'BAST';
}
export const ActivityTypeBadge: React.FC<ActivityTypeBadgeProps> = ({ type }) => {
    const typeConfig = {
        'Not Started': { 
            variant: 'outline' as const, 
            color: 'light' as const, 
            label: 'Not Started' 
        },
        'Find': { 
            variant: 'outline' as const, 
            color: 'info' as const, 
            label: 'Find' 
        },
        'Pull': { 
            variant: 'solid' as const, 
            color: 'warning' as const, 
            label: 'Pull' 
        },
        'Survey': { 
            variant: 'solid' as const, 
            color: 'indigo' as const, 
            label: 'Survey' 
        },
        'BAST': { 
            variant: 'solid' as const, 
            color: 'success' as const, 
            label: 'BAST' 
        },
    };


    const config = typeConfig[type];
    return (
        <Badge variant={config.variant} color={config.color}>
            {config.label}
        </Badge>
    );
};
