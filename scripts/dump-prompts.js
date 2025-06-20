import PromptModel from '../src/server/models/PromptModel.js'
import dump from './dump.js';

async function dumpPrompt() {
    const model = new PromptModel();
    await dump(model, 'prompts');
}

dumpPrompt();
