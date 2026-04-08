import db from './db.js';

export default class Flash extends db {
  constructor() {
    super('flash', 'flashId', false);
  }

  firstUnseen(seen) {
    return this.find( f => !seen.includes(f.flashId) );
  }
}

db.initCache('flash')
