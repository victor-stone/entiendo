import test from 'node:test';
import assert from 'node:assert/strict';

import {
  audioResponse,
  ensureAudioVariant,
  resolveAudioVariant,
} from '../src/server/api/lib/audioVariants.js';
import {
  EDUCATION_VOICE_ID,
  voiceSpeedForVoice,
} from '../src/server/api/lib/audioVariantUtils.js';
import {
  VOICE_CONVERSATION,
  VOICE_EDUCATION,
} from '../src/shared/constants/voiceTypes.js';

class FakeExamples {
  constructor(record) {
    this.record = structuredClone(record);
    this.writeCount = 0;
    this.lastUpdate = null;
  }

  key(record) {
    return record.exampleId;
  }

  byId(exampleId) {
    return exampleId === this.record.exampleId
      ? structuredClone(this.record)
      : null;
  }

  addAudio(exampleId, update) {
    assert.equal(exampleId, this.record.exampleId);
    this.writeCount += 1;
    this.lastUpdate = structuredClone(update);
    this.record = { ...this.record, ...structuredClone(update) };
    return structuredClone(this.record);
  }

  async updateAndCommit(exampleId, update) {
    return this.addAudio(exampleId, update);
  }
}

test('an existing canonical recording is signed without regenerating it', async () => {
  const record = {
    exampleId: 'existing',
    text: 'Una frase.',
    audioVariants: {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Nacho',
      },
    },
  };
  const model = new FakeExamples(record);
  let generationCount = 0;

  const result = await ensureAudioVariant(record, VOICE_CONVERSATION, {
    model,
    getAudioUrlFn: async (key) => `signed:${key}`,
    generateSpeechFn: async () => {
      generationCount += 1;
      throw new Error('must not generate');
    },
  });

  assert.equal(generationCount, 0);
  assert.equal(model.writeCount, 0);
  assert.deepEqual(result.playback, {
    voiceType: VOICE_CONVERSATION,
    url: 'signed:conversation.mp3',
    voiceName: 'Nacho',
  });
});

test('conversation generation writes only the canonical variants map', async () => {
  const record = {
    exampleId: 'new-conversation',
    text: 'Una frase nueva.',
    audioVariants: {},
  };
  const model = new FakeExamples(record);

  const result = await ensureAudioVariant(record, VOICE_CONVERSATION, {
    model,
    selectVoiceFn: () => ({
      serviceId: 'conversation-voice',
      name: 'Nacho',
      voiceType: VOICE_CONVERSATION,
    }),
    generateSpeechFn: async () => ({
      key: 'new-conversation.mp3',
      url: 'signed:new-conversation.mp3',
      expires: Date.now() + 60_000,
    }),
    getAudioUrlFn: async (key) => `signed:${key}`,
    setAudioUrlFn: () => {},
  });

  assert.deepEqual(Object.keys(model.lastUpdate), ['audioVariants']);
  assert.deepEqual(model.record.audioVariants, {
    [VOICE_CONVERSATION]: {
      key: 'new-conversation.mp3',
      voiceName: 'Nacho',
      voiceId: 'conversation-voice',
      speed: 1,
      source: 'tts',
    },
  });
  assert.deepEqual(result.playback, {
    voiceType: VOICE_CONVERSATION,
    url: 'signed:new-conversation.mp3',
    voiceName: 'Nacho',
  });
});

