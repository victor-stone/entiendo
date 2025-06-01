// src/server/api/exampleAPI.js
import ttl from '../lib/audio.js';
import { ExampleModel, PromptModel } from '../models/index.js';
import { generateText } from '../lib/openai.js';

const { generateSpeech, generatePresignedUrl } = ttl;

// TODO: not sure where finalizeExample (exercise?) should go
export async function finalizeExample(example, idiom = null, model = null, debug = null) {
    const needAudio = _ensureAudioAccess(example, debug);
    if (needAudio) {
        example = await needAudio();
        if( !model ) {
            model = new ExampleModel();
        }
        example = await model.addAudio(example.exampleId, example.audio);
    }
    if( idiom ) {
        example.idiom = idiom;
        if (debug) {
            debug('Returning example for "%s (%s)": %s...',
                example.idiom.text,
                example.idiom.usage,
                example.text.slice(0, 14)
            );
        }
    }
    return example;
}

function _ensureAudioAccess(example, debug) {
    const publicUrl = example.audio?.publicUrl;
    if (publicUrl) {
        if (example.audio.expires < Date.now()) {
            return async () => {
                if (debug) debug('existing audio is found, generating a new public url');
                const generatedUrl = await generatePresignedUrl(publicUrl);
                example.audio = {
                    ...example.audio,
                    ...generatedUrl
                };
                return example;
            }
        }
        if (debug) debug('existing audio found and public url is current');
    } else {
        return async () => {
            const { id, name } = _getRandomVoiceOption();
            example.audio = await generateSpeech(example.text, id);
            if (debug) debug('generating audio for example with ' + name);
            return example;
        }
    }
    return null;
}

function _getRandomVoiceOption() {
    const idx = Math.floor(Math.random() * ttl.voiceOptions.length);
    return ttl.voiceOptions[idx];
}

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
    try {
        // Generate new example sentence with position info
        const exampleData = await _generateExampleSentence(idiom, existingExamples);

        return await model.createExample(
            idiom.idiomId,
            exampleData.text,
            exampleData.conjugatedSnippet,
            'openai'
        );
    } catch (error) {
        console.error('Error generating example:', error);
        throw new Error(`Failed to get or create example: ${error.message}`);
    }
}
