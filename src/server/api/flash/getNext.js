import { Flash, Chips } from '../../models/index.js';
import debug from 'debug';
const debugF = debug('api:flash');

export async function getNext(routeContext) {
  const { user: { userId }, payload: { mode = 'new' } } = routeContext;
  debugF('getting next flash for: ' + userId )

  const _chips    = new Chips();
  const _flash    = new Flash();
  let chip        = null;
  let nextFlash   = null;

  if( mode == 'review' ) {
    chip = _chips.oldest(userId);
  } else if( mode == 'flubbed') {
    chip = _chips.worstScore(userId);
  }

  if( chip ) {
    nextFlash = _flash.byId(chip.flashId);
  }

  if( !nextFlash ) {
    const seen      = _chips.forUser(userId);
    const seenFlash = seen.map( s => s.flashId );
    nextFlash = _flash.firstUnseen(seenFlash);

    if( !nextFlash ) { 
      debugF('user has seen all flash cards');
      chip = _chips.oldest(userId);
      nextFlash = _flash.byId(chip.flashId);
    }
  }

  debugF('returning: ' + nextFlash.text )
  return nextFlash;
}