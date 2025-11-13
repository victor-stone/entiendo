// src/server/api/lib/finalizeExample.js
import { Examples, Idioms, Normals } from '../../models/index.js';
import { getAudioUrl, setAudioUrl } from '../../lib/aws/s3audioBucket.js';

import { generateSpeech, selectVoice } from '../../lib/elevenlabs.js';

export async function finalizeExample
(
    record, 
    {
        force = true, 
        model = null, 
        debug = null
    } = { force: true }
) {

    if( debug ) {
        if( record.audio ) {
            debug('Audio at: ' + record.audio );
            debug('VOICE: ' + record.voice );
        }
    }
    if( record.audio ) {
        record.url = await getAudioUrl(record.audio);
    } else if ( force ) {
        const voice = selectVoice();
        const { key, url, expires } = await generateSpeech(record.text, voice);

        setAudioUrl( key, url, expires );
        
        if (debug) debug('generating audio for example with [' + voice.name + "]\n " + key);
        
        if( !model ) 
            model = new Examples();

        record = model.addAudio(model.key(record), { audio: key, voice: voice.name } );
        record.url = url;
    }

    if( !record.idiom ) {
        const _idioms = new Idioms();
        record.idiom = _idioms.byId(record.idiomId);
    }

    const _normals = new Normals();
    record.normal = record.idiom.normal && _normals.byId(record.idiom.normal);

    return record;
}
