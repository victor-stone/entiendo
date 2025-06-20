import { exampleQuery } from './query.js';
import ExampleModeQuery  from '../src/server/models/ExampleModelQuery.js';

// const data = [
//     { foo: 'bar', title: "foobar"},
//     { foo: 'baz', title: "foobaz"}
// ];

// const result = exampleQuery.q( '..{.foo == "baz"}',{ foo: 'baz', title: "replacement" },  data);

// console.log(JSON.stringify(result));
// console.log('--------');
// console.log(JSON.stringify(data));
async function main() {
    const query = await ExampleModeQuery.create();

    const data = query.data;
    let rec = data.find(({exampleId}) => exampleId == "bfa56234-e20e-4182-a1ba-0455c1913d0e");
    const newRec = { feez: 'foobar', source: 'mybutt' };
    Object.assign(rec, newRec);

    const found = query.example("bfa56234-e20e-4182-a1ba-0455c1913d0e");

    console.log( found );
}

main();