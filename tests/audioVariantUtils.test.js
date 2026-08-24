import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_VOICE_SPEEDS,
  EDUCATION_VOICE_ID,
  getAudioVariants,
  mergeAudioVariant,
  selectVoiceFromList,
  voicesForType,
} from '../src/server/api/lib/audioVariantUtils.js';
import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION,
} from '../src/shared/constants/voiceTypes.js';

const voices = [
  {
    serviceId: 'conversation-1',
    name: 'Conversation One',
    voiceType: VOICE_CONVERSATION,
  },
  { serviceId: 'chat-2', name: 'Chat', voiceType: VOICE_CONVERSATION },
  {
    serviceId: EDUCATION_VOICE_ID,
    name: 'Zeta',
    voiceType: VOICE_EDUCATION,
  },
];

test('non-canonical persisted audio shapes are rejected', () => {
  assert.throws(
    () => getAudioVariants({ audio: 'top-level.mp3', audioVariants: {} }),
    /top-level audio response fields/,
  );
  assert.throws(
    () => getAudioVariants({ voice: 'Nacho', audioVariants: {} }),
    /top-level audio response fields/,
  );
  assert.throws(
    () => getAudioVariants({ url: 'signed-url', audioVariants: {} }),
    /top-level audio response fields/,
  );
  assert.throws(
    () => getAudioVariants({ playback: {}, audioVariants: {} }),
    /top-level audio response fields/,
  );
  assert.throws(
    () => getAudioVariants({}),
    /audioVariants object/,
  );
  assert.throws(
    () => getAudioVariants({ audioVariants: [] }),
    /audioVariants object/,
  );
  assert.throws(
    () => getAudioVariants({
      audioVariants: { [VOICE_CONVERSATION]: 'string-variant.mp3' },
    }),
    /must be an object with a key/,
  );
  assert.throws(
    () => getAudioVariants({
      audioVariants: { unsupported: { key: 'unsupported.mp3' } },
    }),
    /Unsupported persisted voice type/,
  );
  assert.throws(
    () => getAudioVariants({
      audioVariants: {
        [VOICE_CONVERSATION]: { key: 'audio.mp3', url: 'signed-url' },
      },
    }),
    /response-only URL metadata/,
  );
});

test('canonical variants preserve both styles and generation metadata', () => {
  const record = {
    audioVariants: {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Malena',
        source: 'upload',
      },
      [VOICE_EDUCATION]: {
        key: 'education.mp3',
        voiceName: 'Zeta',
        voiceId: EDUCATION_VOICE_ID,
        speed: 0.85,
      },
    },
  };

  assert.deepEqual(getAudioVariants(record), {
    [VOICE_CONVERSATION]: {
      key: 'conversation.mp3',
      voiceName: 'Malena',
      source: 'upload',
    },
    [VOICE_EDUCATION]: {
      key: 'education.mp3',
      voiceName: 'Zeta',
      voiceId: EDUCATION_VOICE_ID,
      speed: 0.85,
    },
  });
});

test('merging one style never overwrites the other style', () => {
  const record = {
    audioVariants: {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Nacho',
      },
    },
  };

  assert.deepEqual(
    mergeAudioVariant(record, VOICE_EDUCATION, {
      key: 'education.mp3',
      voiceName: 'Zeta',
    }),
    {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Nacho',
      },
      [VOICE_EDUCATION]: {
        key: 'education.mp3',
        voiceName: 'Zeta',
      },
    },
  );
});

test('conversation selection excludes Zeta and defaults to speed 1', () => {
  assert.deepEqual(
    voicesForType(voices, VOICE_CONVERSATION).map(({ serviceId }) => serviceId),
    ['conversation-1', 'chat-2'],
  );

  const selected = selectVoiceFromList(voices, VOICE_CONVERSATION, () => 0);
  assert.equal(selected.serviceId, 'conversation-1');
  assert.equal(selected.speed, DEFAULT_VOICE_SPEEDS[VOICE_CONVERSATION]);
});

test('voice records without a valid voice type are rejected', () => {
  assert.throws(
    () => voicesForType([
      { serviceId: 'untagged', name: 'Untagged' },
    ], VOICE_CONVERSATION),
    /must have a valid voiceType/,
  );
  assert.throws(
    () => voicesForType([
      { serviceId: 'mistyped', name: 'Mistyped', voiceType: 'teacher' },
    ], VOICE_EDUCATION),
    /must have a valid voiceType/,
  );
  assert.throws(
    () => voicesForType([
      {
        serviceId: 'not-zeta',
        name: 'Other',
        voiceType: VOICE_EDUCATION,
      },
    ], VOICE_EDUCATION),
    /Only Zeta/,
  );
  assert.throws(
    () => voicesForType([
      {
        serviceId: EDUCATION_VOICE_ID,
        name: 'Zeta',
        voiceType: VOICE_CONVERSATION,
      },
    ], VOICE_CONVERSATION),
    /Zeta must use/,
  );
});

test('education selection is restricted to Zeta at the clear default speed', () => {
  const selected = selectVoiceFromList(voices, VOICE_EDUCATION, () => 0.99);

  assert.equal(selected.serviceId, EDUCATION_VOICE_ID);
  assert.equal(selected.name, 'Zeta');
  assert.equal(selected.speed, DEFAULT_VOICE_SPEEDS[VOICE_EDUCATION]);
});

test('an explicit configured speed overrides the style default', () => {
  const configured = voices.map((voice) => (
    voice.serviceId === EDUCATION_VOICE_ID ? { ...voice, speed: 0.8 } : voice
  ));

  assert.equal(
    selectVoiceFromList(configured, VOICE_EDUCATION, () => 0).speed,
    0.8,
  );
});
