import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/helpers/generalHelper';
import { ManageQuotationDataPDF } from '../types/quotation';
import { loadCustomFonts, setFontSafe, setFontByLanguage } from '@/utils/fontLoader';
import { quotationLabelPDF } from '@/pages/Quotation/Manage/language/quotationLabelPDF';
import type { LangCode } from '../../../../components/lang/useLanguage';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable?: {
            finalY: number;
        };
    }
}

// Helper function to format currency
const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        // minimumFractionDigits: 0,
        // maximumFractionDigits: 0
    }).format(numValue);
};

export const generateQuotationPDF = async (data: ManageQuotationDataPDF, language: string) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297]
    });
    
    // Language helper function
    const langField = (key: string): string => {
        const value = quotationLabelPDF[key];
        
        if (value && typeof value === 'object' && value[language as LangCode]) {
            return value[language as LangCode];
        }
        
        return key;
    };
    
    let specYPos = 0;
    let specEndPage = 0;
    
    // Helper function to convert HTML to plain text using advanced parsing logic
    const convertHtmlToPlainText = (htmlContent: string): string => {
        if (!htmlContent) return '';
        
        let result = '';
        
        try {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
            
            const processNodeToText = (node: Node): void => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent?.trim();
                    if (text && text.length > 0) {
                        result += text + ' ';
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    
                    if (element.tagName.toLowerCase() === 'b' || 
                        element.tagName.toLowerCase() === 'u' || 
                        element.tagName.toLowerCase() === 'i') {
                        const text = element.textContent?.trim();
                        if (text) {
                            result += text + '\n';
                        }
                    } else if (element.tagName.toLowerCase() === 'ol') {
                        const listItems = element.querySelectorAll('li');
                        listItems.forEach((li, index) => {
                            const text = li.textContent?.trim() || '';
                            if (text) {
                                result += `${index + 1}. ${text}\n`;
                            }
                        });
                    } else if (element.tagName.toLowerCase() === 'ul') {
                        const listItems = element.querySelectorAll('li');
                        listItems.forEach((li) => {
                            const text = li.textContent?.trim() || '';
                            if (text) {
                                result += `• ${text}\n`;
                            }
                        });
                    } else if (element.tagName.toLowerCase() === 'br') {
                        result += '\n';
                    } else {
                        Array.from(element.childNodes).forEach(child => processNodeToText(child));
                    }
                }
            };
            
            Array.from(htmlDoc.body.childNodes).forEach(node => processNodeToText(node));
            
            return result.trim();
        } catch (error) {
            console.error('Error converting HTML to text:', error);
            return htmlContent;
        }
    };

    const processHtmlToTextAdvanced = (htmlContent: string, maxWidth: number, startXpos: number, startYPos: number): void => {
        if (!htmlContent) return;
        
        specYPos = startYPos;
        
        try {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
            
            const processNodeToTextAdvanced = (node: Node): void => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent?.trim();
                    if (text && text.length > 0) {
                        // Check if need new page before rendering text
                        if (specYPos + 5 > pageHeight - footerHeight - margin) {
                            doc.addPage();
                            addHeaderMSF();
                            addFooter();
                            specYPos = margin + headerHeight + 5;
                            specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                        }
                        
                        doc.setFontSize(8);
                        doc.setTextColor(0, 0, 0);
                        setFontSafe(doc, 'Futura', 'normal');
                        
                        const wrappedText = doc.splitTextToSize(text, maxWidth);
                        wrappedText.forEach((line: string) => {
                            if (specYPos + 5 > pageHeight - footerHeight - margin) {
                                doc.addPage();
                                addHeaderMSF();
                                addFooter();
                                specYPos = margin + headerHeight + 5;
                                specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                            }
                            doc.text(line, startXpos, specYPos);
                            specYPos += 4;
                        });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    
                    // Handle different HTML elements (same logic as processNode)
                    if (element.tagName.toLowerCase() === 'b' || 
                        element.tagName.toLowerCase() === 'u' || 
                        element.tagName.toLowerCase() === 'i') {
                        // Process bold/underline/italic headers
                        const text = element.textContent?.trim();
                        if (text) {
                            // Check if need new page before rendering header
                            if (specYPos + 8 > pageHeight - footerHeight - margin) {
                                doc.addPage();
                                addHeaderMSF();
                                addFooter();
                                specYPos = margin + headerHeight + 5;
                                specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                            }
                            
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0);
                            setFontSafe(doc, 'Futura', 'bold');
                            
                            const wrappedText = doc.splitTextToSize(text, maxWidth);
                            wrappedText.forEach((line: string) => {
                                if (specYPos + 5 > pageHeight - footerHeight - margin) {
                                    doc.addPage();
                                    addHeaderMSF();
                                    addFooter();
                                    specYPos = margin + headerHeight + 5;
                                    specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                                }
                                doc.text(line, startXpos, specYPos);
                                specYPos += 2;
                            });
                            specYPos += 2; // Extra spacing after headers
                        }
                    } else if (element.tagName.toLowerCase() === 'ol') {
                        // Process ordered lists
                        const listItems = element.querySelectorAll('li');
                        listItems.forEach((li, index) => {
                            const text = li.textContent?.trim() || '';
                            
                            // Check if need new page before rendering item
                            if (specYPos + 10 > pageHeight - footerHeight - margin) {
                                doc.addPage();
                                addHeaderMSF();
                                addFooter();
                                specYPos = margin + headerHeight + 5;
                                specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                            }
                            
                            doc.setFontSize(8);
                            doc.setTextColor(0, 0, 0);
                            setFontSafe(doc, 'Futura', 'normal');
                            
                            // Numbered list item
                            const numberPrefix = `${index + 1}. `;
                            const indentWidth = doc.getTextWidth(numberPrefix);
                            
                            if (text) {
                                const wrappedText = doc.splitTextToSize(text, maxWidth - indentWidth);
                                
                                // First line with number
                                const firstLine = wrappedText[0] || '';
                                doc.text(numberPrefix + firstLine, startXpos, specYPos);
                                specYPos += 4;
                                
                                // Continuation lines with indentation
                                for (let i = 1; i < wrappedText.length; i++) {
                                    if (specYPos + 4 > pageHeight - footerHeight - margin) {
                                        doc.addPage();
                                        addHeaderMSF();
                                        addFooter();
                                        specYPos = margin + headerHeight + 5;
                                        specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                                    }
                                    doc.text(wrappedText[i], startXpos + indentWidth, specYPos);
                                    specYPos += 4;
                                }
                            } else {
                                // Just render the number even if text is empty
                                doc.text(numberPrefix, startXpos, specYPos);
                                specYPos += 4;
                            }
                        });
                    } else if (element.tagName.toLowerCase() === 'ul') {
                        // Process unordered lists
                        const listItems = element.querySelectorAll('li');
                        listItems.forEach((li) => {
                            const text = li.textContent?.trim() || '';
                            
                            // Check if need new page before rendering item
                            if (specYPos + 8 > pageHeight - footerHeight - margin) {
                                doc.addPage();
                                addHeaderMSF();
                                addFooter();
                                specYPos = margin + headerHeight + 5;
                                specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                            }
                            
                            doc.setFontSize(8);
                            doc.setTextColor(0, 0, 0);
                            setFontSafe(doc, 'Futura', 'normal');
                            
                            // Bullet list item
                            const bulletPrefix = '• ';
                            const indentWidth = doc.getTextWidth(bulletPrefix);
                            
                            if (text) {
                                const wrappedText = doc.splitTextToSize(text, maxWidth - indentWidth);
                                
                                // First line with bullet
                                const firstLine = wrappedText[0] || '';
                                doc.text(bulletPrefix + firstLine, startXpos, specYPos);
                                specYPos += 4;
                                
                                // Continuation lines with indentation
                                for (let i = 1; i < wrappedText.length; i++) {
                                    if (specYPos + 4 > pageHeight - footerHeight - margin) {
                                        doc.addPage();
                                        addHeaderMSF();
                                        addFooter();
                                        specYPos = margin + headerHeight + 5;
                                        specEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                                    }
                                    doc.text(wrappedText[i], startXpos + indentWidth, specYPos);
                                    specYPos += 4;
                                }
                            } else {
                                // Just render the bullet even if text is empty
                                doc.text(bulletPrefix, startXpos, specYPos);
                                specYPos += 4;
                            }
                        });
                    } else if (element.tagName.toLowerCase() === 'div') {
                        // Always process children elements first to handle lists
                        Array.from(element.childNodes).forEach(child => processNodeToTextAdvanced(child));
                    } else if (element.tagName.toLowerCase() === 'br') {
                        specYPos += 1.5;
                    } else {
                        Array.from(element.childNodes).forEach(child => processNodeToTextAdvanced(child));
                    }
                }
            };
            
            Array.from(htmlDoc.body.childNodes).forEach(node => processNodeToTextAdvanced(node));
        } catch (error) {
            console.error('Error processing HTML content:', error);
        }
    };
    // Helper function untuk safely get image URL
    const getImageUrl = (imageData: any): string => {
        try {
            if (!imageData) return '';
            if (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('/'))) {
                return imageData;   
            }
            if (typeof imageData === 'object' && imageData.image_url) {
                return imageData.image_url;
            }
            if (typeof imageData === 'string') {
                const parsedImages = JSON.parse(imageData);
                if (Array.isArray(parsedImages) && parsedImages.length > 0 && parsedImages[0]?.image_url) {
                    return parsedImages[0].image_url;
                }
            }
            return '';
        } catch (error) {
            console.error('Error parsing image data:', error);
            return '';
        }
    };
    
    await loadCustomFonts(doc);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const headerHeight = 20;
    const footerHeight = 20;
    let yPos = margin + headerHeight - 7;

    const addFooter = () => {
        doc.setFillColor(0, 48, 97);
        doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
        const footerY = pageHeight - footerHeight;
        
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        setFontSafe(doc, 'Futura', 'bold');
        
        // Address section
        const pinIcon = '/pdf/pin.png';
        doc.addImage(pinIcon, 'PNG', margin, footerY + 4, 7, 7);
        doc.text('HEAD OFFICE', margin + 8, footerY + 6);
        setFontSafe(doc, 'Futura', 'normal');
        const address = 'Jl. Raya Cakung Cilincing, KM 35 Kav 532, RT.009/RW.08, Cakung Barat, Cakung,';
        doc.text(address, margin + 8, footerY + 10);
        doc.text('Jakarta Timur, Daerah Khusus Ibukota Jakarta, 13910', margin + 8, footerY + 14);
        
        // Contact info
        
        const webIcon = '/pdf/web.png';
        doc.addImage(webIcon, 'PNG', pageWidth - margin - 55, footerY + 7.2, 4, 4);
        doc.text('motorsights.com', pageWidth - margin - 50, footerY + 10);
        
        const phoneIcon = '/pdf/phone.png';
        doc.addImage(phoneIcon, 'PNG', pageWidth - margin - 25, footerY + 7.3, 4, 4);
        doc.text('(+62) 21-4585-9155', pageWidth - margin - 20, footerY + 10);
    };


    const addHeaderMSF = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        try {
            const iecLogo = '/inline-technology.png';
            doc.addImage(iecLogo, 'PNG', margin - 5, 4.5, 33, 14);
        } catch (error) {
            console.warn('IEC logo not found');
        }
        
        try {
            const msLogo = '/motor-sights-international-logo.png';
            doc.addImage(msLogo, 'PNG', pageWidth - margin - 20, 3, 24, 15);
        } catch (error) {
            console.warn('Motor Sights logo not found');
        }
        
        // Line separator
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(0, headerHeight, pageWidth, headerHeight);
    };

    const checkNewPage = (spaceNeeded: number = 20) => {
        if (yPos + spaceNeeded > pageHeight - footerHeight - margin) {
            doc.addPage();
            addHeaderMSF();
            addFooter();
            yPos = margin + headerHeight + 5;
            return true;
        }
        return false;
    };

    addHeaderMSF();
    addFooter();

    const boxWidth = (pageWidth - 2 * margin) * 0.5;
    doc.setFontSize(9);
    setFontSafe(doc, 'Futura', 'normal');

    const wilayahData = [
        [langField('region'), data.island_name]
    ];

    wilayahData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontByLanguage(doc, label, 'Futura', 'normal', language);
        doc.text(label, margin + boxWidth + 10, yPos);
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        doc.text(value, margin + boxWidth + 42, yPos);
    });
    
    const infoData = [
        [langField('quotationNumber'), data.manage_quotation_no],
        [langField('date'), formatDate(data.manage_quotation_date)],
        [langField('validUntil'), formatDate(data.manage_quotation_valid_date)],
    ];

    infoData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontByLanguage(doc, label, 'Futura', 'normal', language);
        doc.text(label, margin, yPos);
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        doc.text(value, margin + 35, yPos);
        yPos += 5;
    });
    
    yPos += 2;
    const boxStartY = yPos - 2;
    const boxRadius = 1;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 48, 97);
    setFontByLanguage(doc, langField('customerDetails'), 'Futura', 'bold', language);
    doc.text(langField('customerDetails'), margin + 5, yPos + 2);
    yPos += 9;
    
    const customersData = [
        [langField('companyName'), data?.customer_name || '-'],
        [langField('contactPerson'), data?.contact_person || '-'],
        [langField('phone'), data?.customer_phone || '-'],
        [langField('address'), data?.customer_address || '-'],
    ];

    const maxValueWidth = boxWidth - 42;
    
    customersData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontByLanguage(doc, label, 'Futura', 'normal', language);
        doc.text(label, margin + 5, yPos);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        
        // Split text if too long
        const splitValue = doc.splitTextToSize(value, maxValueWidth);
        doc.text(splitValue, margin + 37, yPos);
        yPos += splitValue.length * 5.3;
    });
    
    // rounded border for customer
    const boxHeight = yPos - boxStartY;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, boxStartY - 2.2, boxWidth, boxHeight, boxRadius, boxRadius);

    // DETAIL SALES (sebelah kanan customer)
    const salesBoxStartX = margin + boxWidth + 5;
    const salesBoxWidth = boxWidth - 5;
    let salesYPos = boxStartY + 5; 

    doc.setFontSize(10);
    doc.setTextColor(0, 48, 97);
    setFontByLanguage(doc, langField('salesDetails'), 'Futura', 'bold', language);
    doc.text(langField('salesDetails'), salesBoxStartX + 5, salesYPos);
    salesYPos += 7;
    
    const salesData = [
        [langField('name'), data.employee_name],
        [langField('phone'), data.employee_phone]
    ];

    const maxSalesValueWidth = salesBoxWidth - 42;
    
    salesData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontByLanguage(doc, label, 'Futura', 'normal', language);
        doc.text(label, salesBoxStartX + 5, salesYPos);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        const splitValue = doc.splitTextToSize(value, maxSalesValueWidth);
        doc.text(splitValue, salesBoxStartX + 37, salesYPos);
        salesYPos += splitValue.length * 5;
    });
    
    // rounded border for sales (same height as customer box)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(salesBoxStartX, boxStartY - 2.2, salesBoxWidth, boxHeight, boxRadius, boxRadius);

    yPos += 0;

    // Opening text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    setFontByLanguage(doc, langField('greetings'), 'Futura', 'normal', language);
    doc.text(langField('greetings'), margin, yPos + 4);
    yPos += 6;
    
    const openingText = langField('openingTextITI');
    const splitText = doc.splitTextToSize(openingText, pageWidth - 2 * margin);
    const lineHeight = 4.2;
    setFontByLanguage(doc, openingText, 'Futura', 'normal', language);
    doc.text(splitText, margin, yPos + 3, { lineHeightFactor: 1.3 });
    yPos += splitText.length * lineHeight + 4;

    checkNewPage(30);
    // TABEL ITEM QUOTATION
    const itemData = data.manage_quotation_items.map((spec, index) => [
        (index + 1).toString() + '.',
        spec.componen_product_name,
        spec.product_type || '-',
        formatCurrency(spec.price),
        spec.quantity.toString() || '-',
        formatCurrency(spec.total)
    ]);
    autoTable(doc, {
        startY: yPos,
        head: [[langField('tableHeaders_no'), langField('tableHeaders_typeModel'), langField('tableHeaders_typeITI'), langField('tableHeaders_priceITI'), langField('tableHeaders_qty'), langField('tableHeaders_total')]],
        body: itemData,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 9, 
            cellPadding: 2,
            font: language === 'zh' ? 'NotoSansSC' : 'OpenSans',
            fontStyle: 'normal',
            valign: 'middle',
            textColor: [0, 0, 0]
        },
        headStyles: { 
            fillColor: [228, 231, 236], 
            textColor: [0, 0, 0],
            font: language === 'zh' ? 'NotoSansSC' : 'OpenSans',
            fontStyle: 'bold',
            cellPadding: 3
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 'auto', halign: "center", valign: 'top' },
            1: { cellWidth: 60, textColor: [23, 26, 31], fontStyle: 'semibold' },
            2: { cellWidth: 'auto' }
        },
    });

    const tableStartY = yPos;
    yPos = doc.lastAutoTable?.finalY || yPos;
    yPos += 5;
    const tableHeight = yPos - tableStartY - 2.5;
    const tableWidth = pageWidth - 2 * margin;
    if(data.manage_quotation_items.length < 17) {
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.1);
        doc.roundedRect(margin, tableStartY, tableWidth, tableHeight, boxRadius, boxRadius);
    }

    // TERM & CONDITION & FINANCIAL SUMMARY (Side by Side)
    checkNewPage(80);
    
    const sectionY = yPos + 3;
    const termWidth = (pageWidth - 2 * margin) * 0.58;
    const financialStartX = margin + termWidth + 5.5;
    
    // Simpan halaman awal untuk Financial Summary
    const startPageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
    
    // Left side - Term & Condition (70%)
    let termYPos = sectionY;
    let termEndPage = startPageNumber;
    
    const maxTermWidth = termWidth;
    
    if (data.term_content_payload) {
        doc.setFontSize(12);
        doc.setTextColor(0, 48, 97);
        setFontByLanguage(doc, langField('termsConditions'), 'Futura', 'bold', language);
        doc.text(langField('termsConditions'), margin, termYPos + 3);
        termYPos += 9;

        processHtmlToTextAdvanced(data.term_content_payload, maxTermWidth, margin, termYPos);
        termYPos = specYPos;
        termEndPage = specEndPage;
    }
    
    // Kembali ke halaman awal untuk render Financial Summary
    doc.setPage(startPageNumber);
    
    // Right side - Financial Summary (30%)
    let financialYPos = sectionY;
    const grandTotalBoxWidth = (pageWidth - 2 * margin) * 0.4;
    financialYPos += 5;

    const subtotal = parseFloat(data.manage_quotation_grand_total) / (1 + parseFloat(data.manage_quotation_ppn) / 100);
    const ppnAmount = parseFloat(data.manage_quotation_grand_total) - subtotal;

    const financialData = [
        [langField('financial_subtotal'), formatCurrency(subtotal.toString())],
        [`${langField('financial_ppn')} (${data.manage_quotation_ppn}%):`, formatCurrency(ppnAmount.toString())],
        // ['Biaya Pengiriman:', formatCurrency(data.manage_quotation_delivery_fee)],
        // ['Lain-lain:', formatCurrency(data.manage_quotation_other)],
    ];
    autoTable(doc, {
        startY: financialYPos,
        body: financialData,
        margin: { left: financialStartX, right: margin },
        tableWidth: grandTotalBoxWidth,
        styles: {
            fontSize: 9,
            cellPadding: 1,
            font: 'OpenSans',
            fontStyle: 'normal'
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
            0: { 
                cellWidth: 35, 
                textColor: [0, 0, 0],
                font: 'Futura',
                fontStyle: 'normal',
                valign: 'top'
            },
            1: { 
                cellWidth: 'auto',
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            }
        },
        willDrawCell: (data) => {
            // Check if cell contains Chinese characters and apply appropriate font
            const cellText = data.cell.text?.join('') || '';
            if (language === 'zh' || cellText.match(/[\u4e00-\u9fff]/)) {
                const isFirstColumn = data.column.index === 0;
                const isBold = data.cell.styles.fontStyle === 'bold';
                try {
                    if (isFirstColumn) {
                        doc.setFont('NotoSansSC', 'normal');
                    } else if (isBold) {
                        doc.setFont('NotoSansSC', 'bold');
                    } else {
                        doc.setFont('NotoSansSC', 'normal');
                    }
                } catch (error) {
                    doc.setFont('helvetica', data.cell.styles.fontStyle || 'normal');
                }
            }
        }
    });

    // Update financialYPos setelah autoTable pertama
    financialYPos = doc.lastAutoTable?.finalY || financialYPos;
    financialYPos += 7;
    const summaryPrice = [
        [langField('financial_grandTotal'), formatCurrency(data.manage_quotation_grand_total)],
        [`${langField('financial_downPayment')} (${data.manage_quotation_payment_presentase}%):`, formatCurrency(data.manage_quotation_payment_nominal)],
        [langField('financial_remainingPayment'), formatCurrency(parseFloat(data.manage_quotation_grand_total) - parseFloat(data.manage_quotation_payment_nominal))],
    ];
    autoTable(doc, {
        startY: financialYPos,
        body: summaryPrice,
        margin: { left: financialStartX, right: margin },
        tableWidth: grandTotalBoxWidth,
        styles: {
            fontSize: 9,
            cellPadding: 1,
            font: 'OpenSans',
            fontStyle: 'normal'
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
            0: { 
                cellWidth: 35, 
                textColor: [0, 0, 0],
                font: 'Futura',
                fontStyle: 'normal',
                valign: 'top'
            },
            1: { 
                cellWidth: 'auto',
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            }
        },
        didParseCell: (data) => {
            if (data.row.index === 0 && data.column.index === 1) {
                data.cell.styles.fontSize = 10;
            }
            if (data.row.index === 1 && data.column.index === 1) {
                data.cell.styles.textColor = [34, 197, 94];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 10;
            }
            if (data.row.index === 2 && data.column.index === 1) {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 10;
            }
        },
        willDrawCell: (data) => {
            const cellText = data.cell.text?.join('') || '';
            if (language === 'zh' || cellText.match(/[\u4e00-\u9fff]/)) {
                const isFirstColumn = data.column.index === 0;
                const isBold = data.cell.styles.fontStyle === 'bold';
                try {
                    if (isFirstColumn) {
                        doc.setFont('NotoSansSC', 'normal');
                    } else if (isBold) {
                        doc.setFont('NotoSansSC', 'bold');
                    } else {
                        doc.setFont('NotoSansSC', 'normal');
                    }
                } catch (error) {
                    doc.setFont('helvetica', data.cell.styles.fontStyle || 'normal');
                }
            }
        }
    });

    // Simpan posisi akhir Financial Summary
    const financialEndYPos = doc.lastAutoTable?.finalY || financialYPos;
    doc.setPage(termEndPage);
    if (termEndPage === startPageNumber) {
        yPos = Math.max(termYPos + 10, financialEndYPos + 10);
    } else {
        yPos = termYPos + 10;
    }

    checkNewPage(50);
    
    const sectionStartY = yPos - 7;
    const shippingBoxWidth = (pageWidth - 2 * margin) * 0.5 - 2.5;
    const paymentBoxWidth = (pageWidth - 2 * margin) * 0.5 - 2.5;
    // const paymentBoxStartX = margin + shippingBoxWidth + 3;
    const paymentBoxStartX = margin;
    const infoBoxRadius = 1;
    
    const paymentBoxStartY = sectionStartY;
    let paymentYPos = paymentBoxStartY + 5;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 48, 97);
    setFontByLanguage(doc, langField('paymentInformation'), 'Futura', 'bold', language);
    doc.text(langField('paymentInformation'), paymentBoxStartX + 3, paymentYPos);
    paymentYPos += 7;

    // Data untuk payment table
    const paymentData = [
        [langField('recipientName'), data?.bank_account_name || '-'],
        [langField('bank'), data?.bank_account_bank_name || '-'],
        [langField('accountNumber'), data?.bank_account_number || '-']
    ];

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'Futura', 'normal');
    
    paymentData.forEach(([label, value]) => {
        doc.setTextColor(0, 0, 0);
        setFontByLanguage(doc, label, 'Futura', 'normal', language);
        doc.text(`${label}:`, paymentBoxStartX + 3, paymentYPos);
        
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        const maxValueWidth = paymentBoxWidth - 40;
        const splitValue = doc.splitTextToSize(value, maxValueWidth);
        doc.text(splitValue, paymentBoxStartX + 35, paymentYPos);
        paymentYPos += splitValue.length * 5;
    });
    
    // Draw rounded border for payment box
    const paymentBoxHeight = paymentYPos - paymentBoxStartY + 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.roundedRect(paymentBoxStartX, paymentBoxStartY - 2, paymentBoxWidth, paymentBoxHeight, infoBoxRadius, infoBoxRadius);
        
    // SIGNATURE SECTION - Sejajar dengan shippingData di sebelah kanan
    const signatureStartX = margin + shippingBoxWidth + 32;
    let signatureYPos = sectionStartY + 5;
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontByLanguage(doc, langField('respectfully'), 'Futura', 'normal', language);
    doc.text(langField('respectfully'), signatureStartX, signatureYPos);
    signatureYPos += 5;
    setFontByLanguage(doc, langField('companySignature'), 'Futura', 'normal', language);
    doc.text(langField('companySignature'), signatureStartX, signatureYPos);
    signatureYPos += 15;
    
    // Signature box
    const signatureBoxWidth = (pageWidth - 2 * margin) * 0.3;
    
    // Signature Box
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'OpenSans', 'semibold');
    
    // Nama dan Jabatan
    signatureYPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'OpenSans', 'semibold');
    doc.text('Oscar Feriady Hadi Saputra', signatureStartX + signatureBoxWidth / 2, signatureYPos + 22, { align: 'center' });
    
    signatureYPos += 25;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(signatureStartX, signatureYPos, signatureStartX + signatureBoxWidth, signatureYPos);

    signatureYPos += 5;
    doc.setFontSize(8);
    setFontSafe(doc, 'Futura', 'normal');
    doc.text(langField('jobTitle'), signatureStartX + signatureBoxWidth / 2, signatureYPos, { align: 'center' });
    
    // Update yPos berdasarkan yang paling bawah (payment atau signature)
    yPos = Math.max(paymentYPos + 10, signatureYPos + 10);
    
    // checkNewPage(60);
    
    yPos += 15;

    const specOrder = [
        // Regular specs
        "Unit Model",
        "GVW",
        "Wheelbase",
        "Max Torque",
        "Displacement",
        "Emission Standard",
        "Engine Guard",
        "Fuel Tank",
        "Tyre",
        "Gearbox Transmission",
        "Engine Brand Model",
        "Cargobox/Vessel",
        "Horse Power",
        // EV specs (OFF ROAD EV / ON ROAD EV)
        "Overall Length",
        "Wheelbase",
        "Curb Weight",
        "Gross Vehicle Weight (GVW)",
        "Rated Power / Torque",
        "Peak Power / Torque",
        "Battery Capacity",
        "Battery Protection",
        "Charging Ports",
        "Input Socket Power",
        "Frame",
        "Rear Axles",
        "Tires",
        "Structure Thickness",
        "Remarks"
    ];
    
    
    // Group items by product_type (max 2 items per page per group)
    const itemsWithContent = data.manage_quotation_items
        .map(item => item as any)
        .filter(item => 
            ((item.manage_quotation_item_specifications && item.manage_quotation_item_specifications.length > 0) ||
            (item.manage_quotation_item_accessories && item.manage_quotation_item_accessories.length > 0))
        );

    // Group items by product_type
    const groupedItems = itemsWithContent.reduce((groups: any, item: any) => {
        const productType = item.product_type || 'other';
        if (!groups[productType]) {
            groups[productType] = [];
        }
        groups[productType].push(item);
        return groups;
    }, {});

    if (Object.keys(groupedItems).length > 0) {
        // Add new page for specifications table
        doc.addPage();
        addHeaderMSF();
        addFooter();
        yPos = margin + headerHeight + 2;
        
        // Add specifications table header
        doc.setFontSize(14);
        doc.setTextColor(0, 48, 97);
        setFontByLanguage(doc, langField('productSpecificationsITI'), 'Futura', 'bold', language);
        doc.text(langField('productSpecificationsITI'), pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        
        // Prepare table data
        const tableData: any[] = [];
        
        Object.entries(groupedItems).forEach(([productType, items]: [string, any]) => {
            // Combine all items content in this product type group
            let groupContent = '';
            
            items.forEach((item: any, itemIndex: number) => {
                if (item.manage_quotation_item_specifications && item.manage_quotation_item_specifications.length > 0) {
                    // Add product name
                    if (itemIndex > 0) groupContent += '\n\n';
                    groupContent += `${item.componen_product_name}\n`;
                    groupContent += '─'.repeat(50) + '\n';
                    
                    // Add specifications
                    const filteredSpecs = item.manage_quotation_item_specifications
                        .map((spec: any) => ({
                            label: spec.manage_quotation_item_specification_label,
                            value: spec.manage_quotation_item_specification_value || '-'
                        }))
                        .filter((spec: any, index: number, self: any[]) => 
                            index === self.findIndex((s) => s.label === spec.label && s.value === spec.value)
                        )
                        .sort((a: any, b: any) => {
                            const indexA = specOrder.indexOf(a.label);
                            const indexB = specOrder.indexOf(b.label);
                            const orderA = indexA === -1 ? 999 : indexA;
                            const orderB = indexB === -1 ? 999 : indexB;
                            return orderA - orderB;
                        });
                    
                    filteredSpecs.forEach((spec: any) => {
                        // Convert HTML to plain text for table display using advanced parsing logic
                        const plainValue = convertHtmlToPlainText(spec.value);
                        groupContent += `• ${spec.label}: ${plainValue}\n`;
                    });
                }
            });
            
            if (groupContent.trim()) {
                tableData.push([
                    productType.toUpperCase() || 'OTHER',
                    groupContent.trim()
                ]);
            }
        });
        
        // Render specifications table with 2 columns
        if (tableData.length > 0) {
            autoTable(doc, {
                startY: yPos,
                head: [[langField('productType'), langField('specifications')]],
                body: tableData,
                margin: { left: margin, right: margin },
                tableWidth: pageWidth - 2 * margin,
                styles: {
                    fontSize: 9,
                    cellPadding: 2,
                    font: language === 'zh' ? 'NotoSansSC' : 'OpenSans',
                    fontStyle: 'normal',
                    valign: 'top',
                    textColor: [0, 0, 0],
                    lineColor: [200, 200, 200]
                },
                headStyles: {
                    fillColor: [228, 231, 236],
                    textColor: [0, 0, 0],
                    font: language === 'zh' ? 'NotoSansSC' : 'Futura',
                    fontStyle: 'bold',
                    cellPadding: 6,
                },
                alternateRowStyles: { 
                    fillColor: [248, 250, 252] 
                },
                columnStyles: {
                    0: { 
                        cellWidth: 40,
                        halign: 'center',
                        valign: 'middle',
                        textColor: [0, 48, 97],
                        fontStyle: 'bold'
                    },
                    1: { 
                        cellWidth: 'auto',
                        textColor: [23, 26, 31],
                        // lineHeight: 1.4
                    }
                },
                willDrawCell: (data) => {
                    // Check if cell contains Chinese characters and apply appropriate font
                    const cellText = data.cell.text?.join('') || '';
                    if (language === 'zh' || cellText.match(/[\u4e00-\u9fff]/)) {
                        const isFirstColumn = data.column.index === 0;
                        const isBold = data.cell.styles.fontStyle === 'bold';
                        try {
                            if (isFirstColumn) {
                                doc.setFont('NotoSansSC', 'bold');
                            } else if (isBold) {
                                doc.setFont('NotoSansSC', 'bold');
                            } else {
                                doc.setFont('NotoSansSC', 'normal');
                            }
                        } catch (error) {
                            doc.setFont('helvetica', data.cell.styles.fontStyle || 'normal');
                        }
                    }
                }
            });
            
            const tableStartY = yPos;
            yPos = doc.lastAutoTable?.finalY || yPos;
            yPos += 5;
            const tableHeight = yPos - tableStartY - 5;
            const tableWidth = pageWidth - 2 * margin;
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(margin, tableStartY, tableWidth, tableHeight, boxRadius, boxRadius);
        }
    }

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter();
    }
    

    const fileName = `Quotation_${data.manage_quotation_no.replace(/\//g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
};
