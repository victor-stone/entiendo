import db from './db.js';

export default class Examples extends db {
  constructor() {
    super('examples', 'exampleId', true);
  }

  addAudio(exampleId, audio) {
    return this.update(exampleId, { audio });
  }

  forIdiom(idiomId) {
    return this.findAll('idiomId', idiomId);
  }

}

db.initCache('examples')
