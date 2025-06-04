// scripts/fix-missedWords.js
// Script to fix 'missedWords' fields in ProgressModel records

import ProgressModel from '../src/server/models/ProgressModel.js';

async function fixMissedWords() {
  const progressModel = new ProgressModel();
  const allUsers = await progressModel.findAll();
  let updatedCount = 0;

  for (const record of allUsers) {
    let changed = false;
    if (Array.isArray(record.history)) {
      for (const entry of record.history) {
        if (
          entry.evaluation &&
          typeof entry.evaluation.missedWords === 'string'
        ) {
          entry.evaluation.missedWords = entry.evaluation.missedWords
            .split(',')
            .map(w => w.trim().toLowerCase())
            .filter(Boolean);
          changed = true;
        }
      }
    }
    if (changed) {
      await progressModel.update(record.progressId, { history: record.history });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} records.`);
}

fixMissedWords().catch(err => {
  console.error('Error fixing missedWords:', err);
  process.exit(1);
});
