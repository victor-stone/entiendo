import jspath from 'jspath';
import ExampleQuery from '../src/shared/lib/query/ExampleQuery.js';
import data from '../staging/import/examples.js';
import util from 'util';
import { format } from 'timeago.js';

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

// const result = query.basedOn(['siesta', 'forma']);

// const result = jspath('..{!.basedOn}', data)

const result2 = data.examples.filter( 
                                ex => (!Object.hasOwn(ex, 'idiomId') || !ex.idiomId) && 
                                       !Object.hasOwn(ex, 'basedOn') )
                              .map( ex => {
                                ex.createdAt = format(ex.createdAt);
                                return ex;
                              })

const result3 = data.examples.filter( ex => {
    return !Object.hasOwn(ex,'createdAt');
})

let result = query.example("51545e59-442d-410e-8ccd-be4ffb2f7b90");
// result.fooBaz = 'flalaha';
// result = query.example("7ba4e19f-e4d7-4d1f-86bb-29d81c23217f");

console.log(util.inspect(result, { depth: null, colors: true }));


/*
Semestre Invierno 2025 lanza este Domingo @La Infinita 

Por Favor - confirmar tu asistencia 

*/