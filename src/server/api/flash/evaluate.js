import debug from 'debug';
import { Chips, Flash, Prompts } from '../../models/index.js';
import { generateText } from "../../lib/openai.js"

const debugF = debug('api:flash');

const SCORE_TEXT = {
  1: "❌ Didn’t get the meaning",
  2: "❌ Missed a key part (verb, preposition, or structure)",
  3: "⚠️ Different wording, but still a natural way to say it",
  4: "⚠️ Very close — small mistakes only (accents, typos, word order)",
  5: "✅ Exact match (ignoring punctuation and capitalization)"
};

/*
{
  "score": 4,
  "reason": "The meaning matches and the only issue is a missing accent.",
  "matchesTarget": false
  /* added locally: * /,
  "feedback": "❌ Missed a key part (verb, preposition, or structure)"
}
*/

export async function evaluate(routeContext) {
    const { payload: { flashId,  userTranslation }, 
            user   : { name, userId } } = routeContext;
    debugF('Evaluating flash card for %s', name || userId);
    const evaluation = await _evaluate(flashId, userTranslation);
    if( evaluation ) {
      evaluation.feedback = SCORE_TEXT[evaluation.score];
    }
     _markProgress(flashId, evaluation, userId);
    return evaluation;
}

async function _evaluate(flashId, userAnswer) {
  
    const _flash         = new Flash();
    const { text, translation } = _flash.byId(flashId);
    const _prompts          = new Prompts();
    const systemPrompt      = _prompts.getPromptByName('FLASH_EVALUATION_SYSTEM_PROMPT')
    const userPrompt        = JSON.stringify({
      targetText: text,
      translation,
      userAnswer
    });

    const result = await generateText(systemPrompt, userPrompt, {
        temperature: 0.2,
        max_tokens: 600
    });

    return JSON.parse(result);
}

function _markProgress(flashId, evaluation, userId) {
  const _chips = new Chips();
  const seen = _chips.forUser(userId);
  let chip = seen.find( c => c.flashId == flashId );
  if( chip ) {
    chip.scores.push( evaluation.score );
    const total = chip.scores.reduce((sum, value) => sum + value, 0);
    chip.score = Math.round(total / chip.scores.length);
    chip.date = Date.now();
    _chips.update( chip.chipId, chip );
  } else {
   chip = _chips.create({
      flashId,
      userId,
      score: evaluation.score,
      scores: [ evaluation.score ],
      date: Date.now()
    })
  }
  return chip;
}
