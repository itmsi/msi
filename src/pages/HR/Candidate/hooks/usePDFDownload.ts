import { useState } from 'react';
import { downloadInterviewPDF } from '../utils/PDFInterviewReport';
import { toast } from 'react-hot-toast';

export const usePDFDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async (formData: Record<string, unknown>) => {
    if (isGenerating) {
      toast.error('PDF is already being generated...');
      return;
    }

    setIsGenerating(true);

    try {
      await downloadInterviewPDF(formData);
      toast.success('PDF downloaded successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to download PDF: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadPDF, isGenerating };
};
