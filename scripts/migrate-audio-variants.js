#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

const DEFAULT_LOCAL_FILE = 'data/examples.json';
const DEFAULT_S3_KEY = 'entiendo/data/examples.json';
const DEFAULT_VOICES_FILE = 'data/voices.json';
const DEFAULT_VOICES_S3_KEY = 'entiendo/data/voices.json';
const DEFAULT_USERS_FILE = 'data/users.json';
const DEFAULT_USERS_S3_KEY = 'entiendo/data/users.json';
const DEFAULT_BUCKET = 'entiendo-data';
const DEFAULT_REGION = 'sa-east-1';
const CONVERSATION = 'conversation';
const EDUCATION = 'education';
const EDUCATION_VOICE_ID = '8Nz6hV5TPv151P6ZNEBV';
const VOICE_TYPES = new Set([CONVERSATION, EDUCATION]);
const DEFAULT_EDUCATION_VOICE = Object.freeze({
  service: 'elevenlabs',
  serviceId: EDUCATION_VOICE_ID,
  regiion: 'RP',
  name: 'Zeta',
  voiceType: EDUCATION,
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOwn(record, field) {
  return Object.prototype.hasOwnProperty.call(record, field);
}

const VALUE_OPTIONS = new Set([
  '--source',
  '--file',
  '--key',
  '--bucket',
  '--region',
]);
const BOOLEAN_OPTIONS = new Set(['--apply', '--voices', '--users', '--help']);

export function validateArgs(args) {
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const option = argument.split('=', 1)[0];

    if (BOOLEAN_OPTIONS.has(argument)) continue;
    if (!VALUE_OPTIONS.has(option)) {
      throw new TypeError(`Unknown option: ${argument}`);
    }

    if (argument.includes('=')) {
      if (!argument.slice(argument.indexOf('=') + 1)) {
        throw new TypeError(`Missing value for ${option}`);
      }
      continue;
    }

    if (!args[index + 1] || args[index + 1].startsWith('--')) {
      throw new TypeError(`Missing value for ${option}`);
    }
    index += 1;
  }

  if (args.includes('--voices') && args.includes('--users')) {
    throw new TypeError('--voices and --users cannot be combined');
  }
}

export function migrateExample(record) {
  if (!isPlainObject(record)) {
    throw new TypeError('Every example must be an object');
  }

  if (record.audioVariants !== undefined && !isPlainObject(record.audioVariants)) {
    throw new TypeError('audioVariants must be an object');
  }

  const audioVariants = {};
  for (const [voiceType, variant] of Object.entries(record.audioVariants || {})) {
    if (!VOICE_TYPES.has(voiceType)) {
      throw new TypeError(`Unsupported audio variant: ${voiceType}`);
    }
    if (!isPlainObject(variant) || typeof variant.key !== 'string' || !variant.key) {
      throw new TypeError(`audioVariants.${voiceType} must be an object with a key`);
    }

    const {
      url: _signedUrl,
      expires: _signedUrlExpiry,
      ...storedVariant
    } = variant;
    audioVariants[voiceType] = storedVariant;
  }

  const hasLegacyAudio = hasOwn(record, 'audio');
  const hasLegacyVoice = hasOwn(record, 'voice');
  const hasLegacyUrl = hasOwn(record, 'url');
  const hasLegacyPlayback = hasOwn(record, 'playback');
  const legacyAudioKey = typeof record.audio === 'string'
    ? record.audio
    : isPlainObject(record.audio) ? record.audio.key : null;

  const currentConversation = audioVariants[CONVERSATION];
  if (
    hasLegacyVoice
    && record.voice
    && currentConversation?.voiceName
    && currentConversation.voiceName !== record.voice
  ) {
    throw new TypeError('Legacy voice conflicts with audioVariants.conversation.voiceName');
  }

  if (hasLegacyAudio) {
    if (typeof legacyAudioKey !== 'string' || !legacyAudioKey) {
      throw new TypeError('Legacy audio must be a string or an object with a key');
    }

    if (currentConversation && currentConversation.key !== legacyAudioKey) {
      throw new TypeError('Legacy audio conflicts with audioVariants.conversation.key');
    }

    audioVariants[CONVERSATION] = {
      key: legacyAudioKey,
      ...(record.voice ? { voiceName: record.voice } : {}),
      ...(currentConversation || {})
    };
  }

  const {
    audio: _legacyAudio,
    voice: _legacyVoice,
    url: _legacyUrl,
    playback: _legacyPlayback,
    audioVariants: _previousVariants,
    ...example
  } = record;
  const migratedRecord = {
    ...example,
    audioVariants
  };
  const changed = JSON.stringify(migratedRecord) !== JSON.stringify(record);

  return {
    record: migratedRecord,
    changed,
    hasLegacyFields: hasLegacyAudio || hasLegacyVoice || hasLegacyUrl || hasLegacyPlayback
  };
}

export function migrateExamples(records) {
  if (!Array.isArray(records)) {
    throw new TypeError('Expected audio records JSON to contain an array');
  }

  const stats = {
    total: records.length,
    withLegacyFields: 0,
    changed: 0,
    alreadyMigrated: 0,
    invalid: 0
  };
  const errors = [];
  const migrated = records.map((record, index) => {
    try {
      const result = migrateExample(record);
      if (result.hasLegacyFields) {
        stats.withLegacyFields += 1;
      }
      if (result.changed) stats.changed += 1;
      else stats.alreadyMigrated += 1;
      return result.record;
    } catch (error) {
      stats.invalid += 1;
      errors.push({
        index,
        recordId: record?.exampleId || record?.shovelId || null,
        message: error.message
      });
      return record;
    }
  });

  return { records: migrated, stats, errors };
}

export function migrateVoice(record) {
  if (!isPlainObject(record)) {
    throw new TypeError('Every voice must be an object');
  }
  if (typeof record.serviceId !== 'string' || !record.serviceId) {
    throw new TypeError('Every voice must have a serviceId');
  }

  const expectedType = record.serviceId === EDUCATION_VOICE_ID
    ? EDUCATION
    : CONVERSATION;
  if (record.voiceType !== undefined && !VOICE_TYPES.has(record.voiceType)) {
    throw new TypeError(`Invalid voiceType for ${record.name || record.serviceId}`);
  }
  if (record.serviceId === EDUCATION_VOICE_ID && record.voiceType !== undefined
    && record.voiceType !== EDUCATION) {
    throw new TypeError('Zeta must use the education voiceType');
  }
  if (record.serviceId !== EDUCATION_VOICE_ID && record.voiceType === EDUCATION) {
    throw new TypeError('Only Zeta may use the education voiceType');
  }

  const migratedRecord = record.voiceType
    ? { ...record }
    : { ...record, voiceType: expectedType };
  return {
    record: migratedRecord,
    changed: JSON.stringify(migratedRecord) !== JSON.stringify(record),
  };
}

export function migrateVoices(records) {
  if (!Array.isArray(records)) {
    throw new TypeError('Expected voices JSON to contain an array');
  }

  const stats = {
    total: records.length,
    changed: 0,
    added: 0,
    alreadyMigrated: 0,
    invalid: 0,
  };
  const errors = [];
  const migrated = records.map((record, index) => {
    try {
      const result = migrateVoice(record);
      if (result.changed) stats.changed += 1;
      else stats.alreadyMigrated += 1;
      return result.record;
    } catch (error) {
      stats.invalid += 1;
      errors.push({
        index,
        serviceId: record?.serviceId || null,
        message: error.message,
      });
      return record;
    }
  });

  const zetaIndexes = records.reduce((indexes, record, index) => {
    if (record?.serviceId === EDUCATION_VOICE_ID) indexes.push(index);
    return indexes;
  }, []);

  if (zetaIndexes.length === 0) {
    migrated.push({ ...DEFAULT_EDUCATION_VOICE });
    stats.added = 1;
  } else if (zetaIndexes.length > 1) {
    for (const index of zetaIndexes.slice(1)) {
      stats.invalid += 1;
      errors.push({
        index,
        serviceId: EDUCATION_VOICE_ID,
        message: 'Duplicate Zeta voice record',
      });
    }
  }

  return { records: migrated, stats, errors };
}

export function migrateUser(record) {
  if (!isPlainObject(record)) {
    throw new TypeError('Every user must be an object');
  }

  const { editor: _assignmentEditor, ...user } = record;
  if (user.role === 'editor') user.role = 'user';

  return {
    record: user,
    changed: JSON.stringify(user) !== JSON.stringify(record),
  };
}

export function migrateUsers(records) {
  if (!Array.isArray(records)) {
    throw new TypeError('Expected users JSON to contain an array');
  }

  const stats = {
    total: records.length,
    changed: 0,
    alreadyMigrated: 0,
    invalid: 0,
  };
  const errors = [];
  const migrated = records.map((record, index) => {
    try {
      const result = migrateUser(record);
      if (result.changed) stats.changed += 1;
      else stats.alreadyMigrated += 1;
      return result.record;
    } catch (error) {
      stats.invalid += 1;
      errors.push({
        index,
        userId: record?.userId || null,
        message: error.message,
      });
      return record;
    }
  });

  return { records: migrated, stats, errors };
}

export function migrationChangeCount(stats) {
  return stats.changed + (stats.added || 0);
}

function optionValue(args, name, fallback) {
  const prefix = `${name}=`;
  const inline = args.find(argument => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1] && !args[index + 1].startsWith('--')) {
    return args[index + 1];
  }

  return fallback;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function backupName(fileName, migrationName) {
  const extension = path.extname(fileName) || '.json';
  const base = path.basename(fileName, extension);
  return `${base}.before-${migrationName}.${timestamp()}${extension}`;
}

async function streamToString(body) {
  if (typeof body?.transformToString === 'function') {
    return body.transformToString('utf-8');
  }

  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf-8');
}

export function isMissingS3ObjectError(error) {
  return error?.name === 'NoSuchKey'
    || error?.Code === 'NoSuchKey'
    || error?.code === 'NoSuchKey';
}

export async function readSource(config, dependencies = {}) {
  const readFile = dependencies.readFile || fs.readFile;

  if (config.source === 'local') {
    const filePath = path.resolve(process.cwd(), config.file);
    return {
      raw: await readFile(filePath, 'utf8'),
      description: filePath,
      filePath
    };
  }

  const client = dependencies.s3Client || new S3Client({ region: config.region });
  const description = `s3://${config.bucket}/${config.key}`;

  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: config.bucket,
      Key: config.key
    }));
    return {
      raw: await streamToString(response.Body),
      description,
      client,
      s3ObjectExists: true
    };
  } catch (error) {
    if (!isMissingS3ObjectError(error)) throw error;

    const seedFilePath = path.resolve(process.cwd(), config.file);
    let raw;
    try {
      raw = await readFile(seedFilePath, 'utf8');
    } catch (seedError) {
      throw new Error(
        `${description} does not exist and seed file ${seedFilePath} could not be read: ${seedError.message}`,
        { cause: seedError },
      );
    }

    return {
      raw,
      description,
      client,
      s3ObjectExists: false,
      seedFilePath
    };
  }
}

