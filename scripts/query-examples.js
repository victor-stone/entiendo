import jspath from 'jspath';
import ExampleQuery from '../src/shared/lib/query/ExampleQuery.js';
import data from '../staging/import/examples.js';
import util from 'util';

const query = new ExampleQuery(data);

const t = `..{.basedOn == "opinar" || .basedOn == "decidite" || .basedOn == "uno" || .basedOn == "puso" || .basedOn == "de" || .basedOn == "después" || .basedOn == "almorzar" || .basedOn == "dimos" || .basedOn == "mantenerme" || .basedOn == "en" || .basedOn == "forma" || .basedOn == "el"}`
const t2 = `..{.basedOn == "opinar" || .basedOn == "decidite"}`

function q() {
    let result = jspath(t2,data);
    return result;
}

function ex() { // aka .sandBoxed
    let result = jspath( '..{.basedOn}',data);
    return result;
}

const result = query.basedOn(['siesta', 'forma']);

console.log(util.inspect(result, { depth: null, colors: true }));

