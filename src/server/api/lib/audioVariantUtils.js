import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION,
  VOICE_TYPES,
  isVoiceType,
  normalizeVoiceType,
} from '../../../shared/constants/voiceTypes.js';

export { VOICE_TYPES, isVoiceType, normalizeVoiceType };

export const EDUCATION_VOICE_ID = '8Nz6hV5TPv151P6ZNEBV';

export const DEFAULT_VOICE_SPEEDS = Object.freeze({
  [VOICE_CONVERSATION]: 1,
  [VOICE_EDUCATION]: 0.85,
});

export function voiceTypeForVoice(voice = {}) {
  if (!isVoiceType(voice.voiceType)) {
    const identifier = voice.name || voice.serviceId || 'unknown voice';
    throw new TypeError(`Voice ${identifier} must have a valid voiceType`);
  }
  return voice.voiceType;
}

export function voiceSpeedForVoice(voice = {}, voiceType = voiceTypeForVoice(voice)) {
  const configuredVoiceType = voiceTypeForVoice(voice);
  if (voiceType !== configuredVoiceType) {
    throw new TypeError(`Voice ${voice.name || voice.serviceId} is not configured for ${voiceType}`);
  }

  const configuredSpeed = Number(voice.speed);
  if (Number.isFinite(configuredSpeed) && configuredSpeed > 0) {
    return configuredSpeed;
  }

  return DEFAULT_VOICE_SPEEDS[voiceType];
}

export function voicesForType(voices = [], voiceType = VOICE_CONVERSATION) {
  if (!isVoiceType(voiceType)) {
    throw new TypeError(`Unsupported voice type: ${voiceType}`);
  }

  return voices.filter((voice) => {
    const configuredType = voiceTypeForVoice(voice);
    if (
      configuredType === VOICE_EDUCATION
      && voice.serviceId !== EDUCATION_VOICE_ID
    ) {
      throw new TypeError('Only Zeta may use the education voiceType');
    }
    if (
      voice.serviceId === EDUCATION_VOICE_ID
      && configuredType !== VOICE_EDUCATION
    ) {
      throw new TypeError('Zeta must use the education voiceType');
    }
    return configuredType === voiceType;
  });
}

/**
 * Pure selection helper. Supplying `random` makes selection deterministic in
 * tests without requiring the Voices model (whose data is loaded from S3).
 */
export function selectVoiceFromList(
  voices,
  voiceType = VOICE_CONVERSATION,
  random = Math.random,
) {
  const candidates = voicesForType(voices, voiceType);
  if (candidates.length === 0) {
    throw new Error(`No ${voiceType} voices are configured`);
  }

  const randomValue = Number(random());
  const boundedValue = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.9999999999999999)
    : 0;
  const voice = candidates[Math.floor(boundedValue * candidates.length)];

  return {
    ...voice,
    voiceType,
    speed: voiceSpeedForVoice(voice, voiceType),
  };
}

/** Read and validate the canonical persisted schema without coercion. */
export function getAudioVariants(record = {}) {
  if (
    Object.prototype.hasOwnProperty.call(record, 'audio')
    || Object.prototype.hasOwnProperty.call(record, 'voice')
    || Object.prototype.hasOwnProperty.call(record, 'url')
    || Object.prototype.hasOwnProperty.call(record, 'playback')
  ) {
    throw new TypeError('Audio records must not contain top-level audio response fields');
  }

  if (!isPlainObject(record.audioVariants)) {
    throw new TypeError('Audio records must contain an audioVariants object');
  }

  const variants = {};
  for (const [voiceType, variant] of Object.entries(record.audioVariants)) {
    if (!isVoiceType(voiceType)) {
      throw new TypeError(`Unsupported persisted voice type: ${voiceType}`);
    }
    if (!isAudioVariant(variant)) {
      throw new TypeError(`Audio variant for ${voiceType} must be an object with a key`);
    }
    if (
      Object.prototype.hasOwnProperty.call(variant, 'url')
      || Object.prototype.hasOwnProperty.call(variant, 'expires')
    ) {
      throw new TypeError(`Audio variant for ${voiceType} contains response-only URL metadata`);
    }
    variants[voiceType] = { ...variant };
  }

  return variants;
}

export function isAudioVariant(variant) {
  return isPlainObject(variant)
    && typeof variant.key === 'string'
    && variant.key.length > 0;
}

export function mergeAudioVariant(record, voiceType, variant) {
  if (!isVoiceType(voiceType)) {
    throw new TypeError(`Unsupported voice type: ${voiceType}`);
  }

  if (!isAudioVariant(variant)) {
    throw new TypeError(`Audio variant for ${voiceType} is missing a key`);
  }

  return {
    ...getAudioVariants(record),
    [voiceType]: { ...variant },
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
