// src/server/api/lib/finalizeExample.js
import { Examples, Idioms, Normals } from '../../models/index.js';
import ttl, { getAudioUrl, setAudioUrl } from '../../lib/audio.js';

const { generateSpeech } = ttl;

export async function finalizeExample
(
    record, 
    {
        force = true, 
        model = null, 
        debug = null
    } = { force: true }
) {

    if( record.audio ) {
        record.url = await getAudioUrl(record.audio);
    } else if ( force ) {
        const { id, name }          = ttl.selectVoice();
        const { key, url, expires } = await generateSpeech(record.text, id);

        setAudioUrl( key, url, expires );
        
        if (debug) debug('generating audio for example with ' + name);
        
        if( !model ) 
            model = new Examples();

        record = model.addAudio(model.key(record), { audio: key, voice: name } );
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
