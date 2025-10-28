import db from './db.js';

export default class Homework extends db {
  constructor() {
    super('homework','homeworkId',true);
  }

  forEditor(editor) {
    return this.filter( a => a.source === editor )
  }

  forIdiom(idiomId) {
    return this.filter( a => a.idiomId == idiomId );
  }
}

db.initCache('homework')
