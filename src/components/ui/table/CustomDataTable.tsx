import React from 'react';
import DataTable, { TableColumn, TableStyles, ConditionalStyles } from 'react-data-table-component';
import { StyleSheetManager } from 'styled-components';

interface CustomDataTableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    
    // Pagination props
    pagination?: boolean;
    paginationServer?: boolean;
    paginationTotalRows?: number;
    paginationPerPage?: number;
    paginationDefaultPage?: number;
    paginationRowsPerPageOptions?: number[];
    onChangePage?: (page: number) => void;
    onChangeRowsPerPage?: (currentRowsPerPage: number, currentPage: number) => void;
    
    // Selection props
    selectableRows?: boolean;
    onSelectedRowsChange?: (state: { allSelected: boolean; selectedCount: number; selectedRows: T[] }) => void;
    clearSelectedRows?: boolean;
    
    // Row events
    onRowClicked?: (row: T, event: React.MouseEvent<Element>) => void;
    onRowDoubleClicked?: (row: T, event: React.MouseEvent<Element>) => void;
    onRowMouseEnter?: (row: T, event: React.MouseEvent<Element>) => void;
    onRowMouseLeave?: (row: T, event: React.MouseEvent<Element>) => void;
    
    // Search props
    subHeader?: boolean;
    subHeaderComponent?: React.ReactNode;
    
    // Styling props
    theme?: 'light' | 'dark' | 'auto';
    customStyles?: TableStyles;
    striped?: boolean;
    highlightOnHover?: boolean;
    responsive?: boolean;
    persistTableHead?: boolean;
    
    // Additional props
    noDataComponent?: React.ReactNode;
    progressComponent?: React.ReactNode;
    expandableRows?: boolean;
    expandableRowsComponent?: React.ComponentType<{ data: T }>;
    conditionalRowStyles?: ConditionalStyles<T>[];
    
    // Custom styling options
    headerBackground?: string;
    hoverBackground?: string;
    borderRadius?: string;
    
    // Density options
    dense?: boolean;
    
    // Fixed header options
    fixedHeader?: boolean;
    fixedHeaderScrollHeight?: string;
    
    className?: string;
}

