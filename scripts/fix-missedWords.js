// scripts/fix-missedWords.js
// Script to fix 'missedWords' fields in ProgressModel records

import ProgressModel from '../src/server/models/ProgressModel.js';
import progress from '../staging/import/progress.js';

async function fixMissedWords() {
  const progressModel = new ProgressModel();

  const all = [];
  const arr = progress.progress[0];
  for( let i = 1; i < arr.length; i++ ) {
    const record = arr[i];
    console.log( 'updating %d', i);
    all.push(progressModel.update(record.progressId, record));
  }

  console.log("waiting for update")
  const bigMassiveUpdate = await Promise.all(all);
  console.log(bigMassiveUpdate);

}

fixMissedWords().catch(err => {
  console.error('Error fixing missedWords:', err);
  process.exit(1);
});
