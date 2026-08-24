import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizePreferences,
  updatePreferences,
} from '../src/server/api/userAPI.js';
import {
  DEFAULT_VOICE_TYPE,
  VOICE_EDUCATION,
  VOICE_TYPE,
  isVoiceType,
  normalizeVoiceType,
} from '../src/shared/constants/voiceTypes.js';

test('voice types validate and unknown values normalize to conversation', () => {
  assert.equal(isVoiceType(VOICE_EDUCATION), true);
  assert.equal(isVoiceType('arbitrary-provider-voice'), false);
  assert.equal(normalizeVoiceType('arbitrary-provider-voice'), DEFAULT_VOICE_TYPE);
});

test('preferences gain filter and voice defaults without losing other settings', () => {
  const preferences = normalizePreferences({
    filter: { usage: 'super_rare' },
    getNextExample: 'example-id',
  });

  assert.equal(preferences[VOICE_TYPE], DEFAULT_VOICE_TYPE);
  assert.equal(preferences.filter.usage, 'super_rare');
  assert.ok(Object.prototype.hasOwnProperty.call(preferences.filter, 'tone'));
  assert.equal(preferences.getNextExample, 'example-id');
});

test('a valid education preference is retained', () => {
  assert.equal(
    normalizePreferences({ [VOICE_TYPE]: VOICE_EDUCATION })[VOICE_TYPE],
    VOICE_EDUCATION,
  );
});

test('the preference API rejects arbitrary client voice identifiers', async () => {
  await assert.rejects(
    updatePreferences({
      user: { sub: 'auth0|test', userId: 'auth0|test' },
      payload: {
        preferences: { [VOICE_TYPE]: '8Nz6hV5TPv151P6ZNEBV' },
      },
    }),
    /Invalid voice type/,
  );
});

