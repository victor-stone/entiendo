import db from './db.js';

export default class Users extends db {
  constructor() {
    super('users','userId',true);
  }
}

db.initCache('users')
