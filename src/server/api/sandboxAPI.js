import { generateText } from "../lib/openai.js";
import { ExampleModel, ExampleModelQuery, 
    ProgressModel, ProgressModelQuery, PromptModel } from "../models/index.js";
import { finalizeExample } from "./lib/finalizeExample.js";

export async function getNext(routeContext) {
    const { payload: { basedOn } } = routeContext;

    const basedOnX  = basedOn.slice(0,12);  // TODO: tweak this number 

    let example = await _getExistingSandboxExamples(basedOnX);
    if( example ) {
        return example;
    }

    return _generateNewSandboxExamples(basedOnX);
}

export async function evaluate(routeContext) {
    const { payload: { exampleId, userTranscription, userTranslation }, user: { userId } } = routeContext;

    const evaluation = await _evaluate(exampleId, userTranscription, userTranslation);
    await _markProgress(exampleId, evaluation, userId);
    return evaluation;
}

async function _markProgress(exampleId, evaluation, userId) {
    const query    = await ProgressModelQuery.create(userId);
    let   progress = query.sandbox();
    let   exists   = !!progress;
    if (!progress) {
        progress = {
            userId,
            isSandbox: true,
            history: []
        }
    }

    progress.history.push({
        date: Date.now(),
        exampleId,
        evaluation
    });

    const progressModel = new ProgressModel();

    return exists
        ? progressModel.update(progress.progressId, progress)
        : progressModel.create(progress);
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

async function _getExistingSandboxExamples(basedOn) {
    const query = await ExampleModelQuery.create();
    
    const existing = query.basedOn(basedOn);

    if( existing.length ) {
        const example = await finalizeExample(existing[0])
        return example;
    }
    return null;
}

async function _generateNewSandboxExamples(basedOn) {
    const response = await _generateSandboxSentence(basedOn);
    const model    = new ExampleModel();
    const examples = response.sentences;

    for( var i = 0; i < examples.length; i++ ) {
        const { text, basedOn } = examples[i];
        examples[i] = await model.createSandboxExample(text, basedOn);
    }
    const example = await finalizeExample(examples[0]);
    return example;
}

async function _generateSandboxSentence(basedOn) {
    const model         = new PromptModel();
    const systemPrompt  = await model.getPromptByName('TUNEUP_SYSTEM_PROMPT');
    let   userPrompt    = `The words are: ${basedOn.map(w => `'${w}`).join(', ')}`; 
    const result        = await generateText(systemPrompt, userPrompt);
    return JSON.parse(result);
}
