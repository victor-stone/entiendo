// src/server/models/ExampleModel.js
import BaseModel from './BaseModel.js';

// TODO make this events
const onUpdate = [];
function notifyUpdates() {
  onUpdate.forEach(u => u());
}

/**
 * Model for storing and retrieving example sentences for idioms
 * 
 * {
    "exampleId"        : "97353048-3d1d-49f0-92ce-ac99ce8967b0",
    "createdAt"        : 1747079328336,
    "conjugatedSnippet": "armó un quilombo",  // MIGHT BE NULL
    "idiomId"          : "ebfef004-a6d8-45ad-bc63-f6f6a48ca3e7", // MIGHT BE NULL
    "source"           : "openai",
    "text"             : "Mi primo armó un quilombo bárbaro en la fiesta anoche.",
    "audio" : {
      publicUrl: 'http://....',
      url: 'http://....',
      expires: 1747078883354
    }
 */
export default class ExampleModel extends BaseModel {
  constructor() {
    super('IdiomExamples', 'exampleId');
  }

  /**
   * Find examples for a specific idiom
   * @param {String} idiomId - Idiom ID
   * @returns {Promise<Array>} - Array of examples for the idiom
   */
  async findByIdiomId(idiomId) {
    const filterExpression = {
      expression: 'idiomId = :idiomId',
      values: {
        ':idiomId': { S: idiomId }
      }
    };

    return this.findAll(filterExpression);
  }

  /**
   * Create a new example for an idiom
   * @param {String} idiomId - Idiom ID
   * @param {String} text - Example sentence text
   * @param {String} conjugatedSnippet - Conjugated snippet of the idiom in the text
   * @param {String} source - Source of the example (e.g., 'openai', 'manual', 'user')
   * @returns {Promise<Object>} - Created example
   */
  async createExample(idiomId, text, conjugatedSnippet, source = 'openai', audio = null) {
    const createdAt = Date.now();
    
    const record = this.create({
      idiomId,
      text,
      conjugatedSnippet,
      source,
      createdAt,
      audio
    });
    notifyUpdates();
    return record;
  }

  async createSandboxExample( text, basedOn, source = 'openai', audio = null) {
    const createdAt = Date.now();

    const record = this.create({
      idiomId: null,
      basedOn,
      text,
      source,
      createdAt,
      audio
    });
    notifyUpdates();
    return record;
    
  }

  async addAudio(exampleId, audio) {
    return this.update(exampleId, { audio });
  }
}

ExampleModel.onUpdate = (callback) => onUpdate.push(callback);