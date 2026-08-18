// @ts-nocheck
// PDF Interview Report Generator
// Ported 1:1 from cum-web's Interview/Module/Form/PDFInterviewReport.js so the
// generated report matches the existing system: logo header, weighted score
// multipliers, per-section TOTAL rows, and the Performance Summary + radar
// chart page. Only two things are adapted for this app:
//   - toast: react-hot-toast instead of react-toastify (same .error/.success API)
//   - logo: loaded from /motor-sights-international.png (byte-identical to
//     cum-web's assets/img/motor-sights-international.png) as a data URL first,
//     since jsPDF's addImage needs actual image data, not a bare path
//   - buildInterviewPDFDoc() is split out so the doc can be previewed as a Blob
//     before deciding to download, instead of always force-saving immediately

import { toast } from 'react-hot-toast';

interface FormData {
  data_candidate?: Record<string, unknown>;
  data_score?: Array<{ company_value: string; total_score: number }>;
  interview?: Array<{
    company_value: string;
    comment?: string;
    detail_interviews?: Array<{
      aspect: string;
      question: string;
      answer: string;
      score: number;
    }>;
  }>;
}

let librariesCache: {
  jsPDF: any;
  html2canvas: any;
  initialized: boolean;
} = {
  jsPDF: null,
  html2canvas: null,
  initialized: false,
};

let autoTableAvailable = false;
let logoDataUrlCache: string | null = null;

const resetLibrariesCache = () => {
  librariesCache = { jsPDF: null, html2canvas: null, initialized: false };
  autoTableAvailable = false;
};

const initializeLibraries = async () => {
  if (librariesCache.initialized) return librariesCache;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Library loading timeout')), 30000)
    );

    const loadPromise = Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);

    const [jsPDFModule, html2canvasModule] = await Promise.race([loadPromise, timeoutPromise]);

    const jsPDFClass = jsPDFModule.default;
    const html2canvasClass = html2canvasModule.default;

    try {
      await Promise.race([
        import('jspdf-autotable'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('autoTable timeout')), 10000)),
      ]);

      const testDoc = new jsPDFClass();
      autoTableAvailable = typeof testDoc.autoTable === 'function';
    } catch (e) {
      console.warn('autoTable not available:', e.message);
      autoTableAvailable = false;
    }

    librariesCache.jsPDF = jsPDFClass;
    librariesCache.html2canvas = html2canvasClass;
    librariesCache.initialized = true;

    return librariesCache;
  } catch (error) {
    console.error('Failed to load PDF libraries:', error);
    resetLibrariesCache();
    throw new Error(`Library initialization failed: ${error.message}`);
  }
};

// Fetch the app logo once and cache it as a data URL — jsPDF's addImage needs
// actual image data, not a bare path like cum-web passes it.
const loadLogoDataUrl = async (): Promise<string | null> => {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const res = await fetch('/motor-sights-international.png');
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    logoDataUrlCache = dataUrl;
    return dataUrl;
  } catch (error) {
    console.warn('Logo loading failed:', error);
    return null;
  }
};

// Generate candidate information table
const generateManualTable = (doc: any, formData: FormData, yPosition: number) => {
  const posisi_x = 5;
  const candidateData: any = formData.data_candidate || {};

  const candidateInfo = [
    ['Candidate Name', candidateData.name_candidate || 'N/A', 'Gender', candidateData.gender_candidate || 'N/A'],
    ['Company', candidateData.company_candidate || 'N/A', 'Interviewer', candidateData.interviewer_candidate || 'N/A'],
    ['Position', candidateData.position_candidate || 'N/A', 'Date of Interview', candidateData.date_interview_candidate || 'N/A'],
    ['Age', candidateData.age_candidate || 'N/A', 'Duration', candidateData.duration_candidate ? `${candidateData.duration_candidate} hour(s)` : 'N/A'],
  ];

  let currentY = yPosition;
  const rowHeight = 8;
  const col1Width = 40;
  const col2Width = 60;

  currentY += rowHeight;

  // jsPDF's doc.text() throws if given a non-string (e.g. a numeric age) — coerce every cell.
  const cell = (value: unknown) => (value === null || value === undefined || value === '' ? 'N/A' : String(value));

  candidateInfo.forEach((row) => {
    if (row.length === 4) {
      doc.setFillColor(2, 83, 165);
      doc.rect(posisi_x, currentY, col1Width, rowHeight, 'F');
      doc.rect(posisi_x + col1Width + col2Width, currentY, col1Width, rowHeight, 'F');

      doc.setFillColor(248, 251, 255);
      doc.rect(posisi_x + col1Width, currentY, col2Width, rowHeight, 'F');
      doc.rect(posisi_x + col1Width + col2Width + col1Width, currentY, col2Width, rowHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(cell(row[0]), posisi_x + 2, currentY + 5);
      doc.text(cell(row[2]), posisi_x + 2 + col1Width + col2Width, currentY + 5);

      doc.setTextColor(44, 62, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(cell(row[1]), posisi_x + 2 + col1Width, currentY + 5);
      doc.text(cell(row[3]), posisi_x + 2 + col1Width + col2Width + col1Width, currentY + 5);
    }

    currentY += rowHeight;
  });

  doc.setLineWidth(0.1);
  doc.setDrawColor(255, 255, 255);

  const tableWidth = (col1Width + col2Width) * 2;
  doc.rect(posisi_x, yPosition, tableWidth, rowHeight);

  candidateInfo.forEach((row, index) => {
    const y = yPosition + rowHeight + index * rowHeight;
    if (row.length === 4) {
      doc.rect(posisi_x, y, col1Width, rowHeight);
      doc.rect(posisi_x + col1Width, y, col2Width, rowHeight);
      doc.rect(posisi_x + col1Width + col2Width, y, col1Width, rowHeight);
      doc.rect(posisi_x + col1Width + col2Width + col1Width, y, col2Width, rowHeight);
    }
  });

  doc.setLineWidth(0.2);
  doc.setDrawColor(0);
  doc.rect(posisi_x, yPosition + 8, tableWidth, rowHeight * 4);

  return currentY + 8;
};

const addPageNumbers = (doc: any) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const currentPage = doc.internal.getCurrentPageInfo().pageNumber;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    const pageText = `Page ${i} of ${pageCount}`;
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - textWidth - 15, pageHeight - 5);
  }

  doc.setPage(currentPage);
};