async function applyLocal(source, serialized, migrationName) {
  const directory = path.dirname(source.filePath);
  const backupDirectory = path.join(directory, 'backups');
  const backupPath = path.join(
    backupDirectory,
    backupName(source.filePath, migrationName),
  );
  const temporaryPath = `${source.filePath}.schema-migration.tmp`;

  await fs.mkdir(backupDirectory, { recursive: true });
  await fs.writeFile(backupPath, source.raw, { encoding: 'utf8', flag: 'wx' });
  await fs.writeFile(temporaryPath, serialized, 'utf8');
  await fs.rename(temporaryPath, source.filePath);

  return backupPath;
}

export async function applyS3(config, source, serialized) {
  if (!source.s3ObjectExists) {
    await source.client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: config.key,
      Body: serialized,
      ContentType: 'application/json',
      IfNoneMatch: '*'
    }));

    return { backup: null, created: true };
  }

  const keyDirectory = path.posix.dirname(config.key);
  const backupKey = path.posix.join(
    keyDirectory,
    'backups',
    backupName(path.posix.basename(config.key), config.migrationName)
  );

  await source.client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: backupKey,
    Body: source.raw,
    ContentType: 'application/json'
  }));
  await source.client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: config.key,
    Body: serialized,
    ContentType: 'application/json'
  }));

  return {
    backup: `s3://${config.bucket}/${backupKey}`,
    created: false
  };
}

