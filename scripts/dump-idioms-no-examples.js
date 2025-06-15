/**
 * Script to identify "super common" idioms that do not yet have any example sentences.
 * 
 * This script is used to help prioritize content creation by generating a CSV list of idioms
 * with high usage frequency (>= USAGE_THRESHOLD) that are missing examples in the database.
 * The output CSV can be used by editors or contributors to focus on adding examples for
 * the most important idioms that currently lack them.
 */

import { IdiomModel, ExampleModel } from "../src/server/models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { escapeCSV } from "./escapeCSV.js";

/************ SUPER COMMON *****************/
const USAGE_THRESHOLD = 8; 
/*******************************************/


// Add these two lines to define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const idiomModel = new IdiomModel();
  const exampleModel = new ExampleModel();

  // Get all idioms (with idiomId and text)
  const idioms = await idiomModel.findAll();

  // Get all examples and build a Set of idiomIds that have examples
  const allExamples = await exampleModel.findAll();
  const idiomIdsWithExamples = new Set(allExamples.map(e => e.idiomId));

  const superCommon = [];
  for (const idiom of idioms) {
    if (idiom.usage < USAGE_THRESHOLD) {
      continue;
    }
    if (!idiomIdsWithExamples.has(idiom.idiomId)) {
      console.log(`${idiom.idiomId}\t${idiom.text}`);
      const { idiomId, text, translation } = idiom;
      superCommon.push({
        idiomId, text, translation
      });
    }
  }

  // Save superCommon to CSV
  const csvHeader = "idiomId,text,translation\n";
  const csvRows = superCommon.map(
    ({ idiomId, text, translation }) =>
      `${escapeCSV(idiomId)},${escapeCSV(text)},${escapeCSV(translation)}`
  );
  const csvContent = csvHeader + csvRows.join("\n");

  const outputDir = path.resolve(__dirname, "../staging/stages");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "superCommonIdioms.csv");
  fs.writeFileSync(outputPath, csvContent, "utf8");
  console.log(`Saved ${superCommon.length} idioms to ${outputPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
