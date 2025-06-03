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
    const exmaples = new ExampleModel();

    // csv-parse does not return the header:
    //   text,translation,transcript,snippet,voice,num,idiomId
    // so looping starts at 0

    for (var i = 0; i < exampleRecords.length; i++) {
      
      const { 
        idiomId, 
        snippet   : conjugatedSnippet, 
        text      : idiom,
        num       : row,
        transcript: text,
        voice     : source
      } = exampleRecords[i];

      const regex       = new RegExp(`^${row}(\\.| ).*\\.mp3$`);
      const audioFile   = audioFiles.find((f) => regex.test(f));
      
      if( !audioFile ) {
        console.error(`Missing audio file: ${row}: ${idiom}`);
        continue;
      }

      const audio       = await uploadAudioToS3(path.join(audioPath, audioFile));
            audio.voice = source;
      const exRec       = await exmaples.createExample(
                                  idiomId,
                                  text,
                                  conjugatedSnippet,
                                  source,
                                  audio
                                );
      console.log(`Successfully created ${exRec.exampleId} for ${idiom}`);
    }
  } catch (err) {
    console.log(err);
  }
  return "done";
}

const foo = await main();
console.log(foo);