test('concurrent requests generate and persist one education variant', async () => {
  const record = {
    exampleId: 'concurrent',
    text: 'Otra frase.',
    audioVariants: {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Malena',
      },
      [VOICE_EDUCATION]: {
        key: 'education-old.mp3',
        voiceName: 'Zeta',
        voiceId: EDUCATION_VOICE_ID,
        speed: 0.85,
      },
    },
  };
  const model = new FakeExamples(record);
  let generationCount = 0;
  let releaseGeneration;
  const gate = new Promise((resolve) => { releaseGeneration = resolve; });
  const dependencies = {
    model,
    selectVoiceFn: () => ({
      serviceId: EDUCATION_VOICE_ID,
      name: 'Zeta',
      voiceType: VOICE_EDUCATION,
      speed: 0.7,
    }),
    generateSpeechFn: async () => {
      generationCount += 1;
      await gate;
      return {
        key: 'education.mp3',
        url: 'signed:education.mp3',
        expires: Date.now() + 60_000,
      };
    },
    getAudioUrlFn: async (key) => `signed:${key}`,
    setAudioUrlFn: () => {},
  };

  const first = ensureAudioVariant(record, VOICE_EDUCATION, dependencies);
  const second = ensureAudioVariant(record, VOICE_EDUCATION, dependencies);
  releaseGeneration();
  const [firstResult, secondResult] = await Promise.all([first, second]);

  assert.equal(generationCount, 1);
  assert.equal(model.writeCount, 1);
  assert.deepEqual(firstResult.playback, secondResult.playback);
  assert.deepEqual(model.record.audioVariants, {
    [VOICE_CONVERSATION]: {
      key: 'conversation.mp3',
      voiceName: 'Malena',
    },
    [VOICE_EDUCATION]: {
      key: 'education.mp3',
      voiceName: 'Zeta',
      voiceId: EDUCATION_VOICE_ID,
      speed: 0.7,
      source: 'tts',
    },
  });
});

test('stale Zeta audio is regenerated once at ElevenLabs speed 0.70', async () => {
  const record = {
    exampleId: 'stale-education',
    text: 'Más despacio, por favor.',
    audioVariants: {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Malena',
      },
      [VOICE_EDUCATION]: {
        key: 'education-old.mp3',
        voiceName: 'Zeta',
        voiceId: EDUCATION_VOICE_ID,
        speed: 0.85,
        source: 'tts',
      },
    },
  };
  const model = new FakeExamples(record);
  let generationCount = 0;
  let receivedVoice = null;
  const dependencies = {
    model,
    selectVoiceFn: () => ({
      serviceId: EDUCATION_VOICE_ID,
      name: 'Zeta',
      voiceType: VOICE_EDUCATION,
      speed: 0.95,
    }),
    generateSpeechFn: async (_text, voice) => {
      generationCount += 1;
      receivedVoice = voice;
      return {
        key: 'education-slow.mp3',
        url: 'signed:education-slow.mp3',
        expires: Date.now() + 60_000,
      };
    },
    getAudioUrlFn: async (key) => `signed:${key}`,
    setAudioUrlFn: () => {},
  };

  const first = await ensureAudioVariant(record, VOICE_EDUCATION, dependencies);
  const second = await ensureAudioVariant(model.record, VOICE_EDUCATION, dependencies);

  assert.equal(generationCount, 1);
  assert.equal(voiceSpeedForVoice(receivedVoice, VOICE_EDUCATION), 0.7);
  assert.equal(first.playback.url, 'signed:education-slow.mp3');
  assert.equal(second.playback.url, 'signed:education-slow.mp3');
  assert.deepEqual(model.record.audioVariants[VOICE_EDUCATION], {
    key: 'education-slow.mp3',
    voiceName: 'Zeta',
    voiceId: EDUCATION_VOICE_ID,
    speed: 0.7,
    source: 'tts',
  });
});

test('manual education uploads are never replaced by TTS', async () => {
  const record = {
    exampleId: 'manual-education',
    text: 'Grabación manual.',
    audioVariants: {
      [VOICE_EDUCATION]: {
        key: 'manual.mp3',
        voiceName: 'Teacher',
        source: 'upload',
      },
    },
  };
  const model = new FakeExamples(record);

  const result = await ensureAudioVariant(record, VOICE_EDUCATION, {
    model,
    selectVoiceFn: () => { throw new Error('must not select TTS'); },
    generateSpeechFn: async () => { throw new Error('must not generate TTS'); },
    getAudioUrlFn: async (key) => `signed:${key}`,
  });

  assert.equal(model.writeCount, 0);
  assert.equal(result.playback.url, 'signed:manual.mp3');
});

