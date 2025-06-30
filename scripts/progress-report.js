import { progressQuery, idiomQuery, exampleQuery } from './query.js';
import { format } from 'timeago.js'

const user = "google-oauth2|101722812212104773442"

progressQuery._limitToUser(user);

const progress = progressQuery.schedule();

const exercises = progress.map( p => {
    const idiom = idiomQuery.idiom(p.idiomId);
    return {
        text: idiom.text,
        due: format(p.dueDate),
        cracks: p.history.length,
        history: p.history.map( h => {
            return {
                date: format(h.date),
                text: exampleQuery.example(h.exampleId).text,
                transcription: h.evaluation.transcriptionAccuracy,
                translation: h.evaluation.translationAccuracy,
                mistake: h.evaluation.mistakeType
            }
        })
    }
});

console.log( JSON.stringify(exercises,null,2) );