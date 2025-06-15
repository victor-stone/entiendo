import { IdiomModel } from '../src/server/models/index.js';
import fs from 'fs';
import path from 'path';
import { escapeCSV } from './escapeCSV.js';

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

  // Ensure ../staging/stages directory exists
  const stagesDir = path.resolve(process.cwd(), '../staging/stages');
  if (!fs.existsSync(stagesDir)) {
    fs.mkdirSync(stagesDir, { recursive: true });
  }

  // Write to file
  const filePath = path.join(stagesDir, 'idioms-export.csv');
  fs.writeFileSync(filePath, csvContent, 'utf8');
  console.log(`Exported ${idioms.length} idioms to ${filePath}`);
}

exportIdiomsToCSV().catch(err => {
  console.error('Failed to export idioms:', err);
  process.exit(1);
});