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

  /**
   * Returns the prompt text for a given name, with optional substitutions.
   * @param {string} name
   * @param {object} [substitutions] - Object with keys to replace in the prompt, e.g. { name: "Victor" }
   * @returns {Promise<string|null>} The prompt text or null if not found.
   */
  async getPromptByName(name, substitutions = {}) {
    const result = await this.getById(name);
    if (!result) return null;
    let prompt = result.prompt;

    // Replace ${key} in prompt with corresponding value from substitutions
    prompt = prompt.replace(/\$\{(\w+)\}/g, (match, key) => {
      return substitutions.hasOwnProperty(key) ? substitutions[key] : match;
    });

    return prompt;
  }

}