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
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numValue);
};

export const generateQuotationPDF = async (data: ManageQuotationDataPDF) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297]
    });
    
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

    doc.setFontSize(9);
    setFontSafe(doc, 'Futura', 'normal');
    
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
    const boxWidth = (pageWidth - 2 * margin) * 0.5;
    const boxRadius = 1;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 48, 97);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('Detail Pelanggan', margin + 5, yPos + 2);
    yPos += 9;
    
    const customersData = [
        ['Nama Perusahaan : ',data.customer_name],
        ['Contact Person : ',data.contact_person],
        ['Telepon : ',data.customer_phone],
        ['Alamat : ',data.customer_address],
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
    doc.setDrawColor(228, 231, 236);
    doc.setLineWidth(0.1);
    doc.roundedRect(margin, tableStartY, tableWidth, tableHeight, boxRadius, boxRadius);

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
                            const parts = text.split(/\s*-\s*/); // Split on dash for bullet points
                            
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
                    termYPos += 3; // Add line break spacing
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
                data.cell.styles.fontSize = 11;
            }
            if (data.row.index === 1 && data.column.index === 1) {
                data.cell.styles.textColor = [34, 197, 94];
                data.cell.styles.fontStyle = 'bold';
                // data.cell.styles.font = 'OpenSans';
                data.cell.styles.fontSize = 11;
            }
            if (data.row.index === 2 && data.column.index === 1) {
                data.cell.styles.textColor = [220, 38, 38];
                data.cell.styles.fontStyle = 'bold';
                // data.cell.styles.font = 'OpenSans';
                data.cell.styles.fontSize = 11;
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
    const paymentBoxStartX = margin + shippingBoxWidth + 3;
    const infoBoxRadius = 1;

    // Left side - Shipping Information (50%)
    // if (data.manage_quotation_shipping_term || data.manage_quotation_franco || data.manage_quotation_lead_time) {
        const shippingBoxStartY = sectionStartY;
        let shippingYPos = shippingBoxStartY + 5;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 48, 97);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Shipping Information', margin + 3, shippingYPos);
        shippingYPos += 7;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        setFontSafe(doc, 'Futura', 'normal');
        
        // if (data.manage_quotation_shipping_term) {
            doc.text(`Shipping Term: ${data?.manage_quotation_shipping_term || '-'}`, margin + 4, shippingYPos);
            shippingYPos += 5;
        // }
        // if (data.manage_quotation_franco) {
            doc.text(`Franco: ${data?.manage_quotation_franco || '-'}`, margin + 4, shippingYPos);
            shippingYPos += 5;
        // }
        // if (data.manage_quotation_lead_time) {
            doc.text(`Lead Time: ${data?.manage_quotation_lead_time || '-'}`, margin + 4, shippingYPos);
            shippingYPos += 5;
        // }
        
        // Draw rounded border for shipping box
        const shippingBoxHeight = shippingYPos - shippingBoxStartY + 3;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, shippingBoxStartY - 2, shippingBoxWidth, shippingBoxHeight, infoBoxRadius, infoBoxRadius);
    // }

    // Right side - Payment Information (50%)
    // if (data.bank_account_name && data.bank_account_number && data.bank_account_bank_name) {
        const paymentBoxStartY = sectionStartY;
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
        
        yPos = sectionStartY + Math.max(40, 50); // set minimum height untuk section ini
        yPos += 5;

    // SIGNATURE SECTION
    checkNewPage(60);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'Futura', 'normal');
    doc.text('Hormat Kami,', margin, yPos);
    yPos += 5;
    doc.text('PT. Indonesia Equipment Centre', margin, yPos);
    yPos += 15;
    
    // Signature boxes - 2 columns
    const signatureBoxWidth = (pageWidth - 2 * margin) * 0.3;
    const signatureBox1StartX = margin;
    // const signatureBox2StartX = margin + signatureBoxWidth + 20;
    
    // Signature Box 1
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'OpenSans', 'semibold');
    
    // Area untuk tanda tangan (garis)
    
    // Nama dan Jabatan - Box 1
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    setFontSafe(doc, 'OpenSans', 'semibold');
    doc.text('Oscar Feriady Hadi Saputra', signatureBox1StartX + signatureBoxWidth / 2, yPos + 22, { align: 'center' });
    
    yPos += 25;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(signatureBox1StartX, yPos, signatureBox1StartX + signatureBoxWidth, yPos);

    yPos += 5;
    doc.setFontSize(8);
    setFontSafe(doc, 'Futura', 'normal');
    doc.text('Commercial Control Manager', signatureBox1StartX + signatureBoxWidth / 2, yPos, { align: 'center' });
    
    // Signature Box 2
    yPos -= 35;
    
    
    // // Nama dan Jabatan - Box 2
    // yPos += 5;
    // doc.setFontSize(9);
    // doc.setTextColor(0, 0, 0);
    // setFontSafe(doc, 'OpenSans', 'semibold');
    // doc.text('(Nama)', signatureBox2StartX + signatureBoxWidth / 2, yPos + 22, { align: 'center' });

    // // Area untuk tanda tangan (garis)
    // yPos += 25;
    // doc.setDrawColor(0, 0, 0);
    // doc.setLineWidth(0.3);
    // doc.line(signatureBox2StartX, yPos, signatureBox2StartX + signatureBoxWidth, yPos);


    // yPos += 5;
    // doc.setFontSize(8);
    // setFontSafe(doc, 'Futura', 'normal');
    // doc.text('Jabatan', signatureBox2StartX + signatureBoxWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    // SPECIFICATIONS & ACCESSORIES (After Signature - New Pages)
    // Define specification order once (outside loop to avoid duplication)
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
    
    // Define specifications that need special line height handling
    // const multiLineSpecs = {
    //     "Gearbox Transmission": 3  // 3 lines for better alignment
    // };
    
    // Group items into pages (max 2 items per page)
    const itemsWithContent = data.manage_quotation_items
        .map(item => item as any)
        .filter(item => 
            (item.manage_quotation_item_specifications && item.manage_quotation_item_specifications.length > 0) ||
            (item.manage_quotation_item_accessories && item.manage_quotation_item_accessories.length > 0)
        );

    if (itemsWithContent.length > 0) {
        for (let i = 0; i < itemsWithContent.length; i += 2) {
            const item1 = itemsWithContent[i];
            const item2 = itemsWithContent[i + 1];
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
                if (item1.cp_image) {
                    try {
                        let imageFormat = 'JPEG'; // default
                        const imageSrc = item1.cp_image.toLowerCase();
                        if (imageSrc.includes('.png') || imageSrc.includes('image/png')) {
                            imageFormat = 'PNG';
                        } else if (imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('image/jpeg')) {
                            imageFormat = 'JPEG';
                        }
                        doc.addImage(item1.cp_image, imageFormat, item1StartX + (itemWidth / 2) - 15, item1YPos - 10, 40, 50);
                        item1YPos += 50;
                    } catch (error) {
                        console.warn('Failed to load product image for item 1:', error);
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
                doc.setTextColor(0, 48, 97);
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
                        cellPadding: 2,
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
                            data.cell.styles.minCellHeight = 12; // 3 lines * 4mm spacing
                        }
                    }
                });

                item1YPos = doc.lastAutoTable?.finalY || item1YPos;
                
                // Add rounded border for specifications table
                const specTableHeight = item1YPos - specTableStartY + 10;
                doc.setDrawColor(228, 231, 236);
                doc.setLineWidth(0.1);
                doc.roundedRect(item1StartX, specTableStartY - 10, itemWidth, specTableHeight, 2, 2);
                
                item1YPos += 7;
            }

            // Accessories for item 1
            if (item1.manage_quotation_item_accessories && item1.manage_quotation_item_accessories.length > 0) {
                // Draw separator line
                // if (item1.manage_quotation_item_specifications && item1.manage_quotation_item_specifications.length > 0) {
                //     doc.setDrawColor(200, 200, 200);
                //     doc.setLineWidth(0.3);
                //     doc.line(item1StartX, item1YPos - 3, item1StartX + itemWidth, item1YPos - 3);
                //     item1YPos += 2;
                // }
                setFontSafe(doc, 'Futura', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(0, 48, 97);
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
                        fontSize: 9, 
                        cellPadding: [.5, 0],
                        textColor: [0, 48, 97],
                        valign: 'middle',
                        font: 'OpenSans',
                        fontStyle: 'normal'
                    },
                    alternateRowStyles: { fillColor: [255, 255, 255] },
                    columnStyles: {
                        0: { cellWidth: 5, halign: "center", valign: 'top' },
                        1: { textColor: [23, 26, 31], fontStyle: 'semibold' },
                    }
                });

                item1YPos = doc.lastAutoTable?.finalY || item1YPos;
                
                // Add rounded border for accessories table
                const accTableHeight = item1YPos - accTableStartY + 10;
                doc.setDrawColor(228, 231, 236);
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
                    if (item2.cp_image) {
                        try {
                            let imageFormat = 'JPEG'; // default
                            const imageSrc = item2.cp_image.toLowerCase();
                            if (imageSrc.includes('.png') || imageSrc.includes('image/png')) {
                                imageFormat = 'PNG';
                            } else if (imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('image/jpeg')) {
                                imageFormat = 'JPEG';
                            }
                            doc.addImage(item2.cp_image, imageFormat, item2StartX + (itemWidth / 2) - 15, item2YPos - 10, 40, 50);
                            item2YPos += 50;
                        } catch (error) {
                            console.warn('Failed to load product image for item 2:', error);
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
                        const line = limitedProductName2[i] || ''; // Use empty string if no line available
                        doc.text(line, item2StartX + itemWidth / 2, item2YPos, { align: 'center' });
                        item2YPos += 4;
                    }
                    item2YPos += 3;

                    
                    setFontSafe(doc, 'Futura', 'bold');
                    doc.setFontSize(10);
                    doc.setTextColor(0, 48, 97);
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
                            cellPadding: 2,
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
                                data.cell.styles.minCellHeight = 12; // 3 lines * 4mm spacing
                            }
                        }
                    });

                    item2YPos = doc.lastAutoTable?.finalY || item2YPos;
                    
                    // Add rounded border for specifications table
                    const specTableHeight2 = item2YPos - specTableStartY2 + 10;
                    doc.setDrawColor(228, 231, 236);
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
                    doc.setTextColor(0, 48, 97);
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
                            fontSize: 9, 
                            cellPadding: [.5, 0],
                            textColor: [0, 48, 97],
                            valign: 'middle',
                            font: 'OpenSans',
                            fontStyle: 'normal'
                        },
                        alternateRowStyles: { fillColor: [255, 255, 255] },
                        columnStyles: {
                            0: { cellWidth: 5, halign: "center", valign: 'top' },
                            1: { textColor: [23, 26, 31], fontStyle: 'semibold' },
                        }
                    });

                    item2YPos = doc.lastAutoTable?.finalY || item2YPos;
                    
                    // Add rounded border for accessories table
                    const accTableHeight2 = item2YPos - accTableStartY2 + 10;
                    doc.setDrawColor(228, 231, 236);
                    doc.setLineWidth(0.1);
                    doc.roundedRect(item2StartX, accTableStartY2 - 10, itemWidth, accTableHeight2, 2, 2);
                }
            }
        }
    }

    if(data.include_aftersales_page) {
        // Check if any product has "off road" in product_type
        const hasOffRoadProduct = data.manage_quotation_items.some((item: any) => 
            item.product_type && item.product_type.toLowerCase().includes('off road')
        );
        
        // Check if any product has "on road" in product_type
        const hasOnRoadProduct = data.manage_quotation_items.some((item: any) => 
            item.product_type && item.product_type.toLowerCase().includes('on road')
        );
        
        // Render ON ROAD aftersales page if there's an on road product
        if (hasOnRoadProduct) {
            
            doc.addPage();
            addHeaderIEL();
            addFooter();
            yPos = margin + headerHeight;

            // Title
            doc.setFontSize(14);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Dukungan Produk Motor Sights', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Description text (70% width)
            const descWidth = (pageWidth - 2 * margin) * 0.7;
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const descText = 'Motor Sights memberikan dukungan lengkap mulai dari pelatihan, garansi, servis, dan suku cadang untuk menjaga kelancaran operasional Anda setiap hari.';
            const splitDescText = doc.splitTextToSize(descText, descWidth);
            splitDescText.forEach((line: string) => {
                doc.text(line, pageWidth / 2, yPos, { align: 'center' });
                yPos += 5;
            });
            yPos += 5;

            // Box settings
            const boxWidth = (pageWidth - 2 * margin - 10) / 3; // 3 boxes with 5mm gap each
            const box1StartX = margin;
            const box2StartX = margin + boxWidth + 5;
            const box3StartX = margin + 2 * (boxWidth + 5);
            const boxStartY = yPos;
            const boxPadding = 5;

            // BOX 1 - Paket Perawatan Gratis
            let box1YPos = boxStartY + boxPadding + 3;
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Paket Perawatan Gratis', box1StartX + boxPadding, box1YPos);
            box1YPos += 7;

            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const box1Content = '(TERMASUK SPARE PART DAN OLI MESIN)\nServis untuk PM 1 - PM 3 (5.000KM, 10.000KM, dan 20.000KM)';
            const splitBox1 = doc.splitTextToSize(box1Content, boxWidth - 2 * boxPadding);
            splitBox1.forEach((line: string) => {
                doc.text(line, box1StartX + boxPadding, box1YPos);
                box1YPos += 4;
            });

            const box1Height = box1YPos - boxStartY + boxPadding;

            // BOX 2 - Gratis Pengiriman Spare
            let box2YPos = boxStartY + boxPadding + 3;
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Pengiriman Spare Parts', box2StartX + boxPadding, box2YPos);
            box2YPos += 7;

            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            
            // List items for Box 2
            const box2Items = [
                '1x24 Jam (Pulau Jawa)',
                '3x24 Jam (Luar Pulau Jawa)'
            ];
            
            box2Items.forEach((item, index) => {
                const numberPrefix = `${index + 1}. `;
                doc.text(numberPrefix, box2StartX + boxPadding, box2YPos);
                const itemText = doc.splitTextToSize(item, boxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string, lineIndex: number) => {
                    if (lineIndex === 0) {
                        doc.text(line, box2StartX + boxPadding + 5, box2YPos);
                    } else {
                        doc.text(line, box2StartX + boxPadding + 5, box2YPos);
                    }
                    box2YPos += 4;
                });
            });

            const box2Height = box2YPos - boxStartY + boxPadding;

            // BOX 3 - Garansi Unit
            let box3YPos = boxStartY + boxPadding + 3;
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Garansi Unit', box3StartX + boxPadding, box3YPos);
            box3YPos += 5;

            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const box3Content = 'Garansi 2 tahun atau 60.000 KM operasi**\nDilengkapi garansi hingga 1 tahun sejak tanggal BAST\n\n';
            const splitBox3 = doc.splitTextToSize(box3Content, boxWidth - 2 * boxPadding);
            splitBox3.forEach((line: string) => {
                doc.text(line, box3StartX + boxPadding, box3YPos);
                box3YPos += 4;
            });

            doc.setFontSize(7);
            setFontSafe(doc, 'Futura', 'normal');
            const Box3Note = '**Mana yang tercapai terlebih dahulu, syarat & ketentuan berlaku';
            const splitBox3Note = doc.splitTextToSize(Box3Note, boxWidth - 2 * boxPadding);
            splitBox3Note.forEach((line: string) => {
                doc.text(line, box3StartX + boxPadding, box3YPos - 4);
                box3YPos += 3.5;
            });

            const box3Height = box3YPos - boxStartY - 3;

            // Draw rounded borders for all boxes (use max height for uniform appearance)
            const maxBoxHeight = Math.max(box1Height, box2Height, box3Height);
            
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(box1StartX, boxStartY, boxWidth, maxBoxHeight, 2, 2);
            doc.roundedRect(box2StartX, boxStartY, boxWidth, maxBoxHeight, 2, 2);
            doc.roundedRect(box3StartX, boxStartY, boxWidth, maxBoxHeight, 2, 2);

            // SECOND ROW - 2 columns with 2 boxes each
            let secondRowYPos = boxStartY + maxBoxHeight + 10;
            const leftColStartX = box1StartX;
            const colBoxWidth = boxWidth;

            // LEFT COLUMN - GRATIS
            // Box 1: Pelatihan Pengemudi
            let leftBox1YPos = secondRowYPos;
            const leftBox1StartY = secondRowYPos - boxPadding;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('GRATIS', leftColStartX + boxPadding, leftBox1YPos);
            leftBox1YPos += 6;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Pelatihan Pengemudi', leftColStartX + boxPadding, leftBox1YPos);
            leftBox1YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const driverTrainingItems = [
                'Pelatihan 2 pengemudi/unit',
                '5 hari pelatihan',
                'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
            ];
            
            driverTrainingItems.forEach(item => {
                doc.text('•', leftColStartX + boxPadding, leftBox1YPos);
                const itemText = doc.splitTextToSize(item, colBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, leftColStartX + boxPadding + 5, leftBox1YPos);
                    leftBox1YPos += 4;
                });
            });
            
            const leftBox1Height = leftBox1YPos - leftBox1StartY ;
            
            // Box 2: Pelatihan Mekanik
            const leftBox2StartY = leftBox1StartY + leftBox1Height;
            let leftBox2YPos = leftBox2StartY + boxPadding;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Pelatihan Mekanik', leftColStartX + boxPadding, leftBox2YPos);
            leftBox2YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const mechanicTrainingItems = [
                'Pelatihan mekanik',
                '5 hari pelatihan',
                'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
            ];
            
            mechanicTrainingItems.forEach(item => {
                doc.text('•', leftColStartX + boxPadding, leftBox2YPos);
                const itemText = doc.splitTextToSize(item, colBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, leftColStartX + boxPadding + 5, leftBox2YPos);
                    leftBox2YPos += 4;
                });
            });
            
            const leftBox2Height = leftBox2YPos - leftBox2StartY + boxPadding;

            // LEFT COLUMN - DENGAN INVESTASI
            // Box 1: Kontrak Servis
            let rightBox1YPos = leftBox2YPos + boxPadding + 10;
            const rightBox1StartY = leftBox2StartY + leftBox2Height + 5;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('DENGAN INVESTASI', leftColStartX + boxPadding, rightBox1YPos);
            rightBox1YPos += 6;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Kontrak Servis', leftColStartX + boxPadding, rightBox1YPos);
            rightBox1YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const contractText1 = 'Stand-by mekanik gratis selama 3 bulan dengan minimal pembelian 10 unit. Setelah 3 bulan dapat melanjutkan dengan Kontrak Servis. Memiliki 3 pilihan paket: ';
            const splitContract1 = doc.splitTextToSize(contractText1, colBoxWidth - 2 * boxPadding);
            splitContract1.forEach((line: string) => {
                doc.text(line, leftColStartX + boxPadding, rightBox1YPos);
                rightBox1YPos += 4;
            });
            
            // Bold text for packages
            setFontSafe(doc, 'Futura', 'bold');
            const packagesText = 'Spare Part / Service / Service & Spare Part.';
            const splitPackages = doc.splitTextToSize(packagesText, colBoxWidth - 2 * boxPadding);
            splitPackages.forEach((line: string) => {
                doc.text(line, leftColStartX + boxPadding, rightBox1YPos);
                rightBox1YPos += 4;
            });
            
            const rightBox1Height = rightBox1YPos - rightBox1StartY;
            
            // Box 2: Stand By Mechanic
            const rightBox2StartY = rightBox1StartY + rightBox1Height + 5;
            let rightBox2YPos = rightBox2StartY - 3;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Mobile Service & Spare Part', leftColStartX + boxPadding, rightBox2YPos + 2);
            rightBox2YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const standbyText = 'Memastikan operasional tetap berjalan tanpa perlu kembali ke bengkel. Mencakup perawatan berkala, general repair, tyre service, hingga emergency roadside assistance (ERA).';
            const splitStandby = doc.splitTextToSize(standbyText, colBoxWidth - 2 * boxPadding);
            splitStandby.forEach((line: string) => {
                doc.text(line, leftColStartX + boxPadding, rightBox2YPos);
                rightBox2YPos += 4;
            });
            
            const rightBox2Height = rightBox2YPos - rightBox2StartY + boxPadding;

            // Draw borders for all boxes in second row
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(leftColStartX, leftBox1StartY, colBoxWidth, leftBox1Height + leftBox2Height , 2, 2);
            doc.roundedRect(leftColStartX, rightBox1StartY, colBoxWidth, rightBox1Height + rightBox2Height, 2, 2);
            
            // RIGHT COLUMN - VENDOR HELD STOCK
            const rightColStartX = box2StartX;
            const rightColBoxWidth = boxWidth * 2 + 5;
            let rightColYPos = secondRowYPos;
            const rightColStartY = secondRowYPos - boxPadding; // Store start Y position for border
            
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('IN-HOUSE WORKSHOP & SPARE PARTS', rightColStartX + boxPadding, rightColYPos);
            rightColYPos += 8;
            
            // Manfaat Section
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const programNote = 'Program inovatif untuk menghadirkan pelayanan yang paripurna demi kelancaran operasi unit customer dengan banyak manfaat';
            const programDesc = doc.splitTextToSize(programNote, rightColBoxWidth - 2 * boxPadding);
            programDesc.forEach((line: string) => {
                doc.text(line, rightColStartX + boxPadding, rightColYPos);
                rightColYPos += 3.5;
            });
            rightColYPos += 5;


            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Manfaat:', rightColStartX + boxPadding, rightColYPos);
            rightColYPos += 5;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const manfaatItems = [
                'Ketersediaan Teknisi(stand by mekanik)',
                'Jaminan ketersediaan suku cadang fast moving',
                'Efisiensi logistik',
                'Unit selalu siap bertugas',
                'Tanpa khawatir harus membeli stock sisa setelah masa kontrak berakhir',
            ];
            
            manfaatItems.forEach(item => {
                doc.text('•', rightColStartX + boxPadding, rightColYPos);
                const itemText = doc.splitTextToSize(item, rightColBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, rightColStartX + boxPadding + 5, rightColYPos);
                    rightColYPos += 4;
                });
            });
            
            rightColYPos += 3;
            
            // Syarat Section
            doc.setFontSize(9);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Syarat:', rightColStartX + boxPadding, rightColYPos);
            rightColYPos += 5;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const syaratItems = [
                'Tanpa deposit untuk pembelian mulai dari 30 unit atau lebih.',
                'Pembelian 5-29 unit VHS berlaku dengan deposit/Bank Guarantee sebesar stock yang disediakan.*',
                'Pelanggan menyediakan tempat penyimpanan barang & infrastruktur penunjang (listrik, internet rak, dll.),serta akomodasi manpower (mobilitas mess, & konsumsi).'
            ];
            
            syaratItems.forEach(item => {
                doc.text('•', rightColStartX + boxPadding, rightColYPos);
                const itemText = doc.splitTextToSize(item, rightColBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, rightColStartX + boxPadding + 5, rightColYPos);
                    rightColYPos += 4;
                });
            });
            
            rightColYPos += 3;
            
            // Footer note dengan font size 7
            doc.setFontSize(7);
            setFontSafe(doc, 'Futura', 'normal');
            const footerNote = '*Deposit menyesuaikan stock spare part yang disediakan. Detail akan didiskusikan bersama team Spare Part kami';
            const splitFooterNote = doc.splitTextToSize(footerNote, rightColBoxWidth - 2 * boxPadding);
            splitFooterNote.forEach((line: string) => {
                doc.text(line, rightColStartX + boxPadding, rightColYPos);
                rightColYPos += 3.5;
            });

            // Calculate correct height for right column based on actual content
            const rightColHeight = rightColYPos - rightColStartY + boxPadding;

            // Draw borders for all boxes in second row
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(leftColStartX, leftBox1StartY, colBoxWidth, leftBox1Height + leftBox2Height , 2, 2);
            doc.roundedRect(leftColStartX, rightBox1StartY, colBoxWidth, rightBox1Height + rightBox2Height, 2, 2);
            // Draw border for right column box
            doc.roundedRect(rightColStartX, rightColStartY, rightColBoxWidth, rightColHeight, 2, 2);
            // =================================
            // END OF ON ROAD AFTERSALES PAGE
            // =================================
        }
        
        // Render OFF ROAD aftersales page if there's an off road product
        if (hasOffRoadProduct) {

            // ADD OFF ROAD AFTERSALES PAGE
            doc.addPage();
            addHeaderIEL();
            addFooter();
            yPos = margin + headerHeight;

            // Title
            doc.setFontSize(14);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Dukungan Produk Motor Sights', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            // Description text (70% width)
            const descWidth = (pageWidth - 2 * margin) * 0.7;
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const descText = 'Motor Sights memberikan dukungan lengkap mulai dari pelatihan, garansi, servis, dan suku cadang untuk menjaga kelancaran operasional Anda setiap hari.';
            const splitDescText = doc.splitTextToSize(descText, descWidth);
            splitDescText.forEach((line: string) => {
                doc.text(line, pageWidth / 2, yPos, { align: 'center' });
                yPos += 5;
            });
            yPos += 5;

            // Box settings
            const boxWidth = (pageWidth - 2 * margin - 10) / 3; // 3 boxes with 5mm gap each
            const box1StartX = margin;
            const box2StartX = margin + boxWidth + 5;
            const box3StartX = margin + 2 * (boxWidth + 5);
            const boxStartY = yPos;
            const boxPadding = 5;

            // BOX 1 - Paket Perawatan Gratis
            let box1YPos = boxStartY + boxPadding + 3;
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Paket Perawatan Gratis', box1StartX + boxPadding, box1YPos);
            box1YPos += 7;

            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const box1Content = '(TERMASUK SPARE PART DAN OLI MESIN)\nServis untuk PM 1 - PM 3 (5.000KM, 10.000KM, dan 20.000KM)';
            const splitBox1 = doc.splitTextToSize(box1Content, boxWidth - 2 * boxPadding);
            splitBox1.forEach((line: string) => {
                doc.text(line, box1StartX + boxPadding, box1YPos);
                box1YPos += 4;
            });

            const box1Height = box1YPos - boxStartY + boxPadding;

            // BOX 2 - Gratis Pengiriman Spare
            let box2YPos = boxStartY + boxPadding + 3;
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Pengiriman Spare Parts', box2StartX + boxPadding, box2YPos);
            box2YPos += 7;

            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            
            // List items for Box 2
            const box2Items = [
                '1x24 Jam (Pulau Jawa)',
                '3x24 Jam (Luar Pulau Jawa)'
            ];
            
            box2Items.forEach((item, index) => {
                const numberPrefix = `${index + 1}. `;
                doc.text(numberPrefix, box2StartX + boxPadding, box2YPos);
                const itemText = doc.splitTextToSize(item, boxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string, lineIndex: number) => {
                    if (lineIndex === 0) {
                        doc.text(line, box2StartX + boxPadding + 5, box2YPos);
                    } else {
                        doc.text(line, box2StartX + boxPadding + 5, box2YPos);
                    }
                    box2YPos += 4;
                });
            });

            const box2Height = box2YPos - boxStartY + boxPadding;

            // BOX 3 - Garansi Unit
            let box3YPos = boxStartY + boxPadding + 3;
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Garansi Unit', box3StartX + boxPadding, box3YPos);
            box3YPos += 5;

            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'normal');
            const box3Content = 'Garansi 1 tahun atau 6.000 jam operasi**\nDilengkapi garansi hingga 1 tahun sejak tanggal BAST\n\n';
            const splitBox3 = doc.splitTextToSize(box3Content, boxWidth - 2 * boxPadding);
            splitBox3.forEach((line: string) => {
                doc.text(line, box3StartX + boxPadding, box3YPos);
                box3YPos += 4;
            });

            doc.setFontSize(7);
            setFontSafe(doc, 'Futura', 'normal');
            const Box3Note = '**Mana yang tercapai terlebih dahulu, syarat & ketentuan berlaku';
            const splitBox3Note = doc.splitTextToSize(Box3Note, boxWidth - 2 * boxPadding);
            splitBox3Note.forEach((line: string) => {
                doc.text(line, box3StartX + boxPadding, box3YPos - 4);
                box3YPos += 3.5;
            });

            const box3Height = box3YPos - boxStartY - 3;

            // Draw rounded borders for all boxes (use max height for uniform appearance)
            const maxBoxHeight = Math.max(box1Height, box2Height, box3Height);
            
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(box1StartX, boxStartY, boxWidth, maxBoxHeight, 2, 2);
            doc.roundedRect(box2StartX, boxStartY, boxWidth, maxBoxHeight, 2, 2);
            doc.roundedRect(box3StartX, boxStartY, boxWidth, maxBoxHeight, 2, 2);

            // SECOND ROW - 2 columns with 2 boxes each
            let secondRowYPos = boxStartY + maxBoxHeight + 10;
            const leftColStartX = box1StartX;
            const colBoxWidth = boxWidth;

            // LEFT COLUMN - GRATIS
            // Box 1: Pelatihan Pengemudi
            let leftBox1YPos = secondRowYPos;
            const leftBox1StartY = secondRowYPos - boxPadding;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('GRATIS', leftColStartX + boxPadding, leftBox1YPos);
            leftBox1YPos += 6;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Pelatihan Pengemudi', leftColStartX + boxPadding, leftBox1YPos);
            leftBox1YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const driverTrainingItems = [
                'Pelatihan 2 pengemudi/unit',
                '5 hari pelatihan',
                'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
            ];
            
            driverTrainingItems.forEach(item => {
                doc.text('•', leftColStartX + boxPadding, leftBox1YPos);
                const itemText = doc.splitTextToSize(item, colBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, leftColStartX + boxPadding + 5, leftBox1YPos);
                    leftBox1YPos += 4;
                });
            });
            
            const leftBox1Height = leftBox1YPos - leftBox1StartY ;
            
            // Box 2: Pelatihan Mekanik
            const leftBox2StartY = leftBox1StartY + leftBox1Height;
            let leftBox2YPos = leftBox2StartY + boxPadding;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Pelatihan Mekanik', leftColStartX + boxPadding, leftBox2YPos);
            leftBox2YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const mechanicTrainingItems = [
                'Pelatihan mekanik',
                '5 hari pelatihan',
                'Pra-Tes, Belajar di Kelas, & Praktik Langsung'
            ];
            
            mechanicTrainingItems.forEach(item => {
                doc.text('•', leftColStartX + boxPadding, leftBox2YPos);
                const itemText = doc.splitTextToSize(item, colBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, leftColStartX + boxPadding + 5, leftBox2YPos);
                    leftBox2YPos += 4;
                });
            });
            
            const leftBox2Height = leftBox2YPos - leftBox2StartY + boxPadding;

            // LEFT COLUMN - DENGAN INVESTASI
            // Box 1: Kontrak Servis
            let rightBox1YPos = leftBox2YPos + boxPadding + 10;
            const rightBox1StartY = leftBox2StartY + leftBox2Height + 5;
            
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('DENGAN INVESTASI', leftColStartX + boxPadding, rightBox1YPos);
            rightBox1YPos += 6;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Kontrak Servis', leftColStartX + boxPadding, rightBox1YPos);
            rightBox1YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const contractText1 = 'Stand-by mekanik gratis selama 3 bulan dengan minimal pembelian 10 unit. Setelah 3 bulan dapat melanjutkan dengan Kontrak Servis. Memiliki 3 pilihan paket: ';
            const splitContract1 = doc.splitTextToSize(contractText1, colBoxWidth - 2 * boxPadding);
            splitContract1.forEach((line: string) => {
                doc.text(line, leftColStartX + boxPadding, rightBox1YPos);
                rightBox1YPos += 4;
            });
            
            // Bold text for packages
            setFontSafe(doc, 'Futura', 'bold');
            const packagesText = 'Spare Part / Service / Service & Spare Part.';
            const splitPackages = doc.splitTextToSize(packagesText, colBoxWidth - 2 * boxPadding);
            splitPackages.forEach((line: string) => {
                doc.text(line, leftColStartX + boxPadding, rightBox1YPos);
                rightBox1YPos += 4;
            });
            
            const rightBox1Height = rightBox1YPos - rightBox1StartY;
            
            // Box 2: Stand By Mechanic
            const rightBox2StartY = rightBox1StartY + rightBox1Height + 5;
            let rightBox2YPos = rightBox2StartY - 3;
            
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Stand By Mechanic', leftColStartX + boxPadding, rightBox2YPos + 2);
            rightBox2YPos += 6;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const standbyText = 'Gratis stand by mechanic selama 3 bulan dengan pembelian minimal 10 unit. Support garansi dan OJT Mekanik';
            const splitStandby = doc.splitTextToSize(standbyText, colBoxWidth - 2 * boxPadding);
            splitStandby.forEach((line: string) => {
                doc.text(line, leftColStartX + boxPadding, rightBox2YPos);
                rightBox2YPos += 4;
            });
            
            const rightBox2Height = rightBox2YPos - rightBox2StartY + boxPadding;

            // Draw borders for all boxes in second row
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(leftColStartX, leftBox1StartY, colBoxWidth, leftBox1Height + leftBox2Height , 2, 2);
            doc.roundedRect(leftColStartX, rightBox1StartY, colBoxWidth, rightBox1Height + rightBox2Height, 2, 2);
            
            // RIGHT COLUMN - VENDOR HELD STOCK
            const rightColStartX = box2StartX;
            const rightColBoxWidth = boxWidth * 2 + 5;
            let rightColYPos = secondRowYPos;
            const rightColStartY = secondRowYPos - boxPadding; // Store start Y position for border
            
            doc.setFontSize(10);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('VENDOR HELD STOCK', rightColStartX + boxPadding, rightColYPos);
            rightColYPos += 8;
            
            // Manfaat Section
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Manfaat:', rightColStartX + boxPadding, rightColYPos);
            rightColYPos += 5;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const manfaatItems = [
                'Ketersediaan Teknisi (stand by mekanik)',
                'Suku cadang fast moving selalu tersedia',
                'Efisiensi logistik',
                'Tanpa investasi besar stok suku cadang',
                'Fokus pada target produksi',
                'Tanpa kewajiban membeli stok sisa setelah kontrak berakhir'
            ];
            
            manfaatItems.forEach(item => {
                doc.text('•', rightColStartX + boxPadding, rightColYPos);
                const itemText = doc.splitTextToSize(item, rightColBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, rightColStartX + boxPadding + 5, rightColYPos);
                    rightColYPos += 4;
                });
            });
            
            rightColYPos += 3;
            
            // Syarat Section
            doc.setFontSize(9);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('Syarat:', rightColStartX + boxPadding, rightColYPos);
            rightColYPos += 5;
            
            doc.setFontSize(8);
            setFontSafe(doc, 'Futura', 'normal');
            const syaratItems = [
                'Tanpa deposit untuk pembelian mulai dari 30 unit atau lebih',
                'Pembelian 5-29 unit VHS berlaku dengan deposit/Bank Guarantee sebesar stock yang disediakan.*',
                'Pelanggan menyediakan tempat penyimpanan barang & infrastruktur penunjang (listrik, internet, rak, dll.), serta akomodasi manpower (mobilitas, mess, & konsumsi)'
            ];
            
            syaratItems.forEach(item => {
                doc.text('•', rightColStartX + boxPadding, rightColYPos);
                const itemText = doc.splitTextToSize(item, rightColBoxWidth - 2 * boxPadding - 5);
                itemText.forEach((line: string) => {
                    doc.text(line, rightColStartX + boxPadding + 5, rightColYPos);
                    rightColYPos += 4;
                });
            });
            
            rightColYPos += 3;
            
            // Footer note dengan font size 7
            doc.setFontSize(7);
            setFontSafe(doc, 'Futura', 'normal');
            const footerNote = '*Deposit menyesuaikan stock spare part yang disediakan. Detail akan didiskusikan bersama team Spare Part kami';
            const splitFooterNote = doc.splitTextToSize(footerNote, rightColBoxWidth - 2 * boxPadding);
            splitFooterNote.forEach((line: string) => {
                doc.text(line, rightColStartX + boxPadding, rightColYPos);
                rightColYPos += 3.5;
            });
            
            // Calculate correct height based on actual content
            const rightColHeight = rightColYPos - rightColStartY + boxPadding;
            
            // Draw border for right column box
            doc.setDrawColor(228, 231, 236);
            doc.setLineWidth(0.1);
            doc.roundedRect(rightColStartX, rightColStartY, rightColBoxWidth, rightColHeight, 2, 2);
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
