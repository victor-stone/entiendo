import jspath from 'jspath';
import data from '../staging/import/examples.js';
import util from 'util';


const t = `..{.basedOn == "opinar" || .basedOn == "decidite" || .basedOn == "uno" || .basedOn == "puso" || .basedOn == "de" || .basedOn == "después" || .basedOn == "almorzar" || .basedOn == "dimos" || .basedOn == "mantenerme" || .basedOn == "en" || .basedOn == "forma" || .basedOn == "el"}`
const t2 = `..{.basedOn == "opinar" || .basedOn == "decidite"}`

function q() {
    let result = jspath(t2,data);
    return result;
}
const result = q();
console.log(util.inspect(result, { depth: null, colors: true }));

