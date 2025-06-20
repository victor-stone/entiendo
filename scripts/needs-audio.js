import { idiomQuery, exampleQuery } from './query.js';
import { escapeCSV } from './escapeCSV.js';

// ONLY Super Common

const ids = idiomQuery.byCriteria(null,"super_common", "idiomId")

const missingStuff = { 
    noExamples: [],
    exNeedsAudio: []
}

for( const id of ids ) {
    const examples = exampleQuery.forIdiom(id);
    if( examples && examples.length ) {
        for(const example of examples ) {
            if( !(example.hasOwnProperty('audio')) ) {
                missingStuff.exNeedsAudio.push(example)
            }
        }
    } else {
        const idiom = idiomQuery.idiom(id);
        missingStuff.noExamples.push(idiom);
    }
}

const header = `idiomId,text,translation,transcript,exampleId`

const noExampleMapper = ({idiomId, text, translation}) => {
    return `${idiomId},${escapeCSV(text)},${escapeCSV(translation)},,`
}
const noAudioMapper = ({idiomId, text, exampleId}) => {
    return `${idiomId},${escapeCSV(text)},,,${exampleId}`
}
let   rows = [header, 
              ...missingStuff.noExamples.map(noExampleMapper),
              ...missingStuff.exNeedsAudio.map(noAudioMapper)];

console.log( rows.join('\n') );
