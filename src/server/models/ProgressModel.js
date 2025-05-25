// src/server/models/ProgressModel.js
import BaseModel from "./BaseModel.js";
import criteriaToFilterExpression from "../lib/criteriaToFilter.js";

/**
{
  "progressId": "75507244-50ed-49af-9ba6-8318477b2088",
  "tone"      : "Casual",
  "createdAt" : 1747019365613,
  "difficulty": 2.5,
  "dueDate"   : 1747278565613,
  "usage"     : 9,
  "history"   : [
    {
       "date"      : 1747019365613,
       "exampleId" : "62d21f21-908f-4f60-a7eb-51bad891460c",
       "evaluation": {
          "transcriptionAccuracy": "minor errors",
          "translationAccuracy"  : "minor errors",
          "mistakeType"          : "typo",
          "transcriptionFeedback": "There is a minor gender agreement error with 'la distraído' instead of 'el distraído'.",
          "translationFeedback"  : "The translation is mostly correct, but 'se hizo el distraído' implies pretending to be distracted, not just getting distracted.",
          missedWords            : [ 'se', 'con' ]
      }
    }
  ],
  "idiomId"    : "a4b78aba-c0a5-4079-8c5b-74450087ed12",
  "interval"   : 3,
  "isLeech"    : false,
  "lapseCount" : 0,
  "successRate": 0.8766666666666667,
  "usage"      : 4,
  "userId"     : "google-oauth2|101722812212104773442"
}
 */

/**
 * Model for storing user-specific idiom learning progress
 * Maintains SIRP data globally across all sessions
 */
export default class ProgressModel extends BaseModel {
  constructor() {
    super("UserIdiomProgress", "progressId");
  }

  async create(item) {
    var usage = Number(item.usage);
    return super.create({ ...item, usage, createdAt: Date.now() });
  }

  async update(id, updates) {
    if (updates.hasOwnProperty("usage")) {
      updates.usage = Number(updates.usage);
    }
    return super.update(id, updates);
  }

  /**
   * Find progress data for a specific user-idiom pair
   * @param {String} userId - User ID
   * @param {String} idiomId - Idiom ID
   * @returns {Promise<Object>} - Progress data or null if not found
   */
  async findByUserAndIdiom(userId, idiomId) {
    const filterExpression = {
      expression: "userId = :userId AND idiomId = :idiomId",
      values: {
        ":userId": { S: userId },
        ":idiomId": { S: idiomId },
      },
    };

    const results = await this.findAll(filterExpression);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find all progress data for a user
   * @param {String} userId - User ID
   * @returns {Promise<Array>} - Array of progress data objects
   */
  async findByUser(userId) {
    const filterExpression = {
      expression: "userId = :userId",
      values: {
        ":userId": { S: userId },
      },
    };

    return this.findAll(filterExpression);
  }

  async findDueItems(userId, criteria, pastDue = false) {
    const now = Date.now();
    let filterExpression = criteriaToFilterExpression(criteria, userId);

    if (pastDue) {
      const clause = "dueDate < :now";
      if( filterExpression ) {
        filterExpression.expression += (" AND " + clause);
      } else {
        filterExpression = { expression: clause, values: [] };
      }
      filterExpression.values[":now"] = { N: now.toString() };
    }

    const results = await this.findAll(filterExpression);

    // Sort by dueDate ascending
    return results.sort((a, b) => a.dueDate - b.dueDate);
  }
}
