import { parse } from 'csv-parse/sync';
import { ForbiddenError, ValidationError } from '../../../shared/constants/errorTypes.js';
import { IdiomModel, IdiomModelQuery } from '../../models/index.js';

import debug from 'debug';
const debugAdmin = debug('api:admin');

/**
 * Helper function to validate a single idiom
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
 */
export async function _validateIdioms(records) {
  const idioms     = [];
  const errors     = [];
  const duplicates = [];
  const query      = await IdiomModelQuery.create();

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const idiomData = {
        text       : record.text,
        translation: record.translation,
        tone       : record.tone,
        usage      : record.usage,
        tempId     : `temp-${Date.now()}-${i}`
      };
      const validation = _validateIdiom(idiomData);
      if (!validation.valid) {
        errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
      } else {
        const existingIdiom = query.matchText(idiomData.text);
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
 * Import idioms from payload
 */
export async function importIdioms(routeContext) {
  const { payload: { idioms: originalIdioms }, user: { role } } = routeContext;
  debugAdmin('importIdioms idioms: %s', originalIdioms.length);

  if (!role || role !== 'admin') { throw new ForbiddenError('Unauthorized. Admin role required.');}
  if (!originalIdioms || !Array.isArray(originalIdioms)) { throw new ValidationError('No idioms provided or invalid format');}
  
  const idiomModel = new IdiomModel();
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
 * Validate idioms from uploaded CSV file
 */
export async function importValidateCSV(routeContext) {
  const { user: { role }, payload } = routeContext;
  const uploadedFile = payload.files.file;
  if (role !== 'admin') {
    throw new ForbiddenError('Unauthorized. Admin role required.');
  }
  try {
    const csvContent = uploadedFile.data.toString('utf8');
    const idiomModel = new IdiomModel();
    try {
      const records = parse(csvContent, {
        columns         : true,
        skip_empty_lines: true,
        trim            : true
      });
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