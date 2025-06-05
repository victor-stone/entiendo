// src/server/api/lib/createExample.js
import { PromptModel } from '../../models/index.js';
import { generateText } from '../../lib/openai.js';

async function _generateExampleSentence(idiom, existingExamples) {
    const model         = new PromptModel();
    const systemPrompt  = await model.getPromptByName('RIOPLATENSE_EXAMPLE_SYSTEM_PROMPT');
    let   userPrompt    = await model.getPromptByName('USER_EXAMPLE', idiom)

    if( existingExamples && existingExamples.length > 0 ) {
        const existingExample  = existingExamples.map(({text}) => `"${text}"`).join('\n');
        const userWExamples    = await model.getPromptByName('USER_EXAMPLE_WITH_EXISTING', {existingExample})
              userPrompt      += ' ' + userWExamples;
    }

    const result = await generateText(systemPrompt, userPrompt);

    return JSON.parse(result);
}

export async function createExample(idiom, model, existingExamples) {
    // Generate new example sentence with position info
    const exampleData = await _generateExampleSentence(idiom, existingExamples);

    return await model.createExample(
        idiom.idiomId,
        exampleData.text,
        exampleData.conjugatedSnippet,
        'openai'
    );
}
