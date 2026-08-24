import { VOICE_CONVERSATION, VOICE_EDUCATION } from '../../../shared/constants/voiceTypes.js';
import { Examples } from '../../models/index.js';
import { getAudioUrl, setAudioUrl } from '../../lib/aws/s3audioBucket.js';
import { generateSpeech, selectVoice } from '../../lib/elevenlabs.js';
import {
  DEFAULT_VOICE_SPEEDS,
  EDUCATION_VOICE_ID,
  getAudioVariants,
  isVoiceType,
  mergeAudioVariant,
  voiceSpeedForVoice,
} from './audioVariantUtils.js';

export const AUDIO_FALLBACK_WARNING = 'AUDIO_VARIANT_FALLBACK';

// Deduplicate only the expensive generation/upload/write sequence. Signing an
// existing S3 object is already cached by s3audioBucket.
const generationPromises = new Map();

export async function ensureAudioVariant(
  record,
  voiceType = VOICE_CONVERSATION,
  {
    force = true,
    model = null,
    debug = null,
    generateSpeechFn = generateSpeech,
    selectVoiceFn = selectVoice,
    getAudioUrlFn = getAudioUrl,
    setAudioUrlFn = setAudioUrl,
  } = {},
) {
  if (!record) {
    throw new TypeError('An audio record is required');
  }
  if (!isVoiceType(voiceType)) {
    throw new TypeError(`Unsupported voice type: ${voiceType}`);
  }

  const variants = getAudioVariants(record);
  if (shouldReuseVariant(variants[voiceType], voiceType, force)) {
    return resolveExistingVariant(record, variants, voiceType, getAudioUrlFn);
  }

  if (!force) {
    return {
      record: { ...record, audioVariants: variants },
      playback: null,
      warning: null,
    };
  }

  const persistenceModel = model || new Examples();
  const recordId = persistenceModel.key(record);
  if (!recordId) {
    throw new TypeError('Cannot generate audio for a record without an ID');
  }

  const generationKey = `${persistenceModel.constructor.name}:${recordId}:${voiceType}`;
  let generationPromise = generationPromises.get(generationKey);

  if (!generationPromise) {
    generationPromise = generateAndPersistVariant({
      record,
      recordId,
      voiceType,
      model: persistenceModel,
      debug,
      generateSpeechFn,
      selectVoiceFn,
      getAudioUrlFn,
      setAudioUrlFn,
    });
    generationPromises.set(generationKey, generationPromise);
  }

  try {
    return await generationPromise;
  } finally {
    if (generationPromises.get(generationKey) === generationPromise) {
      generationPromises.delete(generationKey);
    }
  }
}

/**
 * Education audio is an enhancement, not a reason to make an otherwise valid
 * exercise unusable. If its generation fails, reuse an existing conversation
 * recording. We intentionally do not generate a second fallback recording.
 */
export async function resolveAudioVariant(record, voiceType, options = {}) {
  try {
    return await ensureAudioVariant(record, voiceType, options);
  } catch (error) {
    if (voiceType !== VOICE_EDUCATION) throw error;

    const freshRecord = getFreshRecord(options.model, record);
    const variants = getAudioVariants(freshRecord);
    if (!variants[VOICE_CONVERSATION]) throw error;

    if (options.debug) {
      options.debug(
        'Education audio failed for %s; falling back to conversation: %s',
        recordIdentifier(freshRecord),
        error.message,
      );
    }

    const fallback = await ensureAudioVariant(
      freshRecord,
      VOICE_CONVERSATION,
      { ...options, force: false },
    );
    if (!fallback.playback) throw error;

    return {
      ...fallback,
      playback: {
        ...fallback.playback,
        requestedVoiceType: voiceType,
        fallback: true,
      },
      warning: {
        code: AUDIO_FALLBACK_WARNING,
        message: 'The clear recording is unavailable, so the conversational recording is being used.',
        requestedVoiceType: voiceType,
        voiceType: VOICE_CONVERSATION,
      },
    };
  }
}

