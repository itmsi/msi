import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import autoTable from 'jspdf-autotable';
import { loadCustomFonts, setFontSafe } from './fontLoader';
import { ManageROEDataPDF } from '../../types/roeCalculator';

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

export const generateROEPDF = async (data: ManageROEDataPDF) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Load custom Futura fonts
        await loadCustomFonts(doc);
        const pageWidth = doc.internal.pageSize.getWidth(); // 297mm for A4 landscape
        const pageHeight = doc.internal.pageSize.getHeight(); // 210mm for A4 landscape
        const margin = 15;
        const headerHeight = 20;
        const footerHeight = 20;
        let yPos = margin + headerHeight - 5;


    // Function to add header to each page
    const addHeader = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        try {
            const iecLogo = '/motor-sights-international-logo.png';
            doc.addImage(iecLogo, 'PNG', margin - 5, 3, 24, 15);
        } catch (error) {
            console.warn('IEC logo not found');
        }
        
        try {
            // const msLogo = '/motor-sights-international-logo.png';
            // doc.addImage(msLogo, 'PNG', pageWidth - margin - 20, 3, 24, 15);
            doc.setFontSize(12);
            doc.setTextColor(0, 48, 97);
            setFontSafe(doc, 'Futura', 'bold');
            doc.text('ROE & ROA CALCULATOR REPORT', pageWidth - margin - 50, 12, { align: 'center' });
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

    // // Title Section
    // doc.setFontSize(18);
    // doc.setTextColor(0, 48, 97);
    // setFontSafe(doc, 'Futura', 'bold');
    
    // doc.text('ROE & ROA CALCULATOR REPORT', pageWidth / 2, yPos, { align: 'center' });
    // yPos += 10;

    // Customer Information Section
    // checkNewPage(30);
    
    // doc.setFontSize(14);
    // doc.setTextColor(0, 48, 97);
    // setFontSafe(doc, 'Futura', 'bold');
    
    // doc.text('Customer Information', margin, yPos);
    // yPos += 8;

    // const customerInfo = [
    //     ['Customer Name', data.customer_name || 'N/A'],
    //     ['Commodity', data.commodity || 'N/A'],
    //     ['Status', (data.status || 'draft').toUpperCase()],
    //     ['Created Date', data.created_at ? formatDate(data.created_at) : 'N/A']
    // ];

    // doc.setFontSize(10);
    // doc.setTextColor(0, 0, 0);
    // setFontSafe(doc, 'Futura', 'normal');

    // customerInfo.forEach(([label, value]) => {
    //     doc.setTextColor(0, 48, 97);
    //     setFontSafe(doc, 'Futura', 'bold');
    //     doc.text(`${label}:`, margin, yPos);
        
    //     doc.setTextColor(0, 0, 0);
    //     setFontSafe(doc, 'Futura', 'normal');
    //     doc.text(value, margin + 50, yPos);
    //     yPos += 6;
    // });

    yPos += 5;

    // Operational Parameters & Unit Purchase Section (Side by Side)
    checkNewPage(50);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 48, 97);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('Operational Parameters', margin, yPos);
    
    // Show Unit Purchase title if data exists
    if (data.unit_purchases) {
        doc.text('Unit Purchase Information', margin + (pageWidth / 2), yPos);
    }
    yPos += 8;

    const operationalData = [
        ['Tonnage per Ritase', `${data.tonnage_per_ritase} tons`],
        ['Selling Price per Ton', formatCurrency(data.selling_price_per_ton)],
        ['Haul Distance', `${data.haul_distance} km`],
        ['Ritase per Shift', data.ritase_per_shift.toString()],
        ['Shift per Day', data.shift_per_hari.toString()],
        ['Working Days per Month', data.hari_kerja_per_bulan.toString()],
        ['Utilization Rate', `${data.utilization_percent}%`],
        ['Downtime Rate', `${data.downtime_percent}%`],
        ['Fuel Consumption Type', data.fuel_consumption_type],
        ['Fuel Consumption', `${data.fuel_consumption} ${data.fuel_consumption_type}`],
        ['Fuel Price', formatCurrency(data.fuel_price)]
    ];

    const leftTableWidth = (pageWidth - 3 * margin) / 2;
        
        // Left table - Operational Parameters
        autoTable(doc, {
            startY: yPos,
            head: [['Parameter', 'Value']],
            body: operationalData,
            margin: { left: margin, right: margin + leftTableWidth + margin },
            tableWidth: leftTableWidth,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                font: 'Futura',
                fontStyle: 'normal'
            },
            headStyles: {
                fillColor: [0, 48, 97],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: leftTableWidth * 0.55, fontStyle: 'bold' },
                1: { cellWidth: leftTableWidth * 0.45 }
            }
        });

    // Right table - Unit Purchase (if exists)
    if (data.unit_purchases) {
        const unitPurchaseData = [
            ['Price per Unit', formatCurrency(data.unit_purchases.price_per_unit)],
            ['Quantity', data.unit_purchases.quantity.toString()],
            ['Total Asset', formatCurrency(data.unit_purchases.total_asset)],
            ['Down Payment', `${data.unit_purchases.down_payment_percent}%`],
            ['Down Payment Value', formatCurrency(data.unit_purchases.down_payment)],
            ['Remaining Debt', formatCurrency(data.unit_purchases.remaining_debt)],
            ['Financing Tenor', `${data.unit_purchases.financing_tenor_months} months`],
            ['Interest Rate', `${data.unit_purchases.interest_rate_flat_per_year}% per year`],
            ['Depreciation Period', `${data.unit_purchases.depreciation_period_months} months`],
            ['Principal Installment', formatCurrency(data.unit_purchases.principal_installment)],
            ['Interest per Month', formatCurrency(data.unit_purchases.interest_per_month)]
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Value']],
            body: unitPurchaseData,
            margin: { left: margin + leftTableWidth + margin, right: margin },
            tableWidth: leftTableWidth,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                font: 'Futura',
                fontStyle: 'normal'
            },
            headStyles: {
                fillColor: [0, 48, 97],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            columnStyles: {
                0: { cellWidth: leftTableWidth * 0.55, fontStyle: 'bold' },
                1: { cellWidth: leftTableWidth * 0.45 }
            }
        });
    }

    yPos = doc.lastAutoTable?.finalY || yPos;
    yPos += 12;

    // Monthly Cost Breakdown & Financial Performance (Side by Side)
    checkNewPage(60);
    doc.setFontSize(14);
    doc.setTextColor(0, 48, 97);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('Monthly Cost Breakdown', margin, yPos);
    doc.text('Financial Structure', margin + (pageWidth / 2), yPos);
    yPos += 8;

    const monthlyCostData = [
        ['Tyre Expense', formatCurrency(data.tyre_expense_monthly)],
        ['Spare Parts Expense', formatCurrency(data.sparepart_expense_monthly)],
        ['Operator Salary', formatCurrency(data.salary_operator_monthly)],
        ['Depreciation', formatCurrency(data.depreciation_monthly)],
        ['Interest', formatCurrency(data.interest_monthly)],
        ['Overhead', formatCurrency(data.overhead_monthly)],
        ['Total Monthly Expense', formatCurrency(data.total_expense_monthly)]
    ];

    // Left table - Monthly Costs
    autoTable(doc, {
        startY: yPos,
        head: [['Cost Item', 'Amount (IDR)']],
        body: monthlyCostData,
        margin: { left: margin, right: margin + leftTableWidth + margin },
        tableWidth: leftTableWidth,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            font: 'Futura',
            fontStyle: 'normal'
        },
        headStyles: {
            fillColor: [0, 48, 97],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: leftTableWidth * 0.5, fontStyle: 'bold' },
            1: { cellWidth: leftTableWidth * 0.5 }
        },
        didParseCell: (data) => {
            if (data.row.index === monthlyCostData.length - 1) {
                data.cell.styles.fillColor = [240, 240, 240];
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    // Right table - Financial Structure & Revenue
    const financialData = [
        ['Total Assets', formatCurrency(data.assets)],
        ['Equity', formatCurrency(data.equity)],
        ['Liability', formatCurrency(data.liability)],
        ['', ''], // Spacer
        ['Monthly Revenue', formatCurrency(data.revenue_monthly)],
        ['Total Monthly Expense', formatCurrency(data.total_expense_monthly)],
        ['Net Profit Monthly', formatCurrency(data.net_profit_monthly || 0)],
        ['Profit Margin', data.profit_margin ? `${data.profit_margin.toFixed(2)}%` : 'N/A']
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['Financial Item', 'Amount (IDR)']],
        body: financialData,
        margin: { left: margin + leftTableWidth + margin, right: margin },
        tableWidth: leftTableWidth,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            font: 'Futura',
            fontStyle: 'normal'
        },
        headStyles: {
            fillColor: [0, 48, 97],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: leftTableWidth * 0.5, fontStyle: 'bold' },
            1: { cellWidth: leftTableWidth * 0.5 }
        },
        didParseCell: (cellData) => {
            // Financial structure rows (0-2)
            if (cellData.row.index >= 0 && cellData.row.index <= 2) {
                cellData.cell.styles.fillColor = [245, 245, 245];
            }
            // Net profit row
            if (cellData.row.index === 6) {
                const netProfit = parseFloat(String(data.net_profit_monthly || 0));
                if (netProfit > 0) {
                    cellData.cell.styles.textColor = [34, 197, 94]; // Green
                } else if (netProfit < 0) {
                    cellData.cell.styles.textColor = [239, 68, 68]; // Red
                }
                cellData.cell.styles.fontStyle = 'bold';
            }
            // Spacer row
            if (cellData.row.index === 3) {
                cellData.cell.styles.fillColor = [255, 255, 255];
                cellData.cell.text = [];
            }
        }
    });

    yPos = doc.lastAutoTable?.finalY || yPos;
    yPos += 12;



    // ROE & ROA Summary (Highlighted Section) - Full Width
    checkNewPage(50);
    
    const fullTableWidth = pageWidth - 2 * margin;
    
    // Create highlight box
    doc.setFillColor(0, 48, 97);
    doc.roundedRect(margin, yPos - 5, fullTableWidth, 40, 3, 3, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text('ROE & ROA ANALYSIS', pageWidth / 2, yPos + 6, { align: 'center' });
    
    yPos += 15;
    
    // ROE & ROA values in 4 columns layout
    const colWidth = fullTableWidth / 4;
    const col1X = margin + colWidth * 0.25;
    const col2X = margin + colWidth * 0.75;
    const col3X = margin + colWidth * 1.5;
    const col4X = margin + colWidth * 2.5;
    
    // Individual ROE
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    setFontSafe(doc, 'Futura', 'normal');
    doc.text('ROE Individual', col1X, yPos, { align: 'center' });
    
    doc.setFontSize(16);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text(`${data.roe_individual_percentage.toFixed(2)}%`, col1X, yPos + 8, { align: 'center' });
    
    doc.setFontSize(8);
    setFontSafe(doc, 'Futura', 'normal');
    const roeIndNominal = doc.splitTextToSize(formatCurrency(data.roe_individual_nominal), colWidth * 0.8);
    doc.text(roeIndNominal, col1X, yPos + 15, { align: 'center' });
    
    // Aggregate ROE
    doc.setFontSize(10);
    doc.text('ROE Aggregate', col2X, yPos, { align: 'center' });
    
    doc.setFontSize(16);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text(`${data.roe_aggregate_percentage.toFixed(2)}%`, col2X, yPos + 8, { align: 'center' });
    
    doc.setFontSize(8);
    setFontSafe(doc, 'Futura', 'normal');
    const roeAggNominal = doc.splitTextToSize(formatCurrency(data.roe_aggregate_nominal), colWidth * 0.8);
    doc.text(roeAggNominal, col2X, yPos + 15, { align: 'center' });
    
    // Individual ROA
    doc.setFontSize(10);
    doc.text('ROA Individual', col3X, yPos, { align: 'center' });
    
    doc.setFontSize(16);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text(`${data.roa_individual_percentage.toFixed(2)}%`, col3X, yPos + 8, { align: 'center' });
    
    doc.setFontSize(8);
    setFontSafe(doc, 'Futura', 'normal');
    const roaIndNominal = doc.splitTextToSize(formatCurrency(data.roa_individual_nominal), colWidth * 0.8);
    doc.text(roaIndNominal, col3X, yPos + 15, { align: 'center' });
    
    // Aggregate ROA
    doc.setFontSize(10);
    doc.text('ROA Aggregate', col4X, yPos, { align: 'center' });
    
    doc.setFontSize(16);
    setFontSafe(doc, 'Futura', 'bold');
    doc.text(`${data.roa_aggregate_percentage.toFixed(2)}%`, col4X, yPos + 8, { align: 'center' });
    
    doc.setFontSize(8);
    setFontSafe(doc, 'Futura', 'normal');
    const roaAggNominal = doc.splitTextToSize(formatCurrency(data.roa_aggregate_nominal), colWidth * 0.8);
    doc.text(roaAggNominal, col4X, yPos + 15, { align: 'center' });
    
    yPos += 30;

    yPos += 5;

    // Summary Notes
    checkNewPage(25);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    setFontSafe(doc, 'Futura', 'normal');
    
    // const summaryText = `This report was generated on ${formatDate(new Date().toISOString())} based on the operational and financial parameters provided. ROE and ROA calculations are based on monthly performance projections and may vary with actual operational conditions.`;
    // const wrappedText = doc.splitTextToSize(summaryText, pageWidth - 2 * margin);
    
    // doc.text(wrappedText, margin, yPos);

    const customerName = (data.customer_name || 'Unknown').replace(/\s+/g, '_');
    const fileName = `ROE_ROA_Calculator_${customerName}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    

};
