import { History, Shovels} from '../../models/index.js';

export async function getMissedWords(routeContext) { // not called (?)
  const { user: { userId } } = routeContext;
  const _history = new History();
  return _history.missedWords(userId, true);
}

export async function getBasedOn(routeContext) {
  const { user: { userId } } = routeContext;
  const _shovels = new Shovels();
  return _shovels.basedOn(userId);
}
