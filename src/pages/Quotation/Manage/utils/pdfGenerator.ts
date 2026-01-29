import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/helpers/generalHelper';
import { ManageQuotationDataPDF } from '../types/quotation';
import { loadCustomFonts, setFontSafe } from './fontLoader';

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

export const generateQuotationPDF = async (data: ManageQuotationDataPDF) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297]
    });
    
    // Helper function untuk safely get image URL
    const getImageUrl = (imageData: any): string => {
        try {
            if (!imageData) return '';
            
            // If it's already a direct URL
            if (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('/'))) {
                return imageData;
            }
            
            // If it's an object with image_url property
            if (typeof imageData === 'object' && imageData.image_url) {
                return imageData.image_url;
            }
            
            // If it's a JSON string that needs parsing
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
    
    // Load custom Futura fonts
    await loadCustomFonts(doc);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const headerHeight = 20;
    const footerHeight = 20;
    let yPos = margin + headerHeight - 7;

    // Function to add header to each page
    const addHeader = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        try {
            const iecLogo = '/logo-iec.png';
            doc.addImage(iecLogo, 'PNG', margin - 5, 2.5, 75, 15);
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

    const addHeaderIEL = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        try {
            const iecLogo = '/logo-iel.png';
            doc.addImage(iecLogo, 'PNG', margin - 5, 1, 33, 20);
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
            addHeader();
            addFooter();
            yPos = margin + headerHeight + 5;
            return true;
        }
        return false;
    };

    addHeader();
    addFooter();

    const boxWidth = (pageWidth - 2 * margin) * 0.5;
    doc.setFontSize(9);
    setFontSafe(doc, 'Futura', 'normal');

    const wilayahData = [
        ['Region :', data.island_name]
    ];

    wilayahData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text(label, margin + boxWidth + 10, yPos);
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        doc.text(value, margin + boxWidth + 42, yPos);
    });
    
    const infoData = [
        ['No Penawaran :', data.manage_quotation_no],
        ['Tanggal :', formatDate(data.manage_quotation_date)],
        ['Berlaku Hingga :', formatDate(data.manage_quotation_valid_date)],
    ];

    infoData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
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
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('Detail Pelanggan', margin + 5, yPos + 2);
    yPos += 9;
    
    const customersData = [
        ['Nama Perusahaan : ',data?.customer_name || '-'],
        ['Contact Person : ',data?.contact_person || '-'],
        ['Telepon : ',data?.customer_phone || '-'],
        ['Alamat : ',data?.customer_address || '-'],
    ];

    const maxValueWidth = boxWidth - 42;
    
    customersData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
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
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('Detail Sales', salesBoxStartX + 5, salesYPos);
    salesYPos += 7;
    
    const salesData = [
        ['Nama :', data.employee_name],
        ['Telepon :', data.employee_phone]
    ];

    const maxSalesValueWidth = salesBoxWidth - 42;
    
    salesData.forEach(([label, value]) => {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
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
    setFontSafe(doc, 'Futura', 'normal');
    doc.text('Dengan hormat,', margin, yPos + 4);
    yPos += 6;
    
    const openingText = 'Bersama ini PT Indonesia Equipment Centre, selaku Authorized dealer truk MOTOR SIGHTS di Indonesia, bermaksud memberikan penawaran kendaraan sebagai berikut :';
    const splitText = doc.splitTextToSize(openingText, pageWidth - 2 * margin);
    const lineHeight = 4.2;
    doc.text(splitText, margin, yPos + 3, { lineHeightFactor: 1.3 });
    yPos += splitText.length * lineHeight + 4;

    checkNewPage(30);
    // TABEL ITEM QUOTATION
    const itemData = data.manage_quotation_items.map((spec, index) => [
        (index + 1).toString() + '.',
        spec.componen_product_name,
        spec.componen_product_unit_model || '-',
        formatCurrency(spec.price),
        spec.quantity.toString() || '-',
        formatCurrency(spec.total)
    ]);
    autoTable(doc, {
        startY: yPos,
        head: [['No', 'Tipe Model', 'Model', 'Harga/Unit', 'Qty', 'Total']],
        body: itemData,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 9, 
            cellPadding: 2,
            font: 'OpenSans',
            fontStyle: 'normal',
            valign: 'middle',
            textColor: [0, 0, 0]
        },
        headStyles: { 
            fillColor: [228, 231, 236], 
            textColor: [0, 0, 0],
            font: 'Futura',
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
    
    if (data.term_content_payload) {
        doc.setFontSize(12);
        doc.setTextColor(0, 48, 97);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Syarat & Ketentuan', margin, termYPos + 3);
        termYPos += 9;

        // Parse HTML content
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data.term_content_payload, 'text/html');
        
        const maxTermWidth = termWidth;

        // Process all child nodes in order
        const processNode = (node: Node): void => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (text && text.length > 0) {
                    // Check if need new page before rendering text
                    if (termYPos + 5 > pageHeight - footerHeight - margin) {
                        doc.addPage();
                        addHeader();
                        addFooter();
                        termYPos = margin + headerHeight + 5;
                        termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                    }
                    
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    setFontSafe(doc, 'Futura', 'normal');
                    
                    const wrappedText = doc.splitTextToSize(text, maxTermWidth);
                    wrappedText.forEach((line: string) => {
                        if (termYPos + 5 > pageHeight - footerHeight - margin) {
                            doc.addPage();
                            addHeader();
                            addFooter();
                            termYPos = margin + headerHeight + 5;
                            termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                        }
                        doc.text(line, margin, termYPos);
                        termYPos += 5;
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                // Handle different HTML elements
                if (element.tagName.toLowerCase() === 'b' || 
                    element.tagName.toLowerCase() === 'u' || 
                    element.tagName.toLowerCase() === 'i') {
                    // Process bold/underline/italic headers
                    const text = element.textContent?.trim();
                    if (text) {
                        // Check if need new page before rendering header
                        if (termYPos + 8 > pageHeight - footerHeight - margin) {
                            doc.addPage();
                            addHeader();
                            addFooter();
                            termYPos = margin + headerHeight + 5;
                            termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                        }
                        
                        doc.setFontSize(10);
                        doc.setTextColor(0, 48, 97);
                        setFontSafe(doc, 'Futura', 'bold');
                        
                        const wrappedText = doc.splitTextToSize(text, maxTermWidth);
                        wrappedText.forEach((line: string) => {
                            if (termYPos + 5 > pageHeight - footerHeight - margin) {
                                doc.addPage();
                                addHeader();
                                addFooter();
                                termYPos = margin + headerHeight + 5;
                                termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                            }
                            doc.text(line, margin, termYPos);
                            termYPos += 5;
                        });
                        termYPos += 3; // Extra spacing after headers
                    }
                } else if (element.tagName.toLowerCase() === 'ol') {
                    // Process ordered lists
                    const listItems = element.querySelectorAll('li');
                    listItems.forEach((li, index) => {
                        const text = li.textContent?.trim();
                        if (text) {
                            // Check if need new page before rendering item
                            if (termYPos + 10 > pageHeight - footerHeight - margin) {
                                doc.addPage();
                                addHeader();
                                addFooter();
                                termYPos = margin + headerHeight + 5;
                                termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                            }
                            
                            doc.setFontSize(9);
                            doc.setTextColor(0, 0, 0);
                            setFontSafe(doc, 'Futura', 'normal');
                            
                            // Numbered list item
                            const numberPrefix = `${index + 1}. `;
                            const indentWidth = doc.getTextWidth(numberPrefix);
                            const wrappedText = doc.splitTextToSize(text, maxTermWidth - indentWidth);
                            
                            // First line with number
                            doc.text(numberPrefix + wrappedText[0], margin, termYPos);
                            termYPos += 5;
                            
                            // Continuation lines with indentation
                            for (let i = 1; i < wrappedText.length; i++) {
                                if (termYPos + 5 > pageHeight - footerHeight - margin) {
                                    doc.addPage();
                                    addHeader();
                                    addFooter();
                                    termYPos = margin + headerHeight + 5;
                                    termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                                }
                                doc.text(wrappedText[i], margin + indentWidth, termYPos);
                                termYPos += 5;
                            }
                        }
                    });
                } else if (element.tagName.toLowerCase() === 'div') {
                    // Process div content (but skip if it only contains lists or other processed elements)
                    const hasOnlyProcessableChildren = Array.from(element.children).every(child => 
                        ['ol', 'ul', 'b', 'u', 'i', 'br'].includes(child.tagName.toLowerCase())
                    );
                    
                    if (!hasOnlyProcessableChildren) {
                        const text = element.textContent?.trim();
                        if (text && text.length > 0) {
                            // Check for line breaks and treat as paragraphs
                            const parts = text.split(/\s*-\s*/);
                            
                            parts.forEach((part, index) => {
                                const trimmedPart = part.trim();
                                if (trimmedPart) {
                                    // Check if need new page
                                    if (termYPos + 5 > pageHeight - footerHeight - margin) {
                                        doc.addPage();
                                        addHeader();
                                        addFooter();
                                        termYPos = margin + headerHeight + 5;
                                        termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                                    }
                                    
                                    doc.setFontSize(9);
                                    doc.setTextColor(0, 0, 0);
                                    setFontSafe(doc, 'Futura', 'normal');
                                    
                                    // If it's a bullet point (not the first part), add bullet
                                    const textToRender = index > 0 && parts.length > 1 ? `• ${trimmedPart}` : trimmedPart;
                                    const wrappedText = doc.splitTextToSize(textToRender, maxTermWidth - (index > 0 ? 10 : 0));
                                    
                                    wrappedText.forEach((line: string) => {
                                        if (termYPos + 5 > pageHeight - footerHeight - margin) {
                                            doc.addPage();
                                            addHeader();
                                            addFooter();
                                            termYPos = margin + headerHeight + 5;
                                            termEndPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                                        }
                                        doc.text(line, margin + (index > 0 ? 10 : 0), termYPos);
                                        termYPos += 5;
                                    });
                                }
                            });
                        }
                    } else {
                        // Process children elements
                        Array.from(element.childNodes).forEach(child => processNode(child));
                    }
                } else if (element.tagName.toLowerCase() === 'br') {
                    termYPos += 3;
                }
            }
        };

        // Process all body content
        Array.from(htmlDoc.body.childNodes).forEach(node => processNode(node));
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
        ['Subtotal:', formatCurrency(subtotal.toString())],
        [`PPN (${data.manage_quotation_ppn}%):`, formatCurrency(ppnAmount.toString())],
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
    });

    // Update financialYPos setelah autoTable pertama
    financialYPos = doc.lastAutoTable?.finalY || financialYPos;
    financialYPos += 7;
    const summaryPrice = [
        ['TOTAL:', formatCurrency(data.manage_quotation_grand_total)],
        [`Down Payment (${data.manage_quotation_payment_presentase}%):`, formatCurrency(data.manage_quotation_payment_nominal)],
        ['Remaining Payment:', formatCurrency(parseFloat(data.manage_quotation_grand_total) - parseFloat(data.manage_quotation_payment_nominal))],
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
                // data.cell.styles.font = 'OpenSans';
                data.cell.styles.fontSize = 10;
            }
            if (data.row.index === 2 && data.column.index === 1) {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = 'bold';
                // data.cell.styles.font = 'OpenSans';
                data.cell.styles.fontSize = 10;
            }
        }
    });

    // Simpan posisi akhir Financial Summary
    const financialEndYPos = doc.lastAutoTable?.finalY || financialYPos;
    
    // Pindah ke halaman di mana Term & Condition selesai
    doc.setPage(termEndPage);
    
    // Gunakan posisi akhir dari Term & Condition atau Financial Summary (yang lebih bawah)
    // Jika masih di halaman yang sama dengan Financial Summary, pastikan tidak menimpa
    if (termEndPage === startPageNumber) {
        yPos = Math.max(termYPos + 10, financialEndYPos + 10);
    } else {
        yPos = termYPos + 10;
    }

    // SHIPPING & PAYMENT INFORMATION (Side by Side)
    checkNewPage(50);
    
    const sectionStartY = yPos - 7;
    const shippingBoxWidth = (pageWidth - 2 * margin) * 0.5 - 2.5;
    const paymentBoxWidth = (pageWidth - 2 * margin) * 0.5 - 2.5;
    // const paymentBoxStartX = margin + shippingBoxWidth + 3;
    const paymentBoxStartX = margin;
    const infoBoxRadius = 1;

    const shippingBoxStartY = sectionStartY;
    let shippingYPos = shippingBoxStartY + 5;
        
    doc.setFontSize(12);
    doc.setTextColor(0, 48, 97);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('Shipping Information', margin + 3, shippingYPos);
    shippingYPos += 7;

    const shippingData = [
        ['Shipping Term', data?.manage_quotation_shipping_term || '-'],
        ['Franco', data?.manage_quotation_franco || '-'],
        ['Lead Time', data?.manage_quotation_lead_time || '-']
    ];
        
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'Futura', 'normal');

    shippingData.forEach(([label, value]) => {
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text(`${label}:`, margin + 3, shippingYPos);
        
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'OpenSans', 'semibold');
        const maxValueWidth = shippingBoxWidth - 40;
        const splitValue = doc.splitTextToSize(value, maxValueWidth);
        doc.text(splitValue, margin + 35, shippingYPos);
        shippingYPos += splitValue.length * 5;
    });

        // Draw rounded border for shipping box
        const shippingBoxHeight = shippingYPos - shippingBoxStartY + 3;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, shippingBoxStartY - 2, shippingBoxWidth, shippingBoxHeight, infoBoxRadius, infoBoxRadius);
    // }

    // Right side - Payment Information (50%)
    // if (data.bank_account_name && data.bank_account_number && data.bank_account_bank_name) {
        const paymentBoxStartY = shippingYPos + 7;
        let paymentYPos = paymentBoxStartY + 5;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 48, 97);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Payment Information', paymentBoxStartX + 3, paymentYPos);
        paymentYPos += 7;

        // Data untuk payment table
        const paymentData = [
            ['Nama Penerima', data?.bank_account_name || '-'],
            ['Bank', data?.bank_account_bank_name || '-'],
            ['No. Rekening', data?.bank_account_number || '-']
        ];

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
        
        paymentData.forEach(([label, value]) => {
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
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
    // }
        
    // SIGNATURE SECTION - Sejajar dengan shippingData di sebelah kanan
    const signatureStartX = margin + shippingBoxWidth + 32;
    let signatureYPos = sectionStartY + 5;
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'Futura', 'normal');
    doc.text('Hormat Kami,', signatureStartX, signatureYPos);
    signatureYPos += 5;
    doc.text('PT Indonesia Equipment Centre', signatureStartX, signatureYPos);
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
    doc.text('Commercial Control Manager', signatureStartX + signatureBoxWidth / 2, signatureYPos, { align: 'center' });
    
    // Update yPos berdasarkan yang paling bawah (payment atau signature)
    yPos = Math.max(paymentYPos + 10, signatureYPos + 10);
    
    // checkNewPage(60);
    
    yPos += 15;

    const specOrder = [
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
        "Horse Power"
    ];
    
    
    // Group items into pages (max 2 items per page)
    const itemsWithContent = data.manage_quotation_items
        .map(item => item as any)
        .filter(item => 
            item.product_type === 'unit' && // Filter untuk unit products saja
            ((item.manage_quotation_item_specifications && item.manage_quotation_item_specifications.length > 0) ||
            (item.manage_quotation_item_accessories && item.manage_quotation_item_accessories.length > 0))
        );

    if (itemsWithContent.length > 0) {
        for (let i = 0; i < itemsWithContent.length; i += 2) {
            const item1 = itemsWithContent[i];
            const item2 = itemsWithContent[i + 1] || null;
            const hasOnlyOne = !item2;

            doc.addPage();
            addHeader();
            addFooter();
            yPos = margin + headerHeight + 5;

            // Calculate widths based on number of items
            const itemWidth = hasOnlyOne ? (pageWidth - 2 * margin) * 0.6 : (pageWidth - 2 * margin) * 0.5 - 2.5;
            const item1StartX = hasOnlyOne ? margin + (pageWidth - 2 * margin) * 0.2 : margin;
            const item2StartX = margin + itemWidth + 5;

            // Render first item
            let item1YPos = yPos;
            
            // Specifications for item 1
            if (item1.manage_quotation_item_specifications && item1.manage_quotation_item_specifications.length > 0) {
                setFontSafe(doc, 'Futura', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(52, 64, 84);
                
                // Add product image if available
                if (item1.images && item1.images.length > 0) {
                    const imageUrl = getImageUrl(item1.images[0]);
                    const imageUrl2 = getImageUrl(item1.images[1]);
                    let panjang = item1.images.length > 0 && item1.images.length < 2 ? true : false;
                    if (imageUrl) {
                        try {
                            let imageFormat = 'JPEG';
                            const imageSrc = imageUrl.toLowerCase();
                            if (imageSrc.includes('.png') || imageSrc.includes('image/png')) {
                                imageFormat = 'PNG';
                            } else if (imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('image/jpeg')) {
                                imageFormat = 'JPEG';
                            }
                            
                            let imageFormat2 = 'JPEG';
                            if (imageUrl2) {
                                const imageSrc2 = imageUrl2.toLowerCase();
                                if (imageSrc2.includes('.png') || imageSrc2.includes('image/png')) {
                                    imageFormat2 = 'PNG';
                                } else if (imageSrc2.includes('.jpg') || imageSrc2.includes('.jpeg') || imageSrc2.includes('image/jpeg')) {
                                    imageFormat2 = 'JPEG';
                                }
                            }
                            
                            if (panjang) {
                                doc.addImage(imageUrl, imageFormat, item1StartX + (itemWidth / 2) - 38, item1YPos - 10, 37, 50);
                                if (imageUrl2) {
                                    doc.addImage(imageUrl2, imageFormat2, item1StartX + (itemWidth / 2) + 2, item1YPos - 10, 37, 50);
                                }
                            } else {
                                doc.addImage(imageUrl, imageFormat, item1StartX + (itemWidth / 2) - 21, item1YPos - 10, 37, 50);
                            }
                            
                            item1YPos += 50;
                        } catch (error) {
                            console.warn('Failed to load product image for item 1:', error);
                        }
                    }
                }
                
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                setFontSafe(doc, 'Futura', 'normal');
                const productName1 = doc.splitTextToSize(item1.componen_product_name, itemWidth - 10);
                const limitedProductName1 = productName1.slice(0, 2);
                for (let i = 0; i < 2; i++) {
                    const line = limitedProductName1[i] || '';
                    doc.text(line, item1StartX + itemWidth / 2, item1YPos, { align: 'center' });
                    item1YPos += 4;
                }
                item1YPos += 3;

                
                setFontSafe(doc, 'Futura', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(23, 26, 31);
                doc.text(`Specifications`, item1StartX + margin + 2, item1YPos, { align: 'center' });
                item1YPos += 5;

                const specData1 = item1.manage_quotation_item_specifications
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
                    })
                    .map((spec: any) => [spec.label, spec.value]);

                const specTableStartY = item1YPos;
                autoTable(doc, {
                    startY: item1YPos,
                    body: specData1,
                    margin: { left: item1StartX, right: hasOnlyOne ? margin + (pageWidth - 2 * margin) * 0.2 : item2StartX - 5 },
                    tableWidth: itemWidth,
                    styles: { 
                        fontSize: 8, 
                        cellPadding: [1, 2],
                        font: 'Futura',
                        fontStyle: 'normal'
                    },
                    headStyles: { 
                        fillColor: [52, 152, 219], 
                        textColor: 255,
                        font: 'Futura',
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: { fillColor: [255, 255, 255] },
                    columnStyles: {
                        0: { cellWidth: itemWidth * 0.4, fontStyle: 'bold' },
                        1: { cellWidth: itemWidth * 0.6 }
                    },
                    didParseCell: (data) => {
                        // Set minimum height for Gearbox Transmission rows
                        if (data.cell.text && data.cell.text[0] === 'Gearbox Transmission') {
                            data.cell.styles.minCellHeight = 8;
                        }
                    }
                });

                item1YPos = doc.lastAutoTable?.finalY || item1YPos;
                
                // Add rounded border for specifications table
                const specTableHeight = item1YPos - specTableStartY + 10;
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.1);
                doc.roundedRect(item1StartX, specTableStartY - 10, itemWidth, specTableHeight, 2, 2);
                
                item1YPos += 7;
            }
            
            // Accessories for item 1
            if (item1.manage_quotation_item_accessories && item1.manage_quotation_item_accessories.length > 0) {
                setFontSafe(doc, 'Futura', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(23, 26, 31);
                doc.text(`Accessories`, item1StartX + margin, item1YPos, { align: 'center' });
                item1YPos += 5;

                const accData1 = item1.manage_quotation_item_accessories.map((acc: any, index: number) => [
                    (index + 1).toString() + '.',
                    acc.accessory_part_name,
                ]);

                const accTableStartY = item1YPos;
                autoTable(doc, {
                    startY: item1YPos,
                    body: accData1,
                    margin: { left: item1StartX + 1, right: hasOnlyOne ? margin + (pageWidth - 2 * margin) * 0.2 : item2StartX - 5 },
                    tableWidth: itemWidth,
                    styles: { 
                        fontSize: 8, 
                        cellPadding: [.5, 0],
                        valign: 'middle',
                        font: 'Futura',
                        fontStyle: 'normal'
                    },
                    alternateRowStyles: { fillColor: [255, 255, 255] },
                    columnStyles: {
                        0: { cellWidth: 5, halign: "center", valign: 'top' },
                    }
                });

                item1YPos = doc.lastAutoTable?.finalY || item1YPos;
                
                // Add rounded border for accessories table
                const accTableHeight = item1YPos - accTableStartY + 10;
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.1);
                doc.roundedRect(item1StartX, accTableStartY - 10, itemWidth, accTableHeight, 2, 2);
            }

            // Render second item (if exists)
            if (!hasOnlyOne && item2) {
                let item2YPos = yPos;
                
                // Specifications for item 2
                if (item2.manage_quotation_item_specifications && item2.manage_quotation_item_specifications.length > 0) {
                    setFontSafe(doc, 'Futura', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(52, 64, 84);
                    
                    // Add product image if available
                    if (item2.images && item2.images.length > 0) {
                        const imageUrl = getImageUrl(item2.images[0]);
                        const imageUrl2 = getImageUrl(item2.images[1]);
                        let panjang = item2.images.length > 0 && item2.images.length < 3 ? true : false;
                        console.log({panjang});
                        
                        if (imageUrl) {
                            try {
                                let imageFormat = 'JPEG';
                                const imageSrc = imageUrl.toLowerCase();
                                if (imageSrc.includes('.png') || imageSrc.includes('image/png')) {
                                    imageFormat = 'PNG';
                                } else if (imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('image/jpeg')) {
                                    imageFormat = 'JPEG';
                                }

                                let imageFormat2 = 'JPEG';
                                if (imageUrl2) {
                                    const imageSrc2 = imageUrl2.toLowerCase();
                                    if (imageSrc2.includes('.png') || imageSrc2.includes('image/png')) {
                                        imageFormat2 = 'PNG';
                                    } else if (imageSrc2.includes('.jpg') || imageSrc2.includes('.jpeg') || imageSrc2.includes('image/jpeg')) {
                                        imageFormat2 = 'JPEG';
                                    }
                                }
                                
                                if (panjang) {
                                    doc.addImage(imageUrl, imageFormat, item2StartX + (itemWidth / 2) - 38, item2YPos - 10, 37, 50);
                                    if (imageUrl2) {
                                        doc.addImage(imageUrl2, imageFormat2, item2StartX + (itemWidth / 2) + 2, item2YPos - 10, 37, 50);
                                    }
                                } else {
                                    doc.addImage(imageUrl, imageFormat, item2StartX + (itemWidth / 2) - 21, item2YPos - 10, 37, 50);
                                }
                                
                                // doc.addImage(imageUrl, imageFormat, item2StartX + (itemWidth / 2) - 21, item2YPos - 10, 37, 50);
                                item2YPos += 50;
                            } catch (error) {
                                console.warn('Failed to load product image for item 2:', error);
                            }
                        }
                    }
                    
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    setFontSafe(doc, 'Futura', 'normal');
                    const productName2 = doc.splitTextToSize(item2.componen_product_name, itemWidth - 10);
                    // Limit to maximum 2 lines
                    const limitedProductName2 = productName2.slice(0, 2);
                    // Always render exactly 2 lines for consistent height
                    for (let i = 0; i < 2; i++) {
                        const line = limitedProductName2[i] || '';
                        doc.text(line, item2StartX + itemWidth / 2, item2YPos, { align: 'center' });
                        item2YPos += 4;
                    }
                    item2YPos += 3;

                    
                    setFontSafe(doc, 'Futura', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(23, 26, 31);
                    doc.text(`Specifications`, item2StartX + margin + 2, item2YPos, { align: 'center' });
                    item2YPos += 5;

                    const specData2 = item2.manage_quotation_item_specifications
                        .map((spec: any) => ({
                            label: spec.manage_quotation_item_specification_label,
                            value: spec.manage_quotation_item_specification_value || '-'
                        }))
                        // Remove duplicate rows based on label+value combination
                        .filter((spec: any, index: number, self: any[]) => 
                            index === self.findIndex((s) => s.label === spec.label && s.value === spec.value)
                        )
                        .sort((a: any, b: any) => {
                            const indexA = specOrder.indexOf(a.label);
                            const indexB = specOrder.indexOf(b.label);
                            // If not in order list, put at the end
                            const orderA = indexA === -1 ? 999 : indexA;
                            const orderB = indexB === -1 ? 999 : indexB;
                            return orderA - orderB;
                        })
                        .map((spec: any) => [spec.label, spec.value]);

                    const specTableStartY2 = item2YPos;
                    autoTable(doc, {
                        startY: item2YPos,
                        body: specData2,
                        margin: { left: item2StartX, right: margin },
                        tableWidth: itemWidth,
                        styles: { 
                            fontSize: 8, 
                            cellPadding: [1, 2],
                            font: 'Futura',
                            fontStyle: 'normal'
                        },
                        headStyles: { 
                            fillColor: [52, 152, 219], 
                            textColor: 255,
                            font: 'Futura',
                            fontStyle: 'bold'
                        },
                        alternateRowStyles: { fillColor: [255, 255, 255] },
                        columnStyles: {
                            0: { cellWidth: itemWidth * 0.4, fontStyle: 'bold' },
                            1: { cellWidth: itemWidth * 0.6 }
                        },
                        didParseCell: (data) => {
                            // Set minimum height for Gearbox Transmission rows
                            if (data.cell.text && data.cell.text[0] === 'Gearbox Transmission') {
                                data.cell.styles.minCellHeight = 8;
                            }
                        }
                    });

                    item2YPos = doc.lastAutoTable?.finalY || item2YPos;
                    
                    // Add rounded border for specifications table
                    const specTableHeight2 = item2YPos - specTableStartY2 + 10;
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.1);
                    doc.roundedRect(item2StartX, specTableStartY2 - 10, itemWidth, specTableHeight2, 2, 2);
                    
                    item2YPos += 7;
                }

                // Accessories for item 2
                if (item2.manage_quotation_item_accessories && item2.manage_quotation_item_accessories.length > 0) {
                    // Draw separator line
                    // if (item2.manage_quotation_item_specifications && item2.manage_quotation_item_specifications.length > 0) {
                    //     doc.setDrawColor(200, 200, 200);
                    //     doc.setLineWidth(0.3);
                    //     doc.line(item2StartX, item2YPos - 3, item2StartX + itemWidth, item2YPos - 3);
                    //     item2YPos += 2;
                    // }
                    setFontSafe(doc, 'Futura', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(23, 26, 31);
                    doc.text(`Accessories`, item2StartX + margin, item2YPos, { align: 'center' });
                    item2YPos += 5;

                    const accData2 = item2.manage_quotation_item_accessories.map((acc: any, index: number) => [
                        (index + 1).toString() + '.',
                        acc.accessory_part_name || '-',
                    ]);

                    const accTableStartY2 = item2YPos;
                    autoTable(doc, {
                        startY: item2YPos,
                        body: accData2,
                        margin: { left: item2StartX, right: margin },
                        tableWidth: itemWidth,
                        styles: { 
                            fontSize: 8, 
                            cellPadding: [.5, 0],
                            valign: 'middle',
                            font: 'Futura',
                            fontStyle: 'normal'
                        },
                        alternateRowStyles: { fillColor: [255, 255, 255] },
                        columnStyles: {
                            0: { cellWidth: 5, halign: "center", valign: 'top' },
                        }
                    });

                    item2YPos = doc.lastAutoTable?.finalY || item2YPos;
                    
                    // Add rounded border for accessories table
                    const accTableHeight2 = item2YPos - accTableStartY2 + 10;
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.1);
                    doc.roundedRect(item2StartX, accTableStartY2 - 10, itemWidth, accTableHeight2, 2, 2);
                }
            }
            
        }
    }

    if(data.include_aftersales_page) {
        const hasOffRoadProduct = data.manage_quotation_items.some((item: any) => 
            item.componen_type && item.componen_type.toLowerCase().includes('off road')
        );
        
        const hasOnRoadProduct = data.manage_quotation_items.some((item: any) => 
            item.componen_type && item.componen_type.toLowerCase().includes('on road')
        );
        
        const headerProduct = (varYPos: number): number => {
            // Title
            doc.setFontSize(12);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Dukungan Produk Motor Sights', margin, varYPos);
            varYPos += 7;

            const descWidth = (pageWidth - 2 * margin) * 0.6;
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const descText = 'Motor Sights memberikan dukungan lengkap mulai dari pelatihan, garansi, servis, dan suku cadang untuk menjaga kelancaran operasional Anda setiap hari.';
            const splitDescText = doc.splitTextToSize(descText, descWidth);
            const lineHeight = 4.2;
            splitDescText.forEach((line: string) => {
                doc.text(line, margin, varYPos, { lineHeightFactor: 1.3 });
                varYPos += lineHeight;
            });
            
            return varYPos;
        }

        const bagianGratis = (varYPos: number, data: any[], jml: number): number => {
            // =================================
            // BAGIAN 1 - HEADER "GRATIS"
            // =================================
            
            const gratisWidth = (pageWidth - 2 * margin) * 0.7;
            doc.setFillColor(0, 48, 97);
            doc.roundedRect(margin, varYPos, gratisWidth, 9, 1, 1, 'F');
            
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('GRATIS', (margin + gratisWidth * 0.5), varYPos + 7 / 2 + 2, { align: 'center' });
            
            varYPos += 5;

            // =================================
            // BAGIAN 2 - 5 KOLOM GRATIS (CARD)
            // =================================
            const cardGap = 3;
            const cardHeight = 62;
            
            for (let i = 0; i < data.length; i++) {
                const cardWidth = (gratisWidth - ((jml - 1) * cardGap)) / jml;
                const cardX = margin + (i * (cardWidth + cardGap));
                const cardY = varYPos + 5;
                const card = data[i];
                
                doc.setDrawColor(228, 231, 236);
                doc.setLineWidth(0.3);
                doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 1, 1);
                
                const iconSize = 8;
                const iconX = cardX + (cardWidth / 2) - (iconSize / 2);
                const iconY = cardY + 3;
                
                try {
                    if (card.icon) {
                        doc.addImage(card.icon, 'PNG', iconX, iconY, iconSize, iconSize);
                    } else {
                        doc.setFillColor(220, 220, 220);
                        doc.circle(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 'F');
                    }
                } catch (error) {
                    doc.setFillColor(220, 220, 220);
                    doc.circle(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 'F');
                }
                
                let textY = iconY + iconSize + 5;
                doc.setFontSize(8);
                doc.setTextColor(23, 26, 31);
                setFontSafe(doc, 'Futura', 'bold');
                const titleLines = doc.splitTextToSize(card.title, cardWidth - 4);
                titleLines.forEach((line: string) => {
                    doc.text(line, cardX + cardWidth/2, textY, { align: 'center' });
                    textY += 4;
                });
                
                textY += 2;
                
                doc.setFontSize(6);
                doc.setTextColor(0, 0, 0);
                setFontSafe(doc, 'Futura', 'normal');
                card.items.forEach((item: string) => {
                    doc.text('•', cardX + 2, textY);
                    const itemLines = doc.splitTextToSize(item, cardWidth - 8);
                    itemLines.forEach((line: string) => {
                        doc.text(line, cardX + 5, textY);
                        textY += 3;
                    });
                });
                
                if (card.notes && card.notes.length > 0) {
                    textY += 1;
                    doc.setFontSize(5);
                    doc.setTextColor(100, 100, 100);
                    setFontSafe(doc, 'Futura', 'normal');
                    card.notes.forEach((note: string) => {
                        const noteLines = doc.splitTextToSize(note, cardWidth - 4);
                        noteLines.forEach((line: string) => {
                            doc.text(line, cardX + 2, textY);
                            textY += 2.5;
                        });
                    });
                }
            }
            
            return varYPos + cardHeight;
        }

        const bagianWarranty = (varYPos: number): number => {         
            // =================================
            // BAGIAN 3 - BOX KANAN "HIGH LEVEL WARRANTY COMPONENT"
            // =================================
            const gratisWidth = (pageWidth - 2 * margin) * 0.7;
            const cardHeight = 62;
            const warrantyWidth = (pageWidth - 2 * margin) * 0.3;
            const warrantyBoxHeightPt = cardHeight + 10;
            const warrantyBoxX = gratisWidth + margin + 5;
            const warrantyBoxY = varYPos - cardHeight - 10;
            
            doc.setFillColor(243, 244, 246);
            doc.roundedRect(warrantyBoxX, warrantyBoxY, warrantyWidth, warrantyBoxHeightPt, 2, 2, 'F');
            
            let warrantyY = warrantyBoxY + 6;
            doc.setFontSize(9);
            doc.setTextColor(23, 26, 31);
            setFontSafe(doc, 'Futura', 'bold');
            const warrantyTitle = doc.splitTextToSize('HIGH LEVEL WARRANTY COMPONENT', warrantyWidth - 8);
            warrantyTitle.forEach((line: string) => {
                doc.text(line, warrantyBoxX + warrantyWidth/2, warrantyY, { align: 'center' });
                warrantyY += 4;
            });
            
            const warrantyItems = [
                {
                    title: 'Engine',
                    icon: '/pdf/icon-engine.png'
                },
                {
                    title: 'Transmission',
                    icon: '/pdf/icon-transmission.png'
                },
                {
                    title: 'Chassis',
                    icon: '/pdf/icon-truck.png'
                },
                {
                    title: 'Electrical',
                    icon: '/pdf/icon-electric.png'
                },
            ];
            doc.setFontSize(8);
            doc.setTextColor(23, 26, 31);
            setFontSafe(doc, 'Futura', 'normal');
            
            warrantyItems.forEach(item => {
                const iconSize = 6;
                const iconX = warrantyBoxX + (warrantyWidth / 2) - (iconSize / 2);
                
                try {
                    if (item.icon) {
                        doc.addImage(item.icon, 'PNG', iconX, warrantyY, iconSize, iconSize);
                    } else {
                        doc.setFillColor(220, 220, 220);
                        doc.circle(iconX + iconSize/2, warrantyY + iconSize/2, iconSize/2, 'F');
                    }
                } catch (error) {
                    doc.setFillColor(220, 220, 220);
                    doc.circle(iconX + iconSize/2, warrantyY + iconSize/2, iconSize/2, 'F');
                }
                
                // Title below icon
                doc.setFontSize(9);
                doc.text(item.title, warrantyBoxX + warrantyWidth/2, warrantyY + iconSize + 3, { align: 'center' });
                warrantyY += 13;
            });
            
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            setFontSafe(doc, 'Futura', 'normal');
            const notesWaranty = doc.splitTextToSize('*Sampai dengan 2 tahun. Syarat dan ketentuan berlaku.', warrantyWidth - 8);
            notesWaranty.forEach((line: string) => {
                doc.text(line, warrantyBoxX + warrantyWidth/2, warrantyY, { align: 'center' });
                warrantyY += 4;
            });
            return varYPos;
        }
        const investWidth = (pageWidth - 2 * margin) * 0.5;
        const twoColCardHeightMM = 82;
        const twoColCardWidthPt = (investWidth * 0.5) - 2;
        const twoColCardHeightPt = twoColCardHeightMM;
        const bagianInvestasi = (varYPos: number, data: any[]): number => {
            // =================================
            // BAGIAN 4 - HEADER "DENGAN INVESTASI"
            // =================================
            
            let investY = varYPos;
            doc.setFillColor(228, 69, 120);
            doc.roundedRect(margin, investY, investWidth, 9, 1, 1, 'F');
            
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('DENGAN INVESTASI', (margin + investWidth * 0.5), investY + 6.2, { align: 'center' });
            
            investY += 10;

            // =================================
            // BAGIAN 5 - DUA KOLOM (50% : 50%)
            // =================================
            
            const leftCardX = margin;
            const rightCardX = margin + (investWidth * 0.5) + 1;

            for (let i = 0; i < 2; i++) {
                const cardX = i === 0 ? leftCardX : rightCardX;
                const item = data[i];
                
                // Card border
                doc.setDrawColor(228, 231, 236);
                doc.setLineWidth(0.3);
                doc.roundedRect(cardX, investY, twoColCardWidthPt, twoColCardHeightPt, 1, 1);
                
                let cardY = investY;
                
                // Icon - positioned at consistent height
                const iconSize = 8;
                const iconX = cardX + (twoColCardWidthPt / 2) - (iconSize / 2);
                const iconY = cardY + 3;
                
                try {
                    if (item.icon) {
                        doc.addImage(item.icon, 'PNG', iconX, iconY, iconSize, iconSize);
                    } else {
                        doc.setFillColor(220, 220, 220);
                        doc.circle(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 'F');
                    }
                } catch (error) {
                    doc.setFillColor(220, 220, 220);
                    doc.circle(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 'F');
                }
                
                // Title - positioned at consistent height after icon
                cardY = iconY + iconSize + 5;
                
                doc.setFontSize(9);
                doc.setTextColor(23, 26, 31);
                setFontSafe(doc, 'Futura', 'bold');
                const titleLines = doc.splitTextToSize(item.title, twoColCardWidthPt - 10);
                titleLines.forEach((line: string) => {
                    doc.text(line, cardX + twoColCardWidthPt/2, cardY, { align: 'center' });
                    cardY += 4;
                });
                
                // Reserve consistent space for title (max 2 lines)
                cardY = iconY + iconSize + 5 + (2 * 4) + 2;
                
                // Notes below title - regular weight
                if (item.notes && item.notes.length > 0) {
                    doc.setFontSize(7);
                    doc.setTextColor(23, 26, 31);
                    setFontSafe(doc, 'Futura', 'normal');
                    
                    item.notes.forEach((note: any) => {
                        const noteLines = doc.splitTextToSize(note, twoColCardWidthPt - 10);
                        noteLines.forEach((line: string) => {
                            doc.text(line, cardX + 5, cardY);
                            cardY += 3;
                        });
                    });
                }
                
                // Bold notes below regular notes - bold weight
                if (item.notesBold && item.notesBold.length > 0) {
                    doc.setFontSize(7);
                    doc.setTextColor(23, 26, 31);
                    setFontSafe(doc, 'Futura', 'bold');
                    
                    item.notesBold.forEach((boldNote: any) => {
                        const boldNoteLines = doc.splitTextToSize(boldNote, twoColCardWidthPt - 10);
                        boldNoteLines.forEach((line: string) => {
                            doc.text(line, cardX + 5, cardY);
                            cardY += 3;
                        });
                    });
                }
            }

            return investY;
        }
        const bagianDeskripsi = (varYpos: number, manfaat: any[], syarat: any[], notes: any[], offroad: boolean): number => {
            
            // =================================
            // BAGIAN 6 - IN-HOUSE WORKSHOP & SPARE PARTS
            // =================================
            const workshopBoxWidthPt = investWidth;
            const workshopBoxHeightPt = twoColCardHeightPt + 10;
            const workshopBoxX = investWidth + margin + 5;
            const workshopBoxY = varYpos;
            
            // Box border
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.3);
            doc.roundedRect(workshopBoxX, workshopBoxY, workshopBoxWidthPt, workshopBoxHeightPt, 1, 1);
            
            let workshopY = workshopBoxY + 8;
            
            // Title
            doc.setFontSize(10);
            doc.setTextColor(23, 26, 31);
            setFontSafe(doc, 'Futura', 'bold');
            if(offroad) {
                doc.text('VENDOR HELD STOCK', workshopBoxX + 5, workshopY);
                
                workshopY += 5;
                doc.setFontSize(7);
                doc.setTextColor(23, 26, 31);
                setFontSafe(doc, 'Futura', 'normal');
                const titleLines = doc.splitTextToSize('adalah sistem yang ditawarkan Motor Sights untuk memenuhi kebutuhan stok secara berkelanjutan sesuai dengan kesepakatan.*', workshopBoxWidthPt - 10);
                titleLines.forEach((line: string) => {
                    doc.text(line, workshopBoxX + 5, workshopY);
                    workshopY += 4;
                });
            } else {
                doc.text('IN-HOUSE WORKSHOP &', workshopBoxX + 5, workshopY);
                workshopY += 5;
                doc.text('SPARE PARTS OFF-ROAD', workshopBoxX + 5, workshopY);

                workshopY += 5;
                doc.setFontSize(7);
                doc.setTextColor(23, 26, 31);
                setFontSafe(doc, 'Futura', 'normal');
                const titleLines = doc.splitTextToSize('Program inovatif untuk menghadirkan pelayanan yang paripurna demi kelancaran operasi unit customer dengan banyak manfaat*', workshopBoxWidthPt - 10);
                titleLines.forEach((line: string) => {
                    doc.text(line, workshopBoxX + 5, workshopY);
                    workshopY += 4;
                });
            }
            workshopY += 2;
            
            // Manfaat subtitle
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Manfaat:', workshopBoxX + 5, workshopY);
            workshopY += 6;
            
            // Manfaat items
            doc.setFontSize(7);
            setFontSafe(doc, 'Futura', 'normal');
            
            manfaat.forEach(item => {
                doc.text('•', workshopBoxX + 5, workshopY);
                const itemLines = doc.splitTextToSize(item, workshopBoxWidthPt - 15);
                itemLines.forEach((line: string) => {
                    doc.text(line, workshopBoxX + 10, workshopY);
                    workshopY += 3;
                });
            });
            
            workshopY += 3;
            
            // Syarat subtitle
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Syarat:', workshopBoxX + 5, workshopY);
            workshopY += 4;
            
            // Syarat items
            doc.setFontSize(7);
            setFontSafe(doc, 'Futura', 'normal');
            
            syarat.forEach(item => {
                doc.text('•', workshopBoxX + 5, workshopY);
                const itemLines = doc.splitTextToSize(item, workshopBoxWidthPt - 15);
                itemLines.forEach((line: string) => {
                    doc.text(line, workshopBoxX + 10, workshopY);
                    workshopY += 3;
                });
            });
            
            workshopY += 3;
            // Syarat items
            doc.setFontSize(5);
            setFontSafe(doc, 'Futura', 'normal');
            
            notes.forEach(item => {
                const itemLines = doc.splitTextToSize(item, workshopBoxWidthPt - 10);
                itemLines.forEach((line: string) => {
                    doc.text(line, workshopBoxX + 5, workshopY);
                    workshopY += 2.5;
                });
            });

            // Footer note
            // doc.setFontSize(6);
            // setFontSafe(doc, 'Futura', 'normal');
            // const footerNote = '*Deposit sesuai stock spare part. Detail diskusi dengan team Spare Part.';
            // const noteLines = doc.splitTextToSize(footerNote, workshopBoxWidthPt - 10);
            // noteLines.forEach((line: string) => {
            //     doc.text(line, workshopBoxX + 5, workshopY);
            //     workshopY += 2.5;
            // });
            
            // =================================
            // END OF ON ROAD AFTERSALES PAGE
            // =================================
            return workshopY 
        }
        if (hasOnRoadProduct) {      
            doc.addPage();
            addHeaderIEL();
            addFooter();
            yPos = margin + headerHeight;

            yPos = headerProduct(yPos);
            yPos += 2;
            
            const gratisCards = [
                {
                    title: 'Paket Perawatan',
                    icon: '/pdf/maintenance-service.png',
                    items: [
                        'Termasuk Spare Part & Oli Mesin',
                        'Servis untuk PM 1 - PM 3 (5.000KM, 10.000KM, dan 20.000KM)'
                    ]
                },
                {
                    title: 'Pengiriman Spare Parts',
                    icon: '/pdf/pre-delivery-inspection.png',
                    items: [
                        '1x24 Jam (Pulau Jawa)',
                        '3x24 Jam (Luar Pulau Jawa)'
                    ]
                },
                {
                    title: 'Garansi Unit',
                    icon: '/pdf/warranty-service.png',
                    items: [
                        'Garansi 2 tahun atau 60.000 KM operasi**'
                    ],
                    notes: [
                        'Dilengkapi garansi hingga 2 tahun sejak tanggal BAST',
                        '**Mana yang tercapai terlebih dahulu, syarat & ketentuan berlaku'
                    ]
                },
                {
                    title: 'Pelatihan Pengemudi',
                    icon: '/pdf/training.png',
                    items: [
                        'Pelatihan 2 pengemudi/unit',
                        '5 hari pelatihan',
                        'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
                    ]
                },
                {
                    title: 'Pelatihan Mekanik',
                    icon: '/pdf/training-mechanic.png',
                    items: [
                        'Pelatihan mekanik',
                        '5 hari pelatihan',
                        'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
                    ]
                }
            ];
            yPos = bagianGratis(yPos, gratisCards, 5);
            yPos = bagianWarranty(yPos + 5);
            yPos += 3;
            const kontrakItems = [
                {
                    title: 'Kontrak Servis',
                    icon: '/pdf/on-call-service.png',
                    notes: [
                        'Stand-by mekanik gratis selama 3 bulan dengan minimal pembelian 10 unit. Setelah 3 bulan dapat melanjutkan dengan Kontrak Servis. Memiliki 3 pilihan paket:'
                    ],
                    notesBold : [
                        'Spare Part/Service/Service & Spare Part.'
                    ]
                },
                {
                    title: 'Mobile Service & Spare Part',
                    icon: '/pdf/icontruck.png',
                    notes: [
                        'Memastikan operasional tetap berjalan tanpa perlu kembali ke bengkel. Mencakup perawatan berkala, general repair, tyre service, hingga emergency roadside assistance (ERA).'
                    ]
                }
            ];
            yPos = bagianInvestasi(yPos, kontrakItems);
            
            const manfaatItems = [
                'Ketersediaan Teknisi (stand by mekanik)',
                'Jaminan ketersediaan suku cadang fast moving',
                'Tanpa biaya logistik',
                'Unit selalu siap bertugas',
                'Tanpa khawatir harus membeli stock sisa setelah masa kontrak berakhir'
            ];
            const syaratItems = [
                'Tanpa deposit untuk pembelian mulai dari 30 unit atau lebih.',
                'Pembelian 5-29 unit berlaku dengan deposit/Bank Guarantee sebesar stock yang disediakan.**',
                'Pelanggan menyediakan tempat penyimpanan barang & infrastruktur penunjang (listrik, internet rak, dll.), serta akomodasi manpower (mobilitas mess, & konsumsi).'
            ];
            const notesItems = [
                'Notes:',
                'Customer bisa menentukan apa saja barang yang akan di stock, 24 jam hari kerja.',
                '*Paket IHW dan layanan terkait tidak termasuk dalam harga pembelian unit.',
                '**Deposit menyesuaikan stock spare part yang disediakan. Detai akan didiskusikan bersama team Spare Part kami'
            ];
            yPos = bagianDeskripsi(yPos - 10, manfaatItems, syaratItems, notesItems, false);
            yPos += 5;
        }
        
        // Render OFF ROAD aftersales page if there's an off road product
        if (hasOffRoadProduct) {
            doc.addPage();
            addHeaderIEL();
            addFooter();
            yPos = margin + headerHeight;

            yPos = headerProduct(yPos);
            yPos += 2;
            const gratisCards = [
                {
                    title: 'Paket Perawatan',
                    icon: '/pdf/maintenance-service.png',
                    items: [
                        'Termasuk Spare Part & Oli Mesin',
                        'Servis untuk PM 1 - PM 3 (250, 500, 750 hour meter)'
                    ]
                },
                {
                    title: 'Garansi Unit',
                    icon: '/pdf/warranty-service.png',
                    items: [
                        'Garansi 1 tahun atau 6.000 jam operasi**'
                    ],
                    notes: [
                        'Dilengkapi garansi hingga 1 tahun sejak tanggal BAST',
                        '**Mana yang tercapai terlebih dahulu, syarat & ketentuan berlaku'
                    ]
                },
                {
                    title: 'Pelatihan Pengemudi',
                    icon: '/pdf/training.png',
                    items: [
                        'Pelatihan 2 pengemudi/unit',
                        '5 hari pelatihan',
                        'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
                    ]
                },
                {
                    title: 'Pelatihan Mekanik',
                    icon: '/pdf/training-mechanic.png',
                    items: [
                        'Pelatihan mekanik',
                        '5 hari pelatihan',
                        'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
                    ]
                }
            ];
            yPos = bagianGratis(yPos, gratisCards, 4);
            yPos = bagianWarranty(yPos + 5);
            yPos += 3;
            
            const kontrakItems = [
                {
                    title: 'Stand By Mechanic',
                    icon: '/pdf/training-mechanic.png',
                    notes: [
                        'Gratis stand by mechanic selama 3 bulan dengan pembelian minimal 10 unit. Support garansi dan OJT Mekanik.'
                    ]
                },
                {
                    title: 'KONSER (Kontrak Servis)',
                    icon: '/pdf/icontruck.png',
                    notes: [
                        'Setelah 3 bulan dapat melanjutkan dengan Kontrak Servis. Memiliki 3 pilihan paket:'
                    ],
                    notesBold : [
                        'Spare Part / Service / Service & Spare Part'
                    ]
                }
            ];
            yPos = bagianInvestasi(yPos, kontrakItems);
            
            const manfaatItems = [
                'Ketersediaan Teknisi (stand by mekanik).',
                'Jaminan ketersediaan suku cadang fast moving',
                'Tanpa biaya logistik',
                'Unit selalu siap bertugas',
                'Tanpa khawatir harus membeli stock sisa setelah masa kontrak berakhir'
            ];
            const syaratItems = [
                'Tanpa deposit untuk pembelian mulai dari 30 unit atau lebih.',
                'Pembelian 5-29 unit berlaku dengan deposit/Bank Guarantee sebesar stock yang disediakan.**',
                'Pelanggan menyediakan tempat penyimpanan barang & infrastruktur penunjang (listrik, internet rak, dll.), serta akomodasi manpower (mobilitas mess, & konsumsi).'
            ];
            const notesItems = [
                'Notes:',
                '*Paket VHS dan layanan terkait tidak termasuk dalam harga pembelian unit.',
                '**Deposit menyesuaikan stock spare part yang disediakan. Detai akan didiskusikan bersama team Spare Part kami'
            ];

            yPos = bagianDeskripsi(yPos - 10, manfaatItems, syaratItems, notesItems, true);
            yPos += 5;
        }
            
    }

    if(data.include_msf_page) {
        doc.addPage();
        addHeaderMSF();
        addFooter();
        
        yPos = margin + headerHeight;

        const headerProduct = (varYPos: number): number => {
            // Title
            doc.setFontSize(14);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Motor Sights Fleet', margin, varYPos);
            varYPos += 7;

            const descWidth = (pageWidth - 2 * margin) * 0.6;
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const descText = 'Motor Sights Fleet memberikan visibilitas menyeluruh terhadap pergerakan kendaraan, konsumsi bahan bakar, serta pelacakan pendapatan melalui perhitungan ritase. Dengan teknologi telematika yang terintegrasi penuh, perusahaan dapat mengelola operasional armada dengan tepat, efisien, dan memudahkan pengambilan keputusan berbasis data yang lebih baik.';
            const splitDescText = doc.splitTextToSize(descText, descWidth);
            const lineHeight = 4.2;
            splitDescText.forEach((line: string) => {
                doc.text(line, margin, varYPos, { lineHeightFactor: 1.3 });
                varYPos += lineHeight;
            });
            
            return varYPos;
        }

        const subscriptionTable = (varYPos: number): number => {
            // Add title above the border
            doc.setFontSize(10);
            doc.setTextColor(23, 26, 31);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Langganan Bulanan Perangkat Lunak MSF 1.0 (per Unit)', margin, varYPos);
            varYPos += 3;

            const subscriptionData = [
                {title:'Pelacakan Unit Kendaraan'},
                {title:'Pemantauan Konsumsi Bahan Bakar'},
                {title:'Perhitungan Revenue per Unit'}
            ];
            
            // Calculate table dimensions
            const tableWidth = pageWidth - 2 * margin;
            const tableStartY = varYPos;
            const rowHeight = 7;
            const titleHeight = 12;
            const totalTableHeight = titleHeight + subscriptionData.length * rowHeight;
            
            // Draw table border
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, tableStartY, tableWidth, totalTableHeight, 1, 1);
            
            varYPos += 6;
            
            // Add title inside the border
            doc.setFontSize(10);
            doc.setTextColor(23, 26, 31);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Paket Dasar', pageWidth / 2, varYPos + 1, { align: 'center' });
            varYPos += titleHeight - 4;
            
            // Render each subscription item with check icon
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            
            subscriptionData.forEach((item) => {
                const iconSize = 4;
                const iconX = pageWidth / 2.2 - 16;
                const iconY = varYPos - 3;
                
                try {
                    const checkIcon = '/pdf/check.png';
                    doc.addImage(checkIcon, 'PNG', iconX, iconY, iconSize, iconSize);
                } catch (error) {
                    doc.setDrawColor(0, 128, 0);
                    doc.setLineWidth(0.5);
                    doc.line(iconX, iconY + 2, iconX + 1.5, iconY + 3);
                    doc.line(iconX + 1.5, iconY + 3, iconX + 4, iconY);
                }
                
                // Center the text
                doc.text(item.title, iconX + 6, varYPos);
                varYPos += rowHeight - 2;
            });

            return varYPos + 3;
        }
        const dataTouch = (varYPos: number): number => {
            const dataTouchWidth = (pageWidth - 2 * margin) * 0.317;
            const gap = 5;
            
            // ENGLISH VERSION
            // const dataFleet = {
            //     headertitle: 'MOTOR SIGHTS FLEET 1.0 SUBSCRIPTION',
            //     icon: '/pdf/asset-tracking.png',
            //     title: 'Fleet & Asset Tracking',
            //     items: [
            //         {
            //             subtitle: 'Real-time GPS Tracking',
            //             content: 'Monitor vehicle positions in real time (live map view).'
            //         },
            //         {
            //             subtitle: 'Route History & Replay',
            //             content: 'Display travel history, including routes, speed, and stops.'
            //         },
            //         {
            //             subtitle: 'Geofencing & Alerts',
            //             content: 'Send notifications when vehicles enter or exit designated areas (e.g., pool, port, site).'
            //         },
            //         {
            //             subtitle: 'Vehicle Status',
            //             content: 'Online/offline, engine on/off, ignition.'
            //         },
            //         {
            //             subtitle: 'Fuel Consumption Monitoring',
            //             content: 'Calculate average liters per km or liters per hour.'
            //         },
            //         {
            //             subtitle: 'Fuel Tank Sensor & Refill/Drain Alerts',
            //             content: 'Detect refueling or draining activities.'
            //         },
            //         // {
            //         //     subtitle: 'Cost per KM',
            //         //     content: 'Monitor expense costs per kilometer to improve efficiency.'
            //         // },
            //         // {
            //         //     subtitle: 'Cost per Liter',
            //         //     content: 'See fuel consumption not only per KM/Liter, but also when units are idle, running, or in operation.'
            //         // }
            //     ]
            // };
            
            // const dataService = {
            //     headertitle: 'IMPLEMENTATION SERVICES',
            //     icon: '/pdf/installation.png',
            //     title: 'Telematics Installation',
            //     items: [
            //         {
            //             subtitle: 'CAN line tracing',
            //         },
            //         {
            //             subtitle: 'Telematics installation',
            //         },
            //         {
            //             subtitle: 'Software integration',
            //         }
            //     ]
            // };
            // const dataProduct = {
            //     headertitle: 'PRODUCT & DELIVERABLES DETAILS',
            //     icon: null,
            //     title: null,
            //     items: [
            //         {
            //             icon: '/pdf/telematic.png',
            //             title: 'Telematics',
            //             content: 'Motor Sights Fleet 150.'
            //         },
            //         {
            //             icon: '/pdf/module.png',
            //             title: 'eCAN Module',
            //             content: 'Harness for gathering data.'
            //         },
            //     ]
            // };


            // INDONESIAN VERSION
            const dataFleet = {
                headertitle: 'LANGGANAN MOTOR SIGHTS FLEET 1.0',
                icon: '/pdf/asset-tracking.png',
                title: 'Pelacakan Armada & Aset',
                items: [
                    {
                        subtitle: 'Pelacakan GPS Real-Time',
                        content: 'Memantau posisi kendaraan secara real-time melalui tampilan peta.'
                    },
                    {
                        subtitle: 'Riwayat Perjalanan & Putar Ulang Rute',
                        content: 'Menampilkan riwayat perjalanan kendaraan, termasuk rute yang dilalui, kecepatan, dan titik berhenti.'
                    },
                    {
                        subtitle: 'Pembatasan Wilayah & Notifikasi',
                        content: 'Memberikan notifikasi otomatis saat kendaraan masuk atau keluar dari area yang telah ditentukan.'
                    },
                    {
                        subtitle: 'Status Kendaraan',
                        content: 'Menampilkan status kendaraan secara real-time, meliputi perangkat online/offline, mesin hidup/mati, serta kondisi unit.'
                    },
                    {
                        subtitle: 'Perhitungan Revenue Unit',
                        content: 'Menghitung jumlah ritase setiap unit kendaraan secara otomatis guna memudahkan pemantauan produktivitas dan kinerja finansial armada.'
                    },
                    {
                        subtitle: 'Pemantauan Konsumsi Bahan Bakar',
                        content: 'Menghitung konsumsi bahan bakar rata-rata dalam satuan liter per kilometer, serta akumulasi konsumsi bahan bakar berdasarkan periode waktu harian, mingguan, atau bulanan.'
                    },
                    {
                        subtitle: 'Fuel/Refueling Sensor dan Aktivitas Bahan Bakar',
                        content: 'Mendeteksi aktivitas pengisian atau pengurasan bahan bakar melalui report dan juga grafik untuk mencegah kehilangan dan penyimpangan.'
                    },
                    // {
                    //     subtitle: 'Cost per Liter',
                    //     content: 'See fuel consumption not only per KM/Liter, but also when units are idle, running, or in operation.'
                    // }
                ]
            };
            
            const dataService = {
                headertitle: 'LAYANAN IMPLEMENTASI',
                icon: '/pdf/installation.png',
                title: 'Instalasi Hardware',
                items: [
                    {
                        subtitle: 'Penarikan jalur CAN',
                    },
                    {
                        subtitle: 'Pemasangan perangkat telematika',
                    },
                    {
                        subtitle: 'Integrasi dan konfigurasi perangkat lunak MSF 1.0',
                    }
                ]
            };
            
            const dataProduct = {
                headertitle: 'PRODUK & DETAIL YANG DIBERIKAN',
                icon: null,
                title: null,
                items: [
                    {
                        icon: '/pdf/telematic.png',
                        title: 'Perangkat Telematika MSF 150',
                        content: 'Perangkat telematika MSF 150 yang berfungsi untuk mengirimkan data lokasi dan informasi kendaraan secara real-time.'
                    },
                    {
                        icon: '/pdf/module.png',
                        title: 'Modul & Kabel eCAN',
                        content: 'Modul dan kabel harness untuk menghubungkan jalur CAN kendaraan dengan perangkat telematika, guna mengambil data kendaraan secara akurat.'
                    },
                    {
                        icon: '/pdf/module.png',
                        title: 'Software FMS 1.0',
                        content: 'Platform perangkat lunak berbasis web yang digunakan untuk memonitor, menganalisis, dan melaporkan data armada secara komprehensif.'
                    },
                ]
            };

            const allData = [dataFleet, dataService, dataProduct];
            
            // Render each column
            allData.forEach((data, index) => {
                const columnX = margin + (index * (dataTouchWidth + gap));
                let columnY = varYPos;
                const columnStartY = columnY; // Save starting Y position for border
                
                // Header with background
                doc.setFillColor(228, 231, 236);
                doc.roundedRect(columnX, columnY, dataTouchWidth, 12, 2, 2, 'F');
                
                // Header text
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                setFontSafe(doc, 'Futura', 'bold');
                const headerLines = doc.splitTextToSize(data.headertitle, dataTouchWidth - 8);
                headerLines.forEach((line: string, lineIndex: number) => {
                    doc.text(line, columnX + dataTouchWidth/2, columnY + 6 + (lineIndex * 3), { align: 'center' });
                });
                
                columnY += 17;
                const iconSize = 6;
                const iconX = columnX + 3;
                const iconY = columnY;
                if (data.icon && data.title) {
                    
                    try {
                        doc.addImage(data.icon, 'PNG', iconX, iconY, iconSize, iconSize);
                    } catch (error) {
                        doc.setFillColor(220, 220, 220);
                        doc.circle(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 'F');
                    }
                    
                    // Title next to icon
                    doc.setFontSize(10);
                    doc.setTextColor(23, 26, 31);
                    setFontSafe(doc, 'Futura', 'bold');
                    const titleLines = doc.splitTextToSize(data.title, dataTouchWidth - (iconSize + 7));
                    titleLines.forEach((line: string, lineIndex: number) => {
                        doc.text(line, iconX + iconSize + 3, columnY + 4 + (lineIndex * 4));
                    });
                    
                    columnY += 10 + (titleLines.length > 1 ? (titleLines.length - 1) * 4 : 0);
                }
                
                // Items content
                if (data.items) {
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0);
                    setFontSafe(doc, 'Futura', 'normal');
                    
                    data.items.forEach((item: any) => {
                        if (item.subtitle) {
                            // For dataFleet and dataService items
                            doc.setTextColor(23, 26, 31);
                            setFontSafe(doc, 'Futura', 'bold');
                            const subtitleLines = doc.splitTextToSize(item.subtitle, dataTouchWidth - 15);
                            subtitleLines.forEach((line: string) => {
                                doc.text(line, iconX + iconSize + 3, columnY);
                                columnY += 3;
                            });
                            
                            if (item.content) {
                                doc.setTextColor(0, 0, 0);
                                setFontSafe(doc, 'Futura', 'normal');
                                const contentLines = doc.splitTextToSize(item.content, dataTouchWidth - 15);
                                contentLines.forEach((line: string) => {
                                    doc.text(line, iconX + iconSize + 3, columnY);
                                    columnY += 3;
                                });
                            }
                            columnY += 2;
                        } else if (item.title) {
                            const iconSize = 5;
                            const iconY = columnY;
                            
                            doc.setFontSize(10);
                            doc.setTextColor(23, 26, 31);
                            if (item.icon) {
                                try {
                                    doc.addImage(item.icon, 'PNG', iconX, iconY, iconSize, iconSize);
                                } catch (error) {
                                    doc.setFillColor(220, 220, 220);
                                    doc.circle(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 'F');
                                }
                            }
                            
                            doc.setTextColor(23, 26, 31);
                            setFontSafe(doc, 'Futura', 'bold');
                            // doc.text(item.title, iconX + iconSize + 3, columnY + 3);
                            
                            
                            const titleLinesT = doc.splitTextToSize(item.title, dataTouchWidth - (iconSize + 7));
                            titleLinesT.forEach((line: string, lineIndex: number) => {
                                doc.text(line, iconX + iconSize + 3, columnY + 3 + (lineIndex * 4));
                            });
                            columnY += 4.5 + (titleLinesT.length > 1 ? (titleLinesT.length - 1) * 4 : 0)
                            // columnY += 7.5;
                            
                            if (item.content) {
                                doc.setFontSize(8);
                                doc.setTextColor(23, 26, 31);
                                setFontSafe(doc, 'Futura', 'normal');
                                const contentLines = doc.splitTextToSize(item.content, dataTouchWidth - 15);
                                contentLines.forEach((line: string) => {
                                    doc.text(line, iconX + iconSize + 3, columnY + 3);
                                    columnY += 3;
                                });
                            }
                            columnY += 5;
                        }
                    });
                }
                
                // Draw border around entire column
                const columnHeight = columnY - columnStartY ;
                doc.setDrawColor(228, 231, 236);
                doc.setLineWidth(0.3);
                doc.roundedRect(columnX, columnStartY, dataTouchWidth, columnHeight, 2, 2);
            });

            return varYPos + 120; // Adjust based on content height
        }
        
        yPos = headerProduct(yPos);
        yPos += 5;
        yPos = subscriptionTable(yPos);
        yPos += 2;
        yPos = dataTouch(yPos);
        yPos += 2;
    }

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter();
    }
    

    const fileName = `Quotation_${data.manage_quotation_no.replace(/\//g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
};
