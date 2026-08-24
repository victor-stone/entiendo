// src/server/api/lib/finalizeExample.js
import { Idioms, Normals } from '../../models/index.js';
import { VOICE_CONVERSATION } from '../../../shared/constants/voiceTypes.js';
import {
    audioResponse,
    resolveAudioVariant,
} from './audioVariants.js';
import { getAudioVariants } from './audioVariantUtils.js';

export async function finalizeExample
(
    record, 
    {
        force = true, 
        model = null, 
        debug = null,
        idiom = null,
        voiceType = VOICE_CONVERSATION,
    } = {}
) {
    if( debug ) {
        const variants = getAudioVariants(record);
        if( variants[voiceType] ) {
            debug('Audio at: ' + variants[voiceType].key);
            debug('VOICE: ' + variants[voiceType].voiceName);
        }
    }

    const resolved = await resolveAudioVariant(record, voiceType, {
        force,
        model,
        debug,
    });
    record = { ...resolved.record };

    if( !record.idiom && !record.basedOn?.length ) {
        record.idiom = idiom;
        if( !record.idiom ) {
            const _idioms = new Idioms();
            record.idiom = _idioms.byId(record.idiomId);
        }
    }

    if( record.idiom ) {
        const _normals = new Normals();
        record.normal = record.idiom.normal && _normals.byId(record.idiom.normal);
    }

    // Persisted keys and generation metadata stay server-side. Learner clients
    // receive only the selected signed playback object.
    const { audioVariants: _audioVariants, ...learnerRecord } = record;

    return {
        ...learnerRecord,
        ...audioResponse(resolved),
    };
}
