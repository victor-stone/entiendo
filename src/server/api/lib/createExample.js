import { Prompts, Examples, } from '../../models/index.js';
import { generateText } from '../../lib/openai.js';

async function _generateExampleSentence(idiom, existingExamples) {
    const _prompts         = new Prompts();
    const systemPrompt  = await _prompts.getPromptByName('RIOPLATENSE_EXAMPLE_SYSTEM_PROMPT');
    let   userPrompt    = await _prompts.getPromptByName('USER_EXAMPLE', idiom)

    if( existingExamples && existingExamples.length > 0 ) {
        const existingExample  = existingExamples.map(({text}) => `"${text}"`).join('\n');
        const userWExamples    = await _prompts.getPromptByName('USER_EXAMPLE_WITH_EXISTING', {existingExample})
              userPrompt      += ' ' + userWExamples;
    }
    
    const result = await generateText(systemPrompt, userPrompt);

    return JSON.parse(result);
}

export async function createExample(idiom, _examples, existingExamples) {
    const exampleData = await _generateExampleSentence(idiom, existingExamples);
    if( !_examples ) _examples = new Examples();
    return _examples.createExample(
        idiom.idiomId,
        exampleData.text,
        exampleData.conjugatedSnippet,
        'openai'
    );
}
