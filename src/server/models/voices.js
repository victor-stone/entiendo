import db from './db.js';

export default class Voices extends db {
  constructor() {
    super('voices',"serviceId",true);
  }
}

db.initCache('voices')
