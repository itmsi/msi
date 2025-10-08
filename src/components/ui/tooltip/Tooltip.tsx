import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
    content: string | React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
    disabled?: boolean;
    maxWidth?: string;
    theme?: 'dark' | 'light';
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200,
    className = '',
    disabled = false,
    maxWidth = '200px',
    theme = 'dark'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Calculate the best position based on viewport
    const calculatePosition = () => {
        if (!triggerRef.current) return { position, style: {} };

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let bestPosition = position;
        let style: React.CSSProperties = {};

        // Calculate tooltip dimensions (approximate)
        const tooltipWidth = parseInt(maxWidth) || 200;
        const tooltipHeight = 40; // approximate height

        // Check if tooltip fits in the preferred position and calculate coordinates
        switch (position) {
            case 'top':
                if (triggerRect.top - tooltipHeight < 0) {
                    bestPosition = 'bottom';
                    style = {
                        position: 'fixed',
                        top: triggerRect.bottom + 8,
                        left: triggerRect.left + triggerRect.width / 2,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        zIndex: 9999,
                        transform: 'translateX(-50%)'
                    };
                } else {
                    style = {
                        position: 'fixed',
                        top: triggerRect.top - 8,
                        left: triggerRect.left + triggerRect.width / 2,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        textAlign: 'center',
                        zIndex: 9999,
                        transform: 'translateX(-50%) translateY(-100%)'
                    };
                }
                break;
            case 'bottom':
                if (triggerRect.bottom + tooltipHeight > viewportHeight) {
                    bestPosition = 'top';
                    style = {
                        position: 'fixed',
                        top: triggerRect.top - 8,
                        left: triggerRect.left + triggerRect.width / 2,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        zIndex: 9999,
                        textAlign: 'center',
                        transform: 'translateX(-50%) translateY(-100%)'
                    };
                } else {
                    style = {
                        position: 'fixed',
                        top: triggerRect.bottom + 8,
                        left: triggerRect.left + triggerRect.width / 2,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        textAlign: 'center',
                        zIndex: 9999,
                        transform: 'translateX(-50%)'
                    };
                }
                break;
            case 'left':
                if (triggerRect.left - tooltipWidth < 0) {
                    bestPosition = 'right';
                    style = {
                        position: 'fixed',
                        top: triggerRect.top + triggerRect.height / 2,
                        left: triggerRect.right + 8,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        textAlign: 'center',
                        zIndex: 9999,
                        transform: 'translateY(-50%)'
                    };
                } else {
                    style = {
                        position: 'fixed',
                        top: triggerRect.top + triggerRect.height / 2,
                        left: triggerRect.left - tooltipWidth - 8,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        textAlign: 'center',
                        zIndex: 9999,
                        transform: 'translateY(-50%)'
                    };
                }
                break;
            case 'right':
                if (triggerRect.right + tooltipWidth > viewportWidth) {
                    bestPosition = 'left';
                    style = {
                        position: 'fixed',
                        top: triggerRect.top + triggerRect.height / 2,
                        left: triggerRect.left - tooltipWidth - 8,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        textAlign: 'center',
                        zIndex: 9999,
                        transform: 'translateY(-50%)'
                    };
                } else {
                    style = {
                        position: 'fixed',
                        top: triggerRect.top + triggerRect.height / 2,
                        left: triggerRect.right + 8,
                        maxWidth: maxWidth ? maxWidth : 'auto',
                        textAlign: 'center',
                        zIndex: 9999,
                        transform: 'translateY(-50%)'
                    };
                }
                break;
        }

        // Ensure tooltip doesn't go outside viewport bounds
        // Note: With transform, we need to account for the centering
        if (style.left && typeof style.left === 'number') {
            const hasTranslateX = style.transform && style.transform.includes('translateX(-50%)');
            const leftBound = hasTranslateX ? tooltipWidth / 2 : 0;
            const rightBound = hasTranslateX ? viewportWidth - tooltipWidth / 2 : viewportWidth - tooltipWidth;
            
            if (style.left < leftBound) {
                style.left = leftBound + 8;
            }
            if (style.left > rightBound) {
                style.left = rightBound - 8;
            }
        }

        return { position: bestPosition, style };
    };

    const showTooltip = () => {
        if (disabled) return;
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            // Calculate position after tooltip becomes visible
            setTimeout(() => {
                const { position: newPosition, style: newStyle } = calculatePosition();
                setActualPosition(newPosition);
                setTooltipStyle(newStyle);
            }, 0);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Arrow classes
    const getArrowClasses = () => {
        const arrowColor = theme === 'dark' ? 'border-t-gray-900' : 'border-t-white';
        const arrowColorBottom = theme === 'dark' ? 'border-b-gray-900' : 'border-b-white';
        const arrowColorLeft = theme === 'dark' ? 'border-l-gray-900' : 'border-l-white';
        const arrowColorRight = theme === 'dark' ? 'border-r-gray-900' : 'border-r-white';
        
        switch (actualPosition) {
        case 'top':
            return `absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${arrowColor}`;
        case 'bottom':
            return `absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${arrowColorBottom}`;
        case 'left':
            return `absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent ${arrowColorLeft}`;
        case 'right':
            return `absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent ${arrowColorRight}`;
        default:
            return `absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${arrowColor}`;
        }
    };

    // Theme classes
    const getThemeClasses = () => {
        return theme === 'dark'
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-900 border-gray-200 shadow-lg';
    };

    if (!content) {
        return <>{children}</>;
    }

    return (
        <div
            className="relative inline-block"
            ref={triggerRef}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
        {children}
        {isVisible && (
            <div
                ref={tooltipRef}
                className={`transition-all duration-200 ease-in-out ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                style={tooltipStyle}
            >
                <div
                    className={`
                        px-3 py-2 rounded-md text-[12px] font-medium border
                        ${getThemeClasses()}
                        ${className}
                    `}
                >
                    {content}
                    <div className={getArrowClasses()}></div>
                </div>
            </div>
        )}
    </div>
    );
};

export default Tooltip;
