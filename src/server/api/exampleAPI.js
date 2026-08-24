// src/server/api/exampleAPI.js
import { Examples } from '../models/index.js';
import { uploadExampleAudioFromHTTPForm } from './lib/uploadExampleAudioFromHttpForm.js';
import { getAudioUrl, setAudioUrl } from '../lib/aws/s3audioBucket.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../shared/constants/errorTypes.js';
import {
  VOICE_CONVERSATION,
  isVoiceType
} from '../../shared/constants/voiceTypes.js';
import { getAudioVariants } from './lib/audioVariantUtils.js';

function assertCanEditExamples(user) {
  if (user?.role !== 'admin') {
    throw new ForbiddenError('Admin role required');
  }
}

async function prepareExampleForAdmin(example) {
  const variants = getAudioVariants(example);
  const audioVariants = {};

  await Promise.all(Object.entries(variants).map(async ([voiceType, variant]) => {
    const { key, ...metadata } = variant;
    audioVariants[voiceType] = {
      ...metadata,
      url: await getAudioUrl(key)
    };
  }));

  const {
    audioVariants: _storedAudioVariants,
    ...safeExample
  } = example;

  return { ...safeExample, audioVariants };
}

export async function getExamplesForIdiom(routeContext) {
  assertCanEditExamples(routeContext.user);
  const { params } = routeContext;  
  const _examples = new Examples();
  const examples = await Promise.all(
    _examples.forIdiom(params.idiomId).map(prepareExampleForAdmin)
  );
  return { examples };
} 

export async function getExampleById(routeContext) {
    assertCanEditExamples(routeContext.user);
    const { params: { exampleId } } = routeContext;
    const x = new Examples();
    const example = x.byId(exampleId);
    if (!example) throw new NotFoundError('Example not found');
    return prepareExampleForAdmin(example);
}

function _extractNameFromUrl(url) {
  if( !url ) {
    return null;
  }
  const tts = decodeURIComponent(url.toString().split('/').pop());
  return tts.replace('tts/','');
}

export async function updateExample(routeContext) {
    const { params: { exampleId }, payload = {}, user } = routeContext;

    assertCanEditExamples(user);

    const _examples = new Examples();
    const example   = _examples.byId(exampleId);
    if (!example) {
      throw new NotFoundError('Example not found');
    }

    const voiceType = payload.voiceType || VOICE_CONVERSATION;
    if (!isVoiceType(voiceType)) {
      throw new ValidationError(`Invalid voice type: ${voiceType}`);
    }

    const initialAudioVariants = getAudioVariants(example);
    const initialVariant = initialAudioVariants[voiceType];
    const fileName = _extractNameFromUrl(initialVariant?.key) ||
      generateExampleAudioFilename(example, voiceType);

    const { key, url, expires } = await uploadExampleAudioFromHTTPForm( payload, fileName );
    const update = {};

    if (Object.prototype.hasOwnProperty.call(payload, 'text')) {
      update.text = payload.text;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'conjugatedSnippet')) {
      update.conjugatedSnippet = payload.conjugatedSnippet;
    }

    if( key ) {
      setAudioUrl( key, url, expires );
    }

    // Another request may have written a variant while the upload was in
    // flight. Re-read before replacing the nested map.
    const latestExample = _examples.byId(exampleId);
    const audioVariants = getAudioVariants(latestExample);
    const currentVariant = audioVariants[voiceType];
    const variantKey = key || currentVariant?.key;
    if (variantKey) {
      const requestedVoiceName = payload.voiceName;
      const nextVariant = key
        ? {
            key: variantKey,
            ...(requestedVoiceName ? { voiceName: requestedVoiceName } : {}),
            source: 'upload'
          }
        : {
            ...currentVariant,
            key: variantKey,
            ...(requestedVoiceName ? { voiceName: requestedVoiceName } : {})
          };

      update.audioVariants = {
        ...audioVariants,
        [voiceType]: nextVariant
      };
    }

    const updatedExample = await _examples.updateAndCommit(exampleId, update);
    return prepareExampleForAdmin(updatedExample);
}

/**
 * Generates a unique, S3-safe audio filename for an example record
 * @param {object} example - The example record (should have id and text fields)
 * @returns {string} - The generated filename (e.g. example_abc123_hello_world_1720377600000.mp3)
 */
export function generateExampleAudioFilename(example, voiceType = VOICE_CONVERSATION) {
  const base = example.exampleId;
  const text = example.text.toString().substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = Date.now();
  return `${text}_${base}_${voiceType}_${timestamp}.mp3`;
}
