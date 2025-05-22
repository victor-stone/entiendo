import { ExampleModel, IdiomModel, PromptModel, ProgressModel } from '../../models/index.js';
import { generateText } from '../../lib/openai.js';
import { NotFoundError } from '../../../shared/constants/errorTypes.js';
import ttl from './audio.js';
import debug from 'debug';

const debugGetNext = debug('api:exercise:getNext');

const { generateSpeech, generatePresignedUrl } = ttl;

const PAST_DUE = true;
const EXAMPLE_PER_IDIOM_THRESHOLD = 3;
const ATTEMPTS_PER_EXAMPLE_THRESHOLD = 3;

export async function getNext(unified) {
    debugGetNext('**** Getting next exercise for user %s *****', unified.user.userId);

    let [idiom, progress] = await _getNextDueIdiom(unified);

    const model = new ExampleModel();
    let exercise = null;

    if (idiom) {
        debugGetNext('Due idiom found: %s due: %s', 
                            idiom.text, 
                            new Date(progress.dueDate).toLocaleString());
        // 
        // Extract this user's example history from progress
        const seenExampleIdCounts = {};
        const seenExampleIds      = [];

        progress.history.forEach(({exampleId}) => {
            seenExampleIds.push(exampleId);
            seenExampleIdCounts[exampleId] = (seenExampleIdCounts[exampleId] || 0) + 1;
        });
        const maybeCreate = seenExampleIds.length < EXAMPLE_PER_IDIOM_THRESHOLD;
        if( maybeCreate ) {
            // we can make more if we need to ...
            // 
            // first let's determine if this user has seen all the examples available
            // for this idiom
            const examplesForIdiom = await model.findByIdiomId(idiom.idiomId);
            exercise = examplesForIdiom.find( ({exampleId}) => !seenExampleIds.includes(exampleId));
            if( exercise ) {
                debugGetNext('Found an example the user has not seen' );
            } else {
                debugGetNext('User has seen all existing sample, making a new one');
                exercise = await _createExample(idiom, model);
            }
        } else {
            // there are plenty of examples in the system and this user
            // has seen all of them
            //
            // now, let's see how many times they have seen them and favor the ones
            // they have seen the least
            // (by reversing the array we increase the chance of alternating 
            // examples)
            let exampleToUse = seenExampleIds.reverse().find( id => seenExampleIdCounts[id] < ATTEMPTS_PER_EXAMPLE_THRESHOLD);
            if( exampleToUse ) {
                debugGetNext('User has seen this example before but within threshold')
            }
            else {
                // so here are are, maxed out on examples for the idiom,
                // maxed out on views per example for this user
                // TODO: design a policy for this case
                exampleToUse = seenExampleIds[Math.floor(Math.random() * seenExampleIds.length)];
                debugGetNext('WARNING: User has seen all the examples max times, picking one random')
            }
            exercise = await model.getById(exampleToUse)
        }
    } else {
        const { query: { forbidNew } } = unified;
        if (forbidNew) {
            debugGetNext('No due idiom found and new idioms are forbidden');
            throw new NotFoundError('No due idioms available');
        }
        // TODO: Need a way to sprinkle in new idioms 
        // even when a ton are due
        //
        idiom = await _getNewIdiom(unified);
        debugGetNext('Nothing is due for user, fetched: %s', idiom.text);
        const exercises = await model.findByIdiomId(idiom.idiomId);
        if( exercises && exercises.length > 0  ) {
            debugGetNext('found an existing exercise')
            exercise = exercises[0];
        } else {
            exercise = await _createExample(idiom, model);
            debugGetNext('created a new exercise')
        }   
    }
    
    // The example may have been uploaded, not generated 
    // through here so we can't assume audio
    const publicUrl = exercise.audio?.publicUrl;
    if( publicUrl ) {
        if( exercise.audio.expires < Date.now() ) {
            debugGetNext('existing audio is found, generating a new public url')
            exercise.audio = {
                ...exercise.audio,
                ...await generatePresignedUrl(publicUrl)
            };
        } else {
            debugGetNext('existing audio found and public url is current')
        }
    } else {
        const { id, name } = _getRandomVoiceOption();
        exercise.audio = await generateSpeech(exercise.text, id);
        model.addAudio(exercise.exampleId, exercise.audio);
        debugGetNext('generated audio with ' + name)
    }
    
    exercise.idiom = idiom;
    
    debugGetNext('Returning exercise for "%s (%s)": %s...', 
            exercise.idiom.text, 
            exercise.idiom.usage, 
            exercise.text.slice(0,14));
    return exercise;
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
async function _generateExampleSentence(idiom) {

    const model = new PromptModel();
    const systemPrompt = await model.getPromptByName('RIOPLATENSE_EXAMPLE_SYSTEM_PROMPT');
    const userPrompt   = await model.getPromptByName('USER_PROMPT', idiom)

    // Generate the example
    const result = await generateText(systemPrompt, userPrompt, {
        temperature: 0.7,
        max_tokens: 150,
        response_format: { type: "json_object" }
    });

    return JSON.parse(result);
}

/**
 * Get or create an example for an idiom
 * 
 * @param {Object} idiom - Idiom object
 * @returns {Promise<Object>} Example object with text and idiom position
 */
async function _createExample(idiom, model) {
    try {
        // Generate new example sentence with position info
        const exampleData = await _generateExampleSentence(idiom);

        // TODO: we need to check to see if this sentence already exists
        // in our system, if so we have to go back and ask for another
        // example (hopefully this doesn't happen too many times - we need
        // a strategy for to do deal with how that would work)
        // Save and return the new example
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
