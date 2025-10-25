import db from './db.js';

export default class Sandbox extends db {
  constructor() {
    super('sandbox','sandboxId');
  }

  history(userId) {
    return this._(
              this.data.filter( s => s.userId == userId )
            ).sort( (a,b) => b.date - a.date);
  }
}

db.initCache('sandbox')
