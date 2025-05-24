/**
 * Script to batch stage idiom example audio for Entiendo.
 * 
 * Automates linking CSV-mapped idiom examples with audio files,
 * uploading them, and creating database records—making large-scale
 * content updates fast, consistent, and error-resistant.
 */
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { IdiomModel, ExampleModel } from "../src/server/models/index.js";
import { uploadAudioToS3 } from '../src/server/api/exercise/audio.js';

  const stagedir = process.argv[2] || "stage1";
  if (!stagedir) {
    console.error("Usage: node stageAudioSamples.js <stagedir>");
    process.exit(1);
  }

const source = process.argv[3] || "vs";

const baseDir = path.join(".", "stages", stagedir);
const files   = fs.readdirSync(baseDir);
const csvFile = files.find((f) => f.endsWith("map.csv"));

if (!csvFile) {
  console.error("No map.csv file found in", baseDir);
  process.exit(1);
}

const csvPath   = path.join(baseDir, csvFile);
const audioPath = path.join(baseDir, "audio");

const idioms   = new IdiomModel();
const exmaples = new ExampleModel();

async function parseMap() {

  try {
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    // conjugatedSnippet
    const promises = records.map(async (row) => {
      const text = row.text?.toLowerCase();
      if (!text) return;
      try {
        const idiom = await idioms.findByText(text);
        if (idiom) {
          console.log(
            `${row["#"]} ${idiom.idiomId}, ${idiom.text}, ${idiom.translation}`
          );
        } else {
          console.log(`Not found: ${text}`);
        }
        return {
          row              : Number(row["#"]),
          idiomId          : idiom.idiomId,
          idiom            : idiom.text,
          text             : row.example,
          conjugatedSnippet: row.conjugatedSnippet,
          source,
        };
      } catch (err) {
        console.error(`Error finding idiom for "${text}":`, err);
      }
    });

    return Promise.all(promises);
  } catch (err) {
    console.error("Error reading or parsing CSV:", err);
  }
}

async function main() {
  const exampleRecords = await parseMap();
  const audioFiles = fs.readdirSync(audioPath);
  // exampleRecords.length
  try {
    for( var i = 2; i < exampleRecords.length; i++ ) {
      const { idiomId, row, text, conjugatedSnippet, source, idiom } = exampleRecords[i];
      const regex     = new RegExp(`^${row}\\..*\\.mp3$`);
      const audioFile = audioFiles.find(f => regex.test(f));
      console.log(`Row ${row}: audio file = ${audioFile || "not found"}`);
      const audio = await uploadAudioToS3(path.join(audioPath,audioFile))
      console.log(audio);
      const exRec = await exmaples.createExample(idiomId, text, conjugatedSnippet, source, audio );
      console.log(`Successfully created ${exRec.exampleId} for ${idiom}`)
    }
  } catch(err) {
    console.log(err);
  }
  return 'done';
}

const foo = await main();
console.log(foo);

