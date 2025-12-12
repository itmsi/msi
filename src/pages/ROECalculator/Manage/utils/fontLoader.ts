import { jsPDF } from 'jspdf';

// Font loading utility for jsPDF
export const loadCustomFonts = async (doc: jsPDF): Promise<void> => {
    try {
        // Load Futura fonts
        const fonts = [
            { path: '/fonts/futumd.ttf', name: 'Futura', style: 'normal' },
            { path: '/fonts/futumditalic.ttf', name: 'Futura', style: 'italic' },
            { path: '/fonts/futuramdbold.ttf', name: 'Futura', style: 'bold' },
            { path: '/fonts/futurabolditalic.ttf', name: 'Futura', style: 'bolditalic' },
            { path: '/fonts/opensans-bold.ttf', name: 'OpenSans', style: 'bold' },
            { path: '/fonts/opensans-bolditalic.ttf', name: 'OpenSans', style: 'bolditalic' },
            { path: '/fonts/opensans-medium.ttf', name: 'OpenSans', style: 'medium' },
            { path: '/fonts/opensans-mediumitalic.ttf', name: 'OpenSans', style: 'mediumitalic' },
            { path: '/fonts/opensans-regular.ttf', name: 'OpenSans', style: 'normal' },
            { path: '/fonts/opensans-italic.ttf', name: 'OpenSans', style: 'normalitalic' },
            { path: '/fonts/opensans-semibold.ttf', name: 'OpenSans', style: 'semibold' },
            { path: '/fonts/opensans-semibolditalic.ttf', name: 'OpenSans', style: 'semibolditalic' }
        ];

        // Load all fonts
        const fontPromises = fonts.map(async (font) => {
            try {
                const response = await fetch(font.path);
                if (!response.ok) {
                    console.warn(`Failed to load font: ${font.path}`);
                    return null;
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const base64 = arrayBufferToBase64(arrayBuffer);
                
                // Add font to jsPDF
                doc.addFileToVFS(`${font.name}-${font.style}.ttf`, base64);
                doc.addFont(`${font.name}-${font.style}.ttf`, font.name, font.style);
                
                return { name: font.name, style: font.style };
            } catch (error) {
                console.warn(`Error loading font ${font.path}:`, error);
                return null;
            }
        });

        await Promise.all(fontPromises);
        
        // Set default font to Futura
        doc.setFont('Futura', 'normal');
        
        console.log('Custom fonts loaded successfully');
    } catch (error) {
        console.error('Error loading custom fonts:', error);
        // Fallback to default font
        doc.setFont('helvetica', 'normal');
    }
};

// Helper function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
};

// Helper function to set font with fallback
export const setFontSafe = (doc: jsPDF, fontName: string = 'Futura', fontStyle: string = 'normal'): void => {
    try {
        doc.setFont(fontName, fontStyle);
    } catch (error) {
        console.warn(`Font ${fontName} ${fontStyle} not available, falling back to helvetica`);
        doc.setFont('helvetica', fontStyle === 'bold' || fontStyle === 'bolditalic' ? 'bold' : 'normal');
    }
};
