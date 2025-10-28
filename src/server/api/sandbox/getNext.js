import { History, Sandbox, Shovels, Prompts, Settings } from '../../models/index.js';
import debug from 'debug';
import { generateText } from "../../lib/openai.js"
import { finalizeExample } from "../lib/finalizeExample.js";

const debugSB = debug('api:sandbox');

const MAX_LOOK_BACK = 25;
const LOOKBACK_TIME_CUTOFF = 12 * 60 * 60 * 1000; // 12 hours

export async function getNext(routeContext) {
  const { user: { userId } } = routeContext;

  const missedWords   = _getMissedWords(userId);
  const recentWords   = _getRecentlyShoveledWords(userId);
  const potentials    = missedWords.filter( w => !recentWords.includes(w) );
  const unseenShovels = _getUnseenShovels(userId);

  const shovel = unseenShovels.find( s => s.basedOn.find( w => potentials.includes(w) ) );
  
  if( !shovel ) {
    return _makeNewShovel(potentials.slice(0,3));
  } 
  
  const _shovels = new Shovels;
  return await finalizeExample(shovel, { model: _shovels, debug: debugSB });

}

function _getMissedWords(userId) {
  const _history     = new History();
  const missedWords   = _history.missedWords(userId, true);
  if( missedWords.length < 10 ) {
    const defaults = (new Settings()).all()['DEFAULT_MISSED'];
    missedWords.push( ...defaults );
  }
  return missedWords;
}
/**
 * Returns a de-duplicated list of words that the user has recently seen.
 * 
 * Where 'recent' is defined the greater of: the last 25 sandbox exercises
 * or the last 12 hours which ever is more
 *
 */
function _getRecentlyShoveledWords(userId) {
  const _sandbox   = new Sandbox();
  const history    = _sandbox.history(userId);
  const maxHistory = Math.min(history.length, MAX_LOOK_BACK);
  const cutoffDate = Date.now() - LOOKBACK_TIME_CUTOFF;
  let   cutoff     = history.findIndex( h => h.date < cutoffDate );

  if( cutoff == -1 )
    cutoff = history.length;

  const recent = history.slice(0, Math.max( maxHistory, cutoff ));

  const words = [];
  const _shovels = new Shovels();
  recent.forEach( ({shovelId}) => {
    const shovel = _shovels.byId(shovelId);
    words.push( ...shovel.basedOn );
  })

  return [...new Set(words)];
}

function _getUnseenShovels(userId) {
  const _sandbox    = new Sandbox();
  const history     = _sandbox.history(userId);
  const seenShovels = history.map(s => s.shovelId);
  const _shovels    = new Shovels();
  const shovels     = _shovels.all();
  return shovels.filter( ({shovelId}) => !seenShovels.includes(shovelId) );
}

async function _makeNewShovel(basedOn) {
    debugSB('*** Generating new examples for missed words *** ')
    const response  = await _generateSandboxSentence(basedOn);
    const _shovels = new Shovels();
    const shovels  = response.sentences;

    for( var i = 0; i < shovels.length; i++ ) {
        const { text, basedOn } = shovels[i];
        debugSB('[%s] %s', basedOn.join(', '), text);
        shovels[i] = _shovels.create({text, basedOn});
    }
    const shovel = await finalizeExample(shovels[0], { model: _shovels, debug: debugSB });
    debugSB('Using shovel: %s', shovel.text)
    return shovel;
}

async function _generateSandboxSentence(basedOn) {
    const _prompts     = new Prompts();
    const systemPrompt = _prompts.getPromptByName('SANDBOX_SYSTEM_PROMPT');
    const words        = basedOn.map( w => `'${w}'` ).join(', ');
    let   userPrompt   = `The words are: ${words}`;
    const result       = await generateText(systemPrompt, userPrompt);
    try {
        return JSON.parse(result);
    } catch(err) {
        debugSB('ERROR generating new Sandbox example %s', err.message);
        throw err;
    }
}



