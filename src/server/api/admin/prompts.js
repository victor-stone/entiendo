import { ForbiddenError } from '../../../shared/constants/errorTypes.js';
import { PromptModel } from '../../models/index.js';

import debug from 'debug';
const debugAdmin = debug('api:admin');

export async function getPrompts(routeContext) {
  const { user: { role } } = routeContext;
  if (!role || role !== 'admin') { throw new ForbiddenError('Unauthorized. Admin role required.');}
  return await _getPrompts();
}

async function _getPrompts() {
  const model = new PromptModel();
  const prompts = await model.findAll();
  const obj = prompts.reduce((obj, p) => {
    obj[p.PromptId] = p.prompt;
    return obj;
  }, {});
  return obj;
}

export async function putPrompts(routeContext) {
  const { payload: { prompts }, user: { role } } = routeContext;
  if (!role || role !== 'admin') { throw new ForbiddenError('Unauthorized. Admin role required.');}
  const model = new PromptModel();
  const currentPrompts = await _getPrompts();
  const updater = {};
  for (const [key, prompt] of Object.entries(prompts)) {
    if( currentPrompts[key] != prompt ) {
      updater[key] = prompt;
    }
  }
  debugAdmin('Saving prompts %o', updater);
  return model.updatePrompts(updater);
}

