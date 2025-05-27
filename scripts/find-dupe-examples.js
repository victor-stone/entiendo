import { ExampleModel, ProgressModel } from '../src/server/models/index.js';


async function fixUsage() {
  const exampleModel = new ExampleModel();
  const allexample = await exampleModel.findAll();
  const progressModel = new ProgressModel();
  const allProgress = await progressModel.findAll();

  // Find duplicates by .text field
  const seen = new Map();
  for (const example of allexample) {
    if (!example.text) continue;
    const key = example.text.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, [example]);
    } else {
      seen.get(key).push(example);
    }
  }

  // Build a set of all exampleIds used in any progress.history[].exampleId
  const usedExampleIds = new Set();
  for (const progress of allProgress) {
    if (Array.isArray(progress.history)) {
      for (const h of progress.history) {
        if (h && h.exampleId) usedExampleIds.add(h.exampleId);
      }
    }
  }

  // Print and clean up duplicates
  let found = false;
  let deletedCount = 0;
  for (const [text, arr] of seen.entries()) {
    if (arr.length > 1) {
      found = true;
      console.log(`Duplicate text: "${text}" (${arr.length} records)`);
      // Keep the first, check the rest
      const [keep, ...dupes] = arr;
      for (const e of dupes) {
        if (!usedExampleIds.has(e.exampleId)) {
          await exampleModel.delete(e.exampleId);
          deletedCount++;
          console.log(`  Deleted unused duplicate: id=${e.exampleId}, idiomId=${e.idiomId}, source=${e.source}`);
        } else {
          console.log(`  Kept (used in progress): id=${e.exampleId}, idiomId=${e.idiomId}, source=${e.source}`);
        }
      }
    }
  }
  if (!found) {
    console.log('No duplicates found.');
  } else {
    console.log(`Deleted ${deletedCount} duplicate example(s) not referenced in progress.`);
  }
}

fixUsage().catch(err => {
  console.error('Failed to update example:', err);
  process.exit(1);
});
