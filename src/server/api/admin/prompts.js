import { ForbiddenError } from '../../../shared/constants/errorTypes.js';
import { Prompts } from '../../models/index.js';

import debug from 'debug';
const debugAdmin = debug('api:admin');

export async function getPrompts(routeContext) {
  const { user: { role } } = routeContext;
  if (!role || role !== 'admin') { throw new ForbiddenError('Unauthorized. Admin role required.');}
  return await _getPrompts();
}

function _getPrompts() {
  const _prompts = new Prompts();
  const prompts = _prompts.all();
  const obj = prompts.reduce((obj, p) => {
    obj[p.PromptId] = p.prompt;
    return obj;
  }, {});
  return obj;
}

export function putPrompts(routeContext) {
  const { payload: { prompts }, user: { role } } = routeContext;
  if (!role || role !== 'admin') { throw new ForbiddenError('Unauthorized. Admin role required.');}

  const currentPrompts = _getPrompts();
  const updater = {};
  for (const [key, prompt] of Object.entries(prompts)) {
    if( currentPrompts[key] != prompt ) {
      updater[key] = { prompt };
    }
  }
  debugAdmin('Saving prompts %o', updater);
  
  const _prompts = new Prompts();
  return _prompts.updateObject(updater);
}

