import { generateText } from "../lib/openai.js";
import { ExampleModel, ExampleModelQuery, 
    ProgressModel, ProgressModelQuery, PromptModel } from "../models/index.js";
import { finalizeExample } from "./lib/finalizeExample.js";
import debug from 'debug';
const debugSB = debug('api:sandbox');

export async function getNext(routeContext) {
    const { payload: { basedOn }, user: { userId, name } } = routeContext;

    const basedOnX = _randomSliceBasedOn(basedOn);
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

async function _reuseSeenExample(basedOn, userId) {
    return null;
}

function _randomSliceBasedOn(basedOn) {
    const minLen = 4;
    const maxLen = 12;
    if( basedOn.length <= maxLen ) {
        return basedOn;
    }
    const sliceLen = Math.min(
                            Math.max(minLen, Math.floor(Math.random() * basedOn.length)), 
                            maxLen);
    const startIdx = Math.floor(Math.random() * (basedOn.length - sliceLen + 1));
    const basedOnX = basedOn.slice(startIdx, startIdx + sliceLen);
    return basedOnX;
}

export async function evaluate(routeContext) {
    const { payload: { exampleId, userTranscription, userTranslation }, 
            user: { name, userId } } = routeContext;
    debugSB('Evaluating for %s', name || userId);
    const evaluation = await _evaluate(exampleId, userTranscription, userTranslation);
    await _markProgress(exampleId, evaluation, userId);
    return evaluation;
}

const MAX_PER_SANDBOX = 10;

async function _markProgress(exampleId, evaluation, userId) {
    const query       = await ProgressModelQuery.create(userId);
    let   sandboxes   = query.sandbox();
    let   sanbox      = sandboxes.find( s => s.history.length < MAX_PER_SANDBOX );
    let   useExisting = !!sanbox;
    if (useExisting) {
        debugSB('Using existing sandbox %s', sanbox.progressId);
    } else {
        debugSB('Creating a new sandbox')
        sanbox = {
            userId,
            isSandbox: true,
            history: []
        }
    }

    sanbox.history.push({
        date: Date.now(),
        exampleId,
        evaluation
    });

    const progressModel = new ProgressModel();

    return useExisting
        ? progressModel.update(sanbox.progressId, sanbox)
        : progressModel.create(sanbox);
}

async function _evaluate(exampleId, userTranscription, userTranslation) {
    const model             = new ExampleModel();
    const { text, basedOn } = await model.getById(exampleId);
    const promptModel       = new PromptModel();
    const systemPrompt      = await promptModel.getPromptByName('SANDBOX_EVALUATION_SYSTEM_PROMPT')
    const userPrompt        = `Correct sentence: "${text}"
    Target words: "${basedOn.join(', ')}"
  User's transcription: "${userTranscription}"
  User's translation: "${userTranslation}"`;
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
    debugSB('Generating new examples for missed words')
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
    let   userPrompt    = `The words are: ${basedOn.map(w => `'${w}`).join(', ')}`; 
    const result        = await generateText(systemPrompt, userPrompt);
    try {
        JSON.parse(result);
    } catch(err) {
        debugSB('ERROR generating new Sandbox example %s', err.message);
        throw err;
    }
}
