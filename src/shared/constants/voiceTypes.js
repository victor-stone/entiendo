export const VOICE_TYPE = 'voiceType';
export const VOICE_CONVERSATION = 'conversation';
export const VOICE_EDUCATION = 'education';

export const DEFAULT_VOICE_TYPE = VOICE_CONVERSATION;

export const VOICE_TYPES = Object.freeze([
  VOICE_CONVERSATION,
  VOICE_EDUCATION
]);

export function isVoiceType(value) {
  return VOICE_TYPES.includes(value);
}

export function normalizeVoiceType(value) {
  return isVoiceType(value) ? value : DEFAULT_VOICE_TYPE;
}