export function audioResponse({ playback, warning = null }) {
  const warningMessage = typeof warning === 'string' ? warning : warning?.message;
  return {
    playback,
    ...(warningMessage ? { warning: warningMessage } : {}),
    ...(warning?.code ? { warningCode: warning.code } : {}),
  };
}

async function generateAndPersistVariant({
  record,
  recordId,
  voiceType,
  model,
  debug,
  generateSpeechFn,
  selectVoiceFn,
  getAudioUrlFn,
  setAudioUrlFn,
}) {
  // Another voice-type request may have completed while this one was queued.
  const beforeGeneration = model.byId(recordId) || record;
  const currentVariants = getAudioVariants(beforeGeneration);
  const currentVariant = currentVariants[voiceType];
  if (shouldReuseVariant(currentVariant, voiceType, true)) {
    return resolveExistingVariant(
      beforeGeneration,
      currentVariants,
      voiceType,
      getAudioUrlFn,
    );
  }

  const voice = selectVoiceFn(voiceType);
  const { key, url, expires } = await generateSpeechFn(beforeGeneration.text, voice);
  if (!key) {
    throw new Error(`Audio generation for ${voiceType} did not return an S3 key`);
  }

  if (url) setAudioUrlFn(key, url, expires);

  const variant = {
    key,
    voiceName: voice.name,
    voiceId: voice.serviceId,
    speed: voiceSpeedForVoice(voice, voiceType),
    source: 'tts',
  };

  // Re-read immediately before the shallow model update, then merge the
  // nested map. This preserves a different variant written while TTS ran.
  const latestRecord = model.byId(recordId) || beforeGeneration;
  const latestVariants = getAudioVariants(latestRecord);
  const latestVariant = latestVariants[voiceType];
  const variantChangedDuringGeneration = !sameVariant(
    currentVariant,
    latestVariant,
  );

  // A manual upload always wins over background generation. Also reuse a
  // current TTS variant written by another server process while this request
  // was waiting for ElevenLabs.
  if (
    latestVariant?.source === 'upload'
    || (
      variantChangedDuringGeneration
      && shouldReuseVariant(latestVariant, voiceType, true)
    )
  ) {
    return resolveExistingVariant(
      latestRecord,
      latestVariants,
      voiceType,
      getAudioUrlFn,
    );
  }

  const audioVariants = mergeAudioVariant(latestRecord, voiceType, variant);
  const update = { audioVariants };

  const updatedRecord = typeof model.updateAndCommit === 'function'
    ? await model.updateAndCommit(recordId, update)
    : typeof model.addAudio === 'function'
      ? await model.addAudio(recordId, update)
      : await model.update(recordId, update);

  if (debug) {
    debug(
      'Generated %s audio for %s with %s: %s',
      voiceType,
      recordId,
      voice.name,
      key,
    );
  }

  const playbackUrl = url || await getAudioUrlFn(key);
  return {
    record: updatedRecord,
    playback: createPlayback(voiceType, variant, playbackUrl),
    warning: null,
  };
}

async function resolveExistingVariant(record, variants, voiceType, getAudioUrlFn) {
  const variant = variants[voiceType];
  const url = await getAudioUrlFn(variant.key);
  return {
    record: { ...record, audioVariants: variants },
    playback: createPlayback(voiceType, variant, url),
    warning: null,
  };
}

function createPlayback(voiceType, variant, url) {
  return {
    voiceType,
    url,
    voiceName: variant.voiceName || null,
  };
}

function shouldReuseVariant(variant, voiceType, force) {
  if (!variant) return false;
  if (voiceType !== VOICE_EDUCATION || !force) return true;
  if (variant.source === 'upload') return true;

  return variant.voiceId === EDUCATION_VOICE_ID
    && variant.speed === DEFAULT_VOICE_SPEEDS[VOICE_EDUCATION];
}

function sameVariant(first, second) {
  return JSON.stringify(first || null) === JSON.stringify(second || null);
}

function getFreshRecord(model, record) {
  if (!model || !record) return record;
  const id = model.key(record);
  return (id && model.byId(id)) || record;
}

function recordIdentifier(record) {
  return record?.exampleId || record?.shovelId || 'unknown record';
}
