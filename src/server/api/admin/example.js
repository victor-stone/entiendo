import { ForbiddenError, ValidationError } from '../../../shared/constants/errorTypes.js';
import { ExampleModel } from '../../models/index.js';
import { uploadAudioToS3 } from '../../lib/audio.js';

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
  
  const model = new ExampleModel();
  
  // Create the idiom example
  const createdExample = await model.create(exampleData);
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
  
  const exampleModel = new ExampleModel();
  
  // Check if example exists
  const example = await exampleModel.getById(payload.exampleId);
  if (!example) {
    throw new ValidationError('Example not found');
  }
  
  try {
    // Generate a unique filename based on timestamp and example ID
    const timestamp = Date.now();
    const filename = `example_${example.exampleId}_${timestamp}.mp3`;
    
    // Get the file content
    const audioContent = payload.files.file.data;
    const contentType = payload.files.file.mimetype || 'audio/mpeg';
    
    // Upload the audio file to S3
    const audioResult = await uploadAudioToS3(audioContent, filename, contentType);
    
    // Update the example with audio information
    const updatedExample = await exampleModel.update(example.exampleId, {
      audio: audioResult
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