const CustomDataTable = <T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    
    // Pagination
    pagination = true,
    paginationServer = false,
    paginationTotalRows = 0,
    paginationPerPage = 10,
    paginationDefaultPage = 1,
    paginationRowsPerPageOptions,
    onChangePage,
    onChangeRowsPerPage,
    
    // Selection
    selectableRows = false,
    onSelectedRowsChange,
    clearSelectedRows = false,
    
    // Row events
    onRowClicked,
    onRowDoubleClicked,
    onRowMouseEnter,
    onRowMouseLeave,
    
    // Search
    subHeader = false,
    subHeaderComponent,
    
    // Styling
    theme = 'light',
    customStyles,
    striped = true,
    highlightOnHover = true,
    responsive = true,
    persistTableHead = true,
    
    // Additional
    noDataComponent,
    progressComponent,
    expandableRows = false,
    expandableRowsComponent,
    conditionalRowStyles,
    
    // Custom styling
    headerBackground = '#dfe8f2',
    hoverBackground = 'rgba(223, 232, 242, 0.3)',
    borderRadius = '8px',
    
    // Density
    dense = false,
    
    // Fixed header
    fixedHeader = false,
    fixedHeaderScrollHeight = '400px',
    
    className = '',
    ...props 
}: CustomDataTableProps<T>) => {
    
    // Default custom styles with customization options
    const defaultCustomStyles: TableStyles = {
        headRow: {
            style: {
                backgroundColor: headerBackground,
                borderRadius: borderRadius,
                minHeight: dense ? '40px' : '48px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                // borderBottom: '1px solid #e5e7eb',
                borderBottom: 'transparent',
            },
        },
        headCells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
            },
        },
        rows: {
            style: {
                minHeight: dense ? '40px' : '52px',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #ededed !important',  
                '&:last-of-type': {
                    borderBottomWidth: '0px',
                },
            },
            highlightOnHoverStyle: {
                backgroundColor: hoverBackground,
                borderRadius: borderRadius,
                transition: 'background-color 0.15s ease',
                cursor: 'pointer',
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '14px',
            },
        },
        pagination: {
            style: {
                fontSize: '14px',
                minHeight: '56px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e5e7eb',
                color: '#374151',
            },
            pageButtonsStyle: {
                borderRadius: '6px',
                height: '32px',
                width: '32px',
                margin: '0 2px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'transparent',
                fill: '#6b7280',
                '&:disabled': {
                    cursor: 'unset',
                    fill: '#d1d5db',
                },
                '&:hover:not(:disabled)': {
                    backgroundColor: '#ededed !important',
                    fill: '#374151',
                },
                '&:focus': {
                    outline: '2px solid #3b82f6',
                    outlineOffset: '2px',
                },
            },
        },
        noData: {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                color: '#6b7280',
                fontSize: '16px',
            },
        },
        progress: {
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
            },
        },
    };

    // Merge custom styles with defaults
    const mergedStyles = customStyles 
        ? {
            ...defaultCustomStyles,
            ...customStyles,
            headRow: {
                style: {
                    ...defaultCustomStyles.headRow?.style,
                    ...customStyles.headRow?.style,
                },
            },
            rows: {
                style: {
                    ...defaultCustomStyles.rows?.style,
                    ...customStyles.rows?.style,
                },
                highlightOnHoverStyle: {
                    ...defaultCustomStyles.rows?.highlightOnHoverStyle,
                    ...customStyles.rows?.highlightOnHoverStyle,
                },
            },
        }
        : defaultCustomStyles;

    // Default no data component
    const defaultNoDataComponent = (
        <div className="flex flex-col items-center justify-center py-12">
            <svg 
                className="w-12 h-12 text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m8 0V4" 
                />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No data available</p>
            <p className="text-gray-400 text-sm">There are no records to display at this time.</p>
        </div>
    );

    // Default progress component
    const defaultProgressComponent = (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading data...</p>
        </div>
    );

    return (
        <div className={`bg-white overflow-hidden ${className}`}>
            <StyleSheetManager shouldForwardProp={(prop) => !['center', 'allowOverflow'].includes(prop)}>
                <DataTable
                    {...props}
                    columns={columns}
                    data={data}
                    progressPending={loading}
                    
                    // Pagination
                    pagination={pagination}
                    paginationServer={paginationServer}
                    paginationTotalRows={paginationTotalRows}
                    paginationPerPage={paginationPerPage}
                    paginationDefaultPage={paginationDefaultPage}
                    onChangePage={onChangePage}
                    onChangeRowsPerPage={onChangeRowsPerPage}
                    paginationRowsPerPageOptions={paginationRowsPerPageOptions || [10, 25, 50, 100]}
                    
                    // Selection
                    selectableRows={selectableRows}
                    onSelectedRowsChange={onSelectedRowsChange}
                    clearSelectedRows={clearSelectedRows}
                    
                    // Row events
                    onRowClicked={onRowClicked}
                    onRowDoubleClicked={onRowDoubleClicked}
                    onRowMouseEnter={onRowMouseEnter}
                    onRowMouseLeave={onRowMouseLeave}
                    
                    // Search
                    subHeader={subHeader}
                    subHeaderComponent={subHeaderComponent}
                    
                    // Styling
                    theme={theme}
                    customStyles={mergedStyles}
                    striped={striped}
                    highlightOnHover={highlightOnHover}
                    responsive={responsive}
                    persistTableHead={persistTableHead}
                    
                    // Additional
                    noDataComponent={noDataComponent || defaultNoDataComponent}
                    progressComponent={progressComponent || defaultProgressComponent}
                    expandableRows={expandableRows}
                    expandableRowsComponent={expandableRowsComponent}
                    conditionalRowStyles={conditionalRowStyles}
                    
                    // Density
                    dense={dense}
                    
                    // Fixed header
                    fixedHeader={fixedHeader}
                    fixedHeaderScrollHeight={fixedHeaderScrollHeight}
                />
            </StyleSheetManager>
        </div>
    );
};

export default CustomDataTable;