import { IdiomModel } from '../../src/server/models/index.js';
import fs from 'fs';
import path from 'path';

// Helper to escape CSV fields
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportIdiomsToCSV() {
  const idiomModel = new IdiomModel();
  const idioms = await idiomModel.findAll();

  // Sort idioms alphabetically by text
  idioms.sort((a, b) => (a.text || '').localeCompare(b.text || ''));

  // Prepare CSV header and rows
  const header = ['text', 'translation', 'tone','usage', 'idiomId'];
  const rows = idioms.map(idiom =>
    [
      escapeCSV(idiom.text),
      escapeCSV(idiom.translation),
      escapeCSV(idiom.tone),
      escapeCSV(idiom.usage),
      escapeCSV(idiom.idiomId)
    ].join(',')
  );

  const csvContent = [header.join(','), ...rows].join('\n');

  // Ensure docs directory exists
  const docsDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write to file
  const filePath = path.join(docsDir, 'idioms-export.csv');
  fs.writeFileSync(filePath, csvContent, 'utf8');
  console.log(`Exported ${idioms.length} idioms to ${filePath}`);
}

exportIdiomsToCSV().catch(err => {
  console.error('Failed to export idioms:', err);
  process.exit(1);
});