test('stale Zeta audio is not served when generation is disabled', async () => {
  const record = {
    exampleId: 'stale-no-generation',
    text: 'Audio viejo.',
    audioVariants: {
      [VOICE_EDUCATION]: {
        key: 'education-old.mp3',
        voiceName: 'Zeta',
        voiceId: EDUCATION_VOICE_ID,
        speed: 0.85,
      },
    },
  };
  const model = new FakeExamples(record);
  let signed = false;

  const result = await ensureAudioVariant(record, VOICE_EDUCATION, {
    force: false,
    model,
    getAudioUrlFn: async () => {
      signed = true;
      return 'must-not-be-used';
    },
  });

  assert.equal(result.playback, null);
  assert.equal(signed, false);
  assert.equal(model.writeCount, 0);
});

test('a manual education upload arriving during generation wins', async () => {
  const record = {
    exampleId: 'concurrent-upload',
    text: 'Grabación concurrente.',
    audioVariants: {},
  };
  const model = new FakeExamples(record);
  let finishGeneration;
  let generationStarted;
  const started = new Promise(resolve => { generationStarted = resolve; });
  const generation = ensureAudioVariant(record, VOICE_EDUCATION, {
    model,
    selectVoiceFn: () => ({
      serviceId: EDUCATION_VOICE_ID,
      name: 'Zeta',
      voiceType: VOICE_EDUCATION,
    }),
    generateSpeechFn: async () => {
      generationStarted();
      await new Promise(resolve => { finishGeneration = resolve; });
      return {
        key: 'generated.mp3',
        url: 'signed:generated.mp3',
        expires: Date.now() + 60_000,
      };
    },
    getAudioUrlFn: async (key) => `signed:${key}`,
    setAudioUrlFn: () => {},
  });

  await started;
  model.record.audioVariants[VOICE_EDUCATION] = {
    key: 'manual-new.mp3',
    voiceName: 'Teacher',
    source: 'upload',
  };
  finishGeneration();

  const result = await generation;

  assert.equal(model.writeCount, 0);
  assert.equal(result.playback.url, 'signed:manual-new.mp3');
  assert.equal(model.record.audioVariants[VOICE_EDUCATION].source, 'upload');
});

test('education failure falls back to an existing conversation recording', async () => {
  const record = {
    exampleId: 'fallback',
    text: 'Una frase más.',
    audioVariants: {
      [VOICE_CONVERSATION]: {
        key: 'conversation.mp3',
        voiceName: 'Agustin',
      },
    },
  };
  const model = new FakeExamples(record);

  const result = await resolveAudioVariant(record, VOICE_EDUCATION, {
    model,
    selectVoiceFn: () => { throw new Error('ElevenLabs unavailable'); },
    getAudioUrlFn: async (key) => `signed:${key}`,
  });

  assert.equal(result.playback.voiceType, VOICE_CONVERSATION);
  assert.equal(result.playback.requestedVoiceType, VOICE_EDUCATION);
  assert.equal(result.playback.fallback, true);
  assert.equal(result.playback.url, 'signed:conversation.mp3');
  assert.equal(result.warning.code, 'AUDIO_VARIANT_FALLBACK');
  assert.equal(model.writeCount, 0);

  assert.deepEqual(audioResponse(result), {
    playback: result.playback,
    warning: 'The clear recording is unavailable, so the conversational recording is being used.',
    warningCode: 'AUDIO_VARIANT_FALLBACK',
  });
});

test('unsupported voice types are rejected before generation', async () => {
  const record = { exampleId: 'invalid', text: 'Texto.', audioVariants: {} };
  const model = new FakeExamples(record);

  await assert.rejects(
    ensureAudioVariant(record, 'arbitrary-provider-voice', { model }),
    /Unsupported voice type/,
  );
  assert.equal(model.writeCount, 0);
});
