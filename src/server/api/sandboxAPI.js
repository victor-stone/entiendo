import { generateText } from "../lib/openai.js";
import { ExampleModel, ExampleModelQuery, 
    ProgressModel, ProgressModelQuery, PromptModel } from "../models/index.js";
import { finalizeExample } from "./lib/finalizeExample.js";
import {format} from 'timeago.js';

import debug from 'debug';
const debugSB = debug('api:sandbox');

const SANDBOX_MAX_EXAMPLES_PER = 10;
const SANDBOX_CUTOFF_DAYS      = 4;
const SANDBOX_MAX_BASED_ON     = 6;

export async function getNext(routeContext) {
    let { payload: { basedOn }, user: { userId, name } } = routeContext;

    if( !basedOn || !basedOn.length ) {
        const query  = await ProgressModelQuery.create(userId);
        basedOn = query.missedWords(true);
    }
    const basedOnX = basedOn.slice().sort(() => Math.random() - 0.5).slice(0,SANDBOX_MAX_BASED_ON);
    debugSB('getNext for %s based on: %o', name || userId, basedOnX);

    let example = await _getExistingUnseenExample(basedOnX, userId);
    if( example ) {
        return example;
    }

    example = await _reuseSeenExample(basedOnX,userId);
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
            ...model.genIdKey(),
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

    if( record ) {
        debugSB("Not the first time the user did this example.")
        record.evaluation = {
            ...evaluation,
            missedWords: Array.from(new Set([
            ...(record.evaluation.missedWords || []),
            ...(evaluation.missedWords || [])
            ]))
        }
        record.date = now;
    } else {
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

async function _getExistingUnseenExample(basedOn, userId) {
    const exQuery        = await ExampleModelQuery.create();
    const progQuery      = await ProgressModelQuery.create(userId);
    const seenExampleIds = progQuery.exampleIds();
    const existing       = exQuery.basedOn(basedOn);
    const unSeen         = existing.find( ({exampleId}) => !seenExampleIds.includes(exampleId));
    if( unSeen ) {
        debugSB('Found an unseen example %s', unSeen.text)
        return await finalizeExample(unSeen)
    }
    return null;
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
