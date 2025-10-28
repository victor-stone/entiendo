import debug from 'debug';
import { Prompts, Shovels, Sandbox } from '../../models/index.js';
import { generateText } from "../../lib/openai.js"

const debugSB = debug('api:sandbox');

export async function evaluate(routeContext) {
    const { payload: { shovelId, userTranscription, userTranslation }, 
            user   : { name, userId } } = routeContext;
    debugSB('Evaluating for %s', name || userId);
    const evaluation = await _evaluate(shovelId, userTranscription, userTranslation);
    _markProgress(shovelId, evaluation, userId);
    return evaluation;
}

async function _evaluate(shovelId, userTranscription, userTranslation) {
    const _shovels         = new Shovels();
    const { text, basedOn } = _shovels.byId(shovelId);
    const _prompts          = new Prompts();
    const systemPrompt      = _prompts.getPromptByName('SANDBOX_EVALUATION_SYSTEM_PROMPT')
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

function _markProgress(shovelId, evaluation, userId) {
  const _sandbox = new Sandbox();
  _sandbox.create( {
    shovelId,
    date: Date.now(),
    evaluation,
    userId
  })
}
