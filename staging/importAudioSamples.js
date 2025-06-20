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
import { ExampleModel } from "../src/server/models/index.js";
import { uploadAudioToS3 } from "../src/server/lib/audio.js";

const stagedir = process.argv[2];
if (!stagedir) {
  console.error("Usage: node stageAudioSamples.js <stagedir>");
  process.exit(1);
}

const workDir = path.dirname(process.argv[1]);
const baseDir = path.join(workDir, "stages", stagedir);
const files   = fs.readdirSync(baseDir);
const csvFile = `map.csv`;

if (!files.includes(csvFile)) {
  console.error(`No ${csvFile} file found in`, baseDir);
  process.exit(1);
}

function verifyStageFiles() {
  // Check audio directory exists
  const audioPath = path.join(baseDir, "audio");
  if (!fs.existsSync(audioPath) || !fs.statSync(audioPath).isDirectory()) {
    console.error(`Missing audio directory: ${audioPath}`);
    process.exit(1);
  }
  // Check for at least one mp3 file
  const audioFiles = fs.readdirSync(audioPath).filter(f => f.endsWith('.mp3'));
  if (audioFiles.length === 0) {
    console.error(`No .mp3 files found in audio directory: ${audioPath}`);
    process.exit(1);
  }
  // Check CSV columns
  const csvPath         = path.join(baseDir, csvFile);
  const csvContent      = fs.readFileSync(csvPath, "utf8");
  const [headerLine]    = csvContent.split(/\r?\n/);
  const expectedColumns = [
    'text', 'translation', 'transcript', 'snippet', 'voice', 'num', 'idiomId', 'exampleId'
  ];
  const actualColumns = headerLine.split(',').map(s => s.trim());
  const missing = expectedColumns.filter(col => !actualColumns.includes(col));
  if (missing.length > 0) {
    console.error(`CSV file missing columns: ${missing.join(', ')}`);
    process.exit(1);
  }
  // Check all audio files referenced in CSV exist
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  let missingAudio = [];
  for (const rec of records) {
    const row = rec.num;
    // Accept both "." and " " after row number, as in main()
    const regex = new RegExp(`^${row}(\\.| ).*\\.mp3$`);
    const found = audioFiles.find(f => regex.test(f));
    if (!found) {
      missingAudio.push(`${row}: ${rec.text || rec.snippet || ''}`);
    }
  }
  if (missingAudio.length > 0) {
    console.error('Missing audio files for the following rows:');
    missingAudio.forEach(msg => console.error(msg));
    process.exit(1);
  }
  console.log('Stage verification passed: audio directory and CSV columns are valid.');
}

function parseMap() {
  const csvPath   = path.join(baseDir, csvFile);
  try {
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const records = parse(csvContent, {
      columns         : true,
      skip_empty_lines: true,
      trim            : true,
    });
    return records;
  } catch(err) {
    console.error('Error reading/parsing csv',err)
    process.exit(1);
  }
}

async function main() {
  const exampleRecords = parseMap();
  const audioPath      = path.join(baseDir, "audio");
  const audioFiles     = fs.readdirSync(audioPath);

  try {
    const model = new ExampleModel();

    // csv-parse does not return the header:
    //   text,translation,transcript,snippet,voice,num,idiomId
    // so looping starts at 0

    for (var i = 0; i < exampleRecords.length; i++) {
      
      const { 
        idiomId, 
        exampleId,
        snippet   : conjugatedSnippet, 
        text      : idiom,
        num       : row,
        transcript: text,
        voice     : source
      } = exampleRecords[i];

      const regex       = new RegExp(`^${row}(\\.| ).*\\.mp3$`);
      const audioFile   = audioFiles.find((f) => regex.test(f));
      const audio       = await uploadAudioToS3(path.join(audioPath, audioFile));
            audio.voice = source;
      
      if( exampleId ) {
        const exReg = await model.addAudio(exampleId, audio);
        console.log(`Successfully added audio to ${exReg.exampleId} for ${idiom}`);
      } else {
        const exRec= await model.createExample(
                            idiomId,
                            text,
                            conjugatedSnippet,
                            source,
                            audio
                          );
        console.log(`Successfully created ${exRec.exampleId} for ${idiom}`);
      }
    }
  } catch (err) {
    console.log(err);
  }
  return "done";
}

verifyStageFiles();
const foo = await main();
console.log(foo);
