// src/server/api/lib/finalizeExample.js
import ttl from '../../lib/audio.js';
import { Examples } from '../../models/index.js';
import { InvalidCodeFlowError } from '../../../shared/constants/errorTypes.js';
import debug from 'debug';
const debugEx = debug('api:example');

const { generateSpeech, generatePresignedUrl } = ttl;

export async function finalizeExample(
    record, {
        force = true, 
        idiom = null, 
        model = null, 
        debug = null
    } = {force: true}) {

    const needAudio = _ensureAudioAccess(record, debug, force);
    
    if (needAudio) {
        record = await needAudio();
        if( !model ) model = new Examples();
        record = model.addAudio(model.key(record), record.audio);
    }
    if( idiom ) {
        if( idiom.examples ) {
            throw new InvalidCodeFlowError();
        }
        record.idiom = idiom;
        (debug || debugEx)('Finalized example for "%s (%s)": %s...',
            record.idiom.text,
            record.idiom.usage,
            record.text.slice(0, 14)
        );
    }
    return record;
}

export async function checkUrlExpiration(audio) {
    const { publicUrl, expires } = audio;
    if( publicUrl ) {
        if (typeof expires !== 'number' || expires < Date.now()) {
            const generatedUrl = await generatePresignedUrl(publicUrl);
            return {
                ...audio,
                ...generatedUrl
            }
        }
    }
    return audio;
}

function _ensureAudioAccess(record, debug, force) {
    // Ensure example.audio exists
    const audio = record.audio || {};
    const { publicUrl, expires } = audio;

    if (publicUrl) {
        // Only check expires if it's a valid number
        if (typeof expires !== 'number' || expires < Date.now()) {
            return async () => {
                if (debug) debug('existing audio is found, generating a new public url');
                const generatedUrl = await generatePresignedUrl(publicUrl);
                record.audio = {
                    ...audio,
                    ...generatedUrl
                };
                return record;
            }
        }
        if (debug) debug('existing audio found and public url expires: ' + new Date(expires) );
    } else if (force) {
        return async () => {
            const { id, name } = _getRandomVoiceOption();
            record.audio = await generateSpeech(record.text, id);
            if (debug) debug('generating audio for example with ' + name);
            return record;
        }
    }
    return null;
}

function _getRandomVoiceOption() {
    const idx = Math.floor(Math.random() * ttl.voiceOptions.length);
    return ttl.voiceOptions[idx];
}
