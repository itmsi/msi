import React from 'react';

// Helper component to handle center alignment without styled-components warnings
export const TableCenterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {children}
    </div>
);

// Alternative approach using custom CSS classes
export const centerTableStyle = {
    textAlign: 'center' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};