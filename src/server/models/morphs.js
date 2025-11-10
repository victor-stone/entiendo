import db from './db.js';

export default class Morphs extends db {
  constructor() {
    super('morphs', 'morphId', true);
  }



}

db.initCache('morphs')
