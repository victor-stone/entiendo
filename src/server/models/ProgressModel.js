// src/server/models/ProgressModel.js
import BaseModel from "./BaseModel.js";

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
    const spec = { ...item, createdAt: Date.now() };
    if (spec.hasOwnProperty("usage")) {
      spec.usage = Number(spec.usage);
    }
    const record = super.create(spec);
    notifyUpdates();
    return record;
  }

  async update(id, updates) {
    if (updates.hasOwnProperty("usage")) {
      updates.usage = Number(updates.usage);
    }
    const record = super.update(id, updates);
    notifyUpdates();
    return record;
  }

  async findByUser(userId) {
    const filterExpression = {
      expression: "userId = :userId",
      values: {
        ":userId": { S: userId },
      },
    };

    return this.findAll(filterExpression);
  }
}

// TODO make this events
const onUpdate = [];
function notifyUpdates() {
  onUpdate.forEach(u => u());
}
ProgressModel.onUpdate = (callback) => onUpdate.push(callback);
