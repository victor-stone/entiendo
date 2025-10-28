import db from './db.js';

export default class Shovels extends db {
  constructor() {
    super('shovels','shovelId', true);
  }

  addAudio(shovelId, spec) {
    return this.update(shovelId, spec);
  }

  forWord(word) {
    return this._(this.data.filter( s => s.basedOn.includes(word) ))
  }
  
}

db.initCache('shovels')

