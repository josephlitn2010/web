import { VocabularyEntry } from './db';

/**
 * 將詞彙導出為 HTML 文件
 */
export async function exportVocabularyToHTML(
  category: string,
  vocabulary: VocabularyEntry[]
): Promise<void> {
  try {
    const htmlContent = generateVocabularyHTML(category, vocabulary);
    downloadHTML(htmlContent, `${category}-vocabulary.html`);
    console.log('HTML exported successfully');
  } catch (error) {
    console.error('Failed to export HTML:', error);
    throw new Error('Failed to export HTML');
  }
}

/**
 * 將所有詞彙導出為 HTML 文件
 */
export async function exportAllVocabularyToHTML(
  vocabulary: VocabularyEntry[]
): Promise<void> {
  try {
    // 按 Category 分組
    const grouped = new Map<string, VocabularyEntry[]>();
    vocabulary.forEach(word => {
      if (!grouped.has(word.category)) {
        grouped.set(word.category, []);
      }
      grouped.get(word.category)!.push(word);
    });

    const htmlContent = generateAllVocabularyHTML(grouped, vocabulary.length);
    downloadHTML(htmlContent, 'all-vocabulary.html');
    console.log('All vocabulary HTML exported successfully');
  } catch (error) {
    console.error('Failed to export all vocabulary HTML:', error);
    throw new Error('Failed to export all vocabulary HTML');
  }
}

/**
 * 生成單個 Category 的 HTML
 */
function generateVocabularyHTML(category: string, vocabulary: VocabularyEntry[]): string {
  const rows = vocabulary
    .map(
      word => `
    <tr>
      <td class="cell-english">${escapeHTML(word.english)}</td>
      <td class="cell-chinese">${escapeHTML(word.chinese)}</td>
      <td class="cell-pronunciation">${escapeHTML(word.pronunciation || '-')}</td>
      <td class="cell-mastery">
        <div class="mastery-bar">
          <div class="mastery-fill" style="width: ${word.mastery || 0}%"></div>
        </div>
        <span class="mastery-text">${word.mastery || 0}%</span>
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(category)} - Vocabulary List</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 100%);
      padding: 40px 20px;
      color: #333;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .header p {
      font-size: 14px;
      opacity: 0.9;
    }

    .content {
      padding: 40px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #4CAF50;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #4CAF50;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      text-transform: uppercase;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    thead {
      background: #f5f5f5;
      border-bottom: 2px solid #4CAF50;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #333;
      font-size: 13px;
      text-transform: uppercase;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }

    tbody tr:hover {
      background: #f9f9f9;
    }

    .cell-english {
      font-weight: 500;
      color: #333;
      width: 30%;
    }

    .cell-chinese {
      color: #666;
      width: 30%;
    }

    .cell-pronunciation {
      color: #999;
      font-style: italic;
      width: 20%;
    }

    .cell-mastery {
      width: 20%;
    }

    .mastery-bar {
      background: #eee;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .mastery-fill {
      background: linear-gradient(90deg, #4CAF50, #45a049);
      height: 100%;
      transition: width 0.3s ease;
    }

    .mastery-text {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .footer {
      background: #f9f9f9;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #eee;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      .header {
        page-break-after: avoid;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 20px;
      }
      table {
        font-size: 12px;
      }
      th, td {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHTML(category)}</h1>
      <p>Vocabulary List • Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="content">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${vocabulary.length}</div>
          <div class="stat-label">Total Words</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(vocabulary.reduce((sum, v) => sum + (v.mastery || 0), 0) / vocabulary.length)}</div>
          <div class="stat-label">Avg Mastery</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${vocabulary.filter(v => (v.mastery || 0) >= 80).length}</div>
          <div class="stat-label">Mastered</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>English</th>
            <th>Chinese</th>
            <th>Pronunciation</th>
            <th>Mastery</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>VocabLearn • Your Personal Vocabulary Learning App</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 生成所有詞彙的 HTML
 */
function generateAllVocabularyHTML(grouped: Map<string, VocabularyEntry[]>, totalWords: number): string {
  let categorySections = '';

  grouped.forEach((words, category) => {
    const rows = words
      .map(
        word => `
      <tr>
        <td class="cell-english">${escapeHTML(word.english)}</td>
        <td class="cell-chinese">${escapeHTML(word.chinese)}</td>
        <td class="cell-pronunciation">${escapeHTML(word.pronunciation || '-')}</td>
        <td class="cell-mastery">
          <div class="mastery-bar">
            <div class="mastery-fill" style="width: ${word.mastery || 0}%"></div>
          </div>
          <span class="mastery-text">${word.mastery || 0}%</span>
        </td>
      </tr>
    `
      )
      .join('');

    categorySections += `
    <div class="category-section">
      <h2 class="category-title">${escapeHTML(category)}</h2>
      <p class="category-subtitle">${words.length} words</p>
      <table>
        <thead>
          <tr>
            <th>English</th>
            <th>Chinese</th>
            <th>Pronunciation</th>
            <th>Mastery</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    `;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Vocabulary - VocabLearn</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 100%);
      padding: 40px 20px;
      color: #333;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .header p {
      font-size: 14px;
      opacity: 0.9;
    }

    .content {
      padding: 40px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #4CAF50;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #4CAF50;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      text-transform: uppercase;
    }

    .category-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .category-title {
      font-size: 20px;
      color: #4CAF50;
      margin-bottom: 5px;
      padding-bottom: 10px;
      border-bottom: 2px solid #4CAF50;
    }

    .category-subtitle {
      font-size: 12px;
      color: #999;
      margin-bottom: 15px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f5f5f5;
      border-bottom: 2px solid #4CAF50;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      font-size: 12px;
      text-transform: uppercase;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }

    tbody tr:hover {
      background: #f9f9f9;
    }

    .cell-english {
      font-weight: 500;
      color: #333;
      width: 30%;
    }

    .cell-chinese {
      color: #666;
      width: 30%;
    }

    .cell-pronunciation {
      color: #999;
      font-style: italic;
      width: 20%;
    }

    .cell-mastery {
      width: 20%;
    }

    .mastery-bar {
      background: #eee;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .mastery-fill {
      background: linear-gradient(90deg, #4CAF50, #45a049);
      height: 100%;
    }

    .mastery-text {
      font-size: 11px;
      color: #666;
      font-weight: 500;
    }

    .footer {
      background: #f9f9f9;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #eee;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      .category-section {
        page-break-inside: avoid;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 20px;
      }
      table {
        font-size: 11px;
      }
      th, td {
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>All Vocabulary</h1>
      <p>VocabLearn • Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="content">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${totalWords}</div>
          <div class="stat-label">Total Words</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${grouped.size}</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(
            Array.from(grouped.values())
              .flat()
              .reduce((sum, v) => sum + (v.mastery || 0), 0) / totalWords
          )}</div>
          <div class="stat-label">Avg Mastery</div>
        </div>
      </div>

      ${categorySections}
    </div>

    <div class="footer">
      <p>VocabLearn • Your Personal Vocabulary Learning App</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 下載 HTML 文件
 */
function downloadHTML(htmlContent: string, filename: string): void {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 500);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * 轉義 HTML 特殊字符
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
