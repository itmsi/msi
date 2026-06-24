import React from 'react';

interface ActionItem {
    key: string;
    element: React.ReactNode;
}

interface PageHeaderCardProps {
    title: string;
    subtitle?: string;
    actions?: ActionItem[];
    className?: string;
}

const PageHeaderManage: React.FC<PageHeaderCardProps> = ({
    title,
    subtitle,
    actions = [],
    className = '',
}) => {
    return (
        <div className={`bg-white shadow rounded-lg mb-3 ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row lg:justify-between lg:items-center">
                    
                    {/* Left Content */}
                    <div>
                        <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                            {title}
                        </h3>
                        {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </p>
                        )}
                    </div>

                    {/* Right Actions */}
                    {actions.length > 0 && (
                        <div className="flex space-x-3 lg:mt-0 mt-3">
                            {actions.map((action) => (
                                <div key={action.key}>{action.element}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageHeaderManage;