import { VocabularyEntry } from './db';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Trigger file download
 */
function downloadFile(blob: Blob, filename: string) {
  try {
    console.log('Creating download for:', filename, 'Size:', blob.size);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    link.click();
    
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Download cleanup completed');
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }, 500);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Export vocabulary to PDF format
 */
export async function exportVocabularyToPDF(
  categoryName: string,
  vocabulary: VocabularyEntry[]
): Promise<void> {
  try {
    console.log('Starting PDF export for category:', categoryName);
    
    const doc = new jsPDF();
    
    // Set font
    doc.setFontSize(18);
    doc.text(`${categoryName} - Vocabulary List`, 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data
    const tableData = vocabulary.map(word => [
      word.english || '',
      word.chinese || '',
      word.pronunciation || '',
      `${word.mastery || 0}%`,
    ]);

    console.log('Table data prepared:', tableData.length, 'rows');

    // Add table
    doc.autoTable({
      head: [['English', 'Chinese', 'Pronunciation', 'Mastery']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 35, right: 14, bottom: 14, left: 14 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
      },
    });

    console.log('PDF generated successfully');

    // Get PDF as blob and download
    const blob = doc.output('blob');
    console.log('PDF blob created, size:', blob.size);
    
    downloadFile(blob, `${categoryName}-vocabulary.pdf`);
    console.log('Download triggered');
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Export all vocabulary to PDF format
 */
export async function exportAllVocabularyToPDF(
  vocabulary: VocabularyEntry[]
): Promise<void> {
  try {
    console.log('Starting PDF export for all vocabulary');
    
    const doc = new jsPDF();
    
    // Set font
    doc.setFontSize(18);
    doc.text('All Vocabulary List', 14, 22);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Words: ${vocabulary.length}`, 14, 36);
    
    // Prepare table data
    const tableData = vocabulary.map(word => [
      word.english || '',
      word.chinese || '',
      word.category || '',
      word.pronunciation || '',
      `${word.mastery || 0}%`,
    ]);

    console.log('Table data prepared:', tableData.length, 'rows');

    // Add table
    doc.autoTable({
      head: [['English', 'Chinese', 'Category', 'Pronunciation', 'Mastery']],
      body: tableData,
      startY: 42,
      theme: 'grid',
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 42, right: 14, bottom: 14, left: 14 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
      },
    });

    console.log('PDF generated successfully');

    // Get PDF as blob and download
    const blob = doc.output('blob');
    console.log('PDF blob created, size:', blob.size);
    
    downloadFile(blob, 'all-vocabulary.pdf');
    console.log('Download triggered');
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}
