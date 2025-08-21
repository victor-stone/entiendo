// src/server/models/ExampleModel.js
import BaseModel from "./BaseModel.js";

/**
 * Model for storing and retrieving AI Prompts
 * 
 * {
 *     userId,
*      generated,
*      from, 
*      to,
*      seen,
        "insights": [
            {
              "pattern": "Frequent minor errors: prepositions, articles, and short connector words",
              "description": "Across many idioms, your mistakes tend to be small missing words (like ...'
              "suggestion": "Try speaking or writing out full sentences and consciously slow down..."
            },
            {
              "pattern": ...
              "description": ...
              "suggestion": ...
            },
            ...
          ]
        "strategyTips": [
            "Review your recent mistakes by reading the correct phrases out loud, focusing on every...'
            "Get more Rioplatense audio exposure: watch short clips, listen to native podcasts, or...'
            "Don’t brush off 'small' mistakes—dedicate a session to shadowing and rewriting common...'
        ]

* }
 */
export default class ReportModel extends BaseModel {
  constructor() {
    super("Reports", "reportId");
  }

  async addReport(report, from, to) {
    const rec = {
      ...report,
      generated: Date.now(),
      from,
      to,
      lastSeen: 0,
    };
    return await this.create(rec);
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
