import db from './db.js';

export default class Users extends db {
  constructor() {
    super('users','userId',true);
  }

  preferences(userId) {
    const user = this.byId(userId);
    return user.preferences;
  }
}

db.initCache('users')
