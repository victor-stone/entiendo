import { IdiomModel, ExampleModel } from '../src/server/models/index.js';

const ids = [
    "50974f34-72c6-4d1a-99c4-91abfe7ac416",
    "eba37238-d9e4-431d-a5e2-cdcc9dd0546d",
    "97b6889b-4010-4974-8100-eb4776b1b551",
    "29a17ee8-3d7d-4168-ba5c-bce00271d73f",
    "81f5ad67-700f-4032-98da-e3129a90f535",
    "62a64a44-2e50-4752-aa3d-592d486386fa"
];

async function main() {
    const idioms = new IdiomModel();
    const examples = new ExampleModel();

    for( const id of ids ) {
        const exs = await examples.findByIdiomId(id);
        for( const ex of exs ) {
            console.log( 'Deleting example: ', ex.text);
            await examples.delete(ex.exampleId);
        }
        console.log( 'Deleting: ', id);
        await idioms.delete(id);
    }
}

try {
    await main();
} catch(err) {
    console.log(err);
}
console.log('done');