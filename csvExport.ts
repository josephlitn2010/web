import { VocabularyEntry } from './db';

/**
 * Trigger file download
 */
function downloadFile(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export vocabulary to CSV format
 */
export async function exportVocabularyToCSV(
  categoryName: string,
  vocabulary: VocabularyEntry[]
): Promise<void> {
  try {
    console.log('Starting CSV export for category:', categoryName);
    
    // CSV header
    const headers = ['English', 'Chinese', 'Pronunciation', 'Category', 'Mastery %', 'Example Sentence'];
    
    // CSV rows
    const rows = vocabulary.map(word => [
      escapeCSV(word.english || ''),
      escapeCSV(word.chinese || ''),
      escapeCSV(word.pronunciation || ''),
      escapeCSV(word.category || ''),
      `${word.mastery || 0}`,
      escapeCSV(word.exampleSentence || ''),
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    console.log('CSV content generated, size:', csvContent.length);

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${categoryName}-vocabulary.csv`);
    
    console.log('CSV download triggered');
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
}

/**
 * Export all vocabulary to CSV format
 */
export async function exportAllVocabularyToCSV(
  vocabulary: VocabularyEntry[]
): Promise<void> {
  try {
    console.log('Starting CSV export for all vocabulary');
    
    // CSV header
    const headers = ['English', 'Chinese', 'Category', 'Pronunciation', 'Mastery %', 'Example Sentence'];
    
    // CSV rows
    const rows = vocabulary.map(word => [
      escapeCSV(word.english || ''),
      escapeCSV(word.chinese || ''),
      escapeCSV(word.category || ''),
      escapeCSV(word.pronunciation || ''),
      `${word.mastery || 0}`,
      escapeCSV(word.exampleSentence || ''),
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    console.log('CSV content generated, size:', csvContent.length);

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, 'all-vocabulary.csv');
    
    console.log('CSV download triggered');
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to export CSV. Please try again.');
  }
}
