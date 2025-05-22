// src/server/models/UserModel.js
import { useReducer } from 'react';
import BaseModel from './BaseModel.js';

/**
 * Model for User-related database operations
 */
export default class UserModel extends BaseModel {
  constructor() {
    // Pass the table name to the parent constructor
    super('EntendoUsers', 'userId');
  }

  /**
   * Find user by Auth0 ID
   * @param {String} userId - Auth0 user ID (sub claim)
   * @returns {Promise<Object>} - User data
   */
  async findByAuthId(userId) {
    return this.getById(userId, 'userId');
  }

  async updatePreferences(userId, preferences) {
    return this.update(userId, { preferences })
  }
}