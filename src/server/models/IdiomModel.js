// src/server/models/IdiomModel.js
import BaseModel from './BaseModel.js';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import criteriaToFilterExpression from '../lib/criteriaToFilter.js';

/**
 * Model for Idiom-related database operations
 */
export default class IdiomModel extends BaseModel {
  constructor() {
    // Pass the table name to the parent constructor
    super('Idioms');
  }

  async create(item) {
    var usage = Number(item.usage);
    // TODO: call OpenAI if tone and usage are not filled 
    return super.create({...item, usage, createdAt: Date.now()});
  }

  async update(id, updates) {
    if (updates.hasOwnProperty('usage')) {
      updates.usage = Number(updates.usage);
    }
    return super.update(id,updates);
  }

  /**
   * Find an idiom by its exact text
   * @param {String} text - Exact idiom text to search for
   * @returns {Promise<Object|null>} - The idiom if found, null otherwise
   */
  async findByText(text) {
    const filterExpression = {
      expression: '#textAttr = :text',
      values: {
        ':text': { S: text }
      },
      names: {
        '#textAttr': 'text'
      }
    };
    
    const results = await this.findAll(filterExpression);
    return results.length > 0 ? results[0] : null;
  }

  async findIdsByCriteria(criteria) {
    const filterExpression = criteriaToFilterExpression(criteria);
    return this.findAllIds(filterExpression);
  }

  /**
   * Search idioms by text content
   * @param {String} searchText - Text to search for
   * @returns {Promise<Array>} - Matching idioms
   */
  async search(searchText) {
    const filterExpression = {
      expression: 'contains(text, :searchText) OR contains(translation, :searchText)',
      values: {
        ':searchText': { S: searchText.toLowerCase() }
      }
    };
    
    return this.findAll(filterExpression);
  }

  /**
   * Get all unique tones from idioms
   * @returns {Promise<Array>} - Array of unique tone names
   */
  async getTones() {
    return this.getDistinctValues('tone');
  }

  /**
   * Get a list of all idioms with just their ID and text
   * @returns {Promise<Array>} - Array of idioms with id and text fields
   */
  async getIdiomsList() {
    const params = {
      TableName: this.tableName,
      ProjectionExpression: 'idiomId, #text',
      ExpressionAttributeNames: {
        '#text': 'text'
      }
    };
    
    const result = await this.client.send(new ScanCommand(params));
    
    return result.Items.map(item => ({
      idiomId: item.idiomId.S,
      text: item.text.S
    }));
  }
}