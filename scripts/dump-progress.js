import { ProgressModel, IdiomModel, ExampleModel } from '../src/server/models/index.js';
import { format } from 'timeago.js'
/*
This is what a record looks like

{
  "interval": 3,
  "dueDate": 1748455411443,
  "idiomId": "d8f806a7-9985-4e88-806c-fcc29718de32",
  "createdAt": 1748196211443,
  "difficulty": 2.5,
  "isLeech": false,
  "history": [
    {
      "date": 1748196211443,
      "exampleId": "14e243aa-1e81-4140-bc92-dff275df9a35",
      "evaluation": {
        "transcriptionAccuracy": "minor errors",
        "translationAccuracy": "minor errors",
        "mistakeType": "audio misunderstanding",
        "transcriptionFeedback": "Good attempt, but 'fiesta' should be 'siesta'.",
        "translationFeedback": "The translation is mostly correct, but 'hit the sack but good' is not a direct translation of 'me tiré a dormir una siesta'.",
        "englishTranslation": "After the game, I couldn't take it anymore and I lay down to take a nap.",
        "missedWords": "siesta"
      }
    }
  ],
  "successRate": 0.8766666666666667,
  "userId": "google-oauth2|101722812212104773442",
  "tone": "Neutral",
  "progressId": "63fe5a3e-371f-47c2-9b04-fdb6c187451a",
  "usage": 10,
  "lapseCount": 0
}
*/
function dumpRecord(r,idioms,examples) {
    r.dueDateF = format(r.dueDate);
    r.createdAtF = format(r.createdAt);
    r.idiom = idioms.find(({idiomId}) => idiomId == r.idiomId);
    for( let i = 0; i < r.history.length; i++ ) {
        r.history[i].example = examples.find(({exampleId})=> exampleId == r.history[i].exampleId);        
        r.history[i].dateF = format( r.history[i].date );
        if(r.history[i].evaluation.missedWords) {
          r.history[i].evaluation.missedWords = r.history[i].evaluation.missedWords
                .split(/\s?,\s?/) // split on comma, optional spaces
                // .filter(Boolean)
                .map(w => w.toLowerCase())
        } else {
          r.history[i].evaluation.missedWords = [];
        }
        if(r.history[i].example.audio) {
            r.history[i].example.audio = { 
              ...r.history[i].example.audio,
              expiresF: format(r.history[i].example.audio.expires),
              url: r.history[i].example.audio.publicUrl.slice(0,40) + '...',
              publicUrl: r.history[i].example.audio.publicUrl.replace('entiendo-audio-files-426593798727.s3.amazonaws.com/tts', '...') 
            }
        }
        
    }
    console.log(JSON.stringify(r, null, 2));
}
async function dumpProgress() {
  const progressModel = new ProgressModel();
  const allProgress   = await progressModel.findAll();
  const idiomModel    = new IdiomModel();
  const allIdioms     = await idiomModel.findAll();
  const exampleModel  = new ExampleModel();
  const allExamples   = await exampleModel.findAll();

  console.log( 'export default { "progress" : [')
  for( var i = 0; i < allProgress.length; i++ ) {
    if( i !== 0 ) {
        console.log(',');
    }
    dumpRecord(allProgress[i], allIdioms, allExamples);
  }
  console.log(']}');
}

dumpProgress().catch(err => {
  console.error('Failed to dump progress:', err);
  process.exit(1);
});
