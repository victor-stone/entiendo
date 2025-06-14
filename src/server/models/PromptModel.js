// src/server/models/ExampleModel.js
import BaseModel from './BaseModel.js';

/**
 * Model for storing and retrieving AI Prompts
 * 
 * {
    "name"   : "GEN_EXAMPLE_SYSTEM_PROMPT",
    "prompt" : "You are a friend having a conversation in a bar in Montevideo..."
 * }
 */
export default class PromptModel extends BaseModel {
  constructor() {
    super('Prompts', 'PromptId');
  }

  async getPromptByName(name, substitutions = {}) {
    const r = await this.getById(name);
    return r.prompt.replace(/\$\{(\w+)\}/g, (_, k) => k in substitutions ? substitutions[k] : '${'+k+'}');
  }

  async updatePrompts(obj) {
    const promises = [];
    for (const [key, prompt] of Object.entries(obj)) {
      promises.push(this.update(key, { prompt }));
    }
    return await Promise.all(promises);
  }
}