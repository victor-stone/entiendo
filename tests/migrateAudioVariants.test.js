import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  applyS3,
  isMissingS3ObjectError,
  migrationChangeCount,
  migrateExample,
  migrateExamples,
  migrateVoice,
  migrateVoices,
  migrateUser,
  migrateUsers,
  readSource,
  validateArgs,
} from '../scripts/migrate-audio-variants.js';

test('migration moves legacy audio into conversation and deletes aliases', () => {
  const original = {
    exampleId: 'one',
    audio: 'legacy.mp3',
    voice: 'Nacho',
    audioVariants: {
      education: {
        key: 'clear.mp3',
        voiceName: 'Zeta',
        speed: 0.7,
      },
    },
  };

  const { record, changed } = migrateExample(original);

  assert.equal(changed, true);
  assert.equal('audio' in record, false);
  assert.equal('voice' in record, false);
  assert.deepEqual(record.audioVariants, {
    conversation: {
      key: 'legacy.mp3',
      voiceName: 'Nacho',
    },
    education: original.audioVariants.education,
  });
});

test('migration converts the known legacy admin upload object without persisting its signed URL', () => {
  const { record } = migrateExample({
    exampleId: 'object-audio',
    audio: {
      key: 'uploaded.mp3',
      url: 'signed-url',
      expires: 123,
    },
    voice: 'Pato',
  });

  assert.deepEqual(record.audioVariants, {
    conversation: {
      key: 'uploaded.mp3',
      voiceName: 'Pato',
    },
  });
  assert.equal('audio' in record, false);
});

test('migration is idempotent', () => {
  const first = migrateExamples([
    { exampleId: 'one', audio: 'one.mp3', voice: 'Malena' },
    { exampleId: 'two', text: 'No audio yet' },
  ]);
  const second = migrateExamples(first.records);

  assert.equal(first.stats.changed, 2);
  assert.equal(first.stats.withLegacyFields, 1);
  assert.equal(first.stats.invalid, 0);
  assert.equal(second.stats.changed, 0);
  assert.equal(second.stats.alreadyMigrated, 2);
  assert.deepEqual(second.records, first.records);
});

test('migration rejects ambiguous legacy and canonical audio', () => {
  assert.throws(() => migrateExample({
    exampleId: 'conflict',
    audio: 'legacy.mp3',
    audioVariants: {
      conversation: { key: 'canonical.mp3' },
    },
  }), /conflicts/);
  assert.throws(() => migrateExample({
    exampleId: 'voice-conflict',
    voice: 'Nacho',
    audioVariants: {
      conversation: { key: 'canonical.mp3', voiceName: 'Malena' },
    },
  }), /Legacy voice conflicts/);
});

test('voice migration explicitly tags conversation voices and Zeta', () => {
  const result = migrateVoices([
    { serviceId: 'conversation-id', name: 'Nacho' },
    { serviceId: '8Nz6hV5TPv151P6ZNEBV', name: 'Zeta' },
  ]);

  assert.equal(result.stats.changed, 2);
  assert.deepEqual(result.records.map(({ voiceType }) => voiceType), [
    'conversation',
    'education',
  ]);
  assert.equal(migrateVoices(result.records).stats.changed, 0);
});

test('voice migration adds Zeta when an existing voice dataset does not contain it', () => {
  const result = migrateVoices([
    { service: 'elevenlabs', serviceId: 'conversation-id', name: 'Nacho' },
  ]);

  assert.equal(result.stats.changed, 1);
  assert.equal(result.stats.added, 1);
  assert.deepEqual(result.records, [
    {
      service: 'elevenlabs',
      serviceId: 'conversation-id',
      name: 'Nacho',
      voiceType: 'conversation',
    },
    {
      service: 'elevenlabs',
      serviceId: '8Nz6hV5TPv151P6ZNEBV',
      regiion: 'RP',
      name: 'Zeta',
      voiceType: 'education',
    },
  ]);
  assert.equal(migrateVoices(result.records).stats.changed, 0);
});

test('adding Zeta is reported separately and still requires a write', () => {
  const result = migrateVoices([
    {
      service: 'elevenlabs',
      serviceId: 'conversation-id',
      name: 'Nacho',
      voiceType: 'conversation',
    },
  ]);

  assert.equal(result.stats.total, 1);
  assert.equal(result.stats.changed, 0);
  assert.equal(result.stats.added, 1);
  assert.equal(migrationChangeCount(result.stats), 1);
});

test('voice migration rejects duplicate Zeta records', () => {
  const result = migrateVoices([
    { serviceId: '8Nz6hV5TPv151P6ZNEBV', name: 'Zeta' },
    { serviceId: '8Nz6hV5TPv151P6ZNEBV', name: 'Zeta duplicate' },
  ]);

  assert.equal(result.stats.invalid, 1);
  assert.match(result.errors[0].message, /Duplicate Zeta/);
});

