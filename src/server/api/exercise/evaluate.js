import { Examples, Progress, Idioms, Prompts, History } from '../../models/index.js';
import { generateText } from '../../lib/openai.js';
import processSirpState from '../../lib/sirp/process.js';

export async function evaluateResponse(routeContext) {
    const { payload: { exampleId, userTranscription, userTranslation }, user: { userId } } = routeContext;

    const _history   = new History();
    const lastSeen = _history.lastSeen(userId, exampleId);

    const _examples  = new Examples();
    const example    = _examples.byId(exampleId);
    const evaluation = await _evaluateResponse(example.text, userTranscription, userTranslation);
    const progress   = _markProgress(exampleId, example.idiomId, evaluation, userId);


    progress.lastSeen = lastSeen;

    return {
        evaluation,
        progress
    };
}

function _markProgress(exampleId, idiomId, evaluation, userId) {

    const _progress = new Progress();
    let   progress  = _progress.forIdiom(userId, idiomId);

    if (!progress) {
        const _idioms = new Idioms();
        const idiom = _idioms.byId(idiomId);
        const { tone, usage } = idiom;
        progress = _progress.create({
            idiomId,
            userId,
            tone,
            usage
        });
    }

    const { progressId } = progress;

    progress = processSirpState(progress, evaluation);
    progress = _progress.update( progressId, progress );

    const _history = new History();
    _history.create({
        date: Date.now(),
        exampleId,
        evaluation,
        progressId,
        userId
    })

    return progress;
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
