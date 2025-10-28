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

// DEBUG
export const audioFlattener = r => {
  let rec = { ...r };
  if (r.audio) {
    const {
      publicUrl: audio,
      url = undefined,
      expires = 0,
      ...rest
    } = r.audio; // used to be an obj
    rec = { ...rec, audio, ...rest };
  }
  // console.log( rec.audio );
  return rec;
};

db.preventWrite = true;
db.initCache('examples', audioFlattener)
