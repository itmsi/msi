// @ts-nocheck
// PDF Interview Report Generator
// Migrated from cum-web with jsPDF + html2canvas

interface FormData {
  data_candidate?: Record<string, unknown>;
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

const resetLibrariesCache = () => {
  librariesCache = { jsPDF: null, html2canvas: null, initialized: false };
  autoTableAvailable = false;
};

const initializeLibraries = async () => {
  if (librariesCache.initialized) return librariesCache;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Library loading timeout')), 30000)
  );

  const loadPromise = Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const [jsPDFModule, html2canvasModule] = await Promise.race([
    loadPromise,
    timeoutPromise,
  ]);

  const jsPDFClass = jsPDFModule.default;
  const html2canvasClass = html2canvasModule.default;

  try {
    await import('jspdf-autotable');
    const testDoc = new jsPDFClass();
    autoTableAvailable = typeof testDoc.autoTable === 'function';
  } catch {
    autoTableAvailable = false;
  }

  librariesCache.jsPDF = jsPDFClass;
  librariesCache.html2canvas = html2canvasClass;
  librariesCache.initialized = true;

  return librariesCache;
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
    const text = `Page ${i} of ${pageCount}`;
    const tw = doc.getTextWidth(text);
    doc.text(text, pageWidth - tw - 15, pageHeight - 5);
  }
  doc.setPage(currentPage);
};

const generateManualTable = (doc: any, formData: FormData, yPosition: number) => {
  const posisi_x = 5;
  const candidateData = formData.data_candidate || {};
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

  candidateInfo.forEach((row) => {
    doc.setFillColor(2, 83, 165);
    doc.rect(posisi_x, currentY, col1Width, rowHeight, 'F');
    doc.rect(posisi_x + col1Width + col2Width, currentY, col1Width, rowHeight, 'F');
    doc.setFillColor(248, 251, 255);
    doc.rect(posisi_x + col1Width, currentY, col2Width, rowHeight, 'F');
    doc.rect(posisi_x + col1Width + col2Width + col1Width, currentY, col2Width, rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], posisi_x + 2, currentY + 5);
    doc.text(row[2], posisi_x + 2 + col1Width + col2Width, currentY + 5);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], posisi_x + 2 + col1Width, currentY + 5);
    doc.text(row[3], posisi_x + 2 + col1Width + col2Width + col1Width, currentY + 5);
    currentY += rowHeight;
  });

  const tableWidth = (col1Width + col2Width) * 2;
  doc.setLineWidth(0.2);
  doc.setDrawColor(0);
  doc.rect(posisi_x, yPosition + 8, tableWidth, rowHeight * 4);

  return currentY + 8;
};

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

  const getMultipliedScore = (companyValue: string, score: number) => {
    switch (companyValue) {
      case 'SIAH': return score * 2;
      case '7 Values': return Math.floor(score * 1.7) + (score * 1.7 % 1 >= 0.5 ? 1 : 0);
      case 'CSE': return score * 2;
      default: return score;
    }
  };

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
    const sw = colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth;
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
    doc.rect(posisi_x, yPos, sw, baseRowHeight);
    return yPos + baseRowHeight;
  };

  const standard_values: Record<string, number> = {
    SIAH: 40, '7 Values': 60, CSE: 40, SDT: 40, EXPERIENCE: 20,
  };

  currentY = drawTableHeader(currentY);

  const desiredOrder = ['SIAH', '7 Values', 'CSE', 'SDT', 'EXPERIENCE'];
  const groupedData: Record<string, any[]> = {};

  if (formData.interview && Array.isArray(formData.interview)) {
    formData.interview.forEach((item) => {
      if (!groupedData[item.company_value]) groupedData[item.company_value] = [];
      groupedData[item.company_value].push(item);
    });
  }

  const sortedCompanyValues = desiredOrder.filter((cv) => groupedData[cv]);

  sortedCompanyValues.forEach((companyValue) => {
    const items = groupedData[companyValue];
    currentY = drawTableHeader(currentY);
    const companyStartY = currentY;

    const aspectGroups: Record<string, any[]> = {};
    items.forEach((item: any) => {
      const aspect = item.aspect || 'N/A';
      if (!aspectGroups[aspect]) aspectGroups[aspect] = [];
      aspectGroups[aspect].push(item);
    });

    const aspectOrderMap: Record<string, string[]> = {
      SIAH: ['Sincerity', 'Trustworthy', 'Altruism', 'Humble'],
      '7 Values': ['Giving Meaning', 'Love to learn', 'Happy practice', 'Like innovation', 'Happy to share', 'Embrace failure', 'Habit of excellence'],
      CSE: ['Self Esteem', 'Self Efficacy', 'Locus of control', 'Emotional Stability'],
      EXPERIENCE: ['Role Matching', 'Product Knowledge', 'Significant Contribution', 'Goals align with ROE Company'],
      SDT: [],
    };

    const aspectOrder = aspectOrderMap[companyValue] || [];
    const sortedAspectNames = Object.keys(aspectGroups).sort((a, b) => {
      const iA = aspectOrder.indexOf(a);
      const iB = aspectOrder.indexOf(b);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return a.localeCompare(b);
    });

    sortedAspectNames.forEach((aspectName) => {
      const aspectItems = aspectGroups[aspectName];
      // Draw aspect header
      const ah = 8;
      if (currentY + ah > pageHeight - 10) { doc.addPage(); currentY = 10; currentY = drawTableHeader(currentY); }
      doc.setFillColor(41, 128, 185);
      doc.rect(posisi_x + colCompanyWidth + colStandardWidth, currentY, colQuestionWidth + colScoreWidth + colRemarksWidth, ah, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(aspectName, posisi_x + colCompanyWidth + colStandardWidth + 2, currentY + 5);
      currentY += ah;

      aspectItems.forEach((item: any, index: number) => {
        const score = item.score || 0;
        const question = item.question || 'N/A';
        const answer = item.answer || 'N/A';
        const dh = baseRowHeight;

        if (currentY + dh > pageHeight - 10) { doc.addPage(); currentY = 10; currentY = drawTableHeader(currentY); }

        if (index % 2 === 0) doc.setFillColor(250, 252, 255);
        else doc.setFillColor(245, 248, 252);
        doc.rect(posisi_x, currentY, colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth, dh, 'F');

        doc.setTextColor(44, 62, 80);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(question, posisi_x + colCompanyWidth + colStandardWidth + 2, currentY + dh / 2 + 2, { maxWidth: colQuestionWidth - 4 });
        doc.text(answer, posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + 2, currentY + dh / 2 + 2, { maxWidth: colRemarksWidth - 4 });
        doc.text(score.toString(), posisi_x + colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth / 2, currentY + dh / 2 + 2, { align: 'center' });

        const sw = colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth;
        doc.setLineWidth(0.1);
        doc.setDrawColor(222, 226, 230);
        doc.rect(posisi_x, currentY, sw, dh);

        currentY += dh;
      });
    });

    // Draw company segment border
    const segH = currentY - companyStartY;
    const sw = colCompanyWidth + colStandardWidth + colQuestionWidth + colScoreWidth + colRemarksWidth;
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
    doc.rect(posisi_x, companyStartY, sw, segH);
  });

  return currentY + 5;
};

