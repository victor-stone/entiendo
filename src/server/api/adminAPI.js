import { parse } from 'csv-parse/sync';
import { ForbiddenError, ValidationError } from '../../shared/constants/errorTypes.js';
import { IdiomModel, ExampleModel } from '../models/index.js';
import { uploadAudioToS3 } from '../lib/audio.js';
import { reportBug } from '../lib/github.js';

import debug from 'debug';

const debugAdmin = debug('api:admin');

/**
 * Batch create multiple idioms
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Results of batch operation
 */
export async function importIdioms(routeContext) {
  const { payload: { idioms: originalIdioms }, user: { role } } = routeContext;
  
  debugAdmin('importIdioms idioms: %s', originalIdioms.length);

  if (!role || role !== 'admin') { throw new ForbiddenError('Unauthorized. Admin role required.');}
  if (!originalIdioms || !Array.isArray(originalIdioms)) { throw new ValidationError('No idioms provided or invalid format');}
  
  const idiomModel = new IdiomModel();

  /*
  results = {
      idioms,
      errors,
      duplicates
    };  
  */
  const { idioms, errors, duplicates } = await _validateIdioms(originalIdioms, idiomModel);
  
  const promises = [];
  for (const idiom of idioms) {
    promises.push(idiomModel.create(idiom));
  }
  await Promise.all(promises).catch(err => {
    debugAdmin('importIdioms error: %s', err.message);
  });

  debugAdmin('importIdioms created: %s  failed: %s dupes: %s', idioms.length, errors.length, duplicates.length);

  return {
    idioms,
    errors,
    duplicates
  }
}

/**
 * Helper function to validate a single idiom
 * @param {Object} idiom - Idiom to validate
 * @returns {Object} - Validation result
 */
function _validateIdiom(idiom) {
  const errors = [];
  ['text', 'translation', 'tone', 'usage'].forEach(field => {
    if(!idiom[field]) {
      errors.push(field + ' is required');
    }
  });
    
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Helper function to validate multiple idioms and check for duplicates
 * @param {Array} records - Raw records to process
 * @param {IdiomModel} idiomModel - Instance of IdiomModel for database checks
 * @returns {Promise<Object>} - Object containing validated idioms, errors, and duplicates
 */
async function _validateIdioms(records, idiomModel) {
  const idioms = [];
  const errors = [];
  const duplicates = [];

  // Map records to idiom objects
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const idiomData = {
        text       : record.text,
        translation: record.translation,
        tone       : record.tone,
        usage      : record.usage,
        tempId     : `temp-${Date.now()}-${i}`  // Temporary ID for client-side reference
      };
      
      // Validate the idiom
      const validation = _validateIdiom(idiomData);
      if (!validation.valid) {
        errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
      } else {
        const existingIdiom = await idiomModel.findByText(idiomData.text);
        
        if (existingIdiom) {
          debugAdmin('validateIdioms duplicate: %s', idiomData.text);
          duplicates.push({
            ...idiomData,
            existing: existingIdiom
          });
        } else {
          idioms.push(idiomData);
        }
      }
    } catch (err) {
      errors.push(`Error processing row ${i + 2}: ${err.message}`);
    }
  }

  return {
    idioms,
    errors,
    duplicates
  };
}

/**
 * Process an uploaded CSV file and validate idioms without saving them
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Parsed and validated idioms
 */
export async function importValidateCSV(routeContext) {
  const { user: { role }, payload } = routeContext;
  const uploadedFile = payload.files.file;
  
  // Check admin role
  if (role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  try {
    // Read the file content
    const csvContent = uploadedFile.data.toString('utf8');
    const idiomModel = new IdiomModel();
    
    try {
      // Parse the CSV content
      const records = parse(csvContent, {
        columns         : true,
        skip_empty_lines: true,
        trim            : true
      });
      
      // Validate all records
      const validationResults = await _validateIdioms(records, idiomModel);
      
      return {
        ...validationResults,
        totalRecords: validationResults.idioms.length + validationResults.errors.length + validationResults.duplicates.length
      };
    } catch (err) {
      throw new ValidationError(`CSV parsing failed: ${err.message}`);
    }
    
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    console.error('Error processing CSV file:', error);
    throw new Error(`Error processing CSV file: ${error.message}`);
  }
}

/**
 * Create a single idiom
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Created idiom
 */
export async function createIdiom(routeContext) {
  const { payload: idiomData, user: { role } } = routeContext;
  
  // Check admin role
  if (!role || role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  
  const idiomModel = new IdiomModel();
  
  // Check if idiom already exists
  const existingIdiom = await idiomModel.findByText(idiomData.text);
  if (existingIdiom) {
    throw new ValidationError('Idiom with this text already exists');
  }
  
  // Create the idiom
  const createdIdiom = await idiomModel.create(idiomData);
  return createdIdiom;
}

/**
 * Create a single idiom example
 * @param {Object} routeContext - Unified parameter object
 * @returns {Promise<Object>} - Created idiom example
 */
export async function createIdiomExample(routeContext) {
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

export async function reportAppBug(routeContext) {
  const { payload: { title, body, labels }, user: { userId } } = routeContext;
  body += `
  
  userId: ${userId}
  `;
  const result = reportBug({title,body,labels});
  return result;
}