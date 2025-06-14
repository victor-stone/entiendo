import jspath from 'jspath';
import ProgressQuery from '../src/shared/lib/query/ProgressQuery.js';
import progress from '../staging/import/progress.js';
import util from 'util';
import { format } from 'timeago.js'

const query = new ProgressQuery(progress);

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
    let result = jspath('..missedWords', data).map( w => w.toLowerCase() )
        result = [... new Set(result)].sort();
    return result;
}

function findExample() {
    return jspath(`..
        {
            .sandbox && .evaluation{.missedWords == 'podía'}
        }
        `, progress);
}

const result2 = query.oldestSandboxExample(['podía']);

const result3 = query.sandboxExample("51545e59-442d-410e-8ccd-be4ffb2f7b90");

const result6 = query.schedule()
    .filter( ({userId}) => userId == "google-oauth2|101722812212104773442")
    .sort( (a,b) => b.createdAt - a.createdAt )
    .map( ex => {
    ex.dueDate = format(ex.dueDate);
    ex.createdAt = format(ex.createdAt);
    ex.history = ex.history.map( h => {
        h.date = format(h.date);
        return h;
    })
    return ex;
});

const result = getMissedWords(progress);

console.log(util.inspect(result, { depth: null, colors: true }));
console.log(result)
result;
