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
    const margin = 10;
    const headerHeight = 20;
    const footerHeight = 20;
    let yPos = margin + headerHeight;


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
            setFontSafe(doc, 'OpenSans', 'bold');
            doc.text('ROE & ROA Report', pageWidth - margin, 10, { align: 'right' });
            setFontSafe(doc, 'OpenSans', 'normal');
            doc.setFontSize(10);
            doc.text(`${data.customer_name} | ${data.commodity}`, pageWidth - margin, 15 , { align: 'right' });
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

    addHeader();
    addFooter();

    
    // Metrik Keuangan
    const keyFinancialData = (varYPos: number): number => {
        const fullTableWidth = (pageWidth - 2 * margin) / 2;
        const colWidth = fullTableWidth / 2;
        const col1X = (margin + colWidth * 0.55);
        const col2X = margin + colWidth * 1.45;
        
        // Create rounded border background
        const borderHeight = 80;
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, varYPos - 5, fullTableWidth, borderHeight, 2, 2, 'S');
        
        // Add section title
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Metrik Keuangan', margin + 5, varYPos + 3);
        
        // Add border line below title
        doc.setDrawColor(0, 48, 97);
        doc.setLineWidth(0.5);
        doc.line(margin + 5, varYPos + 6, margin + fullTableWidth - 5, varYPos + 6);
        
        varYPos += 15;

        // ROE - Add rounded border
        const roeBoxWidth = colWidth * 0.85;
        const roeBoxHeight = 20;
        const roeBoxX = col1X - roeBoxWidth / 2;
        doc.setFillColor(242, 242, 253);
        doc.roundedRect(roeBoxX - 4, varYPos - 4.5, roeBoxWidth + 4, roeBoxHeight, 1, 1, 'F');
        doc.setDrawColor(242, 242, 253);
        doc.setLineWidth(0.3);
        doc.roundedRect(roeBoxX - 4, varYPos - 4.5, roeBoxWidth + 4, roeBoxHeight, 1, 1, 'S');
        
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text('Return on Equity (ROE)', col1X - 2, varYPos, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(99, 106, 232);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(`${data.pdf_data.key_financial_metrics.roe_percentage}%`, col1X - 2, varYPos + 8, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(86, 93, 109);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text('Laba Bersih / Ekuitas', col1X - 2, varYPos + 13, { align: 'center' });

        // ROA - Add rounded border
        const roaBoxWidth = colWidth * 0.85;
        const roaBoxHeight = 20;
        const roaBoxX = col2X - roaBoxWidth / 2;
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.3);
        doc.roundedRect(roaBoxX, varYPos - 4.5, roaBoxWidth + 4, roaBoxHeight, 1, 1, 'S');
        
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        doc.text('Return on Assets (ROA)', col2X + 2, varYPos, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(`${data.pdf_data.key_financial_metrics.roa_percentage}%`, col2X + 2, varYPos + 8, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(86, 93, 109);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text('Laba Bersih / Total Aset', col2X + 2, varYPos + 13, { align: 'center' });

        varYPos += 23;
   
        // Revenue per Bulan - Add rounded border
        const revenueBoxWidth = colWidth * 0.85;
        const revenueBoxHeight = 17;
        const revenueBoxX = col1X - revenueBoxWidth / 2;
        // doc.setFillColor(245, 245, 245);
        // doc.roundedRect(revenueBoxX, varYPos- 5, revenueBoxWidth, revenueBoxHeight, 1, 1, 'F');
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.3);
        doc.roundedRect(revenueBoxX - 4, varYPos- 5, revenueBoxWidth + 4, revenueBoxHeight, 1, 1, 'S');
        
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text('Pendapatan Bulanan', col1X - 2, varYPos, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(formatCurrency(data.pdf_data.key_financial_metrics.revenue_per_bulan), col1X - 2, varYPos + 8, { align: 'center' });

        // Expenses per Bulan - Add rounded border
        const expensesBoxWidth = colWidth * 0.85;
        const expensesBoxHeight = 17;
        const expensesBoxX = col2X - expensesBoxWidth / 2;
        // doc.setFillColor(245, 245, 245);
        // doc.roundedRect(expensesBoxX, varYPos- 5, expensesBoxWidth, expensesBoxHeight, 1, 1, 'F');
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.3);
        doc.roundedRect(expensesBoxX, varYPos- 5, expensesBoxWidth + 4, expensesBoxHeight, 1, 1, 'S');
        
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text('Biaya Bulanan', col2X + 2, varYPos, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(formatCurrency(data.pdf_data.key_financial_metrics.expenses_per_bulan), col2X + 2, varYPos + 8, { align: 'center' });
        
        varYPos += 20;
        
        // Net Profit per Bulan - Add rounded border
        const netProfitBoxWidth = colWidth * 0.85;
        const netProfitBoxHeight = 17;
        const netProfitBoxX = col1X - netProfitBoxWidth / 2;
        // doc.setFillColor(245, 245, 245);
        // doc.roundedRect(netProfitBoxX, varYPos - 2, netProfitBoxWidth, netProfitBoxHeight, 1, 1, 'F');
        doc.setDrawColor(245, 245, 245);
        doc.setLineWidth(0.3);
        doc.roundedRect(netProfitBoxX - 4, varYPos - 5, netProfitBoxWidth + 4, netProfitBoxHeight, 1, 1, 'S');
        
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        setFontSafe(doc, 'Futura', 'normal');
        doc.text('Laba Bersih Bulanan', col1X - 2, varYPos, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(formatCurrency(data.pdf_data.key_financial_metrics.net_profit_per_bulan), col1X - 2, varYPos + 8, { align: 'center' });
        
        varYPos += 25;
        return varYPos;

    }

    // REVENUE
    const revenueFunction = (varYPos: number): number => {
        const fullTableWidth = (pageWidth - 2 * margin) / 2;
        const colWidth = fullTableWidth / 2;
        
        // Create rounded border background
        const borderHeight = 80;
        let postY = varYPos - borderHeight - 3;
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.5);
        doc.roundedRect(fullTableWidth + margin + 2, postY - 5, fullTableWidth, borderHeight, 2, 2, 'S');
        
        // Add section title
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Pendapatan', fullTableWidth + margin + 5, postY + 3);
        
        // Add border line below title
        doc.setDrawColor(0, 48, 97);
        doc.setLineWidth(0.5);
        doc.line(fullTableWidth + margin + 5, postY + 6, fullTableWidth + margin + fullTableWidth - 5, postY + 6);
        
        postY += 10;

        // OPERATIONAL Section with border
        doc.setFontSize(10);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('OPERATIONAL', fullTableWidth + margin + 5, postY + 2);
        
        // OPERATIONAL border
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.5);
        doc.roundedRect(fullTableWidth + margin + 5, postY + 5, colWidth - 8, 40, 1, 1, 'S');
        
        const operationalData = [
            ['Tonase per Unit', data.pdf_data.revenue.data_operasional.tonnage_per_ritase+' Ton'],
            ['Jarak Haul (PP)', data.pdf_data.revenue.data_operasional.haul_distance+' Km'],
            ['Harga Jual per Ton', formatCurrency(data.pdf_data.revenue.data_operasional.selling_price_per_ton)],
            ['Ritase per Shift', data.pdf_data.revenue.data_operasional.ritase_per_shift],
            ['Shift per Hari', data.pdf_data.revenue.data_operasional.shift_per_hari],
            ['Hari Kerja per Bulan', data.pdf_data.revenue.data_operasional.hari_kerja_per_bulan],
            ['Ketersediaan Fisik', data.pdf_data.revenue.data_operasional.utilization_percent+ '%'],
        ];
        // Left table - Operational
        autoTable(doc, {
            startY: postY + 6,
            body: operationalData,
            margin: { left: fullTableWidth + margin + 6 },
            tableWidth: colWidth - 20,
            styles: {
                fontSize: 8,
                cellPadding: 1,
                valign: 'middle',
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (colWidth - 10) * 0.5, fontStyle: 'normal' },
                1: { cellWidth: (colWidth - 10) * 0.5 }
            },
        });
        // Add vertical separator line
        doc.setDrawColor(0, 48, 97);
        doc.setLineWidth(0.2);
        doc.line(fullTableWidth + margin + colWidth, postY - 2, fullTableWidth + margin + colWidth, postY + 45);
        
        // PRODUKSI Section with border
        doc.setFontSize(10);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('PRODUKSI', fullTableWidth + margin + colWidth + 3, postY + 2);
        
        // PRODUKSI border
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.5);
        doc.roundedRect(fullTableWidth + margin + colWidth + 3, postY + 5, colWidth - 5, 40, 1, 1, 'S');
        
        const produksiData = [
            ['Ritase per Shift', data.pdf_data.revenue.hasil_produksi.ritase_per_hari],
            ['Ritase per Bulan', data.pdf_data.revenue.hasil_produksi.ritase_per_bulan],
            ['Tonase per Bulan', data.pdf_data.revenue.hasil_produksi.tonnage_per_bulan + ' ton'],
        ];
        // Right table - Produksi
        autoTable(doc, {
            startY: postY + 6,
            body: produksiData,
            margin: { left: fullTableWidth + margin + colWidth + 4 },
            tableWidth: colWidth - 20,
            styles: {
                fontSize: 8,
                cellPadding: 1,
                valign: 'middle',
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (colWidth - 7) * 0.5, fontStyle: 'normal' },
                1: { cellWidth: (colWidth - 7) * 0.5 }
            },
        });
        postY += 5;
        
        // TOTAL REVENUE PER BULAN
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        doc.text('Total Pendapatan Bulanan',fullTableWidth * 1.58, (postY + 48), { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(99, 106, 232);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(`${formatCurrency(data.pdf_data.revenue.total_revenue_per_bulan)}`,fullTableWidth * 1.58, (postY + 46) + 8, { align: 'center' });
        
        return varYPos;

    }

    // EXPENSES
    const expenseFunction = (varYPos: number): number => {
        const fullTableWidth = (pageWidth - 2 * margin) / 2;
        
        // Create rounded border background
        const borderHeight = 80;
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, varYPos - 5, fullTableWidth, borderHeight, 2, 2, 'S');
        
        // Add section title
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Biaya', margin + 5, varYPos + 3);
        
        // Add border line below title
        doc.setDrawColor(0, 48, 97);
        doc.setLineWidth(0.5);
        doc.line(margin + 5, varYPos + 6, margin + fullTableWidth - 5, varYPos + 6);
        
        varYPos += 5;
        const operationalData = [
            ['BBM', `${formatCurrency(data.pdf_data.expenses.detail.bbm.nominal)} (${data.pdf_data.expenses.detail.bbm.persentase}%)`],
            ['Ban', `${formatCurrency(data.pdf_data.expenses.detail.ban.nominal)} (${data.pdf_data.expenses.detail.ban.persentase}%)`],
            ['Sparepart', `${formatCurrency(data.pdf_data.expenses.detail.sparepart.nominal)} (${data.pdf_data.expenses.detail.sparepart.persentase}%)`],
            ['Gaji Operator', `${formatCurrency(data.pdf_data.expenses.detail.gaji_operator.nominal)} (${data.pdf_data.expenses.detail.gaji_operator.persentase}%)`],
            ['Depresiasi', `${formatCurrency(data.pdf_data.expenses.detail.depresiasi.nominal)} (${data.pdf_data.expenses.detail.depresiasi.persentase}%)`],
            ['Bunga', `${formatCurrency(data.pdf_data.expenses.detail.bunga.nominal)} (${data.pdf_data.expenses.detail.bunga.persentase}%)`],
            ['Overhead/G&A', `${formatCurrency(data.pdf_data.expenses.detail.overhead.nominal)} (${data.pdf_data.expenses.detail.overhead.persentase}%)`]
        ];
        // Left table - Operational
        autoTable(doc, {
            startY: varYPos + 6,
            body: operationalData,
            margin: { left: margin + 6 },
            tableWidth: fullTableWidth,
            styles: {
                fontSize: 8,
                cellPadding: [1, 2],
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (fullTableWidth - 10) * 0.5, fontStyle: 'normal' },
                1: { cellWidth: (fullTableWidth - 10) * 0.5 }
            },
        });
        // Total ExpenseN
        doc.setFontSize(11);
        doc.setTextColor(86, 93, 109);
        doc.text('Total Biaya',margin + 70, (varYPos + 55), { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(99, 106, 232);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text(`${formatCurrency(data.pdf_data.expenses.total_expense)}`,margin + 70, (varYPos + 53) + 8, { align: 'center' });
        
        // doc.setFontSize(9);
        // doc.setTextColor(86, 93, 109);
        // setFontSafe(doc, 'Futura', 'normal');
        // doc.text('Tonase/Bulan x Harga/Ton x Qty Unit',margin + 70, (varYPos + 50) + 13, { align: 'center' });
        
        varYPos += 25;
        return varYPos;

    }

    // Aset & Liabilitas
    const assetliabilityFunction = (varYPos: number): number => {
        const fullTableWidth = (pageWidth - 2 * margin) / 2;
        const colWidth = fullTableWidth / 2;
        
        // Create rounded border background
        const borderHeight = 80;
        let postY = varYPos - borderHeight + 50;
        doc.setDrawColor(228, 231, 236);
        doc.setLineWidth(0.5);
        doc.roundedRect(fullTableWidth + margin + 2, postY - 5, fullTableWidth, borderHeight, 2, 2, 'S');
        
        // Add section title
        doc.setFontSize(14);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Aset & Liabilitas', fullTableWidth + margin + 5, postY + 3);
        
        // Add border line below title
        doc.setDrawColor(0, 48, 97);
        doc.setLineWidth(0.5);
        doc.line(fullTableWidth + margin + 5, postY + 6, fullTableWidth + margin + fullTableWidth - 5, postY + 6);
        
        postY += 10;

        // OPERATIONAL Section with border
        doc.setFontSize(10);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Aset Tetap – Unit', fullTableWidth + margin + 5, postY + 2);
        
        const assetData = [
            ['Harga per Unit', formatCurrency(data.pdf_data.asset_liability.unit_purchase.harga_per_unit)],
            ['Qty Unit', data.pdf_data.asset_liability.unit_purchase.qty_unit],
            ['Down Payment', data.pdf_data.asset_liability.unit_purchase.down_payment_percent + '%'],
            ['Tenor Pembiayaan', data.pdf_data.asset_liability.unit_purchase.tenor_pembiayaan],
            ['Bunga (Flat)', data.pdf_data.asset_liability.unit_purchase.interest_rate_flat+ '%'],
        ];
        const totalAssetData = [
            ['Total Aset', formatCurrency(data.pdf_data.asset_liability.unit_purchase.total_aset)]
        ];
        // Left table - asset
        autoTable(doc, {
            startY: postY + 6,
            body: assetData,
            margin: { left: fullTableWidth + margin + 6 },
            tableWidth: colWidth - 20,
            styles: {
                fontSize: 8,
                cellPadding: 1,
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (colWidth - 10) * 0.4, fontStyle: 'normal' },
                1: { cellWidth: (colWidth - 10) * 0.6 }
            },
        });
        autoTable(doc, {
            startY: postY + 40,
            body: totalAssetData,
            margin: { left: fullTableWidth + margin + 6 },
            tableWidth: colWidth - 20,
            styles: {
                fontSize: 8,
                cellPadding: 1,
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (colWidth - 10) * 0.4, fontSize: 10, fontStyle: 'normal' },
                1: { cellWidth: (colWidth - 10) * 0.6, fontSize: 10, textColor: [99, 106, 232] }
            },
        });
        // Add vertical separator line
        doc.setDrawColor(0, 48, 97);
        doc.setLineWidth(0.2);
        doc.line(fullTableWidth + margin + colWidth, postY - 2, fullTableWidth + margin + colWidth, postY + 55);
        
        // PRODUKSI Section with border
        doc.setFontSize(10);
        doc.setTextColor(23, 26, 31);
        setFontSafe(doc, 'Futura', 'bold');
        doc.text('Liabilitas – Angsuran Bulanan', fullTableWidth + margin + colWidth + 3, postY + 2);
        
        const liabilityData = [
            ['Cicilan Pokok', formatCurrency(data.pdf_data.asset_liability.cicilan_bulanan.cicilan_pokok)],
            ['Bunga (Rp)', formatCurrency(data.pdf_data.asset_liability.cicilan_bulanan.bunga)],
            ['Total per Bulan', formatCurrency(data.pdf_data.asset_liability.cicilan_bulanan.total_per_bulan)],
            ['Rasio Keuangan', ''],
            ['Cicilan Pokok', data.pdf_data.asset_liability.cicilan_bulanan.rasio_keuangan.cicilan_pokok],
            ['Bunga (%)', data.pdf_data.asset_liability.cicilan_bulanan.rasio_keuangan.bunga + '%'],
        ];
        const totalEquityLiabilityData = [
            ['Ekuitas', formatCurrency(data.pdf_data.asset_liability.equity)],
            ['Liabilitas', formatCurrency(data.pdf_data.asset_liability.liability)]
        ];
        // Right table - liability
        autoTable(doc, {
            startY: postY + 6,
            body: liabilityData,
            margin: { left: fullTableWidth + margin + colWidth + 4 },
            tableWidth: colWidth - 20,
            styles: {
                fontSize: 8,
                cellPadding: 1,
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (colWidth - 7) * 0.4, fontStyle: 'normal' },
                1: { cellWidth: (colWidth - 7) * 0.6 }
            },
        });
        autoTable(doc, {
            startY: postY + 40,
            body: totalEquityLiabilityData,
            margin: { left: fullTableWidth + margin + colWidth + 4 },
            tableWidth: colWidth - 20,
            styles: {
                fontSize: 8,
                cellPadding: 1,
                font: 'Futura',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: (colWidth - 10) * 0.4, fontSize: 10, fontStyle: 'normal' },
                1: { cellWidth: (colWidth - 10) * 0.6, fontSize: 10, textColor: [99, 106, 232] }
            },
        });
        postY += 5;
        return varYPos;

    }
    
    
    yPos = keyFinancialData(yPos);
    yPos = revenueFunction(yPos);
    yPos = expenseFunction(yPos);
    yPos = assetliabilityFunction(yPos);
    yPos += 5;

    const customerName = (data.customer_name || 'Unknown').replace(/\s+/g, '_');
    const fileName = `ROE_ROA_Calculator_${customerName}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    

};