function printUsage() {
  console.log(`Usage: node scripts/migrate-audio-variants.js [options]

Dry-run is the default. Audio mode performs a one-way audioVariants cutover.
Use --voices to tag voice configuration or --users to remove dead assignment metadata.

Options:
  --apply                 Write changes after creating a timestamped backup
  --voices                Tag voice records instead of migrating audio records
  --users                 Remove assignment-era user roles and metadata
  --source=local|s3       Data source (default: local); missing S3 objects are seeded from --file
  --file=<path>           Local JSON source or missing-S3 seed (audio: ${DEFAULT_LOCAL_FILE}; voices: ${DEFAULT_VOICES_FILE}; users: ${DEFAULT_USERS_FILE})
  --key=<s3-key>          S3 object key (audio: ${DEFAULT_S3_KEY}; voices: ${DEFAULT_VOICES_S3_KEY}; users: ${DEFAULT_USERS_S3_KEY})
  --bucket=<name>         S3 bucket (default: BUCKET_NAME or ${DEFAULT_BUCKET})
  --region=<name>         AWS region (default: AWS_REGION or ${DEFAULT_REGION})
  --help                  Show this message`);
}

async function main() {
  const args = process.argv.slice(2);
  validateArgs(args);
  if (args.includes('--help')) {
    printUsage();
    return;
  }

  const voicesMigration = args.includes('--voices');
  const usersMigration = args.includes('--users');
  const defaultFile = usersMigration
    ? DEFAULT_USERS_FILE
    : voicesMigration ? DEFAULT_VOICES_FILE : DEFAULT_LOCAL_FILE;
  const defaultKey = usersMigration
    ? DEFAULT_USERS_S3_KEY
    : voicesMigration ? DEFAULT_VOICES_S3_KEY : DEFAULT_S3_KEY;

  const config = {
    apply: args.includes('--apply'),
    source: optionValue(args, '--source', 'local'),
    file: optionValue(
      args,
      '--file',
      defaultFile,
    ),
    key: optionValue(
      args,
      '--key',
      defaultKey,
    ),
    bucket: optionValue(args, '--bucket', process.env.BUCKET_NAME || DEFAULT_BUCKET),
    region: optionValue(args, '--region', process.env.AWS_REGION || DEFAULT_REGION),
    migrationName: usersMigration
      ? 'assignment-users'
      : voicesMigration ? 'voice-types' : 'audio-variants',
    voicesMigration,
    usersMigration,
  };

  if (!['local', 's3'].includes(config.source)) {
    throw new TypeError(`Unsupported source: ${config.source}`);
  }

  const source = await readSource(config);
  const parsed = JSON.parse(source.raw);
  const result = config.usersMigration
    ? migrateUsers(parsed)
    : config.voicesMigration ? migrateVoices(parsed) : migrateExamples(parsed);

  console.log(`${config.apply ? 'APPLY' : 'DRY RUN'}: ${source.description}`);
  if (config.source === 's3' && !source.s3ObjectExists) {
    console.log(`S3 object is missing; seed file: ${source.seedFilePath}`);
  }
  console.log(JSON.stringify(result.stats, null, 2));

  if (result.errors.length > 0) {
    console.error(JSON.stringify(result.errors, null, 2));
    throw new Error('Migration stopped because invalid records were found');
  }

  if (!config.apply) {
    const action = config.source === 's3' && !source.s3ObjectExists
      ? 'create the S3 object from the validated seed file'
      : 'migrate after creating a backup';
    console.log(`No data was written. Re-run with --apply to ${action}.`);
    return;
  }

  const changedRecords = migrationChangeCount(result.stats);
  if (changedRecords === 0 && source.s3ObjectExists !== false) {
    console.log('No changes are required. No backup or write was performed.');
    return;
  }

  const serialized = `${JSON.stringify(result.records, null, 2)}\n`;
  const outcome = config.source === 'local'
    ? await applyLocal(source, serialized, config.migrationName)
    : await applyS3(config, source, serialized);

  if (config.source === 'local') {
    console.log(`Backup created: ${outcome}`);
    const added = result.stats.added === undefined ? '' : `; added ${result.stats.added}`;
    console.log(`Migrated ${result.stats.changed} records${added}.`);
  } else if (outcome.created) {
    console.log(`Created ${source.description} with ${result.records.length} records.`);
  } else {
    console.log(`Backup created: ${outcome.backup}`);
    const added = result.stats.added === undefined ? '' : `; added ${result.stats.added}`;
    console.log(`Migrated ${result.stats.changed} records${added}.`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
