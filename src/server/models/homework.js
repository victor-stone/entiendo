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

// debug
function mapper(a) {
  a.homeworkId = a.assignmenId;
  delete a.assignmenId;
  return a;
}
db.initCache('homework', mapper)
