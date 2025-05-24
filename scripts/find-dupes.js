/**
 * Script to find and optionally delete duplicate idioms in the IdiomModel table.
 * - Duplicates are idioms with the same 'text'.
 * - If a duplicate idiomId is NOT referenced in ExampleModel, it will be deleted.
 * - If all duplicates are referenced in ExampleModel, a report is printed and nothing is deleted.
 */

import { IdiomModel, ExampleModel } from '../src/server/models/index.js';

async function main() {
  const idiomModel = new IdiomModel();
  const exampleModel = new ExampleModel();

  // 1. Fetch all idioms
  const idioms = await idiomModel.findAll();

  // 2. Group idioms by 'text' (case-insensitive)
  const idiomsByText = {};
  for (const idiom of idioms) {
    const text = idiom.text.trim().toLowerCase(); // case-insensitive
    if (!idiomsByText[text]) idiomsByText[text] = [];
    idiomsByText[text].push(idiom);
  }

  // 3. Find duplicates (more than one idiom with the same text)
  const duplicates = Object.entries(idiomsByText)
    .filter(([_, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log('No duplicate idioms found.');
    return;
  }

  let deletedCount = 0;
  for (const [text, idiomList] of duplicates) {
    // Keep the first idiom, consider the rest as duplicates
    const [keep, ...dupes] = idiomList;

    // For each duplicate, check if it's referenced in ExampleModel
    const referenced = [];
    const notReferenced = [];

    for (const idiom of dupes) {
      const examples = await exampleModel.findByIdiomId(idiom.idiomId);
      if (examples && examples.length > 0) {
        referenced.push(idiom);
      } else {
        notReferenced.push(idiom);
      }
    }

    if (notReferenced.length === 0) {
      console.log(
        `All duplicates for idiom "${text}" are referenced in ExampleModel. No deletions.`
      );
    } else {
      for (const idiom of notReferenced) {
        await idiomModel.delete(idiom.idiomId);
        deletedCount++;
        console.log(
          `Deleted duplicate idiomId=${idiom.idiomId} for text="${text}" (not referenced in ExampleModel)`
        );
      }
    }
  }

  if (deletedCount === 0) {
    console.log('No duplicate idioms were deleted.');
  } else {
    console.log(`Deleted ${deletedCount} duplicate idiom(s) not referenced in ExampleModel.`);
  }
}

main().catch((err) => {
  console.error('Error running find-dupes:', err);
  process.exit(1);
});