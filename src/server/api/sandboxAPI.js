import { generateText } from "../lib/openai.js";
import { ExampleModel, ExampleModelQuery, SettingsModel,
    ProgressModel, ProgressModelQuery, PromptModel } from "../models/index.js";
import { finalizeExample } from "./lib/finalizeExample.js";
import {format} from 'timeago.js';
import { cleanMissedWords } from "../lib/cleanMissedWords.js";
import debug from 'debug';

const debugSB = debug('api:sandbox');

async function _findAnExistingExampleWithAudioForAMissedWordThatUserHasNotSeenYet(userId,words) {
    const query   = await ProgressModelQuery.create(userId)
    const queryEx = await ExampleModelQuery.create();

    const examplesBasedOnWithAudio = queryEx.basedOnWithAudio(words);

    const exampleIds = examplesBasedOnWithAudio
                            .map( ({exampleId}) => exampleId )
                            .sort(() => Math.random() - 0.5);
    const userSeen   = query.exampleIds();
    
    const unseenExampleId = exampleIds.find(id => !userSeen.includes(id));
    return unseenExampleId && finalizeExample(queryEx.example(unseenExampleId), { debug: debugSB });
}

export async function getNext(routeContext) {
    let { user: { userId } } = routeContext;

    const query  = await ProgressModelQuery.create(userId);
    const basedOn = query.missedWords(true);

    let example = await _findAnExistingExampleWithAudioForAMissedWordThatUserHasNotSeenYet(userId, basedOn);
    if( example ) {
        debugSB("Found unseen example based on %o", example.basedOn)
        return example;
    }

    example = await _getExistingUnseenExample(basedOn, userId);
    if( example ) {
        return example;
    }

    example = await _reuseSeenExample(basedOn,userId);
    if( example ) {
        return example;
    }

    return _generateNewSandboxExamples(basedOnX);
}

/*

This system ensure (and counts on) a pile up of 
olders ones and using them instead more and more
instead of generating new ones.
*/
async function _reuseSeenExample(basedOn, userId) {
    const { SANDBOX_CUTOFF_DAYS } = SettingsModel.all();
    const query  = await ProgressModelQuery.create(userId);
    const cutoff = Date.now() - (24 * 60 * 60 * 1000 * SANDBOX_CUTOFF_DAYS);

    for( let i = 0; i < basedOn.length; i++ ) {
        const record = query.oldestSandboxExample([basedOn[i]]);
        if( record && record.date < cutoff ) {
            const model   = new ExampleModel();
            const example = await model.getById(record.exampleId);
            debugSB('Using example from %s - %s', format(record.date), example.text.slice(0,20));
            return finalizeExample(example, { debug: debugSB });
        }
    }

    return null;
}


export async function evaluate(routeContext) {
    const { payload: { exampleId, userTranscription, userTranslation }, 
            user   : { name, userId } } = routeContext;
    debugSB('Evaluating for %s', name || userId);
    const evaluation = await _evaluate(exampleId, userTranscription, userTranslation);
    await _markProgress(exampleId, evaluation, userId);
    return evaluation;
}

async function _checkForPreviousUseOfExample(userId, exampleId) {
    const query = await ProgressModelQuery.create(userId);
    const record = query.sandboxExample(exampleId);
    if( record ) {
        const sandbox = query.sandbox(record.sandbox);
        return [ sandbox, record ];
    }
    return [null, null];
}

async function _markProgress(exampleId, evalResults, userId) {
    const { SANDBOX_MAX_EXAMPLES_PER } = SettingsModel.all();
    const progressModel = new ProgressModel();

    let [ sandbox, record ] = await _checkForPreviousUseOfExample(userId, exampleId);

    if( !sandbox ) {
        const query = await ProgressModelQuery.create(userId);
        let sandboxes = query.sandboxes();
            sandbox   = sandboxes.find( s => s.history.length < SANDBOX_MAX_EXAMPLES_PER );
    }
    
    let useExisting = !!sandbox;

    if (useExisting) {
        debugSB('Using existing sandbox %s', sandbox.progressId);
    } else {
        debugSB('Creating a new sandbox')
        sandbox = {
            ...progressModel.genIdKey(),
            userId,
            isSandbox: true,
            history: [],
        }
    }

    const now = Date.now();

    const {
        transcriptionFeedback,
        translationFeedback,
        englishTranslation,
        ...evaluation
    } = evalResults;

    const { targetWords, missedWords } = evaluation;

    if( record ) {
        debugSB("Not the first time the user did this example.")
        evaluation.missedWords = cleanMissedWords(targetWords, record.evaluation.missedWords, missedWords)
        record.evaluation = { ...evaluation };
        record.date = now;
    } else {
        evaluation.missedWords = cleanMissedWords(targetWords, [], missedWords)
        sandbox.history.push({
            date: now,
            exampleId,
            evaluation,
            sandbox: sandbox.progressId // back pointer
        });
    }

    return useExisting
        ? progressModel.update(sandbox.progressId, { history: sandbox.history } )
        : progressModel.create(sandbox);
}

async function _evaluate(exampleId, userTranscription, userTranslation) {
    const model             = new ExampleModel();
    const { text, basedOn } = await model.getById(exampleId);
    const promptModel       = new PromptModel();
    const systemPrompt      = await promptModel.getPromptByName('SANDBOX_EVALUATION_SYSTEM_PROMPT')
    const userPrompt        = `
  Correct sentence: "${text}"
  Target words: "${basedOn.join(', ')}"
  User's transcription: "${userTranscription}"
  User's translation: "${userTranslation}"
`;
    const result = await generateText(systemPrompt, userPrompt, {
        temperature: 0.2,
        max_tokens: 600
    });

    return JSON.parse(result);
}

async function _generateNewSandboxExamples(basedOn) {
    debugSB('*** Generating new examples for missed words *** ')
    const response = await _generateSandboxSentence(basedOn);
    const model    = new ExampleModel();
    const examples = response.sentences;

    for( var i = 0; i < examples.length; i++ ) {
        const { text, basedOn } = examples[i];
        debugSB('[%s] %s', basedOn.join(', '), text);
        examples[i] = await model.createSandboxExample(text, basedOn);
    }
    const example = await finalizeExample(examples[0], { debug: debugSB });
    debugSB('Using example: %s', example.text)
    return example;
}

async function _generateSandboxSentence(basedOn) {
    const model         = new PromptModel();
    const systemPrompt  = await model.getPromptByName('SANDBOX_SYSTEM_PROMPT');
    const words         = basedOn.map( w => `'${w}'` ).join(', ');
    let   userPrompt    = `The words are: ${words}`;
    const result        = await generateText(systemPrompt, userPrompt);
    try {
        return JSON.parse(result);
    } catch(err) {
        debugSB('ERROR generating new Sandbox example %s', err.message);
        throw err;
    }
}


