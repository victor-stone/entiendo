// src/server/models/ExampleModel.js
import { PropertyCollection } from 'microsoft-cognitiveservices-speech-sdk';
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
    return r ? r.prompt.replace(/\$\{(\w+)\}/g, (_, k) => k in substitutions ? substitutions[k] : '${'+k+'}') : null;
  }

  async getValueByName(name) {
    return this.getById(name);
  }

}