const addLogoToDoc = (doc: any, logoData: string | null, x: number, y: number, width: number, height: number) => {
  try {
    if (logoData) {
      doc.addImage(logoData, 'PNG', x, y, width, height);
    } else {
      doc.setFillColor(52, 58, 64);
      doc.rect(x, y, width, height, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('LOGO', x + width / 2, y + height / 2 + 2, { align: 'center' });
    }
  } catch (error) {
    console.warn('Error adding logo:', error);
    doc.setFillColor(52, 58, 64);
    doc.rect(x, y, width, height, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('LOGO', x + width / 2, y + height / 2 + 2, { align: 'center' });
  }
};

const getMultipliedScore = (companyValue: string, score: number) => {
  switch (companyValue) {
    case 'SIAH':
      return score * 2;
    case '7 Values': {
      const multipliedValue = score * 1.7;
      return Math.floor(multipliedValue) + (multipliedValue % 1 >= 0.5 ? 1 : 0);
    }
    case 'CSE':
      return score * 2;
    default:
      return score;
  }
};

const STANDARD_VALUES: Record<string, number> = {
  SIAH: 40, '7 Values': 60, CSE: 40, SDT: 40, EXPERIENCE: 20,
};

const DESIRED_ORDER = ['SIAH', '7 Values', 'CSE', 'SDT', 'EXPERIENCE'];

// Generate manual assessment table with advanced features
const generateManualAssessmentTable = (doc: any, formData: FormData, yPosition: number) => {
  const posisi_x = 5;
  let currentY = yPosition - 5;
  const baseRowHeight = 8;
  const pageWidth = doc.internal.pageSize.width - 10;
  const pageHeight = doc.internal.pageSize.height;

  const colCompanyWidth = 30;
  const colStandardWidth = 20;
  const colQuestionWidth = 50;
  const colScoreWidth = 15;
  const colRemarksWidth = pageWidth - (colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth);

  const drawTableHeader = (yPos: number) => {
    doc.setFillColor(52, 73, 94);
    doc.rect(posisi_x, yPos, colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth, baseRowHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Company', posisi_x + colCompanyWidth / 2, yPos + 3, { align: 'center' });
    doc.text('Culture', posisi_x + colCompanyWidth / 2, yPos + 6, { align: 'center' });
    doc.text('Standard', posisi_x + colCompanyWidth + colStandardWidth / 2, yPos + 3, { align: 'center' });
    doc.text('Point', posisi_x + colCompanyWidth + colStandardWidth / 2, yPos + 6, { align: 'center' });
    doc.text('Indicator', posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth / 2, yPos + 3, { align: 'center' });
    doc.text('(Culture & Question)', posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth / 2, yPos + 6, { align: 'center' });
    doc.text('Score', posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth / 2, yPos + 5, { align: 'center' });
    doc.text('Answer/Remarks', posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth / 2, yPos + 5, { align: 'center' });

    doc.setLineWidth(0.1);
    doc.setDrawColor(222, 226, 230);
    doc.line(posisi_x + colCompanyWidth, yPos, posisi_x + colCompanyWidth, yPos + baseRowHeight);
    doc.line(posisi_x + colCompanyWidth + colStandardWidth, yPos, posisi_x + colCompanyWidth + colStandardWidth, yPos + baseRowHeight);
    doc.line(posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth, yPos, posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth, yPos + baseRowHeight);
    doc.line(posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth, yPos, posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth, yPos + baseRowHeight);

    const segmentSectionWidth = colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth;
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
    doc.rect(posisi_x, yPos, segmentSectionWidth, baseRowHeight);
    return yPos + baseRowHeight;
  };

  currentY = drawTableHeader(currentY);

  const groupedData: Record<string, any[]> = {};
  if (formData.interview && Array.isArray(formData.interview)) {
    formData.interview.forEach((item) => {
      if (!groupedData[item.company_value]) groupedData[item.company_value] = [];
      groupedData[item.company_value].push(item);
    });
  }

  const sortedCompanyValues = DESIRED_ORDER.filter((company) => groupedData[company]);

  sortedCompanyValues.forEach((companyValue, companyIndex) => {
    const items = groupedData[companyValue];

    if (companyIndex !== 0) {
      currentY = drawTableHeader(currentY);
    }

    let companyStartY = currentY;
    const pageSegments = [{ startY: companyStartY, endY: companyStartY }];
    let currentSegmentIndex = 0;

    const aspectGroups: Record<string, any[]> = {};
    items.forEach((item) => {
      const aspect = item.aspect || 'N/A';
      if (!aspectGroups[aspect]) aspectGroups[aspect] = [];
      aspectGroups[aspect].push(item);
    });

    const drawCompanySegment = (segmentStartY: number, segmentHeight: number, cv: string) => {
      if (segmentHeight <= 0) return;

      const segmentTextY = segmentStartY + segmentHeight / 2 + 1;

      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.setFillColor(52, 73, 94);
      doc.rect(posisi_x, segmentStartY, colCompanyWidth, segmentHeight, 'F');

      doc.setFillColor(74, 144, 226);
      doc.rect(posisi_x + colCompanyWidth, segmentStartY, colStandardWidth, segmentHeight, 'F');

      doc.setGState(new doc.GState({ opacity: 1 }));

      doc.setTextColor(44, 62, 80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(cv, colCompanyWidth - 4);
      const lineHeight = 3;
      const textStartY = segmentTextY - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line: string, i: number) => {
        doc.text(line, posisi_x + colCompanyWidth / 2, textStartY + i * lineHeight, { align: 'center' });
      });

      const standardPoint = STANDARD_VALUES[cv] || 0;
      doc.setTextColor(44, 62, 80);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(standardPoint.toString(), posisi_x + colCompanyWidth + colStandardWidth / 2, segmentTextY, { align: 'center' });

      doc.setLineWidth(0.1);
      doc.setDrawColor(222, 226, 230);
      doc.rect(posisi_x, segmentStartY, colCompanyWidth, segmentHeight);
      doc.rect(posisi_x + colCompanyWidth, segmentStartY, colStandardWidth, segmentHeight);

      const segmentSectionWidth = colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth;
      doc.setLineWidth(0.2);
      doc.setDrawColor(0);
      doc.rect(posisi_x, segmentStartY, segmentSectionWidth, segmentHeight);
    };

    const drawAspectHeader = (aspectName: string, yPos: number) => {
      const aspectHeaderHeight = 8;

      if (yPos + aspectHeaderHeight > pageHeight - 10) {
        pageSegments[currentSegmentIndex].endY = yPos;

        const segmentHeight = pageSegments[currentSegmentIndex].endY - pageSegments[currentSegmentIndex].startY;
        const segmentStartY = pageSegments[currentSegmentIndex].startY;
        drawCompanySegment(segmentStartY, segmentHeight, companyValue);

        doc.addPage();
        yPos = 10;
        yPos = drawTableHeader(yPos);
        companyStartY = yPos;

        currentSegmentIndex++;
        pageSegments.push({ startY: companyStartY, endY: companyStartY });
      }

      doc.setFillColor(41, 128, 185);
      doc.rect(posisi_x + colCompanyWidth + colStandardWidth, yPos, colQuestionWidth + colScoreWidth + colRemarksWidth, aspectHeaderHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(aspectName, posisi_x + colCompanyWidth + colStandardWidth + 2, yPos + 5);

      doc.setLineWidth(0.1);
      doc.setDrawColor(222, 226, 230);
      doc.rect(posisi_x + colCompanyWidth + colStandardWidth, yPos, colQuestionWidth + colScoreWidth + colRemarksWidth, aspectHeaderHeight);

      return yPos + aspectHeaderHeight;
    };

    const aspectOrderMap: Record<string, string[]> = {
      SIAH: ['Sincerity', 'Trustworthy', 'Altruism', 'Humble'],
      '7 Values': ['Giving Meaning', 'Love to learn', 'Happy practice', 'Like innovation', 'Happy to share', 'Embrace failure', 'Habit of excellence'],
      CSE: ['Self Esteem', 'Self Efficacy', 'Locus of control', 'Emotional Stability'],
      EXPERIENCE: ['Role Matching', 'Product Knowledge', 'Significant Contribution', 'Goals align with ROE Company'],
      SDT: [],
    };

    const aspectOrder = aspectOrderMap[companyValue] || [];
    const sortedAspectNames = Object.keys(aspectGroups).sort((a, b) => {
      const indexA = aspectOrder.indexOf(a);
      const indexB = aspectOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    sortedAspectNames.forEach((aspectName) => {
      const aspectItems = aspectGroups[aspectName];

      currentY = drawAspectHeader(aspectName, currentY);
      let aspectHeaderDrawnOnCurrentPage = true;

      aspectItems.forEach((item, index) => {
        const originalScore = item.score || 0;
        const multipliedScore = getMultipliedScore(companyValue, originalScore);

        let maxLines = 1;
        const question = item.question || 'N/A';
        const wrappedQuestion = doc.splitTextToSize(question, colQuestionWidth - 4);
        maxLines = Math.max(maxLines, wrappedQuestion.length);

        const answer = item.answer || 'N/A';
        const wrappedAnswer = doc.splitTextToSize(answer, colRemarksWidth);
        maxLines = Math.max(maxLines, wrappedAnswer.length);

        const dynamicRowHeight = Math.max(baseRowHeight, maxLines * 3 + 3);

        if (currentY + dynamicRowHeight > pageHeight - 10) {
          pageSegments[currentSegmentIndex].endY = currentY;

          const segmentHeight = pageSegments[currentSegmentIndex].endY - pageSegments[currentSegmentIndex].startY;
          const segmentStartY = pageSegments[currentSegmentIndex].startY;
          drawCompanySegment(segmentStartY, segmentHeight, companyValue);

          doc.addPage();
          currentY = 10;
          currentY = drawTableHeader(currentY);
          aspectHeaderDrawnOnCurrentPage = true;

          companyStartY = currentY;
          currentSegmentIndex++;
          pageSegments.push({ startY: companyStartY, endY: companyStartY });
        }

        if (!aspectHeaderDrawnOnCurrentPage) {
          currentY = drawAspectHeader(aspectName, currentY);
          aspectHeaderDrawnOnCurrentPage = true;
          if (pageSegments.length > 0) {
            pageSegments[currentSegmentIndex].startY = currentY;
          }
        }

        if (index % 2 === 0) doc.setFillColor(250, 252, 255);
        else doc.setFillColor(245, 248, 252);
        doc.rect(posisi_x, currentY, colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth, dynamicRowHeight, 'F');

        doc.setTextColor(44, 62, 80);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(wrappedQuestion, posisi_x + colCompanyWidth + colStandardWidth + 2, currentY + 4);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(44, 62, 80);
        doc.text(multipliedScore.toString(), posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth / 2, currentY + 5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(44, 62, 80);
        doc.text(wrappedAnswer, posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + 2, currentY + 4);

        doc.setLineWidth(0.1);
        doc.setDrawColor(222, 226, 230);
        doc.rect(posisi_x + colCompanyWidth + colStandardWidth, currentY, colQuestionWidth, dynamicRowHeight);
        doc.rect(posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth, currentY, colScoreWidth, dynamicRowHeight);
        doc.rect(posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth, currentY, colRemarksWidth, dynamicRowHeight);

        currentY += dynamicRowHeight;
        pageSegments[currentSegmentIndex].endY = currentY;
      });
    });

    const lastSegmentHeight = pageSegments[currentSegmentIndex].endY - pageSegments[currentSegmentIndex].startY;
    const lastSegmentStartY = pageSegments[currentSegmentIndex].startY;
    drawCompanySegment(lastSegmentStartY, lastSegmentHeight, companyValue);

    if (currentY + baseRowHeight > pageHeight - 10) {
      doc.addPage();
      currentY = 10;
      currentY = drawTableHeader(currentY);
    }

    doc.setFillColor(2, 83, 165);
    doc.rect(posisi_x, currentY, colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth, baseRowHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL', posisi_x + colCompanyWidth + colStandardWidth + 2, currentY + 5);

    let totalWithMultiplier = 0;
    items.forEach((item) => {
      const originalScore = item.score || 0;
      totalWithMultiplier += getMultipliedScore(companyValue, originalScore);
    });

    doc.setFontSize(11);
    doc.text(totalWithMultiplier.toString(), posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth / 2, currentY + 5, { align: 'center' });

    const standardTotal = STANDARD_VALUES[companyValue] || 0;
    doc.setFontSize(11);
    doc.text(`(Target: ${standardTotal})`, posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + 2, currentY + 5);

    doc.setLineWidth(0.2);
    doc.setDrawColor(222, 226, 230);
    doc.rect(posisi_x, currentY, colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth, baseRowHeight);

    currentY += baseRowHeight + 2;
  });

  return currentY + 8;
};

const getEvaluation = (total: number) => {
  if (total <= 20) return { remark: 'Very Poor', recommendation: 'Reject', color: [220, 53, 69] };
  if (total <= 40) return { remark: 'Poor', recommendation: 'Reject', color: [255, 193, 7] };
  if (total <= 60) return { remark: 'Average', recommendation: 'Consideration - need comparison', color: [0, 123, 255] };
  if (total <= 80) return { remark: 'Good', recommendation: 'Next Process To be Hired', color: [40, 167, 69] };
  return { remark: 'Excellent', recommendation: 'Next Process To be Hired', color: [40, 167, 69] };
};

const getValidMetrics = (formData: FormData) =>
  Array.isArray(formData.data_score)
    ? formData.data_score.filter((m) => m && typeof m === 'object' && typeof m.total_score === 'number' && m.company_value)
    : [];

const sortMetrics = (metrics: any[]) =>
  [...metrics].sort((a, b) => {
    const indexA = DESIRED_ORDER.indexOf(a.company_value);
    const indexB = DESIRED_ORDER.indexOf(b.company_value);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    return orderA - orderB;
  });

const STANDARD_VALUE_LIST = [
  { company_value: 'SIAH', total_score: 40 },
  { company_value: '7 Values', total_score: 60 },
  { company_value: 'CSE', total_score: 40 },
  { company_value: 'SDT', total_score: 40 },
  { company_value: 'EXPERIENCE', total_score: 20 },
];

// Generate the "Performance Summary" table (Actual/Target/Achievement %)
const generateComprehensiveScoreSection = (doc: any, formData: FormData, yPosition: number, logoData: string | null) => {
  let currentY = yPosition;
  const pageWidth = doc.internal.pageSize.width;

  const validMetrics = getValidMetrics(formData);
  const sortedMetrics = sortMetrics(validMetrics);
  const total = sortedMetrics.reduce((sum, m) => sum + getMultipliedScore(m.company_value, m.total_score), 0);
  const { remark, recommendation, color } = getEvaluation(total);

  doc.setFontSize(10);
  doc.setTextColor(color[0], color[1], color[2]);

  try {
    const logoWidth = 70;
    const logoHeight = 8;
    addLogoToDoc(doc, logoData, 20, currentY - 2, logoWidth, logoHeight);
    currentY += logoHeight + 10;
  } catch (logoError) {
    console.warn('Logo loading failed in performance summary:', logoError);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFORMANCE SUMMARY', 25, currentY);

  currentY += 5;

  if (sortedMetrics.length > 0) {
    const detailRowHeight = 8;
    const tableStartX = 20;
    const tableWidth = pageWidth - 40;

    const col1Width = Math.floor(tableWidth * 0.35);
    const col2Width = Math.floor(tableWidth * 0.2);
    const col3Width = Math.floor(tableWidth * 0.2);
    const col4Width = tableWidth - col1Width - col2Width - col3Width;

    doc.setFillColor(52, 73, 94);
    doc.rect(tableStartX, currentY, tableWidth, detailRowHeight, 'F');
    doc.setLineWidth(0.1);
    doc.setDrawColor(222, 226, 230);
    doc.rect(tableStartX, currentY, tableWidth, detailRowHeight);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Company Value', tableStartX + col1Width / 2, currentY + 6, { align: 'center' });
    doc.text('Actual', tableStartX + col1Width + col2Width / 2, currentY + 6, { align: 'center' });
    doc.text('Target', tableStartX + col1Width + col2Width + col3Width / 2, currentY + 6, { align: 'center' });
    doc.text('Achievement', tableStartX + col1Width + col2Width + col3Width + col4Width / 2, currentY + 6, { align: 'center' });

    doc.setLineWidth(0.1);
    doc.setDrawColor(222, 226, 230);
    doc.line(tableStartX + col1Width, currentY + 1, tableStartX + col1Width, currentY + detailRowHeight - 1);
    doc.line(tableStartX + col1Width + col2Width, currentY + 1, tableStartX + col1Width + col2Width, currentY + detailRowHeight - 1);
    doc.line(tableStartX + col1Width + col2Width + col3Width, currentY + 1, tableStartX + col1Width + col2Width + col3Width, currentY + detailRowHeight - 1);

    currentY += detailRowHeight;

    sortedMetrics.forEach((metric, index) => {
      const standard = STANDARD_VALUE_LIST.find((s) => s.company_value === metric.company_value);
      const standardScore = standard ? standard.total_score : 0;
      const multipliedScore = getMultipliedScore(metric.company_value, metric.total_score);
      const percentage = standardScore === 0 ? 100 : Math.round((multipliedScore / standardScore) * 100);

      const rowBgColor = index % 2 === 0 ? [249, 251, 253] : [255, 255, 255];
      doc.setFillColor(rowBgColor[0], rowBgColor[1], rowBgColor[2]);
      doc.rect(tableStartX, currentY, tableWidth, detailRowHeight, 'F');
      doc.setLineWidth(0.1);
      doc.setDrawColor(222, 226, 230);
      doc.rect(tableStartX, currentY, tableWidth, detailRowHeight);

      doc.setTextColor(44, 62, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 73, 94);
      doc.text(metric.company_value, tableStartX + col1Width / 2, currentY + 6, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const actualColor = multipliedScore >= standardScore ? [39, 174, 96] : [231, 76, 60];
      doc.setTextColor(actualColor[0], actualColor[1], actualColor[2]);
      doc.text(multipliedScore.toString(), tableStartX + col1Width + col2Width / 2, currentY + 6, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(standardScore.toString(), tableStartX + col1Width + col2Width + col3Width / 2, currentY + 6, { align: 'center' });

      let achievementColor = [231, 76, 60];
      if (percentage >= 100) achievementColor = [39, 174, 96];
      else if (percentage >= 80) achievementColor = [52, 152, 219];
      else if (percentage >= 60) achievementColor = [241, 196, 15];

      const achievementBarWidth = Math.floor(col4Width * 0.65);
      const achievementBarHeight = 5;
      const achievementBarX = tableStartX - 5 + col1Width + col2Width + col3Width + (col4Width - achievementBarWidth) / 2;
      const achievementBarY = currentY + 1.5;

      doc.setFillColor(236, 240, 244);
      doc.rect(achievementBarX, achievementBarY, achievementBarWidth, achievementBarHeight, 'F');
      doc.setLineWidth(0.1);
      doc.setDrawColor(189, 195, 199);
      doc.rect(achievementBarX, achievementBarY, achievementBarWidth, achievementBarHeight);

      const achievementFillWidth = (achievementBarWidth * Math.min(percentage, 100)) / 100;
      doc.setFillColor(achievementColor[0], achievementColor[1], achievementColor[2]);
      doc.rect(achievementBarX, achievementBarY, achievementFillWidth, achievementBarHeight, 'F');

      doc.setTextColor(achievementColor[0], achievementColor[1], achievementColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(`${percentage}%`, achievementBarX + achievementBarWidth + 3, currentY + 6);

      doc.setLineWidth(0.1);
      doc.setDrawColor(222, 226, 230);
      doc.line(tableStartX + col1Width, currentY, tableStartX + col1Width, currentY + detailRowHeight);
      doc.line(tableStartX + col1Width + col2Width, currentY, tableStartX + col1Width + col2Width, currentY + detailRowHeight);
      doc.line(tableStartX + col1Width + col2Width + col3Width, currentY, tableStartX + col1Width + col2Width + col3Width, currentY + detailRowHeight);

      doc.setLineWidth(0.1);
      doc.setDrawColor(222, 226, 230);
      doc.rect(tableStartX, currentY, col1Width, detailRowHeight);
      doc.rect(tableStartX + col1Width, currentY, col2Width, detailRowHeight);
      doc.rect(tableStartX + col1Width + col2Width, currentY, col3Width, detailRowHeight);
      doc.rect(tableStartX + col1Width + col2Width + col3Width, currentY, col4Width, detailRowHeight);

      currentY += detailRowHeight;
    });

    doc.setFillColor(2, 83, 165);
    doc.rect(tableStartX, currentY, tableWidth, detailRowHeight, 'F');
    doc.setLineWidth(0.1);
    doc.setDrawColor(222, 226, 230);
    doc.rect(tableStartX, currentY, tableWidth, detailRowHeight);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('OVERALL TOTAL', tableStartX + col1Width / 2, currentY + 6, { align: 'center' });

    const overallActual = sortedMetrics.reduce((sum, m) => sum + getMultipliedScore(m.company_value, m.total_score), 0);
    const overallTarget = sortedMetrics.reduce((sum, m) => {
      const standard = STANDARD_VALUE_LIST.find((s) => s.company_value === m.company_value);
      return sum + (standard ? standard.total_score : 0);
    }, 0);
    const overallPercentage = overallTarget === 0 ? 100 : Math.round((overallActual / overallTarget) * 100);

    doc.setFontSize(11);
    doc.text(overallActual.toString(), tableStartX + col1Width + col2Width / 2, currentY + 6, { align: 'center' });
    doc.setFontSize(9);
    doc.text(overallTarget.toString(), tableStartX + col1Width + col2Width + col3Width / 2, currentY + 6, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`${overallPercentage}%`, tableStartX + col1Width + col2Width + col3Width + col4Width / 2, currentY + 6, { align: 'center' });

    currentY += detailRowHeight + 5;
  }

  return { nextY: currentY + 5, total, remark, recommendation, color };
};

export const generateChartImage = async (formData: FormData) => {
  let chartContainer: HTMLDivElement | null = null;
  let chart: any = null;

  try {
    const { html2canvas } = await initializeLibraries();

    chartContainer = document.createElement('div');
    chartContainer.id = 'pdf-chart-container';
    chartContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 600px;
      height: 400px;
      background-color: white;
      padding: 20px;
      z-index: -1;
    `;
    document.body.appendChild(chartContainer);

    const chartLoadPromise = import('chart.js');
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Chart.js loading timeout')), 15000));
    const chartModule: any = await Promise.race([chartLoadPromise, timeoutPromise]);

    const ChartJS = chartModule.default || chartModule.Chart || chartModule;
    if (!ChartJS || typeof ChartJS !== 'function') {
      throw new Error('Chart.js failed to load properly');
    }

    try {
      const { RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } = chartModule;
      if (RadialLinearScale && PointElement && LineElement && Filler && Tooltip && Legend) {
        ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
      }
    } catch (registerError) {
      console.warn('Chart.js component registration failed:', registerError);
    }

    const validMetrics = getValidMetrics(formData);
    if (validMetrics.length === 0) {
      throw new Error('No valid metrics data available for chart');
    }

    const sortedMetrics = sortMetrics(validMetrics);
    const companyValues = sortedMetrics.map((m) => m.company_value);
    const actualScores = sortedMetrics.map((m) => getMultipliedScore(m.company_value, m.total_score));
    const standardScores = companyValues.map((cv) => {
      const item = STANDARD_VALUE_LIST.find((s) => s.company_value === cv);
      return item ? item.total_score : 0;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 350;
    chartContainer.appendChild(canvas);

    chart = new ChartJS(canvas, {
      type: 'radar',
      data: {
        labels: companyValues,
        datasets: [
          {
            label: 'Standard Target',
            data: standardScores,
            borderColor: 'rgba(255, 193, 7, 1)',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(255, 193, 7, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: true,
          },
          {
            label: 'Actual Score',
            data: actualScores,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.3)',
            borderWidth: 3,
            pointBackgroundColor: actualScores.map((score, index) => (score >= standardScores[index] ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)')),
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            fill: true,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } },
        },
        scales: {
          r: {
            angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
            pointLabels: { font: { size: 12, weight: 'bold' }, color: '#000' },
            ticks: { beginAtZero: true, stepSize: 10, font: { size: 10 }, backdropColor: 'rgba(255, 255, 255, 0.8)', color: '#000' },
            suggestedMin: 0,
            suggestedMax: Math.max(...standardScores, ...actualScores) + 10,
          },
        },
      },
    });

    if (!chart) throw new Error('Chart creation failed');

    await new Promise<void>((resolve) => {
      let attempts = 0;
      const maxAttempts = 20;
      const checkInterval = 200;

      const checkRender = () => {
        attempts++;
        if (chart && chart.canvas && chart.canvas.getContext) {
          const ctx = chart.canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, 10, 10);
          const hasContent = imageData.data.some((value: number) => value !== 0);
          if (hasContent || attempts >= maxAttempts) {
            resolve();
            return;
          }
        }
        if (attempts >= maxAttempts) {
          resolve();
          return;
        }
        setTimeout(checkRender, checkInterval);
      };

      setTimeout(checkRender, 500);
      setTimeout(() => resolve(), 10000);
    });

    const canvasImagePromise = html2canvas(chartContainer, {
      backgroundColor: 'white',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      timeout: 15000,
      logging: false,
      width: chartContainer.offsetWidth,
      height: chartContainer.offsetHeight,
    });

    const canvasTimeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Canvas conversion timeout')), 20000));
    const canvasImage: any = await Promise.race([canvasImagePromise, canvasTimeoutPromise]);
    if (!canvasImage) throw new Error('Canvas conversion returned null');

    const imageData = canvasImage.toDataURL('image/png', 1.0);
    if (!imageData || imageData.length < 100) throw new Error('Generated image data is invalid or empty');

    return imageData;
  } catch (error) {
    console.error('Error generating chart image:', error);

    try {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 500;
      fallbackCanvas.height = 350;
      const ctx = fallbackCanvas.getContext('2d')!;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 500, 350);
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Performance Chart', 250, 50);
      ctx.font = '12px Arial';
      ctx.fillText('Chart generation failed', 250, 100);

      ctx.strokeStyle = 'rgba(54, 162, 235, 1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(250, 200, 80, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = 'rgba(54, 162, 235, 0.3)';
      ctx.fill();

      return fallbackCanvas.toDataURL('image/png');
    } catch (fallbackError) {
      console.error('Fallback chart also failed:', fallbackError);
      return null;
    }
  } finally {
    try {
      if (chart && typeof chart.destroy === 'function') chart.destroy();
    } catch (e) {
      console.warn('Error destroying chart:', e);
    }
    try {
      if (chartContainer && chartContainer.parentNode) chartContainer.parentNode.removeChild(chartContainer);
    } catch (e) {
      console.warn('Error removing chart container:', e);
    }
  }
};

export const generateCandidateInfoTable = (doc: any, formData: FormData, yPosition: number) => generateManualTable(doc, formData, yPosition);
export const generateAssessmentTable = (doc: any, formData: FormData, yPosition: number) => generateManualAssessmentTable(doc, formData, yPosition);

// Builds the full report and returns the jsPDF document — does NOT save/download,
// so callers can preview it (blob) or save it (file) as they see fit.
const buildInterviewPDFDoc = async (formData: FormData) => {
  const { jsPDF } = await Promise.race([
    initializeLibraries(),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('PDF initialization timeout')), 20000)),
  ]);

  const logoData = await loadLogoDataUrl();

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 10;

  try {
    const logoWidth = 70;
    const logoHeight = 8;
    addLogoToDoc(doc, logoData, 10, yPosition - 5, logoWidth, logoHeight);
  } catch (logoError) {
    console.warn('Logo loading failed:', logoError);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const textX = 10 + 70 + 50;
  doc.text('HR FORM INTERVIEW', textX, yPosition + 1);
  yPosition += 5;

  yPosition = generateCandidateInfoTable(doc, formData, yPosition);
  yPosition = generateAssessmentTable(doc, formData, yPosition);

  doc.addPage();
  yPosition = 20;

  const comprehensiveResult = generateComprehensiveScoreSection(doc, formData, yPosition, logoData);
  yPosition = comprehensiveResult.nextY;

  const summaryBorderX = 20;
  const summaryBorderY = 30;
  const summaryBorderWidth = pageWidth - 40;
  const summaryBorderHeight = yPosition - 40;

  doc.setLineWidth(0.2);
  doc.setDrawColor(0);
  doc.rect(summaryBorderX, summaryBorderY, summaryBorderWidth, summaryBorderHeight);

  if (yPosition > pageHeight - 120) {
    doc.addPage();
    yPosition = 20;
  }

  const chartSectionStartY = yPosition + 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFORMANCE CHART', 25, yPosition + 15);
  yPosition += 15;

  const scoreResult = comprehensiveResult;

  try {
    const chartPromise = generateChartImage(formData);
    const chartTimeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Chart generation timeout')), 45000));
    const chartImage: any = await Promise.race([chartPromise, chartTimeoutPromise]);

    if (chartImage && chartImage.length > 100) {
      const chartWidth = 110;
      const chartHeight = 80;
      const chartX = 20;
      const cardX = chartX + chartWidth + 15;
      const cardY = yPosition;
      const cardWidth = 50;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('TOTAL', cardX + cardWidth / 2, cardY + 15, { align: 'center' });

      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(scoreResult.color[0], scoreResult.color[1], scoreResult.color[2]);
      doc.text(scoreResult.total.toString(), cardX + cardWidth / 2, cardY + 30, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(scoreResult.remark, cardX + cardWidth / 2, cardY + 45, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Recommendation:', cardX + cardWidth / 2, cardY + 55, { align: 'center' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(scoreResult.color[0], scoreResult.color[1], scoreResult.color[2]);
      const wrappedRecommendation = doc.splitTextToSize(scoreResult.recommendation, cardWidth - 4);
      const recY = cardY + 62;
      wrappedRecommendation.forEach((line: string, index: number) => {
        doc.text(line, cardX + cardWidth / 2, recY + index * 4, { align: 'center' });
      });

      doc.addImage(chartImage, 'PNG', chartX, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 10;
    } else {
      const cardX = 20;
      const cardY = yPosition;
      const cardWidth = 80;
      const cardHeight = 60;

      doc.setFillColor(248, 249, 250);
      doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.rect(cardX, cardY, cardWidth, cardHeight);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ASSESSMENT SUMMARY', cardX + cardWidth / 2, cardY + 15, { align: 'center' });

      doc.setFontSize(18);
      doc.setTextColor(scoreResult.color[0], scoreResult.color[1], scoreResult.color[2]);
      doc.text(`Total: ${scoreResult.total}`, cardX + cardWidth / 2, cardY + 30, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rating: ${scoreResult.remark}`, cardX + cardWidth / 2, cardY + 42, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(220, 53, 69);
      doc.text('(Chart generation failed)', cardX + cardWidth / 2, cardY + 52, { align: 'center' });

      yPosition += cardHeight + 10;
    }
  } catch (chartError: any) {
    console.error('Chart generation failed:', chartError);
    doc.setTextColor(220, 53, 69);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Chart generation failed: ' + chartError.message, 20, yPosition);
    yPosition += 15;
  }

  const chartBorderX = 20;
  const chartBorderWidth = pageWidth - 40;
  const chartBorderHeight = yPosition - chartSectionStartY;

  doc.setLineWidth(0.2);
  doc.setDrawColor(0);
  doc.rect(chartBorderX, chartSectionStartY - 15, chartBorderWidth, chartBorderHeight);

  addPageNumbers(doc);
  doc.setPage(1);

  return doc;
};

const buildFileName = (formData: FormData) => {
  const candidateData: any = formData.data_candidate || {};
  const candidateName = candidateData.name_candidate || 'Candidate';
  const safeFileName = String(candidateName).replace(/[^a-zA-Z0-9]/g, '_');
  return `Interview_Assessment_${safeFileName}_${new Date().toISOString().split('T')[0]}.pdf`;
};

const generatePDFInternal = async (formData: FormData) => {
  try {
    return await buildInterviewPDFDoc(formData);
  } catch (error: any) {
    console.error('Error generating PDF:', error);

    let errorMessage = 'Failed to generate PDF';
    if (error.message?.includes('timeout')) {
      errorMessage = 'PDF generation timed out. Please try again.';
    } else if (error.message?.includes('Library')) {
      errorMessage = 'Failed to load PDF libraries. Please refresh and try again.';
    } else if (error.message?.includes('Chart')) {
      errorMessage = 'Chart generation failed, but PDF should still work.';
    }

    toast.error(errorMessage + ': ' + error.message);
    throw error;
  }
};

export const downloadInterviewPDF = async (formData: FormData) => {
  try {
    const doc = await generatePDFInternal(formData);
    doc.save(buildFileName(formData));
  } catch (error: any) {
    if (error.message?.includes('Library') || error.message?.includes('timeout')) {
      resetLibrariesCache();
      try {
        const doc = await generatePDFInternal(formData);
        doc.save(buildFileName(formData));
        return;
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        toast.error('PDF generation failed after retry. Please refresh the page and try again.');
        throw retryError;
      }
    }
    throw error;
  }
};

// Same report, returned as a Blob instead of triggering an immediate download —
// lets the caller preview it (e.g. in an iframe) before deciding to save it.
export const generateInterviewPDFBlob = async (formData: FormData): Promise<Blob> => {
  const doc = await generatePDFInternal(formData);
  return doc.output('blob');
};
