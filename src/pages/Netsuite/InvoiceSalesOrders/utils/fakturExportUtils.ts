/**
 * Helper: Escape XML special characters
 */
const escapeXML = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/**
 * Generate Formal XML Faktur Bulk
 * 
 * @param fakturs Array of { faktur: FakturData, row: InvoiceSalesOrder }
 * @returns XML String
 */
export const generateFakturXML = (fakturs: { faktur: any, row: any }[]) => {
    if (fakturs.length === 0) return '';

    // Main TIN (Seller TIN) - extracted from the first faktur's id_tku_Penjual (first 16 digits)
    const firstFaktur = fakturs[0].faktur;
    const mainTIN = (firstFaktur.id_tku_Penjual || '').slice(0, 16);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<TaxInvoiceBulk xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
    xml += `  <TIN>${escapeXML(mainTIN)}</TIN>\n`;
    xml += `  <ListOfTaxInvoice>\n`;

    fakturs.forEach(({ faktur }) => {
        xml += `    <TaxInvoice>\n`;
        xml += `      <TaxInvoiceDate>${escapeXML(faktur.tanggal_faktur?.slice(0, 10))}</TaxInvoiceDate>\n`;
        xml += `      <TaxInvoiceOpt>${escapeXML(faktur.jenis_faktur)}</TaxInvoiceOpt>\n`;
        xml += `      <TrxCode>${escapeXML(faktur.kode_transaksi)}</TrxCode>\n`;
        xml += `      <AddInfo>${escapeXML(faktur.keterangan_tambahan)}</AddInfo>\n`;
        xml += `      <CustomDoc>${escapeXML(faktur.dokumen_pendukung)}</CustomDoc>\n`;
        xml += `      <RefDesc>${escapeXML(faktur.referensi)}</RefDesc>\n`;
        xml += `      <FacilityStamp>${escapeXML(faktur.cap_fasilitas)}</FacilityStamp>\n`;
        xml += `      <SellerIDTKU>${escapeXML(faktur.id_tku_Penjual)}</SellerIDTKU>\n`;
        xml += `      <BuyerTin>${escapeXML(faktur.npwp_or_nik_pembeli)}</BuyerTin>\n`;
        xml += `      <BuyerDocument>${escapeXML(faktur.jenis_id_pembeli)}</BuyerDocument>\n`;
        xml += `      <BuyerCountry>${escapeXML(faktur.negara_pembeli)}</BuyerCountry>\n`;
        xml += `      <BuyerDocumentNumber>${escapeXML(faktur.nomor_dokumen_pembeli)}</BuyerDocumentNumber>\n`;
        xml += `      <BuyerName>${escapeXML(faktur.nama_pembeli)}</BuyerName>\n`;
        xml += `      <BuyerAdress>${escapeXML(faktur.alamat_pembeli)}</BuyerAdress>\n`;
        xml += `      <BuyerEmail>${escapeXML(faktur.email_pembeli)}</BuyerEmail>\n`;
        xml += `      <BuyerIDTKU>${escapeXML(faktur.id_tku_pembeli)}</BuyerIDTKU>\n`;
        
        xml += `      <ListOfGoodService>\n`;
        const details = faktur.details || [];
        details.forEach((detail: any) => {
            xml += `        <GoodService>\n`;
            xml += `          <Opt>${escapeXML(detail.barang_or_jasa)}</Opt>\n`;
            xml += `          <Code>${escapeXML(detail.kode_barang_jasa)}</Code>\n`;
            xml += `          <Name>${escapeXML(detail.nama_barang_or_jasa)}</Name>\n`;
            xml += `          <Unit>${escapeXML(detail.nama_satuan_ukur)}</Unit>\n`;
            xml += `          <Price>${Math.round(Number(detail.harga_satuan) || 0)}</Price>\n`;
            xml += `          <Qty>${detail.jumlah_barang_jasa || 0}</Qty>\n`;
            xml += `          <TotalDiscount>${Math.round(Number(detail.total_diskon) || 0)}</TotalDiscount>\n`;
            xml += `          <TaxBase>${Math.round(Number(detail.dpp) || 0)}</TaxBase>\n`;
            xml += `          <OtherTaxBase>${detail.dpp_nilai_lain || 0}</OtherTaxBase>\n`;
            xml += `          <VATRate>${Math.round((Number(detail.tarif_ppn) || 0) * 100)}</VATRate>\n`;
            xml += `          <VAT>${Math.abs(Math.round(Number(detail.ppn) || 0))}</VAT>\n`;
            xml += `          <STLGRate>${Math.round((Number(detail.tarif_ppnnbm) || 0) * 100)}</STLGRate>\n`;
            xml += `          <STLG>${Math.abs(Math.round(Number(detail.ppnbm) || 0))}</STLG>\n`;
            xml += `        </GoodService>\n`;
        });
        xml += `      </ListOfGoodService>\n`;
        
        xml += `    </TaxInvoice>\n`;
    });

    xml += `  </ListOfTaxInvoice>\n`;
    xml += `</TaxInvoiceBulk>`;

    return xml;
};
