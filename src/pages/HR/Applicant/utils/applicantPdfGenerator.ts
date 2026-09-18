import jsPDF from 'jspdf';
import autoTable, { CellHookData, RowInput, UserOptions } from 'jspdf-autotable';
import { loadCustomFonts, setFontSafe } from '@/utils/fontLoader';
import { formatDateLocal, formatNumberInput } from '@/helpers/generalHelper';
import { ApplicantFormListItem, ApplicantFormUpdateRequest } from '../types/applicant';
import { toDateInputValue } from './applicantForm';

type RGB = [number, number, number];

const FONT = 'Futura';
const BLACK: RGB = [0, 0, 0];
const SECTION_FILL: RGB = [217, 217, 217];
const CHECKBOX_SIZE = 2.8;

const DRIVER_LICENSE_OPTIONS = ['SIM A', 'SIM B', 'SIM C', 'SIO'];

const SCHOOL_LABELS: Record<string, string> = {
    university: 'UNIVERSITY/ Universitas',
    high_school: 'HIGH SCHOOL/ SMA',
    junior_school: 'JUNIOR SCHOOL/ SMP',
    elementary_school: 'ELEMENTARY SCHOOL/ SD',
};

const FAMILY_LABELS: Record<string, string> = {
    ayah: 'Nama Ayah',
    ibu: 'Nama Ibu',
    'suami/istri': 'Nama Suami/ Istri',
    'anak ke-1': 'Nama Anak ke-1 / Saudara ke-1',
    'anak ke-2': 'Nama Anak ke-2 / Saudara ke-2',
    'anak ke-3': 'Nama Anak ke-3 / Saudara ke-3',
    'anak ke-4': 'Nama Anak ke-4 / Saudara ke-4',
};

const normalize = (value: string): string => value.trim().toLowerCase();

const text = (value?: string | null): string => (value && value.trim() ? value.trim() : '-');

const date = (value?: string | null): string => {
    const dateValue = toDateInputValue(value ?? null);
    return dateValue ? formatDateLocal(dateValue) : text(value);
};

const salary = (value?: string | null): string => formatNumberInput(value) || text(value);

const sectionRow = (title: string, colSpan: number, halign: 'center' | 'left' = 'center'): RowInput => [
    { content: title, colSpan, styles: { fillColor: SECTION_FILL, fontStyle: 'bold', halign } },
];

const headerCell = (content: string, extra: { rowSpan?: number; colSpan?: number } = {}) => ({
    content,
    ...extra,
    styles: { fontStyle: 'bold' as const, halign: 'center' as const },
});

const padRows = <T>(rows: T[], minLength: number, createEmpty: () => T): T[] =>
    rows.length >= minLength ? rows : [...rows, ...Array.from({ length: minLength - rows.length }, createEmpty)];

