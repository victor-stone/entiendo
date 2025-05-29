import { ExampleModel, IdiomModel, PromptModel, ProgressModel } from '../../models/index.js';
import { generateText } from '../../lib/openai.js';
import { NotFoundError, CalendarExhaustedError } from '../../../shared/constants/errorTypes.js';
import { getSettings } from '../settingsAPI.js';
import ttl from './audio.js';
import debug from 'debug';

const debugGetNext = debug('api:exercise:getNext');

const { generateSpeech, generatePresignedUrl } = ttl;

const PAST_DUE = true;

export async function getNext(unified) {
    debugGetNext('**** Getting next exercise for user %s *****', unified.user.userId);

    const bypassExercise = _getAdminBypassExercise(unified);
    if (bypassExercise) 
        return await bypassExercise();

    let exercise = await _getNextDueExercise(unified);
    if( exercise ) {
        return exercise;
    }

    exercise = await _getExerciseForNewIdiom(unified);
    if( exercise ) {
        return exercise;
    }

    const { query: { tone, usage } } = unified;
    if( tone || usage ) {
        const fallback = { ...unified, query: { ...unified.query, tone: null, usage: null } };
        const fallbackExercise = await _getNextDueExercise(fallback);
        if( fallbackExercise ) {
            return fallbackExercise;
        }
    }

    debugGetNext('No due idiom found and new idioms are forbidden');
    throw new CalendarExhaustedError('No due idioms available');
}

async function _getNextDueExercise(unified) {
    const [idiom, progress] = await _getNextDueIdiom(unified);

    if (idiom) {
        return await _getExerciseForDueIdiom({ idiom, progress, unified });
    }

    return null;
}

async function _getExerciseForDueIdiom({ idiom, progress, unified }) {
    const { 
        EXAMPLE_PER_IDIOM_THRESHOLD, 
        ATTEMPTS_PER_EXAMPLE_THRESHOLD } = await getSettings();

    const model = new ExampleModel();
    const seenExampleIdCounts = {};
    const seenExampleIds = [];

    progress.history.forEach(({ exampleId }) => {
        seenExampleIds.push(exampleId);
        seenExampleIdCounts[exampleId] = (seenExampleIdCounts[exampleId] || 0) + 1;
    });

    // If user hasn't seen enough examples, try to find or create a new one
    if (seenExampleIds.length < EXAMPLE_PER_IDIOM_THRESHOLD) {
        const examplesForIdiom = await model.findByIdiomId(idiom.idiomId);
        let exercise = examplesForIdiom.find(({ exampleId }) => !seenExampleIds.includes(exampleId));
        if (!!exercise) {
            debugGetNext('Found an example the user has not seen');
            return await _finalizeExercise(exercise, idiom, model);
        }
        debugGetNext('User has seen all existing samples, making a new one');
        exercise = await _createExample(idiom, model, examplesForIdiom);
        return await _finalizeExercise(exercise, idiom, model);
    }

    // User has seen all examples, pick one they've seen the least (or random)
    let exampleToUse = seenExampleIds
        .slice() // copy
        .reverse()
        .find(id => seenExampleIdCounts[id] < ATTEMPTS_PER_EXAMPLE_THRESHOLD);

    if (exampleToUse) {
        debugGetNext('User has seen this example before but within threshold');
    } else {
        exampleToUse = seenExampleIds[Math.floor(Math.random() * seenExampleIds.length)];
        debugGetNext('WARNING: User has seen all the examples max times, picking one random');
    }
    const exercise = await model.getById(exampleToUse);
    return await _finalizeExercise(exercise, idiom, model);
}

async function _isNewAllowed(unified) {
    /*
        if total number of progress < MAX_INITIAL_NEW_IDIOMS then return true.

        If the user has any progress record older than 24 hours and the total number of 
        progress is < (MAX_INITIAL_NEW_IDIOMS * 2) then return true;

        After that only allow MAX_NEW_IDIOMS for the last 24 hours.

        You can calcuate the date of usage by looking at exercise.history[n].date
    */
    const { user: { userId } } = unified;
    const {
        MAX_INITIAL_NEW_IDIOMS,
        MAX_NEW_IDIOMS
    } = await getSettings();

    const model = new ProgressModel();
    const exercises = await model.findByUser(userId);
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // 1. If total number of progress < MAX_INITIAL_NEW_IDIOMS then return true.
    if (exercises.length < MAX_INITIAL_NEW_IDIOMS) {
        return true;
    }

    // 2. If any progress is older than 24 hours and total < (MAX_INITIAL_NEW_IDIOMS * 2) then return true
    const hasOldProgress = exercises.some(e => (now - e.createdAt) > ONE_DAY_MS);
    if (hasOldProgress && exercises.length < (MAX_INITIAL_NEW_IDIOMS * 2)) {
        return true;
    }

    // 3. After that only allow MAX_NEW_IDIOMS for the last 24 hours
    const recentCount = exercises.filter(e => (now - e.createdAt) < ONE_DAY_MS).length;
    return recentCount < MAX_NEW_IDIOMS;
}

