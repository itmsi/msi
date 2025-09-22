import { TableStyles } from 'react-data-table-component';

// Predefined theme configurations
export const tableThemes = {
    default: {
        headerBackground: 'rgba(2, 83, 165, 0.1)',
        hoverBackground: 'rgba(223, 232, 242, 0.3)',
        borderRadius: '8px',
    },
    primary: {
        headerBackground: 'rgba(59, 130, 246, 0.1)',
        hoverBackground: 'rgba(219, 234, 254, 0.5)',
        borderRadius: '8px',
    },
    success: {
        headerBackground: 'rgba(34, 197, 94, 0.1)',
        hoverBackground: 'rgba(220, 252, 231, 0.5)',
        borderRadius: '8px',
    },
    warning: {
        headerBackground: 'rgba(245, 158, 11, 0.1)',
        hoverBackground: 'rgba(254, 243, 199, 0.5)',
        borderRadius: '8px',
    },
    danger: {
        headerBackground: 'rgba(239, 68, 68, 0.1)',
        hoverBackground: 'rgba(254, 226, 226, 0.5)',
        borderRadius: '8px',
    },
    minimal: {
        headerBackground: 'rgba(249, 250, 251, 1)',
        hoverBackground: 'rgba(243, 244, 246, 0.5)',
        borderRadius: '0px',
    },
    dark: {
        headerBackground: 'rgba(31, 41, 55, 1)',
        hoverBackground: 'rgba(55, 65, 81, 0.5)',
        borderRadius: '8px',
    },
};

// Predefined custom styles for different use cases
export const tableStyles = {
    compact: (theme = tableThemes.default): TableStyles => ({
        headRow: {
            style: {
                backgroundColor: theme.headerBackground,
                borderRadius: theme.borderRadius,
                minHeight: '40px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
            },
        },
        rows: {
            style: {
                minHeight: '36px',
                fontSize: '13px',
                color: '#374151',
                borderBottom: '1px solid #f3f4f6',
            },
            highlightOnHoverStyle: {
                backgroundColor: theme.hoverBackground,
                borderRadius: theme.borderRadius,
                transition: 'background-color 0.15s ease',
            },
        },
        cells: {
            style: {
                paddingLeft: '12px',
                paddingRight: '12px',
                fontSize: '13px',
            },
        },
    }),
    
    comfortable: (theme = tableThemes.default): TableStyles => ({
        headRow: {
            style: {
                backgroundColor: theme.headerBackground,
                borderRadius: theme.borderRadius,
                minHeight: '56px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
            },
        },
        rows: {
            style: {
                minHeight: '60px',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #f3f4f6',
            },
            highlightOnHoverStyle: {
                backgroundColor: theme.hoverBackground,
                borderRadius: theme.borderRadius,
                transition: 'background-color 0.15s ease',
            },
        },
        cells: {
            style: {
                paddingLeft: '20px',
                paddingRight: '20px',
                fontSize: '14px',
            },
        },
    }),
    
    striped: (theme = tableThemes.default): TableStyles => ({
        headRow: {
            style: {
                backgroundColor: theme.headerBackground,
                borderRadius: theme.borderRadius,
                minHeight: '48px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e5e7eb',
            },
        },
        rows: {
            style: {
                minHeight: '52px',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #f3f4f6',
                '&:nth-of-type(even)': {
                    backgroundColor: '#f9fafb',
                },
            },
            highlightOnHoverStyle: {
                backgroundColor: theme.hoverBackground,
                borderRadius: theme.borderRadius,
                transition: 'background-color 0.15s ease',
            },
        },
    }),
};

// Utility function to create custom styles with theme
export const createTableStyle = (
    styleType: keyof typeof tableStyles = 'comfortable',
    themeType: keyof typeof tableThemes = 'default'
): TableStyles => {
    const theme = tableThemes[themeType];
    return tableStyles[styleType](theme);
};

export default tableStyles;