import {
    IdiomModel,
    ExampleModel,
    IdiomModelQuery,
    ExampleModelQuery
} from '../../models/index.js'
import ttl, { deleteAudioFromS3 } from '../../lib/audio.js';
const { generatePresignedUrl } = ttl;
import fs from 'fs/promises';
import fetch from 'node-fetch';


/*
    Manage audio for examples

**get idioms without examples (by usage)**
**get examples without audio**
**get pending idiom uploads**
**get pending example uploads**    
*/

export async function reasignVoiceForExample( {exampleId, source} ) {
    const model = new ExampleModel();
    return await model.update( exampleId, { source });
}

export async function assignVoiceToIdiom({idiomId, source}) {
    const assigned = { source, date: source ? Date.now() : null };
    const model = new IdiomModel();
    model.update(idiomId, { assigned })
}

export async function attachExampleAndAudioToIdiom(record) {
    const model = new ExampleModel();
    await model.createExample(record);
    await assignVoiceToIdiom({idiomId, source: null});
}

export async function assignVoiceToExample({exampleId, source}) {
    const assigned = { source, date: source ? Date.now() : null };
    const model = new ExampleModel();
    model.update(exampleId, { assigned })
}

export async function attachAudioToExample({exampleId, audio}) {
    const model = new ExampleModel();
    await model.addAudio(exampleId,audio);
    await assignVoiceToExample({exampId, source: null });
}

export async function downloadAudio({exampleId, fileDestination}) {
    const query = ExampleModelQuery.create();
    const example = query.example(exampleId);
    const generatedUrl = await generatePresignedUrl(example.audio.publicUrl);

    const response = await fetch(generatedUrl);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(fileDestination, Buffer.from(buffer));
}

export async function deleteAudio(exampleId, source) {
    const query = ExampleModelQuery.create();
    const example = query.example(exampleId);
    await deleteAudioFromS3(example.audio.publicUrl);
    const model = new ExampleModel();
    return await model.update( exampleId, { audio: {} } )
}

export async function replaceAudio({ exampleId, audio}) {
    await deleteAudio( exampleId, audio.source );
    await attachAudioToExample({exampleId, audio})
}

export async function audioReports(routeContext) {
    const { reportName } = routeContext.payload;
    const AUDIO_REPORTS = {
        IDIOMS_NO_EXAMPLES: getIdiomsWithoutExamples,
        EXAMPLES_NO_AUDIO: getExamplesWithoutAudio,
        IDIOMS_PENDING: getIdiomsWithPendingAudio,
        EXAMPLES_PENDING: getExamplesWithPendingAudio
    };
    return await AUDIO_REPORTS[reportName](routeContext.payload);
}

export async function getIdiomsWithoutExamples( { context, usage }) {
    const idiomQuery = await IdiomModelQuery.create();
    const exampleQuery = await ExampleModelQuery.create();

    const idioms = idiomQuery.byCriteria( context, usage )

    return idioms.filter( ({idiomId}) => {
        const examples = exampleQuery.forIdiom(idiomId);
        return !examples || !examples.length;
    });
}    
    
export async function getExamplesWithoutAudio( { context, usage } ) {
    const idiomQuery = await IdiomModelQuery.create();
    const exampleQuery = await ExampleModelQuery.create();

    const ids = idiomQuery.byCriteria( context, usage, "idiomId")

    const noAudio = [];

    for( const id of ids ) {
        const examples = exampleQuery.forIdiom(id);
        if( examples && examples.length ) {
            for(const example of examples ) {
                if( !(example.hasOwnProperty('audio')) ) {
                    noAudio.push(example)
                }
            }
        }
    }
    return noAudio;
}

export async function getIdiomsWithPendingAudio({source}) {
    const query = await IdiomModelQuery.create();
    return query.assigned(source);

}

export async function getExamplesWithPendingAudio( {source} ) {
    const query = await ExampleModelQuery.create();
    return query.assigned(source);
}


