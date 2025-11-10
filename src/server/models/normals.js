import db from './db.js';

export default class Normals extends db {
  constructor() {
    super('normals', 'normalId', true);
  }

}

db.initCache('normals')
