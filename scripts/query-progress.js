import jspath from 'jspath';
import progress from '../staging/import/progress.js';
import util from 'util';

function getMissedWordsByMistakeType(data) {
    return jspath('..evaluation', data).reduce( (dict,{mistakeType,missedWords}) => {
        if( missedWords.length ) dict[mistakeType] = new Set( [ ...(dict[mistakeType] || []) , ...missedWords].sort() )
        return dict; }, {})
}

const result = getMissedWordsByMistakeType(progress);
console.log(util.inspect(result, { depth: null, colors: true }));

function getMissedWords(data) {
    let result = jspath('..missedWords', data);
        result = [... new Set(result)].sort();
    return result;
}
