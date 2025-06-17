import { idiomQuery, exampleQuery } from './query.js';
import { escapeCSV } from './escapeCSV.js';
const ids = idiomQuery.byCriteria(null,"super_common", "idiomId")

const needsAudio = { 
    noExamples: [],
    exNeedsAudio: []
}

for( const id of ids ) {
    const examples = exampleQuery.forIdiom(id);
    if( examples && examples.length ) {
        for(const example of examples ) {
            if( !(example.hasOwnProperty('audio')) ) {
                needsAudio.exNeedsAudio.push(example)
            }
        }
    } else {
        const idiom = idiomQuery.idiom(id);
        needsAudio.noExamples.push(idiom);
    }
}

const header = `idiomId,text,translation,transcript`
const mapper = ({idiomId, text, translation}) => 
                `${idiomId},${translation 
                                ? escapeCSV(translation) 
                                : ','},${escapeCSV(text)}`;
let   rows = [header, ...needsAudio.noExamples.map(mapper),
              ...needsAudio.exNeedsAudio.map(mapper)];

console.log( rows.join('\n') );
