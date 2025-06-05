import jspath from 'jspath';
import progress from '../staging/import/progress.js';
import util from 'util';
import { format } from 'timeago.js'

function getMissedWordsByMistakeType(data) {
    return jspath('..evaluation', data).reduce( (dict,{mistakeType,missedWords}) => {
        if( missedWords.length ) dict[mistakeType] = new Set( [ ...(dict[mistakeType] || []) , ...missedWords].sort() )
        return dict; }, {})
}

function withIdioms(data) {
    return jspath('..{.idiomId}.createdAt', data).map(t => format(t))
}

function findIdiom(data) {
    const testIdiom = "c85cbf32-2822-4d62-bb6d-8a4615d47b78";
    return jspath(`..{.idiomId == "${testIdiom}"}`, data);
}

const result = findIdiom(progress);
console.log(util.inspect(result, { depth: null, colors: true }));

function getMissedWords(data) {
    let result = jspath('..missedWords', data);
        result = [... new Set(result)].sort();
    return result;
}
