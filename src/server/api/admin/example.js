import { ForbiddenError, ValidationError } from '../../../shared/constants/errorTypes.js';
import { Examples } from '../../models/index.js';
import { uploadAudioToS3, setAudioUrl } from '../../lib/aws/s3audioBucket.js';
import {
  VOICE_CONVERSATION,
  isVoiceType,
} from '../../../shared/constants/voiceTypes.js';
import { getAudioVariants } from '../lib/audioVariantUtils.js';

/**
 * Save a new example to the database
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Created idiom example
 */
export async function createExample(routeContext) {
  const { payload: exampleData, user: { role } } = routeContext;
  
  // Check admin role
  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  const examples = new Examples();
  
  // Create the idiom example
  if (
    Object.prototype.hasOwnProperty.call(exampleData, 'audio') ||
    Object.prototype.hasOwnProperty.call(exampleData, 'voice') ||
    Object.prototype.hasOwnProperty.call(exampleData, 'url') ||
    Object.prototype.hasOwnProperty.call(exampleData, 'playback')
  ) {
    throw new ValidationError('Use audioVariants for example audio');
  }

  const audioVariants = getAudioVariants({
    audioVariants: exampleData.audioVariants ?? {},
  });
  const createdExample = examples.create({
    ...exampleData,
    audioVariants,
  });
  return createdExample;
}

/**
 * Upload audio file for an existing example
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Updated example with audio information
 */
export async function uploadExampleAudio(routeContext) {
  const { payload, user: { role } } = routeContext;
  
  // Check admin role
  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  // Check if example ID is provided
  if (!payload.exampleId) {
    throw new ValidationError('Example ID is required');
  }
  
  // Check if audio file is provided
  if (!payload.files || !payload.files.file) {
    throw new ValidationError('Audio file is required');
  }

  const voiceType = payload.voiceType || VOICE_CONVERSATION;
  if (!isVoiceType(voiceType)) {
    throw new ValidationError(`Invalid voice type: ${voiceType}`);
  }
  
  const _examples = new Examples();
  
  // Check if example exists
  const example = _examples.byId(payload.exampleId);
  if (!example) {
    throw new ValidationError('Example not found');
  }
  
  try {
    // Generate a unique filename based on timestamp and example ID
    const timestamp = Date.now();
    const filename = `example_${example.exampleId}_${voiceType}_${timestamp}.mp3`;
    
    // Get the file content
    const audioContent = payload.files.file.data;
    const contentType = payload.files.file.mimetype || 'audio/mpeg';
    
    // Upload the audio file to S3
    const audioResult = await uploadAudioToS3(audioContent, filename, contentType);
    setAudioUrl(audioResult.key, audioResult.url, audioResult.expires);
    
    const latestExample = _examples.byId(example.exampleId);
    const audioVariants = getAudioVariants(latestExample);
    const variant = {
      key: audioResult.key,
      ...(payload.voiceName ? { voiceName: payload.voiceName } : {}),
      source: 'upload',
    };

    // Update only the selected canonical variant.
    const updatedExample = await _examples.updateAndCommit(example.exampleId, {
      audioVariants: {
        ...audioVariants,
        [voiceType]: variant,
      },
    });
    
    return {
      success: true,
      example: updatedExample
    };
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
}