async function _getExerciseForNewIdiom(unified) {

    const isNewAllowed = await _isNewAllowed(unified);
    if (!isNewAllowed) {
        return null;
    }

    const model = new ExampleModel();
    let  idiom = await _getNewIdiom(unified);
    if( !idiom ) {
        debugGetNext('New idioms are allowed but the user has seen all of this tone/usage');
        const fallback = { ...unified, query: { ...unified.query, tone: null, usage: null } };
        idiom = await _getNewIdiom(fallback);
    }
    debugGetNext('Nothing is due for user, fetched: %s', idiom.text);

    const exercises = await model.findByIdiomId(idiom.idiomId);
    let exercise;
    if (exercises && exercises.length > 0) {
        debugGetNext('found an existing exercise');
        exercise = exercises[0];
    } else {
        exercise = await _createExample(idiom, model);
        debugGetNext('created a new exercise');
    }
    return await _finalizeExercise(exercise, idiom, model);
}

async function _finalizeExercise(exercise, idiom, model) {
    const needAudio = _ensureAudioAccess(exercise);
    if (needAudio) {
        exercise = await needAudio();
        await model.addAudio(exercise.exampleId, exercise.audio);
    }
    exercise.idiom = idiom;
    debugGetNext('Returning exercise for "%s (%s)": %s...',
        exercise.idiom.text,
        exercise.idiom.usage,
        exercise.text.slice(0, 14)
    );
    return exercise;
}

function _ensureAudioAccess(exercise) {
    const publicUrl = exercise.audio?.publicUrl;
    if( publicUrl ) {
        if (exercise.audio.expires < Date.now()) {
            return async () => {
                debugGetNext('existing audio is found, generating a new public url');
                const generatedUrl = await generatePresignedUrl(publicUrl);
                exercise.audio = {
                    ...exercise.audio,
                    ...generatedUrl
                };
                return exercise;
            }
        }
        debugGetNext('existing audio found and public url is current');
    } else {
        return async () => {
            const { id, name } = _getRandomVoiceOption();
            exercise.audio = await generateSpeech(exercise.text, id);
            debugGetNext('generating audio for example with ' + name);
            return exercise;
        }
    }
    return null;
}

function _getRandomVoiceOption() {
    const idx = Math.floor(Math.random() * ttl.voiceOptions.length);
    return ttl.voiceOptions[idx];
}

async function _getNextDueIdiom(unified) {
    const { query: { tone, usage }, user: { userId } } = unified;
    debugGetNext('Finding due idiom (tone: %s, usage: %s )', 
        tone || '-', usage || '-');

    const idiomModel    = new IdiomModel();
    const progressModel = new ProgressModel();
    const dueItems      = await progressModel.findDueItems(userId, {tone, usage}, PAST_DUE);
    let dueItem, idiom;
    if (dueItems && dueItems.length) {
        dueItem = dueItems[0];
        idiom = await idiomModel.getById(dueItem.idiomId);
    }
    return [idiom, dueItem]
}

async function _getNewIdiom(unified) {
    const { query: { tone, usage }, user: { userId } } = unified;

    const idiomModel = new IdiomModel();
    const progressModel = new ProgressModel();

    const idiomIds = await idiomModel.findIdsByCriteria({tone,usage})
    const userHistory = await progressModel.findByUser(userId);

    // Find first idiom not in user history
    const seenIdiomIds = new Set(userHistory.map(progress => progress.idiomId));
    const idiomId = idiomIds.find(id => !seenIdiomIds.has(id));

    if (idiomId) {
        // debugGetNext("Found match: %s - %s: %s", tone, usage, idiom.text);
    } else {
        if( tone || usage ) {
            return null;
        }
        // TODO: make some more idioms with this spec
        debugGetNext("OOPS User has seen all idioms that match: %s - %s", tone, usage)
        throw new NotFoundError(`Wups, turns out there's nothing here... Refresh your browser(!)`);
    }

    const idiom = idiomModel.getById(idiomId);
    return idiom;
}

/**
* Generate an example sentence for an idiom using OpenAI
* 
* @param {Object} idiom - Idiom object with text and translation
* @returns {Promise<Object>} Generated example sentence with position info
*/
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

/**
 * Get or create an example for an idiom
 * 
 * @param {Object} idiom - Idiom object
 * @returns {Promise<Object>} Example object with text and idiom position
 */
async function _createExample(idiom, model, existingExamples) {
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

function _getAdminBypassExercise(unified) {
    const { user: { preferences } } = unified;
    return preferences.getNextExample ? async () => {
        debugGetNext("Getting admin example: " + preferences.getNextExample)
        const model          = new ExampleModel();
        const idioms         = new IdiomModel();
        let exercise         = await model.getById(preferences.getNextExample);
        let idiom            = await idioms.getById(exercise.idiomId);
        return await _finalizeExercise(exercise, idiom, model);
    } : null;
}