export const downloadInterviewPDF = async (formData: FormData) => {
  try {
    const libs = await initializeLibraries();
    const { jsPDF: JsPDF } = libs;
    const doc = new JsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 83, 165);
    doc.text('INTERVIEW ASSESSMENT REPORT', pageWidth / 2, 15, { align: 'center' });

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 73, 94);
    doc.text('PT. Motor Sights International', pageWidth / 2, 22, { align: 'center' });

    // Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(2, 83, 165);
    doc.line(10, 26, pageWidth - 10, 26);

    // Candidate Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 83, 165);
    doc.text('Candidate Information', 10, 33);

    let yPos = generateManualTable(doc, formData, 33);

    // Assessment Section
    yPos = Math.max(yPos + 5, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 83, 165);
    doc.text('Assessment Results', 10, yPos);

    yPos = generateManualAssessmentTable(doc, formData, yPos + 5);

    // Summary
    if (formData.interview && formData.interview.length > 0) {
      let totalScore = 0;
      formData.interview.forEach((iv) => {
        if (iv.detail_interviews) {
          iv.detail_interviews.forEach((d) => {
            totalScore += d.score;
          });
        }
      });

      if (yPos + 30 > pageHeight - 10) { doc.addPage(); yPos = 10; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(2, 83, 165);
      doc.text('Summary', 10, yPos + 5);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(44, 62, 80);
      doc.text(`Total Score: ${totalScore}`, 10, yPos + 15);

      let recommendation = 'Rejected';
      if (totalScore >= 70) recommendation = 'Recommended for Next Process';
      else if (totalScore >= 50) recommendation = 'Consideration - Need Comparison';

      doc.text(`Recommendation: ${recommendation}`, 10, yPos + 22);
    }

    addPageNumbers(doc);
    doc.save('interview-assessment-report.pdf');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
