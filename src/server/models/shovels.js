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
  return rec;
};

db.preventWrite = true;
db.initCache('shovels', audioFlattener)

