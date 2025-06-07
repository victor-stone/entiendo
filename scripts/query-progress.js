import jspath from 'jspath';
import ProgressQuery from '../src/shared/lib/query/ProgressQuery.js';
import progress from '../staging/import/progress.js';
import util from 'util';
import { format } from 'timeago.js'

const query = new ProgressQuery(progress);

function avaiableSandbox(max) {
    return jspath(`..{.isSandbox && (.history.length < ${max})}`, progress)[0];
}

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

function getMissedWords(data) {
    let result = jspath('..missedWords', data);
        result = [... new Set(result)].sort();
    return result;
}

const result = avaiableSandbox(3);
console.log(util.inspect(result, { depth: null, colors: true }));

