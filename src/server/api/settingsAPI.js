import PromptModel from '../models/PromptModel.js';

/**
 * Fetches the SETTINGS prompt from the Prompts table.
 * @returns {Promise<string|null>} The settings string, or null if not found.
 */
export async function getSettings() {
  const promptModel = new PromptModel();
  const settings = await promptModel.getValueByName('SETTINGS');
  return settings;
}

export default {
  getSettings
};