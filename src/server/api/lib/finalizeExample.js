// src/server/api/lib/finalizeExample.js
import ttl from '../../lib/audio.js';
import { ExampleModel } from '../../models/index.js';

const { generateSpeech, generatePresignedUrl } = ttl;

export async function finalizeExample(example, {force = true, idiom = null, model = null, debug = null} = {force: true}) {
    const needAudio = _ensureAudioAccess(example, debug, force);
    if (needAudio) {
        example = await needAudio();
        if( !model ) model = new ExampleModel();
        example = await model.addAudio(example.exampleId, example.audio);
    }
    if( idiom ) {
        example.idiom = idiom;
        if (debug) {
            if( example.idiom ) {
                debug('Returning example for "%s (%s)": %s...',
                    example.idiom.text,
                    example.idiom.usage,
                    example.text.slice(0, 14)
                );
            } else {
                debug('Returning example for %s: "%s..."',
                    example.basedOn.join(', '),
                    example.text.slice(0, 14)
                );
            }
        }
    }
    return example;
}

function _ensureAudioAccess(example, debug, force) {
    // Ensure example.audio exists
    const audio = example.audio || {};
    const { publicUrl, expires } = audio;

    if (publicUrl) {
        // Only check expires if it's a valid number
        if (typeof expires !== 'number' || expires < Date.now()) {
            return async () => {
                if (debug) debug('existing audio is found, generating a new public url');
                const generatedUrl = await generatePresignedUrl(publicUrl);
                example.audio = {
                    ...audio,
                    ...generatedUrl
                };
                return example;
            }
        }
        if (debug) debug('existing audio found and public url is current');
    } else if (force) {
        return async () => {
            const { id, name } = _getRandomVoiceOption();
            example.audio = await generateSpeech(example.text, id);
            if (debug) debug('generating audio for example with ' + name);
            return example;
        }
    }
    return null;
}

function _getRandomVoiceOption() {
    const idx = Math.floor(Math.random() * ttl.voiceOptions.length);
    return ttl.voiceOptions[idx];
}
