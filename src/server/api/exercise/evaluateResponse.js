import { Examples, Progress, Idioms, Prompts } from '../../models/index.js';
import { generateText } from '../../lib/openai.js';
import processSirpState from '../../lib/sirp/process.js';

export async function evaluateResponse(routeContext) {
    const { payload: { exampleId, userTranscription, userTranslation }, user: { userId } } = routeContext;

    const _examples  = new Examples();
    const example    = _examples.find(exampleId);
    const evaluation = await _evaluateResponse(example.text, userTranscription, userTranslation);
    const progress   = await _markProgress(exampleId, example.idiomId, evaluation, userId);
    return {
        evaluation,
        progress
    };
}

function _markProgress(exampleId, idiomId, evaluation, userId) {
    const _progress = new Progress();
    
    let   progress  = _progress.forIdiom(userId, idiomId);
    let   exists    = !!progress;
    if (!progress) {
        const _idioms = new Idioms();
        const idiom = _idioms.find(idiomId);
        const { tone, usage } = idiom;
        const createdAt = Date.now();
        progress = {
            idiomId,
            userId,
            tone,
            usage,
            createdAt,
            history: []
        }
    }

    progress = processSirpState(progress, evaluation);

    // TODO: curate what bits of 'evaluation' really need 
    // to be stored. Like previous 'progress'?
    progress.history.push({
        date: Date.now(),
        exampleId,
        evaluation
    });

    return exists
        ? _progress.update(progress.progressId, progress)
        : _progress.create(progress);
}

/**
 * Evaluate a user's response to an idiom exercise using OpenAI
 * Uses the exact prompt from the exercise evaluation schema
 *
 * @param {String} correctSentence - The correct Spanish sentence 
 * @param {String} userTranscription - User's transcription attempt
 * @param {String} userTranslation - User's translation attempt
 * @returns {Promise<Object>} Evaluation result with accuracy grades and feedback
 */
async function _evaluateResponse(correctSentence, userTranscription, userTranslation = "") {
    // Using exact prompt from document #90
    const _prompts = new Prompts();
    const systemPrompt = _prompts.getPromptByName('EVAL_SYSTEM_PROMPT')

    const userPrompt = `Correct sentence: "${correctSentence}"
  User's transcription: "${userTranscription}"
  User's translation: "${userTranslation}"`;

    try {
        const result = await generateText(systemPrompt, userPrompt, {
            temperature: 0.2,
            max_tokens: 600
        });

        return JSON.parse(result);
    } catch (error) {
        console.error('Error evaluating response:', error);
        // TODO: investigate what should/could be returned here
        throw error;
    }
}
