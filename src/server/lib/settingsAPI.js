import PromptModel from '../models/PromptModel.js';

/**
 * Fetches the SETTINGS prompt from the Prompts table.
 * @returns {Promise<string|null>} The settings string, or null if not found.
 */
export async function getSettings() {
  const promptModel = new PromptModel();
  // The key is 'SETTINGS' as per your request
  const settings = await promptModel.getPromptByName('SETTINGS');
  return settings;
}

export default {
  getSettings
};