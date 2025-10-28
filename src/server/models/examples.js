import db from './db.js';

export default class Examples extends db {
  constructor() {
    super('examples', 'exampleId', true);
  }

  addAudio(exampleId, spec) {
    return this.update(exampleId, spec);
  }

  forIdiom(idiomId) {
    return this.matching('idiomId', idiomId);
  }

}

db.initCache('examples')