const buildFileName = (values: ApplicantFormUpdateRequest): string => {
    const safe = (value: string) => value.replace(/[\\/:*?"<>|]+/g, ' ').trim();
    return `Form Applicant - ${safe(values.full_name) || 'Applicant'} - ${safe(values.position_applied_for) || '-'}.pdf`;
};

export const generateApplicantFormPDF = async (
    values: ApplicantFormUpdateRequest,
    summary: ApplicantFormListItem
): Promise<void> => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    await loadCustomFonts(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const headerHeight = 20;
    const footerHeight = 20;
    const contentTop = headerHeight + 5;
    const contentBottom = pageHeight - footerHeight - 5;
    const decoratedPages = new Set<number>();
    let cursorY = contentTop;

    const addHeader = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        try {
            const msLogo = '/motor-sights-international-logo.png';
            doc.addImage(msLogo, 'PNG', margin, 3, 24, 15);
        } catch {
            console.warn('IEC logo not found');
        }

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

        const pinIcon = '/pdf/pin.png';
        doc.addImage(pinIcon, 'PNG', margin, footerY + 4, 7, 7);
        doc.text('HEAD OFFICE', margin + 8, footerY + 6);
        setFontSafe(doc, 'Futura', 'normal');
        const address = 'Jl. Raya Cakung Cilincing, KM 35 Kav 532, RT.009/RW.08, Cakung Barat, Cakung,';
        doc.text(address, margin + 8, footerY + 10);
        doc.text('Jakarta Timur, Daerah Khusus Ibukota Jakarta, 13910', margin + 8, footerY + 14);

        const webIcon = '/pdf/web.png';
        doc.addImage(webIcon, 'PNG', pageWidth - margin - 55, footerY + 7.2, 4, 4);
        doc.text('motorsights.com', pageWidth - margin - 50, footerY + 10);

        const phoneIcon = '/pdf/phone.png';
        doc.addImage(phoneIcon, 'PNG', pageWidth - margin - 25, footerY + 7.3, 4, 4);
        doc.text('(+62) 21-8060-3068', pageWidth - margin - 20, footerY + 10);
    };

    const decorateCurrentPage = () => {
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        if (decoratedPages.has(pageNumber)) return;

        addHeader();
        addFooter();
        decoratedPages.add(pageNumber);
    };

    const resetTextStyle = (fontStyle: 'normal' | 'bold' = 'normal', fontSize = 7) => {
        setFontSafe(doc, FONT, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(...BLACK);
    };

    const drawCheckbox = (x: number, centerY: number, label: string, checked: boolean) => {
        const top = centerY - CHECKBOX_SIZE / 2;

        doc.setDrawColor(...BLACK);
        doc.setLineWidth(0.2);
        doc.rect(x, top, CHECKBOX_SIZE, CHECKBOX_SIZE, 'S');

        if (checked) {
            doc.setLineWidth(0.4);
            doc.line(x + 0.55, top + 1.5, x + 1.15, top + 2.2);
            doc.line(x + 1.15, top + 2.2, x + 2.3, top + 0.6);
        }

        resetTextStyle();
        doc.text(label, x + CHECKBOX_SIZE + 1.5, centerY + 1);
    };

    const drawTable = (options: UserOptions) => {
        autoTable(doc, {
            theme: 'grid',
            startY: cursorY,
            margin: { top: contentTop, bottom: footerHeight + 5, left: margin, right: margin },
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            styles: {
                font: FONT,
                fontStyle: 'normal',
                fontSize: 7,
                textColor: BLACK,
                lineColor: BLACK,
                lineWidth: 0.1,
                cellPadding: 1.2,
                valign: 'middle',
                minCellHeight: 6,
            },
            ...options,
            didDrawPage: (data) => {
                decorateCurrentPage();
                if (data.cursor) cursorY = data.cursor.y;
            },
        });
    };

    decorateCurrentPage();

    resetTextStyle('bold', 12);
    doc.text('APPLICANT FORM', pageWidth / 2, cursorY + 4, { align: 'center' });

    cursorY += 8;

    const ownedLicenses = values.driver_license.map(license => normalize(license.name));
    const informationRows: RowInput[] = [
        sectionRow('APPLICANT INFORMATION/ INFORMASI PELAMAR', 4),
        ['FULL NAME / Nama lengkap', text(values.full_name), 'ADDRESS AS PER ID CARD/ Alamat sesuai KTP', text(values.address_as_per_id_card)],
        ['NICKNAME / Nama panggilan', text(values.nickname), 'PRESENT ADDRESS/ Alamat saat ini', text(values.present_address)],
        ['MOBILE / Handphone', text(values.no_mobile), 'CITY/ Kota', text(values.city)],
        [
            'NAME, RELATIONSHIP, AND EMERGENCY CONTACT NUMBER/ Nama, hubungan, nomor kontak darurat',
            text(values.name_relationship_emergency_contact_number),
            'PLACE, DATE OF BIRTH / Tempat, tanggal lahir',
            text(values.place_date_of_birth),
        ],
        ['EMAIL / Alamat email', text(values.email), 'BLOOD TYPE/ Golongan Darah', text(values.blood_type)],
        ['ID NUMBER/ No. KTP', text(values.id_number), 'TAX IDENTIFICATION NUMBER/ NPWP', text(values.tax_identification_number)],
        ['POSITION APPLIED FOR/ Posisi yang dilamar', text(values.position_applied_for), 'WORKING AVAILABLE DATE/ Tanggal siap bekerja', date(values.working_available_date)],
        ['MARITAL STATUS/ Status pernikahan', text(values.marital_status), 'RELIGION/ Agama', text(values.relogion)],
        ['HEIGHT & WEIGHT/ Tinggi & berat badan', text(values.height_weight), 'T-SHIRT SIZE/ Ukuran kaos', text(values.tshirt_size)],
        ["DRIVER's LICENSE/ Izin mengemudi", { content: '', colSpan: 3 }],
    ];
    const driverLicenseRowIndex = informationRows.length - 1;

    drawTable({
        body: informationRows,
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 55 }, 2: { cellWidth: 40 }, 3: { cellWidth: 55 } },
        didDrawCell: (data: CellHookData) => {
            if (data.section !== 'body' || data.row.index !== driverLicenseRowIndex || data.column.index !== 1) return;

            const slotWidth = data.cell.width / DRIVER_LICENSE_OPTIONS.length;
            const centerY = data.cell.y + data.cell.height / 2;
            DRIVER_LICENSE_OPTIONS.forEach((option, index) => {
                drawCheckbox(data.cell.x + 2 + slotWidth * index, centerY, option, ownedLicenses.includes(normalize(option)));
            });
        },
    });

    drawTable({
        body: [
            sectionRow('EDUCATIONAL BACKGROUND/ LATAR BELAKANG PENDIDIKAN', 6),
            [
                headerCell('TYPE OF SCHOOL/ Jenjang Pendidikan'),
                headerCell('NAME OF SCHOOL/ Nama Institusi'),
                headerCell('LOCATION/ Lokasi'),
                headerCell('GRADUATE/ Gelar Kelulusan'),
                headerCell('MAJOR/ Jurusan'),
                headerCell('GRADUATION YEAR/ Tahun Lulus'),
            ],
            ...values.educational_background.map(row => [
                SCHOOL_LABELS[normalize(row.type_of_school)] || text(row.type_of_school),
                text(row.name_of_school),
                text(row.location),
                text(row.graduate),
                text(row.major),
                text(row.graduation_year),
            ]),
        ],
        columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 38 }, 2: { cellWidth: 26 }, 3: { cellWidth: 30 }, 4: { cellWidth: 36 }, 5: { cellWidth: 28 } },
    });

    const informalRows = padRows(
        values.informal_education_special_qualification.map(row => [
            text(row.type_of_training),
            text(row.institution_name),
            text(row.location),
            text(row.certification),
            text(row.periode),
        ]),
        3,
        () => ['', '', '', '', '']
    );

    drawTable({
        body: [
            sectionRow('INFORMAL EDUCATION AND SPECIAL QUALIFICATION/ PENDIDIKAN INFORMAL DAN KETERAMPILAN KHUSUS', 5),
            [
                headerCell('TYPE OF TRAINING/ NAME OF SKILL/ Jenis Pelatihan/ Nama Keterampilan'),
                headerCell("INSTITUTION'S NAME/ Nama Institusi Pelatihan"),
                headerCell('LOCATION/ Tempat'),
                headerCell('CERTIFICATION/ Sertifikasi'),
                headerCell('PERIODE/ Waktu'),
            ],
            ...informalRows,
        ],
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 45 }, 2: { cellWidth: 30 }, 3: { cellWidth: 35 }, 4: { cellWidth: 30 } },
    });

    drawTable({
        body: [
            sectionRow('FAMILY BACKGROUND/ LATAR BELAKANG KELUARGA', 5),
            [
                headerCell(''),
                headerCell('NAME/ Nama'),
                headerCell('AGE/ Usia'),
                headerCell('EMPLOYMENT/ Pekerjaan'),
                headerCell('EMERGENCY CONTACT NUMBER/ Kontak Darurat'),
            ],
            ...values.family_background.map(row => [
                FAMILY_LABELS[normalize(row.relationship)] || text(row.relationship),
                text(row.name),
                text(row.age),
                text(row.employment),
                text(row.emergency_contact_number),
            ]),
        ],
        columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 50 }, 2: { cellWidth: 20 }, 3: { cellWidth: 44 }, 4: { cellWidth: 34 } },
    });

    const experienceRows = padRows(
        values.working_experiences.map(row => [
            text(row.name_of_company),
            date(row.date_from),
            date(row.date_final),
            salary(row.pay_of_salary),
            text(row.name_of_supervisor),
            text(row.reason_of_leaving),
        ]),
        5,
        () => ['', '', '', '', '', '']
    );

    drawTable({
        body: [
            sectionRow('WORKING EXPERIENCES/ PENGALAMAN KERJA', 6),
            [
                headerCell('NAME OF COMPANY/ Nama Perusahaan', { rowSpan: 2 }),
                headerCell('EMPLOYMENT DATES/ Tanggal aktif bekerja', { colSpan: 2 }),
                headerCell('PAY OF SALARY/ Gaji yang dibayar', { rowSpan: 2 }),
                headerCell('NAME OF SUPERVISOR/ Nama Atasan langsung', { rowSpan: 2 }),
                headerCell('REASON FOR LEAVING/ Alasan mengundurkan diri', { rowSpan: 2 }),
            ],
            [headerCell('From/ dari'), headerCell('Final/ terakhir')],
            ...experienceRows,
        ],
        columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 24 }, 2: { cellWidth: 24 }, 3: { cellWidth: 30 }, 4: { cellWidth: 34 }, 5: { cellWidth: 40 } },
    });

    const references = padRows(values.references_old_company, 2, () => ({ name: '', position_company: '', phone: '' }));

    drawTable({
        body: [
            sectionRow('Please list at least two references (HR & User)\nSebutkan sedikitnya dua orang referensi (HR & Atasan Langsung)', 2, 'left'),
            ...references.flatMap((reference, index) => [
                [`${index + 1}. Name/ Nama`, `: ${reference.name.trim()}`],
                ['Position Company/ Jabatan', `: ${reference.position_company.trim()}`],
                ['Phone/ Telepon', `: ${reference.phone.trim()}`],
            ]),
        ],
        styles: {
            font: FONT,
            fontStyle: 'normal',
            fontSize: 7,
            textColor: BLACK,
            lineColor: BLACK,
            lineWidth: 0.1,
            cellPadding: 1.2,
            valign: 'middle',
            minCellHeight: 5,
        },
        columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 145 } },
    });

    const answerOptions = [
        { value: 'ya', label: 'Ya' },
        { value: 'tidak', label: 'Tidak' },
    ];

    drawTable({
        body: [
            sectionRow('Please select one of the following answers.\nSilahkan pilih salah satu jawaban dari pertanyaan berikut.', 3, 'left'),
            ...values.following_answers.map(row => [text(row.question), '', '']),
        ],
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
        didDrawCell: (data: CellHookData) => {
            if (data.section !== 'body' || data.row.index === 0 || data.column.index === 0) return;

            const answer = values.following_answers[data.row.index - 1];
            const option = answerOptions[data.column.index - 1];
            if (!answer || !option) return;

            const centerY = data.cell.y + data.cell.height / 2;
            const startX = data.cell.x + data.cell.width / 2 - 5;
            drawCheckbox(startX, centerY, option.label, normalize(answer.answers) === option.value);
        },
    });

    if (cursorY + 32 > contentBottom) {
        doc.addPage();
        decorateCurrentPage();
        cursorY = contentTop;
    }

    resetTextStyle();
    doc.text('I certified that all answers given herein are true and complete to the best of my knowledge', margin, cursorY + 6);
    doc.text('Signature of Applicant/ Tanda tangan pelamar', margin, cursorY + 28);
    doc.text(`Date/ Tanggal: ${summary.completed_at ? date(summary.completed_at) : ''}`, margin + 100, cursorY + 28);

    doc.save(buildFileName(values));
};
