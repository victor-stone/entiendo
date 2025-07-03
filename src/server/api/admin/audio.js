import {
    IdiomModel,
    ExampleModel,
    IdiomModelQuery,
    ExampleModelQuery,
    SettingsModel
} from '../../models/index.js'
import ttl, { deleteAudioFromS3 } from '../../lib/audio.js';
const { generatePresignedUrl } = ttl;
import fs from 'fs/promises';
import fetch from 'node-fetch';

async function incSyncCounter() {
    const counter = SettingsModel.get('SYNC_COUNTER')
    const model = new SettingsModel();
    await model.put('SYNC_COUNTER', counter + 1);
    return counter; 
}

/*
  ((((((((((()))))))))))
    MANAGE ASSIGNMENTS
  ((((((((((()))))))))))
*/

export async function assignVoiceToIdiom(routeContext) {
    const {idiomId, source} = routeContext.payload;
    const model = new IdiomModel();
    return _assignVoice(model, idiomId, source);
}

export async function assignVoiceToExample(routeContext) {
    const {exampleId, source} = routeContext.payload;
    const model = new ExampleModel();
    return _assignVoice(model, exampleId, source);
}

async function _assignVoice(model, id, source) {
    const sync     = source ? await incSyncCounter() : null;
    const date     = source ? Date.now() : null;
    const assigned = { source, sync, date };
    return model.update(id, { assigned })
}

export async function attachExampleAndAudioToIdiom(record) {
    const model = new ExampleModel();
    await model.createExample(record);
    const imodel = new IdiomModel();
    // this below is assuming a lot:
    // there is only one assignment per idiom
    // that assignment is for this example
    // it is perfectly fine to delete whatever
    //.    assignment info is in the idiom
    return _assignVoice(imodel, idiomId, null);
}

export async function attachAudioToExample({exampleId, audio}) {
    const model = new ExampleModel();
    await model.addAudio(exampleId,audio);
    await assignVoiceToExample({exampleId, source: null });
}

/*
  ((((((((((()))))))))))
      MANAGE FILES
  ((((((((((()))))))))))
*/

export async function downloadAudio({exampleId, fileDestination}) {
    const query        = ExampleModelQuery.create();
    const example      = query.example(exampleId);
    const generatedUrl = await generatePresignedUrl(example.audio.publicUrl);

    const response = await fetch(generatedUrl);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(fileDestination, Buffer.from(buffer));
}

export async function deleteAudio(exampleId, source) {
    const query   = ExampleModelQuery.create();
    const example = query.example(exampleId);
    await deleteAudioFromS3(example.audio.publicUrl);
    const model = new ExampleModel();
    return await model.update( exampleId, { audio: {} } )
}

export async function replaceAudio({ exampleId, audio}) {
    await deleteAudio( exampleId, audio.source );
    await attachAudioToExample({exampleId, audio})
}

/*
  ((((((((((()))))))))))
    GENERATE REPORTS
  ((((((((((()))))))))))
*/

/*
    The report you want is 'Idioms' with no audio
    with a [x] for assigned
*/
export async function audioReports(routeContext) {
    const { reportName } = routeContext.payload;
    const AUDIO_REPORTS = {
        ASSIGNABLE_IDIOMS  : _getAssignableIdioms,
        UNASSIGNED_EXAMPLES: _getUnassignedExamples,
        PENDING_EXAMPLES   : _getPendingExamples
    };
    return await AUDIO_REPORTS[reportName](routeContext.payload);
}

async function _getAssignableIdioms( { context, usage }) {
    const idiomQuery   = await IdiomModelQuery.create();
    const exampleQuery = await ExampleModelQuery.create();

    const idioms = idiomQuery.byCriteria( context, usage )

    return idioms.filter( ({idiomId, assigned}) => {
        const examples = exampleQuery.forIdiom(idiomId);
        return !examples || !examples.length;
    });
}    
    
async function _getUnassignedExamples( { context, usage } ) {
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


async function _getPendingExamples( {source} ) {
    const query = await ExampleModelQuery.create();
    return query.assigned(source);
}