test('voice migration rejects invalid categories and a miscategorized Zeta', () => {
  assert.throws(
    () => migrateVoice({ serviceId: 'voice-id', voiceType: 'teacher' }),
    /Invalid voiceType/,
  );
  assert.throws(
    () => migrateVoice({
      serviceId: '8Nz6hV5TPv151P6ZNEBV',
      name: 'Zeta',
      voiceType: 'conversation',
    }),
    /Zeta must use/,
  );
  assert.throws(
    () => migrateVoice({
      serviceId: 'not-zeta',
      name: 'Other',
      voiceType: 'education',
    }),
    /Only Zeta/,
  );
});

test('assignment user migration preserves the account while removing its role metadata', () => {
  const original = {
    userId: 'editor-user',
    role: 'editor',
    editor: 'pato',
    name: 'Pat',
  };
  const result = migrateUser(original);

  assert.equal(result.changed, true);
  assert.deepEqual(result.record, {
    userId: 'editor-user',
    role: 'user',
    name: 'Pat',
  });
  assert.equal(migrateUsers([result.record]).stats.changed, 0);
});

test('migration CLI rejects unknown, missing, and conflicting options', () => {
  assert.throws(() => validateArgs(['--souce=s3']), /Unknown option/);
  assert.throws(() => validateArgs(['--source']), /Missing value/);
  assert.throws(() => validateArgs(['--voices', '--users']), /cannot be combined/);
  assert.doesNotThrow(() => validateArgs([
    '--source=s3',
    '--key',
    'entiendo/data/examples.json',
    '--apply',
  ]));
});

test('missing S3 objects use the configured local file as their seed', async () => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'entiendo-migration-'));
  const seedFile = path.join(temporaryDirectory, 'voices.json');
  const seed = '[{"serviceId":"voice-id","name":"Voice"}]\n';
  await fs.writeFile(seedFile, seed, 'utf8');

  const missingError = new Error('missing');
  missingError.name = 'NoSuchKey';
  const s3Client = {
    async send() {
      throw missingError;
    },
  };

  try {
    const source = await readSource({
      source: 's3',
      file: seedFile,
      bucket: 'test-bucket',
      key: 'entiendo/data/voices.json',
      region: 'test-region',
    }, { s3Client });

    assert.equal(source.raw, seed);
    assert.equal(source.s3ObjectExists, false);
    assert.equal(source.seedFilePath, seedFile);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true });
  }
});

test('missing S3 object creation does not make a backup and cannot overwrite a raced write', async () => {
  const commands = [];
  const source = {
    raw: '[]\n',
    s3ObjectExists: false,
    client: {
      async send(command) {
        commands.push(command.input);
        return {};
      },
    },
  };
  const config = {
    bucket: 'test-bucket',
    key: 'entiendo/data/voices.json',
    migrationName: 'voice-types',
  };

  const outcome = await applyS3(config, source, '[{"voiceType":"education"}]\n');

  assert.deepEqual(outcome, { backup: null, created: true });
  assert.equal(commands.length, 1);
  assert.deepEqual(commands[0], {
    Bucket: 'test-bucket',
    Key: 'entiendo/data/voices.json',
    Body: '[{"voiceType":"education"}]\n',
    ContentType: 'application/json',
    IfNoneMatch: '*',
  });
});

test('existing S3 object updates retain the backup-before-write behavior', async () => {
  const commands = [];
  const source = {
    raw: '[{"serviceId":"voice-id"}]\n',
    s3ObjectExists: true,
    client: {
      async send(command) {
        commands.push(command.input);
        return {};
      },
    },
  };
  const config = {
    bucket: 'test-bucket',
    key: 'entiendo/data/voices.json',
    migrationName: 'voice-types',
  };

  const outcome = await applyS3(config, source, '[{"voiceType":"conversation"}]\n');

  assert.equal(outcome.created, false);
  assert.match(
    outcome.backup,
    /^s3:\/\/test-bucket\/entiendo\/data\/backups\/voices\.before-voice-types\..+\.json$/,
  );
  assert.equal(commands.length, 2);
  assert.match(
    commands[0].Key,
    /^entiendo\/data\/backups\/voices\.before-voice-types\..+\.json$/,
  );
  assert.equal(commands[0].Body, source.raw);
  assert.equal(commands[1].Key, config.key);
  assert.equal(commands[1].IfNoneMatch, undefined);
});

test('only NoSuchKey is treated as a missing S3 object', () => {
  assert.equal(isMissingS3ObjectError({ name: 'NoSuchKey' }), true);
  assert.equal(isMissingS3ObjectError({ Code: 'NoSuchKey' }), true);
  assert.equal(isMissingS3ObjectError({ code: 'NoSuchKey' }), true);
  assert.equal(isMissingS3ObjectError({ name: 'NoSuchBucket' }), false);
  assert.equal(isMissingS3ObjectError({ name: 'AccessDenied' }), false);
});
