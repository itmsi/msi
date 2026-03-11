import { jsPDF } from 'jspdf';

// Font loading utility for jsPDF
export const loadCustomFonts = async (doc: jsPDF): Promise<void> => {
    try {
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

        // Chinese fonts (Noto Sans SC for Chinese characters)
        const chineseFonts = [
            { path: '/fonts/notosanssc-regular.ttf', name: 'NotoSansSC', style: 'normal' },
            { path: '/fonts/notosanssc-bold.ttf', name: 'NotoSansSC', style: 'bold' }
        ];

        const allFonts = [...fonts, ...chineseFonts];

        const fontPromises = allFonts.map(async (font) => {
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
        
        doc.setFont('Futura', 'normal');
    } catch (error) {
        console.error('Error loading custom fonts:', error);
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

export const setFontSafe = (doc: jsPDF, fontName: string = 'Futura', fontStyle: string = 'normal'): void => {
    try {
        doc.setFont(fontName, fontStyle);
    } catch (error) {
        console.warn(`Font ${fontName} ${fontStyle} not available, falling back to helvetica`);
        doc.setFont('helvetica', 'normal');
    }
};

export const hasChinese = (text: string): boolean => {
    const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/u;
    return chineseRegex.test(text);
};

export const setFontByLanguage = (doc: jsPDF, text: string, fontName: string = 'Futura', fontStyle: string = 'normal', language?: string): void => {
    if (language === 'zh' || hasChinese(text)) {
        try {
            const chineseStyle = fontStyle === 'bold' ? 'bold' : 'normal';
            doc.setFont('NotoSansSC', chineseStyle);
        } catch (error) {
            console.warn('NotoSansSC font not available, falling back to helvetica');
            doc.setFont('helvetica', fontStyle);
        }
    } else {
        setFontSafe(doc, fontName, fontStyle);
    }